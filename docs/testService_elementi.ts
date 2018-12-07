// ===== 1 ========servis: eventi, struktura servisa, implementacija servisa ===============================================

// vscode/src/vs/base/parts/ipc/test/node/testService.ts


import { IChannel, IServerChannel } from 'vs/base/parts/ipc/node/ipc';
import { Event, Emitter } from 'vs/base/common/event';
import { timeout } from 'vs/base/common/async';

// struktura marco eventa je definisana u IMarcoPoloEvent
export interface IMarcoPoloEvent {
	answer: string;
}

// struktura servisa je definisana u ITestService
export interface ITestService {
	// eventHandler
	onMarco: Event<IMarcoPoloEvent>;
	// reaktor
	marco(): Thenable<string>;

	// dvije komande - output je uvijek Thenable
	pong(ping: string): Thenable<{ incoming: string, outgoing: string }>;
	cancelMe(): Thenable<boolean>;
}

export class TestService implements ITestService {


	private _onMarco = new Emitter<IMarcoPoloEvent>();

	onMarco: Event<IMarcoPoloEvent> = this._onMarco.event;

	// marco je reaktor na event
	marco(): Thenable<string> {
		this._onMarco.fire({ answer: 'polo' });
		return Promise.resolve('polo');
	}

	// pong i cancelMe su komande
	pong(ping: string): Thenable<{ incoming: string, outgoing: string }> {
		return Promise.resolve({ incoming: ping, outgoing: 'pong' });
	}

	cancelMe(): Thenable<boolean> {
		return Promise.resolve(timeout(100)).then(() => true);
	}
}

export class TestChannel implements IServerChannel {

	constructor(private testService: ITestService) { }

	listen(_, event: string): Event<any> {
		switch (event) {
			case 'marco': return this.testService.onMarco;
		}

		throw new Error('Event not found');
	}

	call(_, command: string, ...args: any[]): Thenable<any> {
		switch (command) {
			case 'pong': return this.testService.pong(args[0]);
			case 'cancelMe': return this.testService.cancelMe();
			case 'marco': return this.testService.marco();
			default: return Promise.reject(new Error(`command not found: ${command}`));
		}
	}
}

export class TestServiceClient implements ITestService {

	get onMarco(): Event<IMarcoPoloEvent> { return this.channel.listen('marco'); }

	constructor(private channel: IChannel) { }

	marco(): Thenable<string> {
		return this.channel.call('marco');
	}

	pong(ping: string): Thenable<{ incoming: string, outgoing: string }> {
		return this.channel.call('pong', ping);
	}

	cancelMe(): Thenable<boolean> {
		return this.channel.call('cancelMe');
	}
}

// ===== 2 ================================================================================================================
// vscode/src/vs/base/parts/ipc/test/node/testApp.ts


import { Server } from 'vs/base/parts/ipc/node/ipc.cp';
import { TestChannel, TestService } from './testService';

const server = new Server('test');
const service = new TestService();
server.registerChannel('test', new TestChannel(service));


// ===== 3 ========== USAGE ================================================================================================

import * as assert from 'assert';
import { Client } from 'vs/base/parts/ipc/node/ipc.cp';
import { always } from 'vs/base/common/async';
import { TestServiceClient } from './testService';
import { getPathFromAmdModule } from 'vs/base/common/amd';

function createClient(): Client {
	return new Client(getPathFromAmdModule(require, 'bootstrap-fork'), {
		serverName: 'TestServer',
		env: { AMD_ENTRYPOINT: 'vs/base/parts/ipc/test/node/testApp', verbose: true }
	});
}

suite('IPC, Child Process', () => {
	test('createChannel', () => {

		// kreiranje klijenta, get channel, servis preko channela

		const client = createClient();
		const channel = client.getChannel('test');
		const service = new TestServiceClient(channel);

		// servis -> server
		const result = service.pong('ping').then(r => {
			assert.equal(r.incoming, 'ping');
			assert.equal(r.outgoing, 'pong');
		});


		// ugasi klijenta kad ne treba vise?
		return always(result, () => client.dispose());
	});

	test('events', () => {
		const client = createClient();
		const channel = client.getChannel('test');
		const service = new TestServiceClient(channel);

		const event = new Promise((c, e) => {

			//
			service.onMarco(({ answer }) => {
				try {
					assert.equal(answer, 'polo');
					c(null);
				} catch (err) {
					e(err);
				}
			});
		});

		const request = service.marco();
		const result = Promise.all([request, event]);

		return always(result, () => client.dispose());
	});

	test('event dispose', () => {
		const client = createClient();
		const channel = client.getChannel('test');
		const service = new TestServiceClient(channel);

		let count = 0;
		const disposable = service.onMarco(() => count++);

		const result = service.marco().then(async answer => {
			assert.equal(answer, 'polo');
			assert.equal(count, 1);

			const answer_1 = await service.marco();
			assert.equal(answer_1, 'polo');
			assert.equal(count, 2);
			disposable.dispose();

			const answer_2 = await service.marco();
			assert.equal(answer_2, 'polo');
			assert.equal(count, 2);
		});

		return always(result, () => client.dispose());
	});
});




// ===== 4 ================================================================================================================
// /home/hernad/vscode/src/vs/base/parts/ipc/node/ipc.cp.ts

/**
 * This implementation doesn't perform well since it uses base64 encoding for buffers.
 * We should move all implementations to use named ipc.net, so we stop depending on cp.fork.
 */

export class Server<TContext extends string> extends IPCServer<TContext> {
	constructor(ctx: TContext) {
		super({
			send: r => {
				try {
					if (process.send) {
						process.send(r.toString('base64'));
					}
				} catch (e) { /* not much to do */ }
			},
			onMessage: fromNodeEventEmitter(process, 'message', msg => Buffer.from(msg, 'base64'))
		}, ctx);

		process.once('disconnect', () => this.dispose());
	}
}