import { describe, it, expect } from 'vitest';
import {
	getEffectiveMode,
	getMarkerColors,
	buildDonutSegments,
	donutSegmentPath,
	buildPieSegments,
	pieSlicePath,
	buildGradientStops,
} from '../marker-utils';
import type { MarkerStyle, CategoryId } from '../types';

describe('marker-utils', () => {
	describe('getEffectiveMode', () => {
		it('solid style always returns solid', () => {
			expect(getEffectiveMode('solid', 1)).toBe('solid');
			expect(getEffectiveMode('solid', 2)).toBe('solid');
			expect(getEffectiveMode('solid', 5)).toBe('solid');
		});

		it('gradient style always returns gradient', () => {
			expect(getEffectiveMode('gradient', 1)).toBe('gradient');
			expect(getEffectiveMode('gradient', 3)).toBe('gradient');
		});

		it('adaptive style returns solid for 1 category', () => {
			expect(getEffectiveMode('adaptive', 1)).toBe('solid');
		});

		it('adaptive style returns split for 2 categories', () => {
			expect(getEffectiveMode('adaptive', 2)).toBe('split');
		});

		it('adaptive style returns ring for 3+ categories', () => {
			expect(getEffectiveMode('adaptive', 3)).toBe('ring');
			expect(getEffectiveMode('adaptive', 8)).toBe('ring');
		});
	});

	describe('getMarkerColors', () => {
		it('maps categories to their colors', () => {
			const cats: CategoryId[] = ['dry-battery', 'rechargeable-battery'];
			const colors = getMarkerColors(cats);
			expect(colors).toEqual(['#7dd3fc', '#10b981']);
		});

		it('returns empty array for empty categories', () => {
			expect(getMarkerColors([])).toEqual([]);
		});

		it('drops unknown category colors before SVG generation', () => {
			const colors = getMarkerColors(['office' as CategoryId, 'dry-battery']);
			expect(colors).toEqual(['#7dd3fc']);
		});
	});

	describe('donutSegmentPath', () => {
		it('generates valid SVG path string', () => {
			const path = donutSegmentPath(16, 17, 7, 13, 0, Math.PI / 2);
			expect(path).toContain('M');
			expect(path).toContain('A');
			expect(path).toContain('Z');
		});

		it('uses largeArc flag for angles > PI', () => {
			const small = donutSegmentPath(0, 0, 1, 2, 0, Math.PI / 2);
			const large = donutSegmentPath(0, 0, 1, 2, 0, Math.PI * 1.5);
			// large arc flag is the 4th number after the FIRST 'A' command
			const smallParts = small.split(' A ');
			const largeParts = large.split(' A ');
			// First arc command: "A outerR outerR 0 largeArc 1 ..."
			const smallArcFlag = smallParts[1]?.split(' ')[3];
			const largeArcFlag = largeParts[1]?.split(' ')[3];
			expect(smallArcFlag).toBe('0');
			expect(largeArcFlag).toBe('1');
		});
	});

	describe('buildDonutSegments', () => {
		it('creates one segment per color', () => {
			const colors = ['#ff0000', '#00ff00', '#0000ff'];
			const segs = buildDonutSegments(colors, 16, 17, 7, 13);
			expect(segs).toHaveLength(3);
			expect(segs[0].color).toBe('#ff0000');
			expect(segs[1].color).toBe('#00ff00');
			expect(segs[2].color).toBe('#0000ff');
		});

		it('returns empty array for empty colors', () => {
			expect(buildDonutSegments([], 16, 17, 7, 13)).toEqual([]);
		});

		it('generates unique path strings for each segment', () => {
			const colors = ['#ff0000', '#00ff00'];
			const segs = buildDonutSegments(colors, 16, 17, 7, 13);
			expect(segs[0].path).not.toBe(segs[1].path);
		});
	});

	describe('buildPieSegments', () => {
		it('creates one segment per color', () => {
			const colors = ['#ff0000', '#00ff00', '#0000ff'];
			const segs = buildPieSegments(colors, 16, 17, 25);
			expect(segs).toHaveLength(3);
			expect(segs[0].color).toBe('#ff0000');
			expect(segs[1].color).toBe('#00ff00');
			expect(segs[2].color).toBe('#0000ff');
		});

		it('returns empty array for empty colors', () => {
			expect(buildPieSegments([], 16, 17, 25)).toEqual([]);
		});

		it('generates unique path strings for each segment', () => {
			const colors = ['#ff0000', '#00ff00'];
			const segs = buildPieSegments(colors, 16, 17, 25);
			expect(segs[0].path).not.toBe(segs[1].path);
		});

		it('generates paths that cover a large radius', () => {
			const segs = buildPieSegments(['#ff0000'], 16, 17, 25);
			// 半径25の円弧を含むはず
			expect(segs[0].path).toContain('A 25 25');
		});
	});

	describe('pieSlicePath', () => {
		it('generates valid SVG path string', () => {
			const path = pieSlicePath(16, 17, 25, 0, Math.PI / 2);
			expect(path).toContain('M');
			expect(path).toContain('A');
			expect(path).toContain('Z');
		});

		it('starts at center point', () => {
			const path = pieSlicePath(10, 20, 25, 0, Math.PI);
			expect(path.startsWith('M 10 20')).toBe(true);
		});
	});

	describe('buildGradientStops', () => {
		it('creates single stop for one color', () => {
			const stops = buildGradientStops(['#ff0000']);
			expect(stops).toEqual([
				{ color: '#ff0000', pct: 0 },
			]);
		});

		it('creates evenly distributed stops for multiple colors', () => {
			const stops = buildGradientStops(['#ff0000', '#00ff00', '#0000ff']);
			expect(stops).toEqual([
				{ color: '#ff0000', pct: 0 },
				{ color: '#00ff00', pct: 50 },
				{ color: '#0000ff', pct: 100 },
			]);
		});
	});
});
