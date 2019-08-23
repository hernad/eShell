/* eslint-disable no-mixed-spaces-and-tabs */
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
// @ts-check

/**
 * @typedef {{
 *   postMessage: (channel: string, data?: any) => void,
 *   onMessage: (channel: string, handler: any) => void,
 *   focusIframeOnCreate?: boolean,
 *   ready?: Promise<void>,
 *   onIframeLoaded?: (iframe: HTMLIFrameElement) => void,
 *   fakeLoad: boolean
 * }} WebviewHost
 */

(function () {
	'use strict';

	/**
	 * Use polling to track focus of main webview and iframes within the webview
	 *
	 * @param {Object} handlers
	 * @param {() => void} handlers.onFocus
	 * @param {() => void} handlers.onBlur
	 */
	const trackFocus = ({ onFocus, onBlur }) => {
		const interval = 50;
		let isFocused = document.hasFocus();
		setInterval(() => {
			const isCurrentlyFocused = document.hasFocus();
			if (isCurrentlyFocused === isFocused) {
				return;
			}
			isFocused = isCurrentlyFocused;
			if (isCurrentlyFocused) {
				onFocus();
			} else {
				onBlur();
			}
		}, interval);
	};

	const getActiveFrame = () => {
		return /** @type {HTMLIFrameElement} */ (document.getElementById('active-frame'));
	};

	const getPendingFrame = () => {
		return /** @type {HTMLIFrameElement} */ (document.getElementById('pending-frame'));
	};

	const defaultCssRules = `
	body {
		background-color: var(--vscode-editor-background);
		color: var(--vscode-editor-foreground);
		font-family: var(--vscode-font-family);
		font-weight: var(--vscode-font-weight);
		font-size: var(--vscode-font-size);
		margin: 0;
		padding: 0 20px;
	}

	img {
		max-width: 100%;
		max-height: 100%;
	}

	a {
		color: var(--vscode-textLink-foreground);
	}

	a:hover {
		color: var(--vscode-textLink-activeForeground);
	}

	a:focus,
	input:focus,
	select:focus,
	textarea:focus {
		outline: 1px solid -webkit-focus-ring-color;
		outline-offset: -1px;
	}

	code {
		color: var(--vscode-textPreformat-foreground);
	}

	blockquote {
		background: var(--vscode-textBlockQuote-background);
		border-color: var(--vscode-textBlockQuote-border);
	}

	::-webkit-scrollbar {
		width: 10px;
		height: 10px;
	}

	::-webkit-scrollbar-thumb {
		background-color: var(--vscode-scrollbarSlider-background);
	}
	::-webkit-scrollbar-thumb:hover {
		background-color: var(--vscode-scrollbarSlider-hoverBackground);
	}
	::-webkit-scrollbar-thumb:active {
		background-color: var(--vscode-scrollbarSlider-activeBackground);
	}`;

	/**
	 * @param {*} [state]
	 * @return {string}
	 */
	function getVsCodeApiScript(state) {
		return `
			const acquireVsCodeApi = (function() {
				const originalPostMessage = window.parent.postMessage.bind(window.parent);
				const targetOrigin = '*';
				let acquired = false;

				let state = ${state ? `JSON.parse(${JSON.stringify(state)})` : undefined};

				return () => {
					if (acquired) {
						throw new Error('An instance of the VS Code API has already been acquired');
					}
					acquired = true;
					return Object.freeze({
						postMessage: function(msg) {
							return originalPostMessage({ command: 'onmessage', data: msg }, targetOrigin);
						},
						setState: function(newState) {
							state = newState;
							originalPostMessage({ command: 'do-update-state', data: JSON.stringify(newState) }, targetOrigin);
							return newState;
						},
						getState: function() {
							return state;
						}
					});
				};
			})();
			delete window.parent;
			delete window.top;
			delete window.frameElement;
		`;
	}

	/**
	 * @param {WebviewHost} host
	 */
	function createWebviewManager(host) {
		// state
		let firstLoad = true;
		let loadTimeout;
		let pendingMessages = [];

		const initData = {
			initialScrollProgress: undefined
		};


		/**
		 * @param {HTMLDocument?} document
		 * @param {HTMLElement?} body
		 */
		const applyStyles = (document, body) => {
			if (!document) {
				return;
			}

			if (body) {
				body.classList.remove('vscode-light', 'vscode-dark', 'vscode-high-contrast');
				body.classList.add(initData.activeTheme);
			}

			if (initData.styles) {
				for (const variable of Object.keys(initData.styles)) {
					document.documentElement.style.setProperty(`--${variable}`, initData.styles[variable]);
				}
			}
		};

		/**
		 * @param {MouseEvent} event
		 */
		const handleInnerClick = (event) => {
			if (!event || !event.view || !event.view.document) {
				return;
			}

			let baseElement = event.view.document.getElementsByTagName('base')[0];
			/** @type {any} */
			let node = event.target;
			while (node) {
				if (node.tagName && node.tagName.toLowerCase() === 'a' && node.href) {
					if (node.getAttribute('href') === '#') {
						event.view.scrollTo(0, 0);
					} else if (node.hash && (node.getAttribute('href') === node.hash || (baseElement && node.href.indexOf(baseElement.href) >= 0))) {
						let scrollTarget = event.view.document.getElementById(node.hash.substr(1, node.hash.length - 1));
						if (scrollTarget) {
							scrollTarget.scrollIntoView();
						}
					} else {
						host.postMessage('did-click-link', node.href.baseVal || node.href);
					}
					event.preventDefault();
					break;
				}
				node = node.parentNode;
			}
		};

		/**
		 * @param {KeyboardEvent} e
		 */
		const handleInnerKeydown = (e) => {
			host.postMessage('did-keydown', {
				key: e.key,
				keyCode: e.keyCode,
				code: e.code,
				shiftKey: e.shiftKey,
				altKey: e.altKey,
				ctrlKey: e.ctrlKey,
				metaKey: e.metaKey,
				repeat: e.repeat
			});
		};

		let isHandlingScroll = false;
		const handleInnerScroll = (event) => {
			if (!event.target || !event.target.body) {
				return;
			}
			if (isHandlingScroll) {
				return;
			}

			const progress = event.currentTarget.scrollY / event.target.body.clientHeight;
			if (isNaN(progress)) {
				return;
			}

<<<<<<< HEAD


		// propagate focus
		host.onMessage('focus', () => {
			const target = getActiveFrame();
			//console.log(`webview-pre.js on.focus ${target}`);
			if (target) {
				if (target.contentWindow) {
				   target.contentWindow.focus();
				} else {
					console.log('target.contentWindow nul?!');
				}
			}
		});
=======
			isHandlingScroll = true;
			window.requestAnimationFrame(() => {
				try {
					host.postMessage('did-scroll', progress);
				} catch (e) {
					// noop
				}
				isHandlingScroll = false;
			});
		};
>>>>>>> upstream/master

		/**
		 * @return {string}
		 */
		function toContentHtml(data) {
			const options = data.options;
			const text = data.contents;
			const newDocument = new DOMParser().parseFromString(text, 'text/html');

			newDocument.querySelectorAll('a').forEach(a => {
				if (!a.title) {
					a.title = a.getAttribute('href');
				}
			});

			// apply default script
			if (options.allowScripts) {
				const defaultScript = newDocument.createElement('script');
<<<<<<< HEAD
				defaultScript.textContent = `
					const acquireVsCodeApi = (function() {
						if (!window.parent)
						   console.logg('webView debug - window.parent null?!');

						const originalPostMessage = window.parent.postMessage.bind(window.parent);
						let acquired = false;

						let state = ${data.state ? `JSON.parse(${JSON.stringify(data.state)})` : undefined};

						return () => {
							if (acquired) {
								throw new Error('An instance of the VS Code API has already been acquired');
							}
							acquired = true;
							return Object.freeze({
								postMessage: function(msg) {
									return originalPostMessage({ command: 'onmessage', data: msg }, '*');
								},
								setState: function(newState) {
									state = newState;
									originalPostMessage({ command: 'do-update-state', data: JSON.stringify(newState) }, '*');
									return newState;
								},
								getState: function() {
									return state;
								}
							});
						};
					})();
					delete window.parent;
					delete window.top;
					delete window.frameElement;
				`;

=======
				defaultScript.textContent = getVsCodeApiScript(data.state);
>>>>>>> upstream/master
				newDocument.head.prepend(defaultScript);
			}

			// apply default styles
			const defaultStyles = newDocument.createElement('style');
			defaultStyles.id = '_defaultStyles';
			defaultStyles.innerHTML = defaultCssRules;
			newDocument.head.prepend(defaultStyles);

			applyStyles(newDocument, newDocument.body);

<<<<<<< HEAD
			const frame = getActiveFrame();
			const wasFirstLoad = firstLoad;
			// keep current scrollY around and use later
			let setInitialScrollPosition;
			if (firstLoad) {
				console.log('webview first-load');
				firstLoad = false;
				setInitialScrollPosition = (body, window) => {
					if (!isNaN(initData.initialScrollProgress)) {
						if (window.scrollY === 0) {
							window.scroll(0, body.clientHeight * initData.initialScrollProgress);
						}
					}
				};
			} else {
				console.log('webview NOT first load');
				const scrollY = frame && frame.contentDocument && frame.contentDocument.body ? frame.contentWindow.scrollY : 0;
				setInitialScrollPosition = (body, window) => {
					if (window.scrollY === 0) {
						window.scroll(0, scrollY);
					}
				};
			}
=======
			// set DOCTYPE for newDocument explicitly as DOMParser.parseFromString strips it off
			// and DOCTYPE is needed in the iframe to ensure that the user agent stylesheet is correctly overridden
			return '<!DOCTYPE html>\n' + newDocument.documentElement.outerHTML;
		}
>>>>>>> upstream/master

		document.addEventListener('DOMContentLoaded', () => {
			const idMatch = document.location.search.match(/\bid=([\w-]+)/);
			const ID = idMatch ? idMatch[1] : undefined;
			if (!document.body) {
				return;
			}

<<<<<<< HEAD
			const newFrame = document.createElement('iframe');
			newFrame.setAttribute('id', 'pending-frame');
			newFrame.setAttribute('frameborder', '0');
			newFrame.setAttribute('sandbox', options.allowScripts ? 'allow-scripts allow-forms allow-modals allow-same-origin' : 'allow-same-origin');
			newFrame.style.cssText = 'display: block; margin: 0; overflow: hidden; position: absolute; width: 100%; height: 100%; visibility: hidden';
			document.body.appendChild(newFrame);
=======
			host.onMessage('styles', (_event, data) => {
				initData.styles = data.styles;
				initData.activeTheme = data.activeTheme;
>>>>>>> upstream/master

				const target = getActiveFrame();
				if (!target) {
					return;
				}

				if (target.contentDocument) {
					applyStyles(target.contentDocument, target.contentDocument.body);
				}
			});

			// propagate focus
			host.onMessage('focus', () => {
				const target = getActiveFrame();
				if (target) {
					target.contentWindow.focus();
				}
			});

			// update iframe-contents
			let updateId = 0;
			host.onMessage('content', async (_event, data) => {
				const currentUpdateId = ++updateId;
				await host.ready;
				if (currentUpdateId !== updateId) {
					return;
				}

				const options = data.options;
				const newDocument = toContentHtml(data);

				const frame = getActiveFrame();
				const wasFirstLoad = firstLoad;
				// keep current scrollY around and use later
				let setInitialScrollPosition;
				if (firstLoad) {
					firstLoad = false;
					setInitialScrollPosition = (body, window) => {
						if (!isNaN(initData.initialScrollProgress)) {
							if (window.scrollY === 0) {
								window.scroll(0, body.clientHeight * initData.initialScrollProgress);
							}
						}
					};
				} else {
					const scrollY = frame && frame.contentDocument && frame.contentDocument.body ? frame.contentWindow.scrollY : 0;
					setInitialScrollPosition = (body, window) => {
						if (window.scrollY === 0) {
							window.scroll(0, scrollY);
						}
					};
				}

				// Clean up old pending frames and set current one as new one
				const previousPendingFrame = getPendingFrame();
				if (previousPendingFrame) {
					previousPendingFrame.setAttribute('id', '');
					document.body.removeChild(previousPendingFrame);
				}
				if (!wasFirstLoad) {
					pendingMessages = [];
				}

				const newFrame = document.createElement('iframe');
				newFrame.setAttribute('id', 'pending-frame');
				newFrame.setAttribute('frameborder', '0');
				newFrame.setAttribute('sandbox', options.allowScripts ? 'allow-scripts allow-forms allow-same-origin' : 'allow-same-origin');
				if (host.fakeLoad) {
					// We should just be able to use srcdoc, but I wasn't
					// seeing the service worker applying properly.
					// Fake load an empty on the correct origin and then write real html
					// into it to get around this.
					newFrame.src = `./fake.html?id=${ID}`;
				}
				newFrame.style.cssText = 'display: block; margin: 0; overflow: hidden; position: absolute; width: 100%; height: 100%; visibility: hidden';
				document.body.appendChild(newFrame);

				if (!host.fakeLoad) {
					// write new content onto iframe
					newFrame.contentDocument.open();
				}

				newFrame.contentWindow.addEventListener('keydown', handleInnerKeydown);

				newFrame.contentWindow.addEventListener('DOMContentLoaded', e => {
					if (host.fakeLoad) {
						newFrame.contentDocument.open();
						newFrame.contentDocument.write(newDocument);
						newFrame.contentDocument.close();
						hookupOnLoadHandlers(newFrame);
					}
					const contentDocument = e.target ? (/** @type {HTMLDocument} */ (e.target)) : undefined;
					if (contentDocument) {
						applyStyles(contentDocument, contentDocument.body);
					}
<<<<<<< HEAD
					// Styles may have changed since we created the element. Make sure we re-style
					applyStyles(newFrame.contentDocument, newFrame.contentDocument.body);
					newFrame.setAttribute('id', 'active-frame');
					newFrame.style.visibility = 'visible';
					if (newFrame.contentWindow)
                        newFrame.contentWindow.focus();
					else
                        console.log('newFrame.contentWindows nul?!');
=======
				});
>>>>>>> upstream/master

				const onLoad = (contentDocument, contentWindow) => {
					if (contentDocument && contentDocument.body) {
						// Workaround for https://github.com/Microsoft/vscode/issues/12865
						// check new scrollY and reset if neccessary
						setInitialScrollPosition(contentDocument.body, contentWindow);
					}

<<<<<<< HEAD
					pendingMessages.forEach((data) => {
						if (contentWindow) {
                           contentWindow.postMessage(data, '*');
						} else console.log('contentWindows nul?!');
					});
					pendingMessages = [];
				}
			};

			clearTimeout(loadTimeout);
			loadTimeout = undefined;
			loadTimeout = setTimeout(() => {
				clearTimeout(loadTimeout);
				loadTimeout = undefined;
				onLoad(newFrame.contentDocument, newFrame.contentWindow);
			}, 200);

			newFrame.contentWindow.addEventListener('load', function (e) {
				if (loadTimeout) {
=======
					const newFrame = getPendingFrame();
					if (newFrame && newFrame.contentDocument && newFrame.contentDocument === contentDocument) {
						const oldActiveFrame = getActiveFrame();
						if (oldActiveFrame) {
							document.body.removeChild(oldActiveFrame);
						}
						// Styles may have changed since we created the element. Make sure we re-style
						applyStyles(newFrame.contentDocument, newFrame.contentDocument.body);
						newFrame.setAttribute('id', 'active-frame');
						newFrame.style.visibility = 'visible';
						if (host.focusIframeOnCreate) {
							newFrame.contentWindow.focus();
						}

						contentWindow.addEventListener('scroll', handleInnerScroll);

						pendingMessages.forEach((data) => {
							contentWindow.postMessage(data, '*');
						});
						pendingMessages = [];
					}
				};

				/**
				 * @param {HTMLIFrameElement} newFrame
				 */
				function hookupOnLoadHandlers(newFrame) {
>>>>>>> upstream/master
					clearTimeout(loadTimeout);
					loadTimeout = undefined;
					loadTimeout = setTimeout(() => {
						clearTimeout(loadTimeout);
						loadTimeout = undefined;
						onLoad(newFrame.contentDocument, newFrame.contentWindow);
					}, 200);

					newFrame.contentWindow.addEventListener('load', function (e) {
						if (loadTimeout) {
							clearTimeout(loadTimeout);
							loadTimeout = undefined;
							onLoad(e.target, this);
						}
					});

					// Bubble out link clicks
					newFrame.contentWindow.addEventListener('click', handleInnerClick);

					if (host.onIframeLoaded) {
						host.onIframeLoaded(newFrame);
					}
				}

<<<<<<< HEAD
			/*
			hernad
			newFrame.contentWindow.addEventListener("visibilitychange", function () {

				console.log("visibilitychange");
				if (newFrame.contentDocument["hidden"]) {
					console.log('sakrivam');
			    } else {
				   console.log('otkrivam');
				   const scrollY = newFrame && newFrame.contentDocument && newFrame.contentDocument.body ? newFrame.contentWindow.scrollY : 0;
				   console.log(`webview NOT first load ${scrollY}`);
				   setInitialScrollPosition = (body, window) => {
					  if (window.scrollY === 0) {
						window.scroll(0, scrollY);
					  }
				   };
				}
			});
			*/

			// Bubble out link clicks
			newFrame.contentWindow.addEventListener('click', handleInnerClick);
=======
				if (!host.fakeLoad) {
					hookupOnLoadHandlers(newFrame);
				}
>>>>>>> upstream/master

				if (!host.fakeLoad) {
					newFrame.contentDocument.write(newDocument);
					newFrame.contentDocument.close();
				}

				host.postMessage('did-set-content', undefined);
			});

<<<<<<< HEAD
		// Forward message to the embedded iframe
		host.onMessage('message', (_event, data) => {
			const pending = getPendingFrame();
			if (!pending) {
				const target = getActiveFrame();
				if (target) {
					if (target.contentWindow)
			          target.contentWindow.postMessage(data, '*');
					else
					  console.log('target.contentWindow null/2 ?!');
					return;
=======
			// Forward message to the embedded iframe
			host.onMessage('message', (_event, data) => {
				const pending = getPendingFrame();
				if (!pending) {
					const target = getActiveFrame();
					if (target) {
						target.contentWindow.postMessage(data, '*');
						return;
					}
>>>>>>> upstream/master
				}
				pendingMessages.push(data);
			});

			host.onMessage('initial-scroll-position', (_event, progress) => {
				initData.initialScrollProgress = progress;
			});


			trackFocus({
				onFocus: () => host.postMessage('did-focus'),
				onBlur: () => host.postMessage('did-blur')
			});

			// signal ready
			host.postMessage('webview-ready', {});
		});
	}

	if (typeof module !== 'undefined') {
		module.exports = createWebviewManager;
	} else {
		window.createWebviewManager = createWebviewManager;
	}
}());
