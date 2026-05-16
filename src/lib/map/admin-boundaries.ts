import type {
	Feature,
	FeatureCollection,
	Geometry,
	MultiPolygon,
	Point,
	Polygon
} from 'geojson';

import type { WardSummaryFeatureProperties } from './facility-rendering';

export type AdminBoundaryLevel = 'prefecture' | 'municipality';
export type AdminBoundaryGeometry = Polygon | MultiPolygon;

export interface N03BoundaryProperties {
	[key: string]: unknown;
	N03_001?: string | null;
	N03_002?: string | null;
	N03_003?: string | null;
	N03_004?: string | null;
	N03_007?: string | null;
}

export interface AdminBoundaryValidationStats {
	totalFeatures: number;
	acceptedFeatures: number;
	missingGeometry: number;
	unsupportedGeometry: number;
	missingRequiredProperties: number;
}

export type AdminBoundaryFeature = Feature<AdminBoundaryGeometry, N03BoundaryProperties>;
export type AdminBoundaryCollection = FeatureCollection<AdminBoundaryGeometry, N03BoundaryProperties>;

export interface AdminSummaryFeatureProperties extends WardSummaryFeatureProperties {
	areaKey: string;
	boundaryCode: string | null;
	boundaryPrefecture: string;
	boundaryCityLabel: string;
}

export type AdminSummaryPolygonCollection = FeatureCollection<AdminBoundaryGeometry, AdminSummaryFeatureProperties>;
export type AdminSummaryLabelCollection = FeatureCollection<Point, AdminSummaryFeatureProperties>;

export interface AdminSummaryCollections {
	polygons: AdminSummaryPolygonCollection;
	labels: AdminSummaryLabelCollection;
}

export interface ValidatedAdminBoundaryCollection {
	collection: AdminBoundaryCollection;
	stats: AdminBoundaryValidationStats;
}

export const ADMIN_BOUNDARY_URLS: Record<AdminBoundaryLevel, string> = {
	prefecture: '/geojson/admin-areas/prefectures.json',
	municipality: '/geojson/admin-areas/municipalities.json'
};

const EMPTY_ADMIN_SUMMARY_COLLECTIONS: AdminSummaryCollections = {
	polygons: { type: 'FeatureCollection', features: [] },
	labels: { type: 'FeatureCollection', features: [] }
};

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

function isSupportedGeometry(geometry: Geometry | null | undefined): geometry is AdminBoundaryGeometry {
	return geometry?.type === 'Polygon' || geometry?.type === 'MultiPolygon';
}

function stringValue(value: unknown): string | null {
	return typeof value === 'string' && value.trim() ? value.trim() : null;
}

export function normalizeAdminAreaKey(value: string | null | undefined): string {
	return (value ?? '')
		.normalize('NFKC')
		.replace(/\s+/g, '')
		.trim()
		.toLowerCase();
}

function requiredPropertiesForLevel(level: AdminBoundaryLevel): string[] {
	return level === 'prefecture' ? ['N03_001'] : ['N03_001', 'N03_004'];
}

function hasRequiredProperties(properties: N03BoundaryProperties, level: AdminBoundaryLevel): boolean {
	return requiredPropertiesForLevel(level).every((key) => stringValue(properties[key]) !== null);
}

export function validateAdminBoundaryCollection(
	raw: unknown,
	level: AdminBoundaryLevel
): ValidatedAdminBoundaryCollection {
	const stats: AdminBoundaryValidationStats = {
		totalFeatures: 0,
		acceptedFeatures: 0,
		missingGeometry: 0,
		unsupportedGeometry: 0,
		missingRequiredProperties: 0
	};

	if (!isRecord(raw) || raw.type !== 'FeatureCollection' || !Array.isArray(raw.features)) {
		throw new Error('Administrative boundary GeoJSON must be a FeatureCollection.');
	}

	const features: AdminBoundaryFeature[] = [];
	stats.totalFeatures = raw.features.length;

	for (const item of raw.features) {
		if (!isRecord(item) || item.type !== 'Feature') continue;

		const geometry = item.geometry as Geometry | null | undefined;
		if (!geometry) {
			stats.missingGeometry += 1;
			continue;
		}
		if (!isSupportedGeometry(geometry)) {
			stats.unsupportedGeometry += 1;
			continue;
		}

		const properties = (isRecord(item.properties) ? item.properties : {}) as N03BoundaryProperties;
		if (!hasRequiredProperties(properties, level)) {
			stats.missingRequiredProperties += 1;
			continue;
		}

		features.push({
			type: 'Feature',
			geometry,
			properties
		});
	}

	stats.acceptedFeatures = features.length;

	return {
		collection: {
			type: 'FeatureCollection',
			features
		},
		stats
	};
}

function boundaryCode(feature: AdminBoundaryFeature): string | null {
	return stringValue(feature.properties.N03_007);
}

function boundaryPrefecture(feature: AdminBoundaryFeature): string {
	return stringValue(feature.properties.N03_001) ?? '';
}

function boundaryMunicipalityLabel(feature: AdminBoundaryFeature): string {
	return stringValue(feature.properties.N03_004) ?? '';
}

function boundaryAreaKeys(feature: AdminBoundaryFeature, level: AdminBoundaryLevel): string[] {
	const prefecture = boundaryPrefecture(feature);
	const municipality = boundaryMunicipalityLabel(feature);
	const code = boundaryCode(feature);
	const keys = new Set<string>();

	if (level === 'prefecture') {
		keys.add(normalizeAdminAreaKey(prefecture));
		if (code) keys.add(normalizeAdminAreaKey(code));
	} else {
		if (code) keys.add(normalizeAdminAreaKey(code));
		keys.add(normalizeAdminAreaKey(municipality));
		keys.add(`${normalizeAdminAreaKey(prefecture)}:${normalizeAdminAreaKey(municipality)}`);
	}

	return [...keys].filter(Boolean);
}

function summaryAreaKeys(summary: WardSummaryFeatureProperties): string[] {
	const keys = new Set<string>();
	keys.add(normalizeAdminAreaKey(summary.city));
	keys.add(normalizeAdminAreaKey(summary.cityLabel));
	keys.add(`${normalizeAdminAreaKey(summary.prefecture)}:${normalizeAdminAreaKey(summary.cityLabel)}`);
	return [...keys].filter(Boolean);
}

function buildSummaryLookup(
	summaryCollection: FeatureCollection<Point, WardSummaryFeatureProperties>
): Map<string, Feature<Point, WardSummaryFeatureProperties>> {
	const lookup = new Map<string, Feature<Point, WardSummaryFeatureProperties>>();
	for (const summary of summaryCollection.features) {
		for (const key of summaryAreaKeys(summary.properties)) {
			if (!lookup.has(key)) lookup.set(key, summary);
		}
	}
	return lookup;
}

function toAdminSummaryProperties(
	boundary: AdminBoundaryFeature,
	summary: Feature<Point, WardSummaryFeatureProperties>,
	level: AdminBoundaryLevel
): AdminSummaryFeatureProperties {
	const code = boundaryCode(boundary);
	const prefecture = boundaryPrefecture(boundary);
	const municipality = boundaryMunicipalityLabel(boundary);
	const firstKey = boundaryAreaKeys(boundary, level)[0] ?? summary.properties.city;

	return {
		...summary.properties,
		areaKey: firstKey,
		boundaryCode: code,
		boundaryPrefecture: prefecture,
		boundaryCityLabel: level === 'prefecture' ? prefecture : municipality
	};
}

function toZeroSummaryProperties(
	boundary: AdminBoundaryFeature,
	level: AdminBoundaryLevel,
	labelCoordinates: [number, number]
): AdminSummaryFeatureProperties {
	const code = boundaryCode(boundary);
	const prefecture = boundaryPrefecture(boundary);
	const municipality = boundaryMunicipalityLabel(boundary);
	const cityLabel = level === 'prefecture' ? prefecture : municipality;
	const city = level === 'prefecture' ? prefecture : (code ?? municipality);
	const firstKey = boundaryAreaKeys(boundary, level)[0] ?? normalizeAdminAreaKey(city);

	return {
		prefecture,
		city,
		cityLabel,
		summaryType: level,
		facilityCount: 0,
		clusterRadiusScale: 1,
		sumLng: labelCoordinates[0],
		sumLat: labelCoordinates[1],
		minLng: labelCoordinates[0],
		minLat: labelCoordinates[1],
		maxLng: labelCoordinates[0],
		maxLat: labelCoordinates[1],
		areaKey: firstKey,
		boundaryCode: code,
		boundaryPrefecture: prefecture,
		boundaryCityLabel: cityLabel
	};
}

function forEachPosition(geometry: AdminBoundaryGeometry, visitor: (position: [number, number]) => void): void {
	const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
	for (const polygon of polygons) {
		for (const ring of polygon) {
			for (const position of ring) {
				const [lng, lat] = position;
				if (Number.isFinite(lng) && Number.isFinite(lat)) {
					visitor([lng, lat]);
				}
			}
		}
	}
}

function getBoundaryLabelPoint(geometry: AdminBoundaryGeometry): [number, number] | null {
	let minLng = Number.POSITIVE_INFINITY;
	let minLat = Number.POSITIVE_INFINITY;
	let maxLng = Number.NEGATIVE_INFINITY;
	let maxLat = Number.NEGATIVE_INFINITY;

	forEachPosition(geometry, ([lng, lat]) => {
		minLng = Math.min(minLng, lng);
		minLat = Math.min(minLat, lat);
		maxLng = Math.max(maxLng, lng);
		maxLat = Math.max(maxLat, lat);
	});

	if (![minLng, minLat, maxLng, maxLat].every(Number.isFinite)) return null;
	return [(minLng + maxLng) / 2, (minLat + maxLat) / 2];
}

export function buildAdministrativeSummaryFeatureCollections(
	boundaries: AdminBoundaryCollection | null | undefined,
	summaryCollection: FeatureCollection<Point, WardSummaryFeatureProperties>,
	level: AdminBoundaryLevel
): AdminSummaryCollections {
	if (!boundaries) {
		return EMPTY_ADMIN_SUMMARY_COLLECTIONS;
	}

	const summariesByKey = buildSummaryLookup(summaryCollection);
	const polygons: AdminSummaryPolygonCollection['features'] = [];
	const labels: AdminSummaryLabelCollection['features'] = [];

	for (const boundary of boundaries.features) {
		const summary = boundaryAreaKeys(boundary, level)
			.map((key) => summariesByKey.get(key))
			.find((item): item is Feature<Point, WardSummaryFeatureProperties> => item !== undefined);

		const zeroLabelPoint = summary ? null : getBoundaryLabelPoint(boundary.geometry);
		const properties = summary
			? toAdminSummaryProperties(boundary, summary, level)
			: toZeroSummaryProperties(boundary, level, zeroLabelPoint ?? [0, 0]);
		polygons.push({
			type: 'Feature',
			geometry: boundary.geometry,
			properties
		});
		if (summary || zeroLabelPoint) {
			labels.push({
				type: 'Feature',
				geometry: summary?.geometry ?? { type: 'Point', coordinates: zeroLabelPoint as [number, number] },
				properties
			});
		}
	}

	return {
		polygons: {
			type: 'FeatureCollection',
			features: polygons
		},
		labels: {
			type: 'FeatureCollection',
			features: labels
		}
	};
}

export async function loadAdminBoundaryCollection(
	level: AdminBoundaryLevel,
	fetcher: typeof fetch = fetch
): Promise<ValidatedAdminBoundaryCollection> {
	const response = await fetcher(ADMIN_BOUNDARY_URLS[level]);
	if (!response.ok) {
		throw new Error(`Failed to load administrative boundaries: ${response.status}`);
	}
	return validateAdminBoundaryCollection(await response.json(), level);
}
