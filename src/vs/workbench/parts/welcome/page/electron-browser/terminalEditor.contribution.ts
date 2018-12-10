/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize } from 'vs/nls';
import { IWorkbenchContributionsRegistry, Extensions as WorkbenchExtensions } from 'vs/workbench/common/contributions';
import { Registry } from 'vs/platform/registry/common/platform';
import { TerminalEditorContribution, TerminalEditorAction, TerminalEditorInputFactory } from 'vs/workbench/parts/welcome/page/electron-browser/terminalEditor';
import { IWorkbenchActionRegistry, Extensions as ActionExtensions } from 'vs/workbench/common/actions';
import { SyncActionDescriptor, MenuRegistry, MenuId } from 'vs/platform/actions/common/actions';
import { IConfigurationRegistry, Extensions as ConfigurationExtensions, ConfigurationScope } from 'vs/platform/configuration/common/configurationRegistry';

import { IEditorInputFactoryRegistry, Extensions as EditorExtensions } from 'vs/workbench/common/editor';
import { EditorDescriptor, Extensions as EditorExtensionsBrowser, IEditorRegistry } from 'vs/workbench/browser/editor';

//import { EditorDescriptor, Extensions as EditorExtensions, IEditorRegistry } from 'vs/workbench/browser/editor';

// import { EditorDescriptor, Extensions as EditorExtensions, IEditorRegistry } from 'vs/workbench/browser/editor';


import { LifecyclePhase } from 'vs/platform/lifecycle/common/lifecycle';

Registry.as<IConfigurationRegistry>(ConfigurationExtensions.Configuration)
	.registerConfiguration({
		'id': 'workbench',
		'order': 7,
		'title': localize('workbenchConfigurationTitle', "Workbench"),
		'properties': {
			'workbench.terminalEditor': {
				'scope': ConfigurationScope.APPLICATION, // Make sure repositories cannot trigger opening a README for tracking.
				'type': 'string',
				'enum': ['none', 'f18Terminal'],
				'enumDescriptions': [
					localize({ comment: ['This is the description for a setting. Values surrounded by single quotes are not to be translated.'], key: 'workbench.startupTerminal.none' }, "Start without an terminal."),
					localize({ comment: ['This is the description for a setting. Values surrounded by single quotes are not to be translated.'], key: 'workbench.startupTerminal.f18Terminal' }, "Otvoriti F18 terminal.")
				],
				'default': 'f18Terminal',
				'description': localize('workbench.startupEditor', "Aktivirati F18 terminal.")
			},
		}
	});

Registry.as<IWorkbenchContributionsRegistry>(WorkbenchExtensions.Workbench)
	.registerWorkbenchContribution(TerminalEditorContribution, LifecyclePhase.Restored);

Registry.as<IWorkbenchActionRegistry>(ActionExtensions.WorkbenchActions)
	.registerWorkbenchAction(new SyncActionDescriptor(TerminalEditorAction, TerminalEditorAction.ID, TerminalEditorAction.LABEL), 'F18: Terminal', localize('terminalF18', "F18 Terminal"));

Registry.as<IEditorInputFactoryRegistry>(EditorExtensions.EditorInputFactories).registerEditorInputFactory(TerminalEditorInputFactory.ID, TerminalEditorInputFactory);


import { TerminalEditorPart } from 'vs/workbench/parts/welcome/walkThrough/electron-browser/terminalEditorPart';
import { TerminalEditorInput } from 'vs/workbench/parts/welcome/walkThrough/node/terminalEditorInput';
import { SyncDescriptor } from 'vs/platform/instantiation/common/descriptors';


Registry.as<IEditorRegistry>(EditorExtensionsBrowser.Editors)
	.registerEditor(new EditorDescriptor(
		TerminalEditorPart,
		TerminalEditorPart.ID,
		localize('terminalEditor.editor.label', "F18 terminal"),
	),
		[new SyncDescriptor(TerminalEditorInput)]);


MenuRegistry.appendMenuItem(MenuId.MenubarHelpMenu, {
	group: '1_welcome',
	command: {
		id: 'workbench.action.showF18Terminal',
		title: localize({ key: 'miF18Terminal', comment: ['&& denotes a mnemonic'] }, "F1&&8 Terminal")
	},
	order: 1
});

import { TerminalEditorContentProvider } from 'vs/workbench/parts/welcome/walkThrough/node/terminalEditorContentProvider';


Registry.as<IWorkbenchContributionsRegistry>(WorkbenchExtensions.Workbench)
	.registerWorkbenchContribution(TerminalEditorContentProvider, LifecyclePhase.Starting);