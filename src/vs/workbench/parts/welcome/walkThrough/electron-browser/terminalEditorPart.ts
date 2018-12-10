/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/


import { DomScrollableElement } from 'vs/base/browser/ui/scrollbar/scrollableElement';
import { ScrollbarVisibility } from 'vs/base/common/scrollable';
import * as strings from 'vs/base/common/strings';
import { URI } from 'vs/base/common/uri';
import { IDisposable, dispose } from 'vs/base/common/lifecycle';
import { EditorOptions } from 'vs/workbench/common/editor';
import { BaseEditor } from 'vs/workbench/browser/parts/editor/baseEditor';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { TerminalEditorInput } from 'vs/workbench/parts/welcome/walkThrough/node/terminalEditorInput';
import { IOpenerService } from 'vs/platform/opener/common/opener';

import { IModelService } from 'vs/editor/common/services/modelService';
import { CodeEditorWidget } from 'vs/editor/browser/widget/codeEditorWidget';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { localize } from 'vs/nls';
import { IStorageService } from 'vs/platform/storage/common/storage';
// import { RawContextKey } from 'vs/platform/contextkey/common/contextkey';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';

import { CommandsRegistry } from 'vs/platform/commands/common/commands';

import { IThemeService, registerThemingParticipant } from 'vs/platform/theme/common/themeService';
import { registerColor, focusBorder, textLinkForeground, textLinkActiveForeground, textPreformatForeground, contrastBorder, textBlockQuoteBackground, textBlockQuoteBorder } from 'vs/platform/theme/common/colorRegistry';
import { getExtraColor } from 'vs/workbench/parts/welcome/walkThrough/node/walkThroughUtils';
import { UILabelProvider } from 'vs/base/common/keybindingLabels';
import { OS, OperatingSystem } from 'vs/base/common/platform';

import { INotificationService } from 'vs/platform/notification/common/notification';
import { Dimension, size } from 'vs/base/browser/dom';
import { IEditorGroupsService } from 'vs/workbench/services/group/common/editorGroupsService';
import { CancellationToken } from 'vs/base/common/cancellation';

// export const WALK_THROUGH_FOCUS = new RawContextKey<boolean>('interactivePlaygroundFocus', false);


// const UNBOUND_COMMAND = localize('walkThrough.unboundCommand', "unbound");
// const WALK_THROUGH_EDITOR_VIEW_STATE_PREFERENCE_KEY = 'walkThroughEditorViewState';

/*
interface IViewState {
	scrollTop: number;
	scrollLeft: number;
}
*/

/*
interface IWalkThroughEditorViewState {
	viewState: IViewState;
}
*/

export class TerminalEditorPart extends BaseEditor {

	static readonly ID: string = 'workbench.editor.terminalEditorPart';

	private disposables: IDisposable[] = [];
	private contentDisposables: IDisposable[] = [];
	private content: HTMLDivElement;
	private scrollbar: DomScrollableElement;
	// private editorFocus: IContextKey<boolean>;
	private lastFocus: HTMLElement;
	private size: Dimension;
	// IEditorMemento - za snimanje stanja se koristi
	// private editorMemento: IEditorMemento<IWalkThroughEditorViewState>;

	constructor(
		@ITelemetryService telemetryService: ITelemetryService,
		@IThemeService themeService: IThemeService,
		@IModelService modelService: IModelService,
		@IOpenerService private openerService: IOpenerService,
		@IKeybindingService private keybindingService: IKeybindingService,
		@IStorageService storageService: IStorageService,
		// @IContextKeyService private contextKeyService: IContextKeyService,
		@IConfigurationService private configurationService: IConfigurationService,
		@INotificationService private notificationService: INotificationService,
		@IEditorGroupsService editorGroupService: IEditorGroupsService
	) {
		super(TerminalEditorPart.ID, telemetryService, themeService, storageService);
		// this.editorFocus = WALK_THROUGH_FOCUS.bindTo(this.contextKeyService);
		// this.editorMemento = this.getEditorMemento<IWalkThroughEditorViewState>(editorGroupService, WALK_THROUGH_EDITOR_VIEW_STATE_PREFERENCE_KEY);
	}

	createEditor(container: HTMLElement): void {


		this.content = document.createElement('div');
		// this.content.tabIndex = 0;
		this.content.style.outlineStyle = 'none';

		this.scrollbar = new DomScrollableElement(this.content, {
			horizontal: ScrollbarVisibility.Auto,
			vertical: ScrollbarVisibility.Auto
		});
		this.disposables.push(this.scrollbar);
		container.appendChild(this.scrollbar.getDomNode());

		// this.registerFocusHandlers();
		this.registerClickHandler();

		this.disposables.push(this.scrollbar.onScroll(e => this.updatedScrollPosition()));


	}

	private updatedScrollPosition() {
		const scrollDimensions = this.scrollbar.getScrollDimensions();
		const scrollPosition = this.scrollbar.getScrollPosition();
		const scrollHeight = scrollDimensions.scrollHeight;
		if (scrollHeight && this.input instanceof TerminalEditorInput) {
			const scrollTop = scrollPosition.scrollTop;
			const height = scrollDimensions.height;
			this.input.relativeScrollPosition(scrollTop / scrollHeight, (scrollTop + height) / scrollHeight);
		}
	}

	// private addEventListener<K extends keyof HTMLElementEventMap, E extends HTMLElement>(element: E, type: K, listener: (this: E, ev: HTMLElementEventMap[K]) => any, useCapture?: boolean): IDisposable;
	// private addEventListener<E extends HTMLElement>(element: E, type: string, listener: EventListenerOrEventListenerObject, useCapture?: boolean): IDisposable;
	// private addEventListener<E extends HTMLElement>(element: E, type: string, listener: EventListenerOrEventListenerObject, useCapture?: boolean): IDisposable {
   //		element.addEventListener(type, listener, useCapture);
//		return toDisposable(() => { element.removeEventListener(type, listener, useCapture); });
//	}

	/*
	private registerFocusHandlers() {
		this.disposables.push(this.addEventListener(this.content, 'mousedown', e => {
			this.focus();
		}));
		this.disposables.push(this.addEventListener(this.content, 'focus', e => {
			this.editorFocus.set(true);
		}));
		this.disposables.push(this.addEventListener(this.content, 'blur', e => {
			this.editorFocus.reset();
		}));
		this.disposables.push(this.addEventListener(this.content, 'focusin', e => {
			// Work around scrolling as side-effect of setting focus on the offscreen zone widget (#18929)
			if (e.target instanceof HTMLElement && e.target.classList.contains('zone-widget-container')) {
				const scrollPosition = this.scrollbar.getScrollPosition();
				this.content.scrollTop = scrollPosition.scrollTop;
				this.content.scrollLeft = scrollPosition.scrollLeft;
			}
			if (e.target instanceof HTMLElement) {
				this.lastFocus = e.target;
			}
		}));
	}
	*/



	private registerClickHandler() {
		this.content.addEventListener('click', event => {
			for (let node = event.target as HTMLElement; node; node = node.parentNode as HTMLElement) {
				if (node instanceof HTMLAnchorElement && node.href) {
					let baseElement = window.document.getElementsByTagName('base')[0] || window.location;
					if (baseElement && node.href.indexOf(baseElement.href) >= 0 && node.hash) {
						const scrollTarget = this.content.querySelector(node.hash);
						const innerContent = this.content.firstElementChild;
						if (scrollTarget && innerContent) {
							const targetTop = scrollTarget.getBoundingClientRect().top - 20;
							const containerTop = innerContent.getBoundingClientRect().top;
							this.scrollbar.setScrollPosition({ scrollTop: targetTop - containerTop });
						}
					} else {
						this.open(URI.parse(node.href));
					}
					event.preventDefault();
					break;
				} else if (node instanceof HTMLButtonElement) {
					const href = node.getAttribute('data-href');
					if (href) {
						this.open(URI.parse(href));
					}
					break;
				} else if (node === event.currentTarget) {
					break;
				}
			}
		});
	}

	private open(uri: URI) {
		if (uri.scheme === 'command' && uri.path === 'git.clone' && !CommandsRegistry.getCommand('git.clone')) {
			this.notificationService.info(localize('walkThrough.gitNotFound', "It looks like Git is not installed on your system."));
			return;
		}
		this.openerService.open(this.addFrom(uri));
	}



	private addFrom(uri: URI) {
		if (uri.scheme !== 'command' || !(this.input instanceof TerminalEditorInput)) {
			return uri;
		}
		const query = uri.query ? JSON.parse(uri.query) : {};
		query.from = this.input.getTelemetryFrom();
		return uri.with({ query: JSON.stringify(query) });
	}



	layout(dimension: Dimension): void {
		this.size = dimension;
		size(this.content, dimension.width, dimension.height);
		this.updateSizeClasses();
		this.contentDisposables.forEach(disposable => {
			if (disposable instanceof CodeEditorWidget) {
				disposable.layout();
			}
		});
		this.scrollbar.scanDomNode();
	}

	private updateSizeClasses() {
		const innerContent = this.content.firstElementChild;
		if (this.size && innerContent) {
			const classList = innerContent.classList;
			classList[this.size.height <= 685 ? 'add' : 'remove']('max-height-685px');
		}
	}

	focus(): void {
		let active = document.activeElement;
		while (active && active !== this.content) {
			active = active.parentElement;
		}
		if (!active) {
			(this.lastFocus || this.content).focus();
		}
		// this.editorFocus.set(true);
	}

	arrowUp() {
		const scrollPosition = this.scrollbar.getScrollPosition();
		this.scrollbar.setScrollPosition({ scrollTop: scrollPosition.scrollTop - this.getArrowScrollHeight() });
	}

	arrowDown() {
		const scrollPosition = this.scrollbar.getScrollPosition();
		this.scrollbar.setScrollPosition({ scrollTop: scrollPosition.scrollTop + this.getArrowScrollHeight() });
	}

	private getArrowScrollHeight() {
		let fontSize = this.configurationService.getValue<number>('editor.fontSize');
		if (typeof fontSize !== 'number' || fontSize < 1) {
			fontSize = 12;
		}
		return 3 * fontSize;
	}

	pageUp() {
		const scrollDimensions = this.scrollbar.getScrollDimensions();
		const scrollPosition = this.scrollbar.getScrollPosition();
		this.scrollbar.setScrollPosition({ scrollTop: scrollPosition.scrollTop - scrollDimensions.height });
	}

	pageDown() {
		const scrollDimensions = this.scrollbar.getScrollDimensions();
		const scrollPosition = this.scrollbar.getScrollPosition();
		this.scrollbar.setScrollPosition({ scrollTop: scrollPosition.scrollTop + scrollDimensions.height });
	}

	setInput(input: TerminalEditorInput, options: EditorOptions, token: CancellationToken): Thenable<void> {
		if (this.input instanceof TerminalEditorInput) {
			this.saveTextEditorViewState(this.input);
		}

		this.contentDisposables = dispose(this.contentDisposables);
		this.content.innerHTML = '';

		return super.setInput(input, options, token)
			.then(() => {
				return input.resolve();
			})
			.then(model => {
				if (token.isCancellationRequested) {
					return;
				}

				const content = model.main.textEditorModel.getLinesContent().join('\n');
				if (!strings.endsWith(input.getResource().path, '.md')) {
					this.content.innerHTML = content;
					this.updateSizeClasses();
					this.decorateContent();
					this.contentDisposables.push(this.keybindingService.onDidUpdateKeybindings(() => this.decorateContent()));
					if (input.onReady) {
						input.onReady(this.content.firstElementChild as HTMLElement);
					}
					this.scrollbar.scanDomNode();
					this.loadTextEditorViewState(input);
					this.updatedScrollPosition();
					return;
				}


				this.updateSizeClasses();
				this.multiCursorModifier();
				this.contentDisposables.push(this.configurationService.onDidChangeConfiguration(e => {
					if (e.affectsConfiguration('editor.multiCursorModifier')) {
						this.multiCursorModifier();
					}
				}));

				this.scrollbar.scanDomNode();
				this.loadTextEditorViewState(input);
				this.updatedScrollPosition();
			});
	}


	private decorateContent() {
		/*
		const keys = this.content.querySelectorAll('.shortcut[data-command]');
		Array.prototype.forEach.call(keys, (key: Element) => {
			const command = key.getAttribute('data-command');
			const keybinding = command && this.keybindingService.lookupKeybinding(command);
			const label = keybinding ? keybinding.getLabel() : UNBOUND_COMMAND;
			while (key.firstChild) {
				key.removeChild(key.firstChild);
			}
			key.appendChild(document.createTextNode(label));
		});
		const ifkeys = this.content.querySelectorAll('.if_shortcut[data-command]');
		Array.prototype.forEach.call(ifkeys, (key: HTMLElement) => {
			const command = key.getAttribute('data-command');
			const keybinding = command && this.keybindingService.lookupKeybinding(command);
			key.style.display = !keybinding ? 'none' : '';
		});
		*/
	}

	private multiCursorModifier() {
		const labels = UILabelProvider.modifierLabels[OS];
		const value = this.configurationService.getValue<string>('editor.multiCursorModifier');
		const modifier = labels[value === 'ctrlCmd' ? (OS === OperatingSystem.Macintosh ? 'metaKey' : 'ctrlKey') : 'altKey'];
		const keys = this.content.querySelectorAll('.multi-cursor-modifier');
		Array.prototype.forEach.call(keys, (key: Element) => {
			while (key.firstChild) {
				key.removeChild(key.firstChild);
			}
			key.appendChild(document.createTextNode(modifier));
		});
	}

	private saveTextEditorViewState(input: TerminalEditorInput): void {
		// const scrollPosition = this.scrollbar.getScrollPosition();

		/*
		this.editorMemento.saveEditorState(this.group, input, {
			viewState: {
				scrollTop: scrollPosition.scrollTop,
				scrollLeft: scrollPosition.scrollLeft
			}
		});
		*/
	}

	private loadTextEditorViewState(input: TerminalEditorInput) {
		// const state = this.editorMemento.loadEditorState(this.group, input);
		// if (state) {
		//	this.scrollbar.setScrollPosition(state.viewState);
		// }
	}

	public clearInput(): void {
		if (this.input instanceof TerminalEditorInput) {
			this.saveTextEditorViewState(this.input);
		}
		super.clearInput();
	}

	protected saveState(): void {
		if (this.input instanceof TerminalEditorInput) {
			this.saveTextEditorViewState(this.input);
		}

		super.saveState();
	}

	dispose(): void {
		// this.editorFocus.reset();
		this.contentDisposables = dispose(this.contentDisposables);
		this.disposables = dispose(this.disposables);
		super.dispose();
	}
}

// theming

export const embeddedEditorBackground = registerColor('terminalEditor.embeddedEditorBackground', { dark: null, light: null, hc: null }, localize('walkThrough.embeddedEditorBackground', 'Background color for the embedded editors on the Interactive Playground.'));

registerThemingParticipant((theme, collector) => {
	const color = getExtraColor(theme, embeddedEditorBackground, { dark: 'rgba(0, 0, 0, .4)', extra_dark: 'rgba(200, 235, 255, .064)', light: '#f4f4f4', hc: null });
	if (color) {
		collector.addRule(`.monaco-workbench > .part.editor > .content .terminalEditorontent .monaco-editor-background,
			.monaco-workbench > .part.editor > .content .terminalEditorontent .margin-view-overlays { background: ${color}; }`);
	}
	const link = theme.getColor(textLinkForeground);
	if (link) {
		collector.addRule(`.monaco-workbench > .part.editor > .content .terminalEditorontent a { color: ${link}; }`);
	}
	const activeLink = theme.getColor(textLinkActiveForeground);
	if (activeLink) {
		collector.addRule(`.monaco-workbench > .part.editor > .content .terminalEditorontent a:hover,
			.monaco-workbench > .part.editor > .content .terminalEditorontent a:active { color: ${activeLink}; }`);
	}
	const focusColor = theme.getColor(focusBorder);
	if (focusColor) {
		collector.addRule(`.monaco-workbench > .part.editor > .content .terminalEditorontent a:focus { outline-color: ${focusColor}; }`);
	}
	const shortcut = theme.getColor(textPreformatForeground);
	if (shortcut) {
		collector.addRule(`.monaco-workbench > .part.editor > .content .terminalEditorontent code,
			.monaco-workbench > .part.editor > .content .terminalEditorontent .shortcut { color: ${shortcut}; }`);
	}
	const border = theme.getColor(contrastBorder);
	if (border) {
		collector.addRule(`.monaco-workbench > .part.editor > .content .terminalEditorontent .monaco-editor { border-color: ${border}; }`);
	}
	const quoteBackground = theme.getColor(textBlockQuoteBackground);
	if (quoteBackground) {
		collector.addRule(`.monaco-workbench > .part.editor > .content .terminalEditorontent blockquote { background: ${quoteBackground}; }`);
	}
	const quoteBorder = theme.getColor(textBlockQuoteBorder);
	if (quoteBorder) {
		collector.addRule(`.monaco-workbench > .part.editor > .content .terminalEditorontent blockquote { border-color: ${quoteBorder}; }`);
	}
});
