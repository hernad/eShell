import { BaseEditor } from './baseEditor';

import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IStorageService } from 'vs/platform/storage/common/storage';

import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { EditorInput, EditorOptions, EditorModel } from 'vs/workbench/common/editor';
import * as uuid from 'vs/base/common/uuid';

import * as nls from 'vs/nls';

import * as DOM from 'vs/base/browser/dom';

import { Action } from 'vs/base/common/actions';
import { TPromise } from 'vs/base/common/winjs.base';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
// import * as aria from 'vs/base/browser/ui/aria/aria';

import { IDisposable } from 'vs/base/common/lifecycle';

import {
	ITerminalConfigHelper,
	ITerminalInstance,
	IShellLaunchConfig,
	KEYBINDING_CONTEXT_TERMINAL_FOCUS,
	EXT_HOST_CREATION_DELAY
} from 'vs/workbench/parts/terminal/common/terminal';

import { TerminalInstance } from 'vs/workbench/parts/terminal/electron-browser/terminalInstance';

import { TerminalConfigHelper } from 'vs/workbench/parts/terminal/electron-browser/terminalConfigHelper';

import { Event, Emitter } from 'vs/base/common/event';
import { IContextKeyService, IContextKey } from 'vs/platform/contextkey/common/contextkey';

// import { SplitView, Orientation, IView, Sizing } from 'vs/base/browser/ui/splitview/splitview';

// import { ExtHostContext, MainThreadCommandsShape, ExtHostCommandsShape, MainContext, IExtHostContext } from 'vs/workbench/api/node/extHost.protocol';

import { CancellationToken } from 'vs/base/common/cancellation';


let $ = DOM.$;

// const SPLIT_PANE_MIN_SIZE = 120;
// const TERMINAL_MIN_USEFUL_SIZE = 250;

/*
class SplitPaneContainer {
	private _height: number;
	private _width: number;
	private _splitView: SplitView;
	private _splitViewDisposables: IDisposable[];
	private _children: SplitPane[] = [];

	private _onDidChange: Event<number | undefined> = Event.None;
	public get onDidChange(): Event<number | undefined> {
		return this._onDidChange;
	}

	constructor(private _container: HTMLElement, public orientation: Orientation) {
		this._width = this._container.offsetWidth;
		this._height = this._container.offsetHeight;
		this._createSplitView();
		this._splitView.layout(this.orientation === Orientation.HORIZONTAL ? this._width : this._height);
	}

	private _createSplitView(): void {
		this._splitView = new SplitView(this._container, { orientation: this.orientation });
		this._splitViewDisposables = [];
		this._splitViewDisposables.push(this._splitView.onDidSashReset(() => this._splitView.distributeViewSizes()));
	}

	public split(instance: ITerminalInstance, index: number = this._children.length): void {
		this._addChild(instance, index);
	}

	public resizePane(index: number, direction: Direction, amount: number): void {
		// TODO: Should resize pane up/down resize the panel?

		// Only resize the correct dimension
		const isHorizontal = direction === Direction.Left || direction === Direction.Right;
		if (
			(isHorizontal && this.orientation !== Orientation.HORIZONTAL) ||
			(!isHorizontal && this.orientation !== Orientation.VERTICAL)
		) {
			return;
		}

		// Only resize when there is mor ethan one pane
		if (this._children.length <= 1) {
			return;
		}

		// Get sizes
		const sizes: number[] = [];
		for (let i = 0; i < this._splitView.length; i++) {
			sizes.push(this._splitView.getViewSize(i));
		}

		// Remove size from right pane, unless index is the last pane in which case use left pane
		const isSizingEndPane = index !== this._children.length - 1;
		const indexToChange = isSizingEndPane ? index + 1 : index - 1;
		if (isSizingEndPane && direction === Direction.Left) {
			amount *= -1;
		} else if (!isSizingEndPane && direction === Direction.Right) {
			amount *= -1;
		} else if (isSizingEndPane && direction === Direction.Up) {
			amount *= -1;
		} else if (!isSizingEndPane && direction === Direction.Down) {
			amount *= -1;
		}

		// Ensure the size is not reduced beyond the minimum, otherwise weird things can happen
		if (sizes[index] + amount < SPLIT_PANE_MIN_SIZE) {
			amount = SPLIT_PANE_MIN_SIZE - sizes[index];
		} else if (sizes[indexToChange] - amount < SPLIT_PANE_MIN_SIZE) {
			amount = sizes[indexToChange] - SPLIT_PANE_MIN_SIZE;
		}

		// Apply the size change
		sizes[index] += amount;
		sizes[indexToChange] -= amount;
		for (let i = 0; i < this._splitView.length - 1; i++) {
			this._splitView.resizeView(i, sizes[i]);
		}
	}

	private _addChild(instance: ITerminalInstance, index: number): void {
		const child = new SplitPane(instance, this.orientation === Orientation.HORIZONTAL ? this._height : this._width);
		child.orientation = this.orientation;
		if (typeof index === 'number') {
			this._children.splice(index, 0, child);
		} else {
			this._children.push(child);
		}

		this._withDisabledLayout(() => this._splitView.addView(child, Sizing.Distribute, index));

		this._onDidChange = anyEvent(...this._children.map((c) => c.onDidChange));
	}

	public remove(instance: ITerminalInstance): void {
		let index: number | null = null;
		for (let i = 0; i < this._children.length; i++) {
			if (this._children[i].instance === instance) {
				index = i;
			}
		}
		if (index !== null) {
			this._children.splice(index, 1);
			this._splitView.removeView(index, Sizing.Distribute);
		}
	}

	public layout(width: number, height: number): void {
		this._width = width;
		this._height = height;
		if (this.orientation === Orientation.HORIZONTAL) {
			this._children.forEach((c) => c.orthogonalLayout(height));
			this._splitView.layout(width);
		} else {
			this._children.forEach((c) => c.orthogonalLayout(width));
			this._splitView.layout(height);
		}
	}

	public setOrientation(orientation: Orientation): void {
		if (this.orientation === orientation) {
			return;
		}
		this.orientation = orientation;

		// Remove old split view
		while (this._container.children.length > 0) {
			this._container.removeChild(this._container.children[0]);
		}
		this._splitViewDisposables.forEach((d) => d.dispose());
		this._splitViewDisposables = [];
		this._splitView.dispose();

		// Create new split view with updated orientation
		this._createSplitView();
		this._withDisabledLayout(() => {
			this._children.forEach((child) => {
				child.orientation = orientation;
				this._splitView.addView(child, 1);
			});
		});
	}

	private _withDisabledLayout(innerFunction: () => void): void {
		// Whenever manipulating views that are going to be changed immediately, disabling
		// layout/resize events in the terminal prevent bad dimensions going to the pty.
		this._children.forEach((c) => (c.instance.disableLayout = true));
		innerFunction();
		this._children.forEach((c) => (c.instance.disableLayout = false));
	}
}

class SplitPane implements IView {
	public minimumSize: number = SPLIT_PANE_MIN_SIZE;
	public maximumSize: number = Number.MAX_VALUE;

	public orientation: Orientation | undefined;
	protected _size: number;

	private _onDidChange: Event<number | undefined> = Event.None;
	public get onDidChange(): Event<number | undefined> {
		return this._onDidChange;
	}

	readonly element: HTMLElement;

	constructor(readonly instance: ITerminalInstance, public orthogonalSize: number) {
		this.element = document.createElement('div');
		this.element.className = 'my-terminal-split-pane';
		this.instance.attachToElement(this.element);
	}

	public layout(size: number): void {
		// Only layout when both sizes are known
		this._size = size;
		if (!this._size || !this.orthogonalSize) {
			return;
		}

		if (this.orientation === Orientation.VERTICAL) {
			this.instance.layout({ width: this.orthogonalSize, height: this._size });
		} else {
			this.instance.layout({ width: this._size, height: this.orthogonalSize });
		}
	}

	public orthogonalLayout(size: number): void {
		this.orthogonalSize = size;
	}
}
*/

export class MyEditor extends BaseEditor implements ITerminalMy {
	private ariaLabelElement: HTMLElement;
	static readonly ID: string = 'myEditor';
	// private editorService: IEditorService;
	// private editorInput: MyEditorInput;
	protected terminalFocusContextKey: IContextKey<boolean>;
	private _terminalInstance: ITerminalInstance;

	private terminalContainer: HTMLElement;

	private myElement: HTMLElement;
	private configHelper: ITerminalConfigHelper;
	private shellLaunchConfig: IShellLaunchConfig;
	private instantiationService: IInstantiationService;

	public get terminalInstance(): ITerminalInstance {
		return this._terminalInstance;
	}


	private readonly _onInstancesChanged: Emitter<void>;
	public get onInstancesChanged(): Event<void> {
		return this._onInstancesChanged.event;
	}

	protected readonly _onInstanceCreated: Emitter<ITerminalInstance> = new Emitter<ITerminalInstance>();
	public get onInstanceCreated(): Event<ITerminalInstance> {
		return this._onInstanceCreated.event;
	}

	protected readonly _onMyEditorDisposed: Emitter<ITerminalMy> = new Emitter<ITerminalMy>();
	public get onMyEditorDisposed(): Event<ITerminalMy> {
		return this._onMyEditorDisposed.event;
	}

	private _container: HTMLElement;

	constructor(
		@IContextKeyService private readonly contextKeyService: IContextKeyService,
		@IStorageService storageService: IStorageService,
		@IThemeService themeService: IThemeService,
		// @IEditorService editorService: IEditorService,
		@IInstantiationService instantiationService: IInstantiationService
		// @ITerminalService terminalService: ITerminalService,
		// configHelper: ITerminalConfigHelper,
		// shellLaunchConfig: IShellLaunchConfig,
	) {
		super(MyEditor.ID, null, themeService, storageService);
		// this.editorService = editorService;
		// this.terminalService = terminalService;

		this.instantiationService = instantiationService;
		// this.setInput( new MyEditorInput(this.instantiationService), undefined, undefined );


		this.terminalFocusContextKey = KEYBINDING_CONTEXT_TERMINAL_FOCUS.bindTo(this.contextKeyService);

		this.configHelper = instantiationService.createInstance(TerminalConfigHelper);
		this.shellLaunchConfig = {};

		// this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostCommands);
		// ExtHostContext.ExtHostTerminalService

		//if (this._container) {
		//	this.attachToElement(this._container);
		//}




		this.setInput(new MyEditorInput(this.instantiationService), undefined, undefined);

		this._onInstancesChanged = new Emitter<void>();
	}


	setInput(input: EditorInput, options: EditorOptions, token: CancellationToken): Thenable<void> {
		return super.setInput(input, options, token).then(() => {

			// Update editor options after having set the input. We do this because there can be
			// editor input specific options (e.g. an ARIA label depending on the input showing)
			//this.updateEditorConfiguration();
			// this._editorContainer.setAttribute('aria-label', this.computeAriaLabel());

			console.log('setovan myeditor input', input, options, token)
		});
	}

	private _onTerminalOpened(terminalInstance: ITerminalInstance): void {
		console.log('on terminal opened!');
		/*
		if (terminalInstance.title) {
			this._proxy.$acceptTerminalOpened(terminalInstance.id, terminalInstance.title);
		} else {
			terminalInstance.waitForTitle().then(title => {
				this._proxy.$acceptTerminalOpened(terminalInstance.id, title);
			});
		}
		*/
	}

	public get title(): string {
		let title = this.terminalInstance.title;

		return title;
	}



	private _onInstanceDisposed(instance: ITerminalInstance): void {

		// Fire events and dispose tab if it was the last instance
		this._onInstancesChanged.fire();

		this._onMyEditorDisposed.fire(this);

	}

	getId(): string {
		return MyEditor.ID;
	}

	layout(): void {}

	public createTerminalInstance(): ITerminalInstance {

		const instance = this.instantiationService.createInstance(
			TerminalInstance,
			this.terminalFocusContextKey,
			this.configHelper,
			this.terminalContainer,
			this.shellLaunchConfig
		);



		this._toDispose.push(
			this.onInstanceCreated((instance) => {
				// Delay this message so the TerminalInstance constructor has a chance to finish and
				// return the ID normally to the extension host. The ID that is passed here will be used
				// to register non-extension API terminals in the extension host.
				setTimeout(() => this._onTerminalOpened(instance), EXT_HOST_CREATION_DELAY);
			})
		);

		instance.addDisposable(
			instance.onDisposed((instance) => {
				this._onInstanceDisposed(instance);
			})
		);

		instance.addDisposable(
			instance.onFocused((instance) => {
				// aria.alert(nls.localize('terminalFocus', "Terminal {0}", this.terminalService.activeTabIndex + 1));
				// this._setActiveInstance(instance);
				console.log( 'instance focus:', instance );
			})
		);

		this._onInstanceCreated.fire(instance);
		return instance;
	}

	createEditor(parent: HTMLElement): void {
		// dodajemo ga parentu
		this._container = parent;

		this.terminalContainer = DOM.append(parent, $('div', { class: 'terminal-outer-container' }));
		// this.terminalContainer.style.width = '500px';
		// this.terminalContainer.style.height = '300px';


		this.myElement = DOM.append(this.terminalContainer, $('div', { class: 'my-editor' }));

		DOM.append(this.myElement, $('div')).innerHTML = `<h1>${this.input.getName()}</h1>`;

		this.createAriaLabelElement(this.myElement);





		this.myElement.classList.add('terminal-mymy');
		// hernad privremeni fix
		(this.configHelper as any).panelContainer = this.myElement;


		const instance = this.createTerminalInstance();

		this.addDisposable(this.onMyEditorDisposed(this._onMyEditorDisposed.fire, this._onMyEditorDisposed));
		this.addDisposable(this.onInstancesChanged(this._onInstancesChanged.fire, this._onInstancesChanged));


		this._terminalInstance = instance;


		this._terminalInstance.attachToElement(this.myElement);

		this._terminalInstance.setVisible(true);

	}

	private createAriaLabelElement(parent: HTMLElement): void {
		this.ariaLabelElement = DOM.append(parent, DOM.$(''));
		this.ariaLabelElement.setAttribute('id', 'my-editor-aria-label-element');
		this.ariaLabelElement.setAttribute('aria-live', 'assertive');
	}

	public addDisposable(disposable: IDisposable): void {
		this._register(disposable);
	}

	dispose(): void {
		// this.editorFocus.reset();
		// this.contentDisposables = dispose(this.contentDisposables);
		// this.disposables = dispose(this.disposables);
		super.dispose();

		if (this.myElement) {
			this._container.removeChild(this.myElement);
			this.myElement = null;
		}

		this._terminalInstance = null;
		this._onInstancesChanged.fire();
	}

	// koristi action
	// public openEditor() {
		// kad stavim pinned - true, welcome ne prekriva terminal

	//	return this.openEditor(this.input, { pinned: true });
	//}
}

// const ed = instantiationService.createInstance(MyEditor, 'my.editor');

export class MyEditorInput extends EditorInput {
	public static readonly ID: string = 'workbench.input.myeditor';
	public readonly myEditorModel: MyEditorModel;
	private _resource: string;

	constructor(@IInstantiationService instantiationService: IInstantiationService) {
		super();
		this.myEditorModel = instantiationService.createInstance(MyEditorModel);

		this.resource = uuid.generateUuid();
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
	public static readonly LABEL = nls.localize('my.editor.label', 'My Editor');


	constructor(id: string, label: string,
		@IInstantiationService private instantiationService: IInstantiationService,
		@IEditorService private editorService: IEditorService,

		) {
		super(id, label);
	}

	public run(): TPromise<void> {
		//return this.instantiationService.createInstance(MyEditor).openEditor().then(() => undefined);
		// const editor = this.instantiationService.createInstance(MyEditor);
		// editor.createEditor()

		// this.editorService.openEditor( )
		const editorInput = new MyEditorInput( this.instantiationService );
		return this.editorService.openEditor(editorInput, {pinned: true}).then( () => undefined );
	}
}

export interface ITerminalMy {

	terminalInstance: ITerminalInstance;
	title: string;
	onMyEditorDisposed: Event<ITerminalMy>;
	onInstancesChanged: Event<void>;

	//focusPreviousPane(): void;
	//focusNextPane(): void;

	//resizePane(direction: Direction): void;

	// setActiveInstanceByIndex(index: number): void;
	// attachToElement(element: HTMLElement): void;
	setVisible(visible: boolean): void;
	layout(width: number, height: number): void;
	addDisposable(disposable: IDisposable): void;

	// split(terminalFocusContextKey: IContextKey<boolean>, configHelper: ITerminalConfigHelper, shellLaunchConfig: IShellLaunchConfig): ITerminalInstance | undefined;
}
