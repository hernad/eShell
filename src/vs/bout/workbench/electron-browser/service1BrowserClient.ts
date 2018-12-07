import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
// import { IStorageService, StorageScope } from 'vs/platform/storage/common/storage';
// import { ITelemetryService, ITelemetryInfo } from 'vs/platform/telemetry/common/telemetry';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
// import * as platform from 'vs/base/common/platform';
// import product from 'vs/platform/node/product';


import { Client } from 'vs/base/parts/ipc/node/ipc.cp';
import { getPathFromAmdModule } from 'vs/base/common/amd';
// import { always } from 'vs/base/common/async';

import {Service1Client, SERVICE1_ID} from 'vs/bout/service1';


function createClient(): Client {
	return new Client(getPathFromAmdModule(require, 'bootstrap-fork'), {
		serverName: 'Service1',
		env: { AMD_ENTRYPOINT: 'vs/bout/service1App', verbose: true }
	});
}

export class Service1BrowserClient implements IWorkbenchContribution {

	// private static readonly hideWelcomeSettingskey = 'workbench.hide.welcome';

	// private welcomePageURL: string;
	// private appName: string;


	constructor(
		// @IStorageService private storageService: IStorageService,
		@IEnvironmentService environmentService: IEnvironmentService,
		// @ITelemetryService private telemetryService: ITelemetryService
	) {
		// this.appName = product.nameLong;


		if (environmentService.isExtensionDevelopment) {
			return;
		}
		console.log('service1.browser constructor');

		this.cmd1();


	}

	private cmd1() {

		const client = createClient();
		const channel = client.getChannel(SERVICE1_ID);
		const service = new Service1Client(channel);
		let fireRequest;
		let fireRequest2;
		// let disposed = false;


		const event1Handler = service.onEvent1(({ answer }) => {
			console.log(`obrađujem onEvent1: ${answer}`);
		});

		// servis -> server
		const pingRequest = service.ping('ping').then(response => {
			console.log( response.incoming, response.outgoing);
		});

		console.log( 'ispaljujem event1Fire!');
		fireRequest = service.event1Fire().then( (answer) => {
			console.log(`event1Fire().then answer treba biti event1-resolved: ${answer}`);
			// if (!disposed) {
			// }
		});

		fireRequest2 = service.event1Fire().then( (answer) => {
			console.log(`event1Fire().then2: ${answer}`);
		});


		Promise.all([
			pingRequest,
			event1Handler,
			fireRequest,
			fireRequest2
		]).then(() => {
			console.log('bye bye service1 client');
			client.dispose();
		});

		// kad se svi ovi promisi zavrse, dispozati klijenta
		/*
		always(result, () => {
			// disposed = true;
			console.log('bye bye service1 client');
			client.dispose();
		});
		*/



	}


}
