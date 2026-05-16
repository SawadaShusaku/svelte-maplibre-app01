import { describe, expect, it } from 'vitest';
import type { GeoFeature } from '$lib/data';
import {
	buildAdministrativeSummaryFeatureCollections,
	validateAdminBoundaryCollection,
	type AdminBoundaryCollection
} from '../admin-boundaries';
import { buildWardSummaryFeatureCollection } from '../facility-rendering';

function facility(
	id: string,
	prefecture: string,
	city: string,
	cityLabel: string,
	coordinates: [number, number]
): GeoFeature {
	return {
		type: 'Feature',
		geometry: { type: 'Point', coordinates },
		properties: {
			id,
			prefecture,
			city,
			cityLabel,
			name: id,
			address: '',
			categories: ['button-battery'],
			hours: null,
			notes: null,
			imageUrl: null,
			imageAlt: null,
			imageCredit: null,
			imageSourceUrl: null,
			mapillaryImageId: null,
			officialUrl: null,
			categoryUrls: null
		}
	};
}

function square(minLng: number, minLat: number, maxLng: number, maxLat: number) {
	return {
		type: 'Polygon' as const,
		coordinates: [[
			[minLng, minLat],
			[maxLng, minLat],
			[maxLng, maxLat],
			[minLng, maxLat],
			[minLng, minLat]
		]]
	};
}

describe('validateAdminBoundaryCollection', () => {
	it('keeps supported polygon features and reports missing geometries', () => {
		const result = validateAdminBoundaryCollection({
			type: 'FeatureCollection',
			features: [
				{
					type: 'Feature',
					geometry: square(0, 0, 1, 1),
					properties: { N03_001: '東京都', N03_004: '豊島区', N03_007: '13116' }
				},
				{
					type: 'Feature',
					geometry: null,
					properties: { N03_001: '東京都', N03_004: '境界未定地', N03_007: '13999' }
				}
			]
		}, 'municipality');

		expect(result.collection.features).toHaveLength(1);
		expect(result.stats.totalFeatures).toBe(2);
		expect(result.stats.acceptedFeatures).toBe(1);
		expect(result.stats.missingGeometry).toBe(1);
	});

	it('rejects non-FeatureCollection input', () => {
		expect(() => validateAdminBoundaryCollection({ type: 'Feature' }, 'prefecture')).toThrow(
			/FeatureCollection/
		);
	});
});

describe('buildAdministrativeSummaryFeatureCollections', () => {
	it('joins prefecture summaries to prefecture polygons', () => {
		const boundaries: AdminBoundaryCollection = {
			type: 'FeatureCollection',
			features: [
				{
					type: 'Feature',
					geometry: square(139, 35, 140, 36),
					properties: { N03_001: '東京都', N03_007: '13' }
				},
				{
					type: 'Feature',
					geometry: square(135, 34, 136, 35),
					properties: { N03_001: '大阪府', N03_007: '27' }
				}
			]
		};
		const summaries = buildWardSummaryFeatureCollection([
			facility('tokyo-1', '東京都', 'toshima', '豊島区', [139.7, 35.7]),
			facility('tokyo-2', '東京都', 'chiyoda', '千代田区', [139.75, 35.69])
		], 'prefecture');

		const result = buildAdministrativeSummaryFeatureCollections(boundaries, summaries, 'prefecture');

		expect(result.polygons.features).toHaveLength(2);
		expect(result.labels.features).toHaveLength(2);
		const tokyo = result.polygons.features.find((item) => item.properties.cityLabel === '東京都');
		const osaka = result.polygons.features.find((item) => item.properties.cityLabel === '大阪府');
		expect(tokyo?.properties.facilityCount).toBe(2);
		expect(osaka?.properties.facilityCount).toBe(0);
	});

	it('matches Tokyo ward summaries by prefecture and ward label', () => {
		const boundaries: AdminBoundaryCollection = {
			type: 'FeatureCollection',
			features: [
				{
					type: 'Feature',
					geometry: square(139.6, 35.6, 139.8, 35.8),
					properties: { N03_001: '東京都', N03_004: '豊島区', N03_007: '13116' }
				}
			]
		};
		const summaries = buildWardSummaryFeatureCollection([
			facility('tokyo-1', '東京都', 'toshima', '豊島区', [139.7, 35.7])
		], 'municipality');

		const result = buildAdministrativeSummaryFeatureCollections(boundaries, summaries, 'municipality');

		expect(result.polygons.features).toHaveLength(1);
		expect(result.polygons.features[0].properties.city).toBe('toshima');
		expect(result.labels.features[0].geometry.coordinates).toEqual([139.7, 35.7]);
	});

	it('matches non-Tokyo municipality summaries by prefecture and municipality label', () => {
		const boundaries: AdminBoundaryCollection = {
			type: 'FeatureCollection',
			features: [
				{
					type: 'Feature',
					geometry: square(135.4, 34.6, 135.6, 34.8),
					properties: { N03_001: '大阪府', N03_004: '大阪市', N03_007: '27100' }
				}
			]
		};
		const summaries = buildWardSummaryFeatureCollection([
			facility('osaka-1', '大阪府', 'osaka-city', '大阪市', [135.5, 34.7])
		], 'municipality');

		const result = buildAdministrativeSummaryFeatureCollections(boundaries, summaries, 'municipality');

		expect(result.polygons.features).toHaveLength(1);
		expect(result.polygons.features[0].properties.cityLabel).toBe('大阪市');
	});

	it('keeps administrative polygons with zero matching facilities and labels them from geometry center', () => {
		const boundaries: AdminBoundaryCollection = {
			type: 'FeatureCollection',
			features: [
				{
					type: 'Feature',
					geometry: square(130, 30, 131, 31),
					properties: { N03_001: '福岡県', N03_004: '福岡市', N03_007: '40130' }
				}
			]
		};
		const summaries = buildWardSummaryFeatureCollection([
			facility('osaka-1', '大阪府', 'osaka-city', '大阪市', [135.5, 34.7])
		], 'municipality');

		const result = buildAdministrativeSummaryFeatureCollections(boundaries, summaries, 'municipality');

		expect(result.polygons.features).toHaveLength(1);
		expect(result.polygons.features[0].properties.facilityCount).toBe(0);
		expect(result.polygons.features[0].properties.cityLabel).toBe('福岡市');
		expect(result.labels.features).toHaveLength(1);
		expect(result.labels.features[0].properties.facilityCount).toBe(0);
		expect(result.labels.features[0].geometry.coordinates).toEqual([130.5, 30.5]);
	});
});
