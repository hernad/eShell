/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import 'vs/css!./terminalEditor';
import { URI } from 'vs/base/common/uri';
import * as strings from 'vs/base/common/strings';
import * as path from 'path';
import { ICommandService } from 'vs/platform/commands/common/commands';
import * as arrays from 'vs/base/common/arrays';
import { TerminalEditorInput } from 'vs/workbench/parts/welcome/walkThrough/node/terminalEditorInput';
import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { onUnexpectedError } from 'vs/base/common/errors';
// import { IWindowService } from 'vs/platform/windows/common/windows';
import { TPromise } from 'vs/base/common/winjs.base';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { localize } from 'vs/nls';
import { Action } from 'vs/base/common/actions';
// import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
// import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { Schemas } from 'vs/base/common/network';
import { IBackupFileService } from 'vs/workbench/services/backup/common/backup';
// import { getInstalledExtensions, IExtensionStatus, onExtensionChanged, isKeymapExtension } from 'vs/workbench/parts/extensions/electron-browser/extensionsUtils';
// import { IExtensionEnablementService, IExtensionManagementService, IExtensionGalleryService, IExtensionTipsService, EnablementState, LocalExtensionType } from 'vs/platform/extensionManagement/common/extensionManagement';
import { used } from 'vs/workbench/parts/welcome/page/electron-browser/terminal';
import { ILifecycleService, StartupKind } from 'vs/platform/lifecycle/common/lifecycle';
import { IDisposable, dispose } from 'vs/base/common/lifecycle';
// import { tildify, getBaseLabel } from 'vs/base/common/labels';
import { registerThemingParticipant } from 'vs/platform/theme/common/themeService';
import { registerColor, focusBorder, textLinkForeground, textLinkActiveForeground, foreground, descriptionForeground, contrastBorder, activeContrastBorder } from 'vs/platform/theme/common/colorRegistry';
import { getExtraColor } from 'vs/workbench/parts/welcome/walkThrough/node/walkThroughUtils';
// import { IExtensionsWorkbenchService } from 'vs/workbench/parts/extensions/common/extensions';
// import { IWorkspaceIdentifier, ISingleFolderWorkspaceIdentifier, isSingleFolderWorkspaceIdentifier, isWorkspaceIdentifier } from 'vs/platform/workspaces/common/workspaces';
import { IEditorInputFactory, EditorInput } from 'vs/workbench/common/editor';
// import { getIdAndVersionFromLocalExtensionId } from 'vs/platform/extensionManagement/node/extensionManagementUtil';
// import { INotificationService, Severity } from 'vs/platform/notification/common/notification';
// import { TimeoutTimer } from 'vs/base/common/async';
// import { areSameExtensions } from 'vs/platform/extensionManagement/common/extensionManagementUtil';
// import { ILabelService } from 'vs/platform/label/common/label';
import { IFileService } from 'vs/platform/files/common/files';

used();

const configurationKey = 'workbench.terminalEditor';
// const oldConfigurationKey = 'workbench.welcome.enabled';
// const telemetryFrom = 'terminalEditor';

export class TerminalEditorContribution implements IWorkbenchContribution {

	constructor(
		@IInstantiationService instantiationService: IInstantiationService,
		@IConfigurationService configurationService: IConfigurationService,
		@IEditorService editorService: IEditorService,
		@IBackupFileService backupFileService: IBackupFileService,
		@IFileService fileService: IFileService,
		@IWorkspaceContextService contextService: IWorkspaceContextService,
		@ILifecycleService lifecycleService: ILifecycleService,
		@ICommandService private commandService: ICommandService,
	) {
		if (lifecycleService.startupKind !== StartupKind.ReloadedWindow) {
			backupFileService.hasBackups().then(hasBackups => {
				const activeEditor = editorService.activeEditor;
				if (!activeEditor && !hasBackups) {
					const openWithReadme = configurationService.getValue(configurationKey) === 'readme';
					if (openWithReadme) {
						return Promise.all(contextService.getWorkspace().folders.map(folder => {
							const folderUri = folder.uri;
							return fileService.readFolder(folderUri)
								.then(files => {
									const file = arrays.find(files.sort(), file => strings.startsWith(file.toLowerCase(), 'readme'));
									if (file) {
										return folderUri.with({
											path: path.posix.join(folderUri.path, file)
										});
									}
									return undefined;
								}, onUnexpectedError);
						})).then(results => results.filter(result => !!result))
							.then<any>(readmes => {
								if (!editorService.activeEditor) {
									if (readmes.length) {
										const isMarkDown = (readme: URI) => strings.endsWith(readme.path.toLowerCase(), '.md');
										return Promise.all([
											this.commandService.executeCommand('markdown.showPreview', null, readmes.filter(isMarkDown), { locked: true }),
											editorService.openEditors(readmes.filter(readme => !isMarkDown(readme))
												.map(readme => ({ resource: readme }))),
										]);
									} else {
										return instantiationService.createInstance(TerminalEditor).openEditor();
									}
								}
								return undefined;
							});
					} else {
						return instantiationService.createInstance(TerminalEditor).openEditor();
					}
				}
				return undefined;
			}).then(null, onUnexpectedError);
		}
	}
}



export class TerminalEditorAction extends Action {

	public static readonly ID = 'workbench.action.showF18Terminal';
	public static readonly LABEL = localize('terminalEditor', "F18 Terminal");

	constructor(
		id: string,
		label: string,
		@IInstantiationService private instantiationService: IInstantiationService
	) {
		super(id, label);
	}

	public run(): TPromise<void> {
		return this.instantiationService.createInstance(TerminalEditor)
			.openEditor()
			.then(() => undefined);
	}
}

/*
interface ExtensionSuggestion {
	name: string;
	title?: string;
	id: string;
	isKeymap?: boolean;
	isCommand?: boolean;
}
*/

/*
const extensionPacks: ExtensionSuggestion[] = [
];

const keymapExtensions: ExtensionSuggestion[] = [
	{ name: localize('terminalEditor.atom', "Atom"), id: 'ms-vscode.atom-keybindings', isKeymap: true },
];
*/

/*
interface Strings {
	installEvent: string;
	installedEvent: string;
	detailsEvent: string;

	alreadyInstalled: string;
	reloadAfterInstall: string;
	installing: string;
	extensionNotFound: string;
}
*/

/*

const extensionPackStrings: Strings = {
	installEvent: 'installExtension',
	installedEvent: 'installedExtension',
	detailsEvent: 'detailsExtension',

	alreadyInstalled: localize('terminalEditor.extensionPackAlreadyInstalled', "Support for {0} is already installed."),
	reloadAfterInstall: localize('terminalEditor.willReloadAfterInstallingExtensionPack', "The window will reload after installing additional support for {0}."),
	installing: localize('terminalEditor.installingExtensionPack', "Installing additional support for {0}..."),
	extensionNotFound: localize('terminalEditor.extensionPackNotFound', "Support for {0} with id {1} could not be found."),
};


const keymapStrings: Strings = {
	installEvent: 'installKeymap',
	installedEvent: 'installedKeymap',
	detailsEvent: 'detailsKeymap',

	alreadyInstalled: localize('terminalEditor.keymapAlreadyInstalled', "The {0} keyboard shortcuts are already installed."),
	reloadAfterInstall: localize('terminalEditor.willReloadAfterInstallingKeymap', "The window will reload after installing the {0} keyboard shortcuts."),
	installing: localize('terminalEditor.installingKeymap', "Installing the {0} keyboard shortcuts..."),
	extensionNotFound: localize('terminalEditor.keymapNotFound', "The {0} keyboard shortcuts with id {1} could not be found."),
};
*/

const terminalEditorTypeId = 'workbench.editors.terminalEditorInput';

class TerminalEditor {

	private disposables: IDisposable[] = [];

	readonly editorInput: TerminalEditorInput;

	constructor(
		@IEditorService private editorService: IEditorService,
		@IInstantiationService private instantiationService: IInstantiationService,
		// @IWindowService private windowService: IWindowService,
		// @IWorkspaceContextService private contextService: IWorkspaceContextService,
		// @IConfigurationService private configurationService: IConfigurationService,
		// @IEnvironmentService private environmentService: IEnvironmentService,
		// @ILabelService private labelService: ILabelService,
		// @INotificationService private notificationService: INotificationService,
		// @IExtensionEnablementService private extensionEnablementService: IExtensionEnablementService,
		// @IExtensionGalleryService private extensionGalleryService: IExtensionGalleryService,
		// @IExtensionManagementService private extensionManagementService: IExtensionManagementService,
		// @IExtensionTipsService private tipsService: IExtensionTipsService,
		// @IExtensionsWorkbenchService private extensionsWorkbenchService: IExtensionsWorkbenchService,
		@ILifecycleService lifecycleService: ILifecycleService,
		// @ITelemetryService private telemetryService: ITelemetryService
	) {
		this.disposables.push(lifecycleService.onShutdown(() => this.dispose()));

		// const recentlyOpened = this.windowService.getRecentlyOpened();
		// const installedExtensions = this.instantiationService.invokeFunction(getInstalledExtensions);


		const resource = URI.parse(require.toUrl('./terminal'))
			.with({
				scheme: Schemas.terminalF18,
				query: JSON.stringify({ moduleId: 'vs/workbench/parts/welcome/page/electron-browser/terminal' })
			});

		this.editorInput = this.instantiationService.createInstance(TerminalEditorInput, {
			typeId: terminalEditorTypeId,
			name: localize('terminalEditor.title', "F18 Terminal"),
			resource,
			// telemetryFrom,
			// onReady: (container: HTMLElement) => this.onReady(container, recentlyOpened, installedExtensions)
			// onReady: (container: HTMLElement) => this.onReady(container, recentlyOpened, installedExtensions)
		});


	}

	public openEditor() {
		// kad stavim pinned - true, welcome ne prekriva terminal
		return this.editorService.openEditor(this.editorInput, { pinned: true  });
	}

	/*
	private onReady(container: HTMLElement, recentlyOpened: TPromise<{ files: URI[]; workspaces: (IWorkspaceIdentifier | ISingleFolderWorkspaceIdentifier)[]; }>, installedExtensions: TPromise<IExtensionStatus[]>): void {

		const showOnStartup = <HTMLInputElement>container.querySelector('#showOnStartup');

		showOnStartup.setAttribute('checked', 'checked');
		showOnStartup.addEventListener('click', e => {
			this.configurationService.updateValue(configurationKey, showOnStartup.checked ? 'terminalEditor' : 'newUntitledFile', ConfigurationTarget.USER);
		});

		recentlyOpened.then(({ workspaces }) => {
			// Filter out the current workspace
			workspaces = workspaces.filter(workspace => !this.contextService.isCurrentWorkspace(workspace));
			if (!workspaces.length) {
				const recent = container.querySelector('.terminalEditor') as HTMLElement;
				recent.classList.add('emptyRecent');
				return;
			}
			const ul = container.querySelector('.recent ul');
			const before = ul.firstElementChild;
			workspaces.slice(0, 5).forEach(workspace => {
				let label: string;
				let resource: URI;
				if (isSingleFolderWorkspaceIdentifier(workspace)) {
					resource = workspace;
					label = this.labelService.getWorkspaceLabel(workspace);
				} else if (isWorkspaceIdentifier(workspace)) {
					label = this.labelService.getWorkspaceLabel(workspace);
					resource = URI.file(workspace.configPath);
				} else {
					label = getBaseLabel(workspace);
					resource = URI.file(workspace);
				}

				const li = document.createElement('li');

				const a = document.createElement('a');
				let name = label;
				let parentFolderPath: string;

				if (resource.scheme === Schemas.file) {
					let parentFolder = path.dirname(resource.fsPath);
					if (!name && parentFolder) {
						const tmp = name;
						name = parentFolder;
						parentFolder = tmp;
					}
					parentFolderPath = tildify(parentFolder, this.environmentService.userHome);
				} else {
					parentFolderPath = this.labelService.getUriLabel(resource);
				}


				a.innerText = name;
				a.title = label;
				a.setAttribute('aria-label', localize('terminalEditor.openFolderWithPath', "Open folder {0} with path {1}", name, parentFolderPath));
				a.href = 'javascript:void(0)';
				a.addEventListener('click', e => {

					this.telemetryService.publicLog('workbenchActionExecuted', {
						id: 'openRecentFolder',
						from: telemetryFrom
					});
					this.windowService.openWindow([resource], { forceNewWindow: e.ctrlKey || e.metaKey });
					e.preventDefault();
					e.stopPropagation();
				});
				li.appendChild(a);

				const span = document.createElement('span');
				span.classList.add('path');
				span.classList.add('detail');
				span.innerText = parentFolderPath;
				span.title = label;
				li.appendChild(span);

				ul.insertBefore(li, before);
			});
		}).then(null, onUnexpectedError);


		this.addExtensionList(container, '.extensionPackList', extensionPacks, extensionPackStrings);
		this.addExtensionList(container, '.keymapList', keymapExtensions, keymapStrings);

		this.updateInstalledExtensions(container, installedExtensions);
		this.disposables.push(this.instantiationService.invokeFunction(onExtensionChanged)(ids => {
			for (const id of ids) {
				if (container.querySelector(`.installExtension[data-extension="${stripVersion(id.id)}"], .enabledExtension[data-extension="${stripVersion(id.id)}"]`)) {
					const installedExtensions = this.instantiationService.invokeFunction(getInstalledExtensions);
					this.updateInstalledExtensions(container, installedExtensions);
					break;
				}
			}
		}));
	}


	private addExtensionList(container: HTMLElement, listSelector: string, suggestions: ExtensionSuggestion[], strings: Strings) {
		const list = container.querySelector(listSelector);
		if (list) {
			suggestions.forEach((extension, i) => {
				if (i) {
					list.appendChild(document.createTextNode(localize('terminalEditor.extensionListSeparator', ", ")));
				}

				const a = document.createElement('a');
				a.innerText = extension.name;
				a.title = extension.title || (extension.isKeymap ? localize('terminalEditor.installKeymap', "Install {0} keymap", extension.name) : localize('terminalEditor.installExtensionPack', "Install additional support for {0}", extension.name));
				if (extension.isCommand) {
					a.href = `command:${extension.id}`;
					list.appendChild(a);
				} else {
					a.classList.add('installExtension');
					a.setAttribute('data-extension', extension.id);
					a.href = 'javascript:void(0)';
					a.addEventListener('click', e => {
						this.installExtension(extension, strings);
						e.preventDefault();
						e.stopPropagation();
					});
					list.appendChild(a);

					const span = document.createElement('span');
					span.innerText = extension.name;
					span.title = extension.isKeymap ? localize('terminalEditor.installedKeymap', "{0} keymap is already installed", extension.name) : localize('terminalEditor.installedExtensionPack', "{0} support is already installed", extension.name);
					span.classList.add('enabledExtension');
					span.setAttribute('data-extension', extension.id);
					list.appendChild(span);
				}
			});
		}
	}


	private installExtension(extensionSuggestion: ExtensionSuggestion, strings: Strings): void {

		this.telemetryService.publicLog(strings.installEvent, {
			from: telemetryFrom,
			extensionId: extensionSuggestion.id,
		});
		this.instantiationService.invokeFunction(getInstalledExtensions).then(extensions => {
			const installedExtension = arrays.first(extensions, extension => stripVersion(extension.identifier.id) === extensionSuggestion.id);
			if (installedExtension && installedExtension.globallyEnabled) {

				this.telemetryService.publicLog(strings.installedEvent, {
					from: telemetryFrom,
					extensionId: extensionSuggestion.id,
					outcome: 'already_enabled',
				});
				this.notificationService.info(strings.alreadyInstalled.replace('{0}', extensionSuggestion.name));
				return;
			}
			const foundAndInstalled = installedExtension ? Promise.resolve(installedExtension.local) : this.extensionGalleryService.query({ names: [extensionSuggestion.id], source: telemetryFrom })
				.then(result => {
					const [extension] = result.firstPage;
					if (!extension) {
						return null;
					}
					return this.extensionManagementService.installFromGallery(extension)
						.then(() => this.extensionManagementService.getInstalled(LocalExtensionType.User))
						.then(installed => {
							const local = installed.filter(i => areSameExtensions(extension.identifier, i.galleryIdentifier))[0];
							// TODO: Do this as part of the install to avoid multiple events.
							return this.extensionEnablementService.setEnablement(local, EnablementState.Disabled).then(() => local);
						});
				});

			this.notificationService.prompt(
				Severity.Info,
				strings.reloadAfterInstall.replace('{0}', extensionSuggestion.name),
				[{
					label: localize('ok', "OK"),
					run: () => {
						const messageDelay = new TimeoutTimer();
						messageDelay.cancelAndSet(() => {
							this.notificationService.info(strings.installing.replace('{0}', extensionSuggestion.name));
						}, 300);
						TPromise.join(extensionSuggestion.isKeymap ? extensions.filter(extension => isKeymapExtension(this.tipsService, extension) && extension.globallyEnabled)
							.map(extension => {
								return this.extensionEnablementService.setEnablement(extension.local, EnablementState.Disabled);
							}) : []).then(() => {
								return foundAndInstalled.then(foundExtension => {
									messageDelay.cancel();
									if (foundExtension) {
										return this.extensionEnablementService.setEnablement(foundExtension, EnablementState.Enabled)
											.then(() => {

												this.telemetryService.publicLog(strings.installedEvent, {
													from: telemetryFrom,
													extensionId: extensionSuggestion.id,
													outcome: installedExtension ? 'enabled' : 'installed',
												});
												return this.windowService.reloadWindow();
											});
									} else {
										this.telemetryService.publicLog(strings.installedEvent, {
											from: telemetryFrom,
											extensionId: extensionSuggestion.id,
											outcome: 'not_found',
										});
										this.notificationService.error(strings.extensionNotFound.replace('{0}', extensionSuggestion.name).replace('{1}', extensionSuggestion.id));
										return undefined;
									}
								});
							}).then(null, err => {
								this.telemetryService.publicLog(strings.installedEvent, {
									from: telemetryFrom,
									extensionId: extensionSuggestion.id,
									outcome: isPromiseCanceledError(err) ? 'canceled' : 'error',
									error: String(err),
								});
								this.notificationService.error(err);
							});
					}
				}, {
					label: localize('details', "Details"),
					run: () => {
						this.telemetryService.publicLog(strings.detailsEvent, {
							from: telemetryFrom,
							extensionId: extensionSuggestion.id,
						});
						this.extensionsWorkbenchService.queryGallery({ names: [extensionSuggestion.id] })
							.then(result => this.extensionsWorkbenchService.open(result.firstPage[0]))
							.then(null, onUnexpectedError);
					}
				}]
			);
		}).then(null, err => {
			this.telemetryService.publicLog(strings.installedEvent, {
				from: telemetryFrom,
				extensionId: extensionSuggestion.id,
				outcome: isPromiseCanceledError(err) ? 'canceled' : 'error',
				error: String(err),
			});
			this.notificationService.error(err);
		});

	}


	private updateInstalledExtensions(container: HTMLElement, installedExtensions: TPromise<IExtensionStatus[]>) {
		installedExtensions.then(extensions => {
			const elements = container.querySelectorAll('.installExtension, .enabledExtension');
			for (let i = 0; i < elements.length; i++) {
				elements[i].classList.remove('installed');
			}
			extensions.filter(ext => ext.globallyEnabled)
				.map(ext => stripVersion(ext.identifier.id))
				.forEach(id => {
					const install = container.querySelectorAll(`.installExtension[data-extension="${id}"]`);
					for (let i = 0; i < install.length; i++) {
						install[i].classList.add('installed');
					}
					const enabled = container.querySelectorAll(`.enabledExtension[data-extension="${id}"]`);
					for (let i = 0; i < enabled.length; i++) {
						enabled[i].classList.add('installed');
					}
				});
		}).then(null, onUnexpectedError);
	}
	*/

	dispose(): void {
		this.disposables = dispose(this.disposables);
	}
}

/*
function stripVersion(id: string): string {
	return getIdAndVersionFromLocalExtensionId(id).id;
}
*/


export class TerminalEditorInputFactory implements IEditorInputFactory {

	static readonly ID = terminalEditorTypeId;

	public serialize(editorInput: EditorInput): string {
		return '{}';
	}

	public deserialize(instantiationService: IInstantiationService, serializedEditorInput: string): TerminalEditorInput {
		return instantiationService.createInstance(TerminalEditor)
			.editorInput;
	}
}

// theming

export const buttonBackground = registerColor('terminalEditor.buttonBackground', { dark: null, light: null, hc: null }, localize('terminalEditor.buttonBackground', 'Background color for the buttons on the Welcome page.'));
export const buttonHoverBackground = registerColor('terminalEditor.buttonHoverBackground', { dark: null, light: null, hc: null }, localize('terminalEditor.buttonHoverBackground', 'Hover background color for the buttons on the Welcome page.'));
export const terminalEditorBackground = registerColor('terminalEditor.background', { light: null, dark: null, hc: null }, localize('terminalEditor.background', 'Background color for the Welcome page.'));

registerThemingParticipant((theme, collector) => {
	const backgroundColor = theme.getColor(terminalEditorBackground);
	if (backgroundColor) {
		collector.addRule(`.monaco-workbench > .part.editor > .content .terminalEditorContainer { background-color: ${backgroundColor}; }`);
	}
	const foregroundColor = theme.getColor(foreground);
	if (foregroundColor) {
		collector.addRule(`.monaco-workbench > .part.editor > .content .terminalEditor .caption { color: ${foregroundColor}; }`);
	}
	const descriptionColor = theme.getColor(descriptionForeground);
	if (descriptionColor) {
		collector.addRule(`.monaco-workbench > .part.editor > .content .terminalEditor .detail { color: ${descriptionColor}; }`);
	}
	const buttonColor = getExtraColor(theme, buttonBackground, { dark: 'rgba(0, 0, 0, .2)', extra_dark: 'rgba(200, 235, 255, .042)', light: 'rgba(0,0,0,.04)', hc: 'black' });
	if (buttonColor) {
		collector.addRule(`.monaco-workbench > .part.editor > .content .terminalEditor .commands .item button { background: ${buttonColor}; }`);
	}
	const buttonHoverColor = getExtraColor(theme, buttonHoverBackground, { dark: 'rgba(200, 235, 255, .072)', extra_dark: 'rgba(200, 235, 255, .072)', light: 'rgba(0,0,0,.10)', hc: null });
	if (buttonHoverColor) {
		collector.addRule(`.monaco-workbench > .part.editor > .content .terminalEditor .commands .item button:hover { background: ${buttonHoverColor}; }`);
	}
	const link = theme.getColor(textLinkForeground);
	if (link) {
		collector.addRule(`.monaco-workbench > .part.editor > .content .terminalEditor a { color: ${link}; }`);
	}
	const activeLink = theme.getColor(textLinkActiveForeground);
	if (activeLink) {
		collector.addRule(`.monaco-workbench > .part.editor > .content .terminalEditor a:hover,
			.monaco-workbench > .part.editor > .content .terminalEditor a:active { color: ${activeLink}; }`);
	}
	const focusColor = theme.getColor(focusBorder);
	if (focusColor) {
		collector.addRule(`.monaco-workbench > .part.editor > .content .terminalEditor a:focus { outline-color: ${focusColor}; }`);
	}
	const border = theme.getColor(contrastBorder);
	if (border) {
		collector.addRule(`.monaco-workbench > .part.editor > .content .terminalEditor .commands .item button { border-color: ${border}; }`);
	}
	const activeBorder = theme.getColor(activeContrastBorder);
	if (activeBorder) {
		collector.addRule(`.monaco-workbench > .part.editor > .content .terminalEditor .commands .item button:hover { outline-color: ${activeBorder}; }`);
	}
});
