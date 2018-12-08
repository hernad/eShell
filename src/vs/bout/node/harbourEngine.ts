import * as cp from 'child_process';
import { EventEmitter } from 'events';

import { NodeStringDecoder, StringDecoder } from 'string_decoder';
import { startsWith } from 'vs/base/common/strings';

import { createSpdLogService } from 'vs/platform/log/node/spdlogService';
import { EnvironmentService } from 'vs/platform/environment/node/environmentService';
import { LogLevel } from 'vs/platform/log/common/log';
import { parseArgs } from 'vs/platform/environment/node/argv';


import { OutputChannel, Maybe, HarbourError, HarbourErrorCode, serializeHarbourError } from './harbourUtils';

const harbourDiskPath = '/home/hernad/harbour/bin/harbour';

export class HarbourEngine {

	private outputChannel;

	constructor() {
		const environmentService = new EnvironmentService( parseArgs([]), process.execPath);
		const logService = createSpdLogService(`harbour`, LogLevel.Info, environmentService.logsPath);

		this.outputChannel = new OutputChannel(logService);
	}

	provideVersion( /*progress: vscode.Progress<string>*/ ): Thenable<boolean> {

		this.outputChannel.appendLine('start provide version');


		return new Promise((resolve, reject) => {
			// token.onCancellationRequested(() => cancel());

			const args = getArgs();

			// const cwd = options.folder.fsPath;
			const  cwd = '/home/hernad';

			const escapedArgs = args
				.map(arg => arg.match(/^-/) ? arg : `'${arg}'`)
				.join(' ');

			this.outputChannel.appendLine(`harbour ${escapedArgs}\n - cwd: ${cwd}`);

			let process: Maybe<cp.ChildProcess> = cp.spawn(harbourDiskPath, args, { cwd });

			process.on('error', e => {
				console.error(e);
				this.outputChannel.appendLine('Error: ' + (e && e.message));
				reject(serializeHarbourError(new HarbourError(e && e.message, HarbourErrorCode.other)));
			});

			let gotResult = false;
			const parser = new HarbourParser();
			parser.on('result', (match: string) => {
				console.log( `imamo rezultat ${match}` );
				gotResult = true;
				// progress.report(match);
			});

			let isDone = false;
			const cancel = () => {
				isDone = true;

				if (process) {
					process.kill();
				}

				if (parser) {
					parser.cancel();
				}
			};

			let limitHit = false;

			parser.on('hitLimit', () => {
				limitHit = true;
				cancel();
			});

			process.stdout.on('data', data => {
				parser.handleData(data);
			});

			let gotData = false;
			process.stdout.once('data', () => gotData = true);

			let stderr = '';
			process.stderr.on('data', data => {
				const message = data.toString();
				this.outputChannel.appendLine(message);
				stderr += message;
			});

			process.on('close', () => {
				this.outputChannel.appendLine(gotData ? 'Got data from stdout' : 'No data from stdout');
				this.outputChannel.appendLine(gotResult ? 'Got result from parser' : 'No result from parser');
				this.outputChannel.appendLine('');
				if (isDone) {
					resolve( limitHit );
				} else {
					// Trigger last result
					parser.flush();
					process = null;
					let searchError: Maybe<HarbourError>;
					if (stderr && !gotData && (searchError = harbourErrorMsgForDisplay(stderr))) {
						reject(serializeHarbourError(new HarbourError(searchError.message, searchError.code)));
					} else {
						resolve( limitHit );
					}
				}
			});
		});
	}
}

/**
 * Read the first line of stderr and return an error for display or undefined, based on a whitelist.
 * Ripgrep produces stderr output which is not from a fatal error, and we only want the search to be
 * "failed" when a fatal error was produced.
 */
function harbourErrorMsgForDisplay(msg: string): Maybe<HarbourError> {
	const firstLine = msg.split('\n')[0].trim();

	if (startsWith(firstLine, 'harbour parse error')) {
		return new HarbourError('Harbour parse error', HarbourErrorCode.harbourParseError);
	}

	/*
	let match = firstLine.match(/grep config error: unknown encoding: (.*)/);
	if (match) {
		return new SearchError(`Unknown encoding: ${match[1]}`, SearchErrorCode.unknownEncoding);
	}

	if (startsWith(firstLine, 'error parsing glob')) {
		// Uppercase first letter
		return new SearchError(firstLine.charAt(0).toUpperCase() + firstLine.substr(1), SearchErrorCode.globParseError);
	}

	if (startsWith(firstLine, 'the literal')) {
		// Uppercase first letter
		return new SearchError(firstLine.charAt(0).toUpperCase() + firstLine.substr(1), SearchErrorCode.invalidLiteral);
	}
	*/

	return undefined;
}

class HarbourParser extends EventEmitter {

	private stringDecoder: NodeStringDecoder;
	private remainder = '';
	private isDone = false;
	// private hitLimit = false;
	// private numResults = 0;

	constructor() {
		super();
		this.stringDecoder = new StringDecoder();
	}

	public cancel(): void {
		this.isDone = true;
	}

	public flush(): void {
		this.handleDecodedData(this.stringDecoder.end());
	}

	on(event: 'result', listener: (result: string) => void);
	on(event: 'hitLimit', listener: () => void);

	on(event: string, listener: (...args: any[]) => void) {
		super.on(event, listener);
	}

	public handleData(data: Buffer | string): void {
		if (this.isDone) {
			return;
		}

		const dataStr = typeof data === 'string' ? data : this.stringDecoder.write(data);
		this.handleDecodedData(dataStr);
	}

	private handleDecodedData(decodedData: string): void {
		// check for newline before appending to remainder
		let newlineIdx = decodedData.indexOf('\n');

		// If the previous data chunk didn't end in a newline, prepend it to this chunk
		const dataStr = this.remainder + decodedData;

		if (newlineIdx >= 0) {
			newlineIdx += this.remainder.length;
		} else {
			// Shortcut
			this.remainder = dataStr;
			return;
		}

		let prevIdx = 0;
		while (newlineIdx >= 0) {
			this.handleLine(dataStr.substring(prevIdx, newlineIdx).trim());
			prevIdx = newlineIdx + 1;
			newlineIdx = dataStr.indexOf('\n', prevIdx);
		}

		this.remainder = dataStr.substring(prevIdx).trim();
	}

	private handleLine(outputLine: string): void {
		if (this.isDone || !outputLine) {
			return;
		}

		//  let parsedLine: IHarbourMessage;
		try {
			// parsedLine = JSON.parse(outputLine);
			// parsedLine.data = outputLine;
			// parsedLine.type = 'vako';
			console.log('emit result:', outputLine);
			this.emit('result', outputLine);

		} catch (e) {
			throw new Error(`malformed line from harbour: ${outputLine}`);
		}

        /*
		if (parsedLine.type === 'match') {
			const matchPath = bytesOrTextToString(parsedLine.data.path);
			// const uri = URI.file(path.join(this.rootFolder, matchPath));
			// const result = this.createTextSearchMatch(parsedLine.data, uri);
			this.onResult(result);

			if (this.hitLimit) {
				this.cancel();
				this.emit('hitLimit');
			}
		}
		*/

		// if (this.hitLimit) {
			this.cancel();
			this.emit('hitLimit');
		// }

		/*
		} else if (parsedLine.type === 'context') {
			const contextPath = bytesOrTextToString(parsedLine.data.path);
			const uri = URI.file(path.join(this.rootFolder, contextPath));
			const result = this.createTextSearchContext(parsedLine.data, uri);
			result.forEach(r => this.onResult(r));
		}
		*/
	}

	/*
	private createTextSearchMatch(data: IRgMatch, uri: vscode.Uri): vscode.TextSearchMatch {
		const lineNumber = data.line_number - 1;
		const fullText = bytesOrTextToString(data.lines);
		const fullTextBytes = Buffer.from(fullText);

		let prevMatchEnd = 0;
		let prevMatchEndCol = 0;
		let prevMatchEndLine = lineNumber;
		const ranges = data.submatches.map((match, i) => {
			if (this.hitLimit) {
				return null;
			}

			this.numResults++;
			if (this.numResults >= this.maxResults) {
				// Finish the line, then report the result below
				this.hitLimit = true;
			}

			let matchText = bytesOrTextToString(match.match);
			const inBetweenChars = fullTextBytes.slice(prevMatchEnd, match.start).toString().length;
			let startCol = prevMatchEndCol + inBetweenChars;

			const stats = getNumLinesAndLastNewlineLength(matchText);
			let startLineNumber = prevMatchEndLine;
			let endLineNumber = stats.numLines + startLineNumber;
			let endCol = stats.numLines > 0 ?
				stats.lastLineLength :
				stats.lastLineLength + startCol;

			if (lineNumber === 0 && i === 0 && startsWithUTF8BOM(matchText)) {
				matchText = stripUTF8BOM(matchText);
				startCol -= 3;
				endCol -= 3;
			}

			prevMatchEnd = match.end;
			prevMatchEndCol = endCol;
			prevMatchEndLine = endLineNumber;

			return new Range(startLineNumber, startCol, endLineNumber, endCol);
		})
			.filter(r => !!r);

		return createTextSearchResult(uri, fullText, <Range[]>ranges, this.previewOptions);
	}
	*/

	/*
	private createTextSearchContext(data: IRgMatch, uri: URI): vscode.TextSearchContext[] {
		const text = bytesOrTextToString(data.lines);
		const startLine = data.line_number;
		return text
			.replace(/\r?\n$/, '')
			.split('\n')
			.map((line, i) => {
				return {
					text: line,
					uri,
					lineNumber: startLine + i
				};
			});
	}
	*/

	/*
	private onResult(match: string): void {
		this.emit('result', match);
	}
	*/
}

/*
function bytesOrTextToString(obj: any): string {
	return obj.bytes ?
		Buffer.from(obj.bytes, 'base64').toString() :
		obj.text;
}

function getNumLinesAndLastNewlineLength(text: string): { numLines: number, lastLineLength: number } {
	const re = /\n/g;
	let numLines = 0;
	let lastNewlineIdx = -1;
	let match: ReturnType<typeof re.exec>;
	while (match = re.exec(text)) {
		numLines++;
		lastNewlineIdx = match.index;
	}

	const lastLineLength = lastNewlineIdx >= 0 ?
		text.length - lastNewlineIdx - 1 :
		text.length;

	return { numLines, lastLineLength };
}
*/

function getArgs(): string[] {
	const args = ['--version'];

	// args.push(query.isCaseSensitive ? '--case-sensitive' : '--ignore-case');

	// options.includes
	//	.map(anchorGlob)
	//	.forEach(globArg => args.push('-g', globArg));

	// options.excludes
	//	.map(anchorGlob)
	//	.forEach(rgGlob => args.push('-g', `!${rgGlob}`));


	return args;
}

export function unicodeEscapesToPCRE2(pattern: string): string {
	const reg = /((?:[^\\]|^)(?:\\\\)*)\\u([a-z0-9]{4})(?!\d)/g;
	// Replace an unescaped $ at the end of the pattern with \r?$
	// Match $ preceeded by none or even number of literal \
	while (pattern.match(reg)) {
		pattern = pattern.replace(reg, `$1\\x{$2}`);
	}

	return pattern;
}

export interface IHarbourMessage {
	type: 'vako' | 'nako';
	data: any;
}

export interface IHarbourMatch {
	value: string;
}


export type IRgBytesOrText = { bytes: string } | { text: string };

export function fixRegexEndingPattern(pattern: string): string {
	// Replace an unescaped $ at the end of the pattern with \r?$
	// Match $ preceeded by none or even number of literal \
	return pattern.match(/([^\\]|^)(\\\\)*\$$/) ?
		pattern.replace(/\$$/, '\\r?$') :
		pattern;
}

export function fixRegexNewline(pattern: string): string {
	// Replace an unescaped $ at the end of the pattern with \r?$
	// Match $ preceeded by none or even number of literal \
	return pattern.replace(/([^\\]|^)(\\\\)*\\n/g, '$1$2\\r?\\n');
}

export function fixRegexCRMatchingWhitespaceClass(pattern: string, isMultiline: boolean): string {
	return isMultiline ?
		pattern.replace(/([^\\]|^)((?:\\\\)*)\\s/g, '$1$2(\\r?\\n|[^\\S\\r])') :
		pattern.replace(/([^\\]|^)((?:\\\\)*)\\s/g, '$1$2[ \\t\\f]');
}

export function fixRegexCRMatchingNonWordClass(pattern: string, isMultiline: boolean): string {
	return isMultiline ?
		pattern.replace(/([^\\]|^)((?:\\\\)*)\\W/g, '$1$2(\\r?\\n|[^\\w\\r])') :
		pattern.replace(/([^\\]|^)((?:\\\\)*)\\W/g, '$1$2[^\\w\\r]');
}
