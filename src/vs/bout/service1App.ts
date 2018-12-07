import { Server } from 'vs/base/parts/ipc/node/ipc.cp';
import { Service1Channel, Service1 } from './service1';

const server = new Server('service1');
const service = new Service1();
server.registerChannel('service1', new Service1Channel(service));