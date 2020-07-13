/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { KeyboardLayoutContribution } from 'vs/workbench/services/keybinding/browser/keyboardLayouts/_.contribution';


KeyboardLayoutContribution.INSTANCE.registerKeyboardLayout({
	layout: { id: 'com.apple.keylayout.Russian', lang: 'ru', localizedName: 'Russian' },
	secondaryLayouts: [],
	mapping: {
		KeyA: ['ф', 'Ф', 'ƒ', 'ƒ', 0],
		KeyB: ['и', 'И', 'и', 'И', 0],
		KeyC: ['с', 'С', '≠', '≠', 0],
		KeyD: ['в', 'В', 'ћ', 'Ћ', 0],
		KeyE: ['у', 'У', 'ќ', 'Ќ', 0],
		KeyF: ['а', 'А', '÷', '÷', 0],
		KeyG: ['п', 'П', '©', '©', 0],
		KeyH: ['р', 'Р', '₽', '₽', 0],
		KeyI: ['ш', 'Ш', 'ѕ', 'Ѕ', 0],
		KeyJ: ['о', 'О', '°', '•', 0],
		KeyK: ['л', 'Л', 'љ', 'Љ', 0],
		KeyL: ['д', 'Д', '∆', '∆', 0],
		KeyM: ['ь', 'Ь', '~', '~', 0],
		KeyN: ['т', 'Т', '™', '™', 0],
		KeyO: ['щ', 'Щ', 'ў', 'Ў', 0],
		KeyP: ['з', 'З', '‘', '’', 0],
		KeyQ: ['й', 'Й', 'ј', 'Ј', 0],
		KeyR: ['к', 'К', '®', '®', 0],
		KeyS: ['ы', 'Ы', 'ы', 'Ы', 0],
		KeyT: ['е', 'Е', '†', '†', 0],
		KeyU: ['г', 'Г', 'ѓ', 'Ѓ', 0],
		KeyV: ['м', 'М', 'µ', 'µ', 0],
		KeyW: ['ц', 'Ц', 'џ', 'Џ', 0],
		KeyX: ['ч', 'Ч', '≈', '≈', 0],
		KeyY: ['н', 'Н', 'њ', 'Њ', 0],
		KeyZ: ['я', 'Я', 'ђ', 'Ђ', 0],
		Digit1: ['1', '!', '!', '|', 0],
		Digit2: ['2', '"', '@', '"', 0],
		Digit3: ['3', '№', '#', '£', 0],
		Digit4: ['4', '%', '$', '€', 0],
		Digit5: ['5', ':', '%', '∞', 0],
		Digit6: ['6', ',', '^', '¬', 0],
		Digit7: ['7', '.', '&', '¶', 0],
		Digit8: ['8', ';', '*', '√', 0],
		Digit9: ['9', '(', '{', '\'', 0],
		Digit0: ['0', ')', '}', '`', 0],
		Enter: [],
		Escape: [],
		Backspace: [],
		Tab: [],
		Space: [' ', ' ', ' ', ' ', 0],
		Minus: ['-', '_', '–', '—', 0],
		Equal: ['=', '+', '»', '«', 0],
		BracketLeft: ['х', 'Х', '“', '”', 0],
		BracketRight: ['ъ', 'Ъ', 'ъ', 'Ъ', 0],
		Backslash: ['ё', 'Ё', 'ё', 'Ё', 0],
		Semicolon: ['ж', 'Ж', '…', '…', 0],
		Quote: ['э', 'Э', 'э', 'Э', 0],
		Backquote: [']', '[', ']', '[', 0],
		Comma: ['б', 'Б', '≤', '<', 0],
		Period: ['ю', 'Ю', '≥', '>', 0],
		Slash: ['/', '?', '“', '„', 0],
		CapsLock: [],
		F1: [],
		F2: [],
		F3: [],
		F4: [],
		F5: [],
		F6: [],
		F7: [],
		F8: [],
		F9: [],
		F10: [],
		F11: [],
		F12: [],
		Insert: [],
		Home: [],
		PageUp: [],
		Delete: [],
		End: [],
		PageDown: [],
		ArrowRight: [],
		ArrowLeft: [],
		ArrowDown: [],
		ArrowUp: [],
		NumLock: [],
		NumpadDivide: ['/', '/', '/', '/', 0],
		NumpadMultiply: ['*', '*', '*', '*', 0],
		NumpadSubtract: ['-', '-', '-', '-', 0],
		NumpadAdd: ['+', '+', '+', '+', 0],
		NumpadEnter: [],
		Numpad1: ['1', '1', '1', '1', 0],
		Numpad2: ['2', '2', '2', '2', 0],
		Numpad3: ['3', '3', '3', '3', 0],
		Numpad4: ['4', '4', '4', '4', 0],
		Numpad5: ['5', '5', '5', '5', 0],
		Numpad6: ['6', '6', '6', '6', 0],
		Numpad7: ['7', '7', '7', '7', 0],
		Numpad8: ['8', '8', '8', '8', 0],
		Numpad9: ['9', '9', '9', '9', 0],
		Numpad0: ['0', '0', '0', '0', 0],
		NumpadDecimal: [',', '.', ',', ',', 0],
		IntlBackslash: ['>', '<', '§', '±', 0],
		ContextMenu: [],
		NumpadEqual: ['=', '=', '=', '=', 0],
		F13: [],
		F14: [],
		F15: [],
		F16: [],
		F17: [],
		F18: [],
		F19: [],
		F20: [],
		AudioVolumeMute: [],
		AudioVolumeUp: ['', '=', '', '', 0],
		AudioVolumeDown: [],
		NumpadComma: [],
		IntlRo: [],
		KanaMode: [],
		IntlYen: [],
		ControlLeft: [],
		ShiftLeft: [],
		AltLeft: [],
		MetaLeft: [],
		ControlRight: [],
		ShiftRight: [],
		AltRight: [],
		MetaRight: []
	}
});