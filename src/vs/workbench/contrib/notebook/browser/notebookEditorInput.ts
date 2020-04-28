/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { EditorInput, EditorModel, IEditorInput, GroupIdentifier, ISaveOptions, IRevertOptions } from 'vs/workbench/common/editor';
import { Emitter, Event } from 'vs/base/common/event';
import { INotebookService } from 'vs/workbench/contrib/notebook/browser/notebookService';
import { ICell, NotebookCellTextModelSplice } from 'vs/workbench/contrib/notebook/common/notebookCommon';
import { URI } from 'vs/base/common/uri';
import { NotebookTextModel } from 'vs/workbench/contrib/notebook/common/model/notebookTextModel';
import { NotebookCellTextModel } from 'vs/workbench/contrib/notebook/common/model/notebookCellTextModel';
import { isEqual } from 'vs/base/common/resources';
import { IWorkingCopyService, IWorkingCopy, WorkingCopyCapabilities, IWorkingCopyBackup } from 'vs/workbench/services/workingCopy/common/workingCopyService';

export class NotebookEditorModel extends EditorModel {
	private _dirty = false;

	protected readonly _onDidChangeDirty = this._register(new Emitter<void>());
	readonly onDidChangeDirty = this._onDidChangeDirty.event;

	private readonly _onDidChangeCells = new Emitter<NotebookCellTextModelSplice[]>();
	get onDidChangeCells(): Event<NotebookCellTextModelSplice[]> { return this._onDidChangeCells.event; }

	private readonly _onDidChangeContent = this._register(new Emitter<void>());
	readonly onDidChangeContent: Event<void> = this._onDidChangeContent.event;


	get notebook() {
		return this._notebook;
	}

	constructor(
		private _notebook: NotebookTextModel
	) {
		super();

		if (_notebook && _notebook.onDidChangeCells) {
			this._register(_notebook.onDidChangeContent(() => {
				this._dirty = true;
				this._onDidChangeDirty.fire();
				this._onDidChangeContent.fire();
			}));
			this._register(_notebook.onDidChangeCells((e) => {
				this._onDidChangeCells.fire(e);
			}));
		}
	}

	isDirty() {
		return this._dirty;
	}

	getNotebook(): NotebookTextModel {
		return this._notebook;
	}

	insertCell(cell: ICell, index: number) {
		let notebook = this.getNotebook();

		if (notebook) {
			this.notebook.insertNewCell(index, [cell as NotebookCellTextModel]);
			this._dirty = true;
			this._onDidChangeDirty.fire();

		}
	}

	deleteCell(index: number) {
		let notebook = this.getNotebook();

		if (notebook) {
			this.notebook.removeCell(index);
		}
	}

	moveCellToIdx(index: number, newIdx: number) {
		this.notebook.moveCellToIdx(index, newIdx);
	}

	async save(): Promise<boolean> {
		if (this._notebook) {
			this._dirty = false;
			this._onDidChangeDirty.fire();
			// todo, flush all states
			return true;
		}

		return false;
	}
}

export class NotebookEditorInput extends EditorInput {
	static readonly ID: string = 'workbench.input.notebook';
	private promise: Promise<NotebookEditorModel> | null = null;
	private textModel: NotebookEditorModel | null = null;
	private readonly _onDidChangeContent = this._register(new Emitter<void>());
	readonly onDidChangeContent: Event<void> = this._onDidChangeContent.event;

	constructor(
		public resource: URI,
		public name: string,
		public readonly viewType: string | undefined,
		@INotebookService private readonly notebookService: INotebookService,
		@IWorkingCopyService private readonly workingCopyService: IWorkingCopyService
	) {
		super();

		const input = this;
		const workingCopyAdapter = new class implements IWorkingCopy {
			readonly resource = input.resource.with({ scheme: 'vscode-notebook' });
			get name() { return input.getName(); }
			readonly capabilities = input.isUntitled() ? WorkingCopyCapabilities.Untitled : 0;
			readonly onDidChangeDirty = input.onDidChangeDirty;
			readonly onDidChangeContent = input.onDidChangeContent;
			isDirty(): boolean { return input.isDirty(); }
			backup(): Promise<IWorkingCopyBackup> { return input.backup(); }
			save(options?: ISaveOptions): Promise<boolean> { return input.save(0, options).then(editor => !!editor); }
			revert(options?: IRevertOptions): Promise<void> { return input.revert(0, options); }
		};

		this._register(this.workingCopyService.registerWorkingCopy(workingCopyAdapter));

	}

	getTypeId(): string {
		return NotebookEditorInput.ID;
	}

	getName(): string {
		return this.name;
	}

	isDirty() {
		return this.textModel?.isDirty() || false;
	}

	async save(group: GroupIdentifier, options?: ISaveOptions): Promise<IEditorInput | undefined> {
		if (this.textModel) {
			await this.notebookService.save(this.textModel.notebook.viewType, this.textModel.notebook.uri);
			await this.textModel.save();
			return this;
		}

		return undefined;
	}

	async revert(group: GroupIdentifier, options?: IRevertOptions): Promise<void> {
		if (this.textModel) {
			// TODO@rebornix we need hashing
			await this.textModel.save();
		}
	}

	async resolve(): Promise<NotebookEditorModel> {
		if (!this.promise) {
			if (!await this.notebookService.canResolve(this.viewType!)) {
				throw new Error(`Cannot open notebook of type '${this.viewType}'`);
			}

			this.promise = this.notebookService.resolveNotebook(this.viewType!, this.resource).then(notebook => {
				this.textModel = new NotebookEditorModel(notebook!);
				this.textModel.onDidChangeDirty(() => this._onDidChangeDirty.fire());
				this.textModel.onDidChangeContent(() => {
					this._onDidChangeContent.fire();
				});
				return this.textModel;
			});
		}

		return this.promise;
	}

	async backup(): Promise<IWorkingCopyBackup> {
		return {};
	}

	matches(otherInput: unknown): boolean {
		if (this === otherInput) {
			return true;
		}
		if (otherInput instanceof NotebookEditorInput) {
			return this.viewType === otherInput.viewType
				&& isEqual(this.resource, otherInput.resource);
		}
		return false;
	}

	dispose() {
		if (this.textModel) {
			this.notebookService.destoryNotebookDocument(this.textModel!.notebook.viewType, this.textModel!.notebook);
		}

		super.dispose();
	}
}
