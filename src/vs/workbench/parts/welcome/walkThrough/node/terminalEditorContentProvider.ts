/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { URI } from 'vs/base/common/uri';
import { ITextModelService, ITextModelContentProvider } from 'vs/editor/common/services/resolverService';
import { IModelService } from 'vs/editor/common/services/modelService';
import { ITextFileService } from 'vs/workbench/services/textfile/common/textfiles';
import { ITextModel, ITextBufferFactory } from 'vs/editor/common/model';
import { IModeService } from 'vs/editor/common/services/modeService';
import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { Schemas } from 'vs/base/common/network';

export class TerminalEditorContentProvider implements ITextModelContentProvider, IWorkbenchContribution {

	constructor(
		@ITextModelService private textModelResolverService: ITextModelService,
		@ITextFileService private textFileService: ITextFileService,
		@IModeService private modeService: IModeService,
		@IModelService private modelService: IModelService,
	) {
		this.textModelResolverService.registerTextModelContentProvider(Schemas.terminalF18, this);
	}

	public provideTextContent(resource: URI): Thenable<ITextModel> {
		const query = resource.query ? JSON.parse(resource.query) : {};
		const content: Thenable<string | ITextBufferFactory> = (query.moduleId ? new Promise<string>((resolve, reject) => {
			require([query.moduleId], content => {
				try {
					resolve(content.default());
				} catch (err) {
					reject(err);
				}
			});
		}) : this.textFileService.resolveTextContent(URI.file(resource.fsPath)).then(content => content.value));
		return content.then(content => {
			let codeEditorModel = this.modelService.getModel(resource);
			if (!codeEditorModel) {
				codeEditorModel = this.modelService.createModel(content, this.modeService.createByFilepathOrFirstLine(resource.fsPath), resource);
			} else {
				this.modelService.updateModel(codeEditorModel, content);
			}

			return codeEditorModel;
		});
	}
}

