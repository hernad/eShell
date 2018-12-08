import { IChannel, IServerChannel } from 'vs/base/parts/ipc/node/ipc';
import { Event } from 'vs/base/common/event';
// import { timeout } from 'vs/base/common/async';

import { IService1, IService1Event1 } from 'vs/bout/common/service1';


// klijentska strana
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

	harbourVersion(): Thenable<boolean> {
		console.log('hb Service1Client:', process.type);

		return this.channel.call('harbourVersion');
	}
}

