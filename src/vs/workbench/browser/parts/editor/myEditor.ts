import { BaseEditor } from './baseEditor'
// import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IStorageService } from 'vs/platform/storage/common/storage';


import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { EditorInput, EditorModel } from 'vs/workbench/common/editor';
import * as uuid from 'vs/base/common/uuid';

import * as nls from 'vs/nls';

import * as DOM from 'vs/base/browser/dom';

import { Action } from 'vs/base/common/actions';
import { TPromise } from 'vs/base/common/winjs.base';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';

/*

export interface IKeybindingsEditor extends IEditor {

	activeKeybindingEntry: IKeybindingItemEntry;

	search(filter: string): void;
	focusSearch(): void;
	clearSearchResults(): void;
	focusKeybindings(): void;
	recordSearchKeys(): void;
	toggleSortByPrecedence(): void;
	defineKeybinding(keybindingEntry: IKeybindingItemEntry): Thenable<any>;
	removeKeybinding(keybindingEntry: IKeybindingItemEntry): Thenable<any>;
	resetKeybinding(keybindingEntry: IKeybindingItemEntry): Thenable<any>;
	copyKeybinding(keybindingEntry: IKeybindingItemEntry): void;
	copyKeybindingCommand(keybindingEntry: IKeybindingItemEntry): void;
	showSimilarKeybindings(keybindingEntry: IKeybindingItemEntry): void;
}

*/

let $ = DOM.$;

export class MyEditor extends BaseEditor {

	private ariaLabelElement: HTMLElement;
	static readonly ID: string = 'myEditor';
	private editorService: IEditorService;
	private editorInput: MyEditorInput;

	constructor(
		@IStorageService storageService: IStorageService,
		@IThemeService themeService: IThemeService,
		@IEditorService editorService: IEditorService,
		@IInstantiationService instatiationService: IInstantiationService
		) {
		super(MyEditor.ID, null, themeService, storageService);
		this.editorService = editorService;

		// ? je li problem
		this.editorInput = new MyEditorInput(instatiationService);
		this.editorInput.resource = uuid.generateUuid();
	}

	getId(): string {
		return MyEditor.ID;
	}

	layout(): void { }

	createEditor(parent: HTMLElement): void {

		// dodajemo ga parentu
		const myEditorElement = DOM.append(parent, $('div', { class: 'my-editor' }));

		this.createAriaLabelElement(myEditorElement);
		// this.createOverlayContainer(keybindingsEditorElement);
		// this.createHeader(keybindingsEditorElement);
		// this.createBody(keybindingsEditorElement);

		// const focusTracker = this._register(DOM.trackFocus(parent));
		// this._register(focusTracker.onDidFocus(() => this.keybindingsEditorContextKey.set(true)));
		// this._register(focusTracker.onDidBlur(() => this.keybindingsEditorContextKey.reset()));
	}

	private createAriaLabelElement(parent: HTMLElement): void {
		this.ariaLabelElement = DOM.append(parent, DOM.$(''));
		this.ariaLabelElement.setAttribute('id', 'my-editor-aria-label-element');
		this.ariaLabelElement.setAttribute('aria-live', 'assertive');
	}


	dispose(): void {
		// this.editorFocus.reset();
		// this.contentDisposables = dispose(this.contentDisposables);
		// this.disposables = dispose(this.disposables);
		super.dispose();
	}

	// koristi action
	public openEditor() {
		// kad stavim pinned - true, welcome ne prekriva terminal
		return this.editorService.openEditor(this.editorInput, { pinned: true  });
	}
}

// const ed = instantiationService.createInstance(MyEditor, 'my.editor');


export class MyEditorInput extends EditorInput {

	public static readonly ID: string = 'workbench.input.myeditor';
	public readonly myEditorModel: MyEditorModel;
	private _resource: string;

	constructor(@IInstantiationService instantiationService: IInstantiationService) {
		super();
		this.myEditorModel = instantiationService.createInstance(MyEditorModel);
	}

	getTypeId(): string {
		return MyEditorInput.ID;
	}

	getName(): string {
		return 'my-' + this.resource;
	}

	resolve(): Thenable<MyEditorModel> {
		return Promise.resolve(this.myEditorModel);
	}

	get resource() {
		return this._resource;
	}

	set resource(id: string) {
		this._resource = id;
	}


	matches(otherInput: any): boolean {
		// return otherInput instanceof MyEditorInput;

		if (super.matches(otherInput) === true) {
			return true;
		}

		if (otherInput instanceof MyEditorInput) {
			const otherMyEditorInput = <MyEditorInput>otherInput;

			// Otherwise compare by properties
			return otherMyEditorInput.resource === this.resource;
		}

		return false;

	}


}



export class MyEditorModel extends EditorModel {

	// private _keybindingItems: IKeybindingItem[];
	// private _keybindingItemsSortedByPrecedence: IKeybindingItem[];
	// private modifierLabels: ModifierLabels;


	constructor() {
		super();
	}

	public resolve(): Thenable<EditorModel> {
		return Promise.resolve(null);
	}

}



export class MyEditorAction extends Action {

	public static readonly ID = 'workbench.action.showMyEditor';
	public static readonly LABEL = nls.localize('my.editor.label', "My Editor");

	constructor(
		id: string,
		label: string,
		@IInstantiationService private instantiationService: IInstantiationService
	) {
		super(id, label);
	}

	public run(): TPromise<void> {
		return this.instantiationService.createInstance(MyEditor)
			.openEditor()
			.then(() => undefined);
	}
}