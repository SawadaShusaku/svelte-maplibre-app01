import type { CategoryId, MarkerStyle } from './types.js';
import { CATEGORY_COLOR } from './db/categories.js';

export type RenderMode = 'solid' | 'split' | 'ring' | 'gradient';

export function getEffectiveMode(
	style: MarkerStyle,
	categoryCount: number
): RenderMode {
	if (style === 'solid') return 'solid';
	if (style === 'gradient') return 'gradient';
	// adaptive
	if (categoryCount === 1) return 'solid';
	if (categoryCount === 2) return 'split';
	return 'ring';
}

export function getMarkerColors(categories: CategoryId[]): string[] {
	return categories
		.map((c) => CATEGORY_COLOR[c])
		.filter((color): color is string => typeof color === 'string' && color.length > 0);
}

export interface DonutSegment {
	path: string;
	color: string;
}

export function buildDonutSegments(
	colors: string[],
	cx: number,
	cy: number,
	innerR: number,
	outerR: number
): DonutSegment[] {
	const count = colors.length;
	if (count === 0) return [];
	const anglePer = (2 * Math.PI) / count;
	const offset = -Math.PI / 2;
	const segs: DonutSegment[] = [];
	for (let i = 0; i < count; i++) {
		const start = offset + i * anglePer;
		const end = offset + (i + 1) * anglePer;
		segs.push({
			path: donutSegmentPath(cx, cy, innerR, outerR, start, end),
			color: colors[i],
		});
	}
	return segs;
}

export function donutSegmentPath(
	cx: number,
	cy: number,
	innerR: number,
	outerR: number,
	startAngle: number,
	endAngle: number
): string {
	const ox1 = cx + outerR * Math.cos(startAngle);
	const oy1 = cy + outerR * Math.sin(startAngle);
	const ox2 = cx + outerR * Math.cos(endAngle);
	const oy2 = cy + outerR * Math.sin(endAngle);
	const ix2 = cx + innerR * Math.cos(endAngle);
	const iy2 = cy + innerR * Math.sin(endAngle);
	const ix1 = cx + innerR * Math.cos(startAngle);
	const iy1 = cy + innerR * Math.sin(startAngle);
	const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
	return `M ${ox1} ${oy1} A ${outerR} ${outerR} 0 ${largeArc} 1 ${ox2} ${oy2} L ${ix2} ${iy2} A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix1} ${iy1} Z`;
}

export interface PieSegment {
	path: string;
	color: string;
}

export function buildPieSegments(
	colors: string[],
	cx: number,
	cy: number,
	r: number
): PieSegment[] {
	const count = colors.length;
	if (count === 0) return [];
	const anglePer = (2 * Math.PI) / count;
	const offset = -Math.PI / 2;
	const segs: PieSegment[] = [];
	for (let i = 0; i < count; i++) {
		const start = offset + i * anglePer;
		const end = offset + (i + 1) * anglePer;
		segs.push({
			path: pieSlicePath(cx, cy, r, start, end),
			color: colors[i],
		});
	}
	return segs;
}

export function pieSlicePath(
	cx: number,
	cy: number,
	r: number,
	startAngle: number,
	endAngle: number
): string {
	const x1 = cx + r * Math.cos(startAngle);
	const y1 = cy + r * Math.sin(startAngle);
	const x2 = cx + r * Math.cos(endAngle);
	const y2 = cy + r * Math.sin(endAngle);
	const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
	return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
}

export function buildGradientStops(colors: string[]): { color: string; pct: number }[] {
	return colors.map((color, i) => ({
		color,
		pct: Math.round((i / Math.max(colors.length - 1, 1)) * 100),
	}));
}
