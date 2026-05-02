import { CATEGORY_COLOR } from '$lib/db/categories.js';
import {
	buildGradientStops,
	buildPieSegments,
	getEffectiveMode,
	getMarkerColors
} from '$lib/marker-utils.js';
import type { CategoryId, MarkerStyle } from '$lib/types.js';

import type { MarkerImageDescriptor } from './facility-rendering.js';
import { MARKER_ICON_HEIGHT, MARKER_ICON_WIDTH } from './facility-rendering.js';

const pinPath = 'M16 1 C7.2 1 0 8.2 0 17 C0 27 16 41 16 41 C16 41 32 27 32 17 C32 8.2 24.8 1 16 1 Z';
const markerImageCache = new Map<string, Promise<ImageData>>();

function buildMarkerSvg(
	categories: CategoryId[],
	style: MarkerStyle,
	iconKey: string,
	solidColor?: string
): string {
	const safeId = iconKey.replace(/[^a-z0-9]/gi, '-');
	const gradId = `pin-grad-${safeId}`;
	const highlightId = `pin-highlight-${safeId}`;
	const clipId = `pin-clip-${safeId}`;
	const leftHalfId = `left-half-${safeId}`;
	const rightHalfId = `right-half-${safeId}`;

	const colors = getMarkerColors(categories);
	const effectiveMode = getEffectiveMode(style, categories.length);
	const primaryColor =
		style === 'solid' && solidColor ? solidColor : colors[0] ?? CATEGORY_COLOR['dry-battery'];
	const ringSegments =
		effectiveMode === 'ring' ? buildPieSegments(colors, 16, 17, 25) : [];
	const gradientStops =
		effectiveMode === 'gradient' ? buildGradientStops(colors) : [];

	const defs: string[] = [];
	if (effectiveMode === 'gradient') {
		defs.push(
			`<linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="100%">`,
			...gradientStops.map(
				(stop) =>
					`<stop offset="${stop.pct}%" stop-color="${stop.color}" stop-opacity="0.95" />`
			),
			'</linearGradient>'
		);
	}
	defs.push(
		`<linearGradient id="${highlightId}" x1="0%" y1="0%" x2="0%" y2="100%">`,
		'<stop offset="0%" stop-color="white" stop-opacity="0.8" />',
		'<stop offset="35%" stop-color="white" stop-opacity="0.1" />',
		'<stop offset="100%" stop-color="white" stop-opacity="0" />',
		'</linearGradient>',
		`<clipPath id="${clipId}"><path d="${pinPath}" /></clipPath>`
	);
	if (effectiveMode === 'split') {
		defs.push(
			`<clipPath id="${leftHalfId}"><rect x="0" y="0" width="16" height="42" /></clipPath>`,
			`<clipPath id="${rightHalfId}"><rect x="16" y="0" width="16" height="42" /></clipPath>`
		);
	}

	let body = '';
	if (effectiveMode === 'solid') {
		body = `<path d="${pinPath}" fill="${primaryColor}" stroke="rgba(180,180,180,0.5)" stroke-width="2.0" />`;
	} else if (effectiveMode === 'split') {
		body = [
			`<path d="${pinPath}" fill="${colors[0]}" stroke="rgba(180,180,180,0.5)" stroke-width="2.0" clip-path="url(#${leftHalfId})" />`,
			`<path d="${pinPath}" fill="${colors[1]}" stroke="rgba(180,180,180,0.5)" stroke-width="2.0" clip-path="url(#${rightHalfId})" />`,
			`<path d="${pinPath}" fill="none" stroke="rgba(180,180,180,0.5)" stroke-width="2.0" />`
		].join('');
	} else if (effectiveMode === 'ring') {
		body = [
			`<g clip-path="url(#${clipId})">`,
			...ringSegments.map((segment) => `<path d="${segment.path}" fill="${segment.color}" />`),
			'</g>',
			`<path d="${pinPath}" fill="none" stroke="rgba(180,180,180,0.5)" stroke-width="2.0" />`
		].join('');
	} else {
		body = `<path d="${pinPath}" fill="url(#${gradId})" stroke="rgba(180,180,180,0.5)" stroke-width="2.0" />`;
	}

	return [
		`<svg width="${MARKER_ICON_WIDTH}" height="${MARKER_ICON_HEIGHT}" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg">`,
		'<defs>',
		...defs,
		'</defs>',
		body,
		`<path d="${pinPath}" fill="url(#${highlightId})" />`,
		'<circle cx="16" cy="17" r="6" fill="white" />',
		'</svg>'
	].join('');
}

async function svgToImageData(svg: string): Promise<ImageData> {
	const img = new window.Image();
	img.decoding = 'async';

	await new Promise<void>((resolve, reject) => {
		img.onload = () => resolve();
		img.onerror = () => reject(new Error('Failed to load marker SVG image.'));
		img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
	});

	const canvas = document.createElement('canvas');
	canvas.width = MARKER_ICON_WIDTH;
	canvas.height = MARKER_ICON_HEIGHT;
	const ctx = canvas.getContext('2d');
	if (!ctx) {
		throw new Error('Canvas 2D context is not available.');
	}

	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
	return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

export function getMarkerImage(descriptor: MarkerImageDescriptor): Promise<ImageData> {
	const cached = markerImageCache.get(descriptor.iconKey);
	if (cached) return cached;

	const promise = svgToImageData(
		buildMarkerSvg(
			descriptor.categories,
			descriptor.style,
			descriptor.iconKey,
			descriptor.solidColor
		)
	);
	markerImageCache.set(descriptor.iconKey, promise);
	return promise;
}
