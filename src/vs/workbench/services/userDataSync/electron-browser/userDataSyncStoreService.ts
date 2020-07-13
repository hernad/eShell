/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { SyncResource, IUserDataSyncStoreService, IUserDataSyncStore, getUserDataSyncStore, IUserData, IUserDataManifest, IResourceRefHandle, ServerResource } from 'vs/platform/userDataSync/common/userDataSync';
import { ISharedProcessService } from 'vs/platform/ipc/electron-browser/sharedProcessService';
import { IChannel } from 'vs/base/parts/ipc/common/ipc';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IProductService } from 'vs/platform/product/common/productService';
import { Event } from 'vs/base/common/event';

export class UserDataSyncStoreService implements IUserDataSyncStoreService {

	_serviceBrand: undefined;
	private readonly channel: IChannel;
	readonly userDataSyncStore: IUserDataSyncStore | undefined;

	constructor(
		@ISharedProcessService sharedProcessService: ISharedProcessService,
		@IProductService productService: IProductService,
		@IConfigurationService configurationService: IConfigurationService
	) {
		this.channel = sharedProcessService.getChannel('userDataSyncStoreService');
		this.userDataSyncStore = getUserDataSyncStore(productService, configurationService);
		this.onTokenFailed = Event.None;
		this.onTokenSucceed = Event.None;
	}

	onTokenFailed: Event<void>;
	onTokenSucceed: Event<void>;

	setAuthToken(token: string, type: string): void {
		throw new Error('Method not implemented.');
	}
	read(resource: ServerResource, oldValue: IUserData | null, headers?: import("../../../../base/parts/request/common/request").IHeaders | undefined): Promise<IUserData> {
		throw new Error('Method not implemented.');
	}
	write(resource: ServerResource, content: string, ref: string | null, headers?: import("../../../../base/parts/request/common/request").IHeaders | undefined): Promise<string> {
		throw new Error('Method not implemented.');
	}

	manifest(): Promise<IUserDataManifest | null> {
		throw new Error('Not Supported');
	}

	clear(): Promise<void> {
		throw new Error('Not Supported');
	}

	getAllRefs(key: SyncResource): Promise<IResourceRefHandle[]> {
		return this.channel.call('getAllRefs', [key]);
	}

	resolveContent(key: SyncResource, ref: string): Promise<string | null> {
		return this.channel.call('resolveContent', [key, ref]);
	}

	delete(key: SyncResource): Promise<void> {
		return this.channel.call('delete', [key]);
	}

}

registerSingleton(IUserDataSyncStoreService, UserDataSyncStoreService);
