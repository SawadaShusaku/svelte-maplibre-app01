import type maplibregl from 'maplibre-gl';
import type { FeatureCollection, Point } from 'geojson';

import type { GeoFeature } from '$lib/data.js';
import type { CategoryId, MarkerStyle } from '$lib/types.js';

export const CLUSTER_TRANSITION_ZOOM = 11.75;
export const PREFECTURE_SUMMARY_MAX_ZOOM = 7.5;
export const INDIVIDUAL_MARKER_MIN_ZOOM = CLUSTER_TRANSITION_ZOOM;
export const WARD_SUMMARY_MAX_ZOOM = CLUSTER_TRANSITION_ZOOM;
export const WARD_SUMMARY_CLICK_ZOOM = 14;
export const PREFECTURE_SUMMARY_CLICK_ZOOM = 8.75;
export const MARKER_ICON_WIDTH = 32;
export const MARKER_ICON_HEIGHT = 42;
export const MARKER_ICON_SIZE = 27 / MARKER_ICON_WIDTH;

export interface MarkerFeatureProperties {
	facilityId: string;
	iconKey: string;
}

export interface MarkerImageDescriptor {
	iconKey: string;
	categories: CategoryId[];
	style: MarkerStyle;
	solidColor?: string;
}

export interface WardSummaryFeatureProperties {
	city: string;
	cityLabel: string;
	summaryType: 'prefecture' | 'municipality';
	facilityCount: number;
	minLng: number;
	minLat: number;
	maxLng: number;
	maxLat: number;
}

export function buildFacilityIndex(facilities: GeoFeature[]): Map<string, GeoFeature> {
	return new Map(facilities.map((facility) => [facility.properties.id, facility]));
}

export function resolveSelectedFacility(
	facilityIndex: Map<string, GeoFeature>,
	selectedFacilityId: string | null
): GeoFeature | null {
	if (!selectedFacilityId) return null;
	return facilityIndex.get(selectedFacilityId) ?? null;
}

export function getMarkerIconKey(
	categories: CategoryId[],
	style: MarkerStyle,
	solidColor?: string
): string {
	const categoryKey = categories.join('__') || 'none';
	return ['marker', style, solidColor ?? 'default', categoryKey]
		.join('--')
		.replace(/[^a-z0-9_-]/gi, '-')
		.toLowerCase();
}

function isFiniteCoordinatePair(coordinates: unknown): coordinates is [number, number] {
	return (
		Array.isArray(coordinates) &&
		coordinates.length >= 2 &&
		Number.isFinite(coordinates[0]) &&
		Number.isFinite(coordinates[1])
	);
}

export function buildMarkerFeatureCollection(
	facilities: GeoFeature[],
	style: MarkerStyle,
	solidColor?: string
): FeatureCollection<Point, MarkerFeatureProperties> {
	return {
		type: 'FeatureCollection',
		features: facilities
			.filter((facility) => isFiniteCoordinatePair(facility.geometry.coordinates))
			.map((facility) => ({
				type: 'Feature',
				geometry: {
					type: 'Point',
					coordinates: facility.geometry.coordinates
				},
				properties: {
					facilityId: facility.properties.id,
					iconKey: getMarkerIconKey(facility.properties.categories as CategoryId[], style, solidColor)
				}
			}))
	};
}

export function buildMarkerImageDescriptors(
	facilities: GeoFeature[],
	style: MarkerStyle,
	solidColor?: string
): MarkerImageDescriptor[] {
	const descriptors = new Map<string, MarkerImageDescriptor>();

	for (const facility of facilities) {
		if (!isFiniteCoordinatePair(facility.geometry.coordinates)) continue;
		const categories = facility.properties.categories as CategoryId[];
		const iconKey = getMarkerIconKey(categories, style, solidColor);
		if (!descriptors.has(iconKey)) {
			descriptors.set(iconKey, {
				iconKey,
				categories,
				style,
				solidColor
			});
		}
	}

	return [...descriptors.values()];
}

export function buildWardSummaryFeatureCollection(
	facilities: GeoFeature[],
	level: 'prefecture' | 'municipality' = 'municipality'
): FeatureCollection<Point, WardSummaryFeatureProperties> {
	const summaries = new Map<string, WardSummaryFeatureProperties>();

	for (const facility of facilities) {
		if (!isFiniteCoordinatePair(facility.geometry.coordinates)) continue;
		const [lng, lat] = facility.geometry.coordinates;
		const { city, cityLabel, prefecture } = facility.properties;
		const key = level === 'prefecture' ? prefecture : city;
		const label = level === 'prefecture' ? prefecture : cityLabel;
		if (!key || !label) continue;
		const existing = summaries.get(key);

		if (existing) {
			existing.facilityCount += 1;
			existing.minLng = Math.min(existing.minLng, lng);
			existing.minLat = Math.min(existing.minLat, lat);
			existing.maxLng = Math.max(existing.maxLng, lng);
			existing.maxLat = Math.max(existing.maxLat, lat);
			continue;
		}

		summaries.set(key, {
			city: key,
			cityLabel: label,
			summaryType: level,
			facilityCount: 1,
			minLng: lng,
			minLat: lat,
			maxLng: lng,
			maxLat: lat
		});
	}

	return {
		type: 'FeatureCollection',
		features: [...summaries.values()].map((summary) => ({
			type: 'Feature',
			geometry: {
				type: 'Point',
				coordinates: [
					(summary.minLng + summary.maxLng) / 2,
					(summary.minLat + summary.maxLat) / 2
				]
			},
			properties: summary
		}))
	};
}

export function panToFacility(
	map: maplibregl.Map,
	facility: GeoFeature,
	isMobile: boolean,
	options?: { zoom?: number; duration?: number }
): void {
	const [lng, lat] = facility.geometry.coordinates;
	const duration = options?.duration ?? 300;

	if (isMobile) {
		const offset = window.innerHeight * 0.25;
		map.easeTo({
			center: [lng, lat],
			zoom: options?.zoom,
			offset: [0, -offset],
			duration
		});
		return;
	}

	if (options?.zoom !== undefined) {
		map.flyTo({ center: [lng, lat], zoom: options.zoom });
	}
}

export function fitToWardSummary(
	map: maplibregl.Map,
	summary: WardSummaryFeatureProperties,
	isMobile: boolean
): void {
	const center: [number, number] = [
		(summary.minLng + summary.maxLng) / 2,
		(summary.minLat + summary.maxLat) / 2
	];

	map.easeTo({
		center,
		zoom: summary.summaryType === 'prefecture' ? PREFECTURE_SUMMARY_CLICK_ZOOM : WARD_SUMMARY_CLICK_ZOOM,
		offset: isMobile ? [0, -window.innerHeight * 0.2] : [0, 0],
		duration: 500
	});
}
