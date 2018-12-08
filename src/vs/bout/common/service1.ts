import { Event } from 'vs/base/common/event';
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
	harbourVersion(): Thenable<boolean>;
}

export const IService1 = createDecorator<IService1>(SERVICE1_ID);
