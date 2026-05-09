import { describe, expect, it } from 'vitest';
import { escapeLikePattern } from '../d1-repository';

describe('escapeLikePattern', () => {
	it('escapes SQL LIKE wildcards so user input matches literally', () => {
		expect(escapeLikePattern('%')).toBe('\\%');
		expect(escapeLikePattern('_')).toBe('\\_');
		expect(escapeLikePattern('100%還元')).toBe('100\\%還元');
		expect(escapeLikePattern('a_b')).toBe('a\\_b');
	});

	it('escapes the escape character itself before wildcards', () => {
		expect(escapeLikePattern('\\')).toBe('\\\\');
		expect(escapeLikePattern('a\\%b')).toBe('a\\\\\\%b');
	});

	it('leaves regular characters unchanged', () => {
		expect(escapeLikePattern('図書館')).toBe('図書館');
		expect(escapeLikePattern('battery')).toBe('battery');
		expect(escapeLikePattern('')).toBe('');
	});
});
