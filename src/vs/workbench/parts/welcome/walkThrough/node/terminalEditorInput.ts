/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as strings from 'vs/base/common/strings';
import { EditorInput, EditorModel, ITextEditorModel } from 'vs/workbench/common/editor';

import { URI } from 'vs/base/common/uri';
import { IDisposable, dispose, IReference } from 'vs/base/common/lifecycle';
// import { telemetryURIDescriptor } from 'vs/platform/telemetry/common/telemetryUtils';
import { ITextModelService } from 'vs/editor/common/services/resolverService';

export class TerminalEditorModel extends EditorModel {

	constructor(
		private mainRef: IReference<ITextEditorModel>,
		// private snippetRefs: IReference<ITextEditorModel>[]
	) {
		super();
	}

	get main() {
		return this.mainRef.object;
	}


	dispose() {
		// this.snippetRefs.forEach(ref => ref.dispose());
		this.mainRef.dispose();
		super.dispose();
	}
}

export interface TerminalEditorInputOptions {
	readonly typeId: string;
	readonly name: string;
	readonly description?: string;
	readonly resource: URI;
	readonly telemetryFrom: string;
	readonly onReady?: (container: HTMLElement) => void;
}

export class TerminalEditorInput extends EditorInput {

	private disposables: IDisposable[] = [];

	private promise: Thenable<TerminalEditorModel>;

	private maxTopScroll = 0;
	private maxBottomScroll = 0;

	constructor(
		private options: TerminalEditorInputOptions,
		@ITextModelService private textModelResolverService: ITextModelService
		// @IHashService private hashService: IHashService
	) {
		super();
	}

	getResource(): URI {
		return this.options.resource;
	}

	getTypeId(): string {
		return this.options.typeId;
	}

	getName(): string {
		return this.options.name;
	}

	getDescription(): string {
		return this.options.description || '';
	}

	getTelemetryFrom(): string {
		return this.options.telemetryFrom;
	}

	/*
	getTelemetryDescriptor(): object {
		const descriptor = super.getTelemetryDescriptor();
		descriptor['target'] = this.getTelemetryFrom();
		descriptor['resource'] = telemetryURIDescriptor(this.options.resource, path => this.hashService.createSHA1(path));

		return descriptor;
	}
	*/

	get onReady() {
		return this.options.onReady;
	}

	resolve(): Thenable<TerminalEditorModel> {
		if (!this.promise) {
			this.promise = this.textModelResolverService.createModelReference(this.options.resource)
				.then(ref => {
					if (strings.endsWith(this.getResource().path, '.html')) {
						return new TerminalEditorModel(ref);
					}

					return Promise.all([]).then(refs => new TerminalEditorModel(ref));
				});
		}
		return this.promise;
	}

	/*
	resolve(): Thenable<TerminalEditorModel> {
		if (!this.promise) {
			this.promise = this.textModelResolverService.createModelReference(this.options.resource)
				.then(ref => {
					if (strings.endsWith(this.getResource().path, '.html')) {
						return new TerminalEditorModel(ref, []);
					}


					const snippets: Thenable<IReference<ITextEditorModel>>[] = [];

					let i = 0;
					const renderer = new marked.Renderer();
					renderer.code = (code, lang) => {
						const resource = this.options.resource.with({ scheme: Schemas.TerminalEditorSnippet, fragment: `${i++}.${lang}` });
						snippets.push(this.textModelResolverService.createModelReference(resource));
						return '';
					};


					const markdown = ref.object.textEditorModel.getLinesContent().join('\n');
					marked(markdown, { renderer });

					return Promise.all(snippets)
						.then(refs => new TerminalEditorModel(ref, refs));
				});
		}

		return this.promise;
	}
	*/

	matches(otherInput: any): boolean {
		if (super.matches(otherInput) === true) {
			return true;
		}

		if (otherInput instanceof TerminalEditorInput) {
			let otherResourceEditorInput = <TerminalEditorInput>otherInput;

			// Compare by properties
			return otherResourceEditorInput.options.resource.toString() === this.options.resource.toString();
		}

		return false;
	}

	dispose(): void {
		this.disposables = dispose(this.disposables);

		if (this.promise) {
			this.promise.then(model => model.dispose());
			this.promise = null;
		}

		super.dispose();
	}

	public relativeScrollPosition(topScroll: number, bottomScroll: number) {
		this.maxTopScroll = Math.max(this.maxTopScroll, topScroll);
		this.maxBottomScroll = Math.max(this.maxBottomScroll, bottomScroll);
	}
}
