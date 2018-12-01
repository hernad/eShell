/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

export interface ITerminalLauncher {
	runInTerminal(args: DebugProtocol.RunInTerminalRequestArguments, config: ITerminalSettings): Promise<number | undefined>;
}

export interface ITerminalSettings {
	external: {
		windowsExec: string,
		osxExec: string,
		linuxExec: string
	};
	integrated: {
		shell: {
			osx: string,
			windows: string,
			linux: string
		}
	};
}


export interface IExceptionInfo {
	readonly id?: string;
	readonly description?: string;
	readonly breakMode: string;
	readonly details?: DebugProtocol.ExceptionDetails;
}