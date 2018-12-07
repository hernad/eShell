import { IChannel, IServerChannel } from 'vs/base/parts/ipc/node/ipc';
import { Event, Emitter } from 'vs/base/common/event';
import { timeout } from 'vs/base/common/async';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';

export const SERVICE1_ID = 'service1';

export interface IService1Event1 {
	answer: string;
}


export interface IService1 {

	onEvent1: Event<IService1Event1>;
	event1Fire(): Thenable<string>;
	ping(pong: string): Thenable<{ incoming: string, outgoing: string }>;
	cancelMe(): Thenable<boolean>;
	harbourVersion(): Thenable<string>;
}

export const IService1 = createDecorator<IService1>(SERVICE1_ID);


export class Service1 implements IService1 {


	private _onEvent1 = new Emitter<IService1Event1>();

	// ožičavam enEvent1 sa instancom event emitera
	onEvent1: Event<IService1Event1> = this._onEvent1.event;

	// komanda koja aktivira 'event1-fired'
	event1Fire(): Thenable<string> {
		this._onEvent1.fire({ answer: 'ODGOVARAM SA FIRE!' });
		return Promise.resolve('event1-resolved');
	}


	ping(pong: string): Thenable<{ incoming: string, outgoing: string }> {
		return Promise.resolve({ incoming: pong, outgoing: 'pong' });
	}

	cancelMe(): Thenable<boolean> {
		return Promise.resolve(timeout(100)).then(() => true);
	}

	harbourVersion(): Thenable<string> {
	   return Promise.resolve(timeout(2000)).then( () => '0.0.0.0');
	}
}

export class Service1Channel implements IServerChannel {

	constructor(private service: IService1) { }

	// mapiranje eventa koji dolaze od klijenta
	listen(_, event: string): Event<any> {
		switch (event) {
			// kada stigne ovaj dogadjaj aktiviraj eventHandler onEvent1
			case 'event1Fire': return this.service.onEvent1;
		}

		throw new Error(`Event not found ${event}`);
	}

	// mapiranje klijentskih i serverskih komandi
	call(_, command: string, ...args: any[]): Thenable<any> {
		switch (command) {
			case 'ping': return this.service.ping(args[0]);
			case 'cancelMe': return this.service.cancelMe();
			case 'event1Fire': return this.service.event1Fire();
			case 'harbourVersion': return this.service.harbourVersion();
			default: return Promise.reject(new Error(`command not found: ${command}`));
		}
	}
}

export class Service1Client implements IService1 {

	get onEvent1(): Event<IService1Event1> { return this.channel.listen('event1Fire'); }

	constructor(private channel: IChannel) { }

	event1Fire(): Thenable<string> {
		return this.channel.call('event1Fire');
	}

	ping(pong: string): Thenable<{ incoming: string, outgoing: string }> {
		return this.channel.call('ping', pong);
	}

	cancelMe(): Thenable<boolean> {
		return this.channel.call('cancelMe');
	}

	harbourVersion(): Thenable<string> {
		return this.channel.call('harbourVersion');
	}
}

