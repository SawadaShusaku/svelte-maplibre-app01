import { describe, it, expect, beforeEach } from 'vitest';
import { getMarkerStyle, setMarkerStyle } from '../marker-style';
import type { MarkerStyle } from '../types';

describe('marker-style', () => {
	const STORAGE_KEY = 'recycling-map:marker-style';
	let store: Record<string, string> = {};

	beforeEach(() => {
		store = {};
		// node環境ではlocalStorageがないのでモック
		Object.defineProperty(globalThis, 'localStorage', {
			value: {
				getItem: (key: string) => store[key] ?? null,
				setItem: (key: string, value: string) => { store[key] = value; },
				removeItem: (key: string) => { delete store[key]; },
			},
			writable: true,
			configurable: true,
		});
	});

	describe('getMarkerStyle', () => {
		it('should return default "adaptive" when localStorage is empty', () => {
			const style = getMarkerStyle();
			expect(style).toBe('adaptive');
		});

		it('should return stored style from localStorage', () => {
			localStorage.setItem(STORAGE_KEY, 'solid');
			const style = getMarkerStyle();
			expect(style).toBe('solid');
		});

		it('should return default when stored value is invalid', () => {
			localStorage.setItem(STORAGE_KEY, 'invalid-value');
			const style = getMarkerStyle();
			expect(style).toBe('adaptive');
		});

		it('should handle all valid MarkerStyle values', () => {
			const validStyles: MarkerStyle[] = ['adaptive', 'solid', 'gradient'];
			for (const expected of validStyles) {
				localStorage.setItem(STORAGE_KEY, expected);
				expect(getMarkerStyle()).toBe(expected);
			}
		});
	});

	describe('setMarkerStyle', () => {
		it('should store style in localStorage', () => {
			setMarkerStyle('gradient');
			expect(localStorage.getItem(STORAGE_KEY)).toBe('gradient');
		});

		it('should overwrite existing stored style', () => {
			localStorage.setItem(STORAGE_KEY, 'solid');
			setMarkerStyle('adaptive');
			expect(localStorage.getItem(STORAGE_KEY)).toBe('adaptive');
		});
	});

	describe('round-trip', () => {
		it('should persist and restore style correctly', () => {
			setMarkerStyle('solid');
			expect(getMarkerStyle()).toBe('solid');
		});
	});
});
