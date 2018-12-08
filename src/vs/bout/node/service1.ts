import { IService1, IService1Event1 } from 'vs/bout/common/service1';
import { HarbourEngine } from 'vs/bout/node/harbourEngine';
import { Event, Emitter } from 'vs/base/common/event';


export class Service1 implements IService1 {


	private _onEvent1 = new Emitter<IService1Event1>();


	// ožičavam enEvent1 sa instancom event emitera
	public onEvent1: Event<IService1Event1> = this._onEvent1.event;

	// komanda koja aktivira 'event1-fired'
	public event1Fire(): Thenable<string> {
		console.log('node-event1Fire');
		this._onEvent1.fire({ answer: 'ODGOVARAM SA FIRE!' });
		return Promise.resolve('event1-resolved');
	}


	public ping(pong: string): Thenable<{ incoming: string, outgoing: string }> {
		console.log('node-ping');
		return Promise.resolve({ incoming: pong, outgoing: 'pong' });
	}

	public cancelMe(): Thenable<boolean> {
		// return Promise.resolve(timeout(100)).then(() => true);
		return Promise.resolve(true);
	}

	public harbourVersion(): Thenable<boolean> {
		console.log('hb Service1 process type:', process.type, process.debugPort);
	   const engine = new HarbourEngine();
	   return engine.provideVersion();
	}
}