import { describe, expect, it } from 'vitest';
import type { GeoFeature } from '$lib/data';
import { buildMarkerFeatureCollection, buildWardSummaryFeatureCollection } from '../facility-rendering';

function feature(
	id: string,
	prefecture: string,
	city: string,
	cityLabel: string,
	coordinates: [number, number],
	categories = ['button-battery']
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
			categories,
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

describe('buildWardSummaryFeatureCollection', () => {
	it('groups facilities by municipality or ward at mid zoom', () => {
		const summary = buildWardSummaryFeatureCollection([
			feature('tokyo-1', '東京都', 'toshima', '豊島区', [139.7, 35.7]),
			feature('tokyo-2', '東京都', 'toshima', '豊島区', [139.71, 35.71]),
			feature('osaka-1', '大阪府', 'osaka-city', '大阪市', [135.5, 34.7])
		], 'municipality');

		expect(summary.features).toHaveLength(2);
		expect(summary.features.map((item) => item.properties.cityLabel).sort()).toEqual(['大阪市', '豊島区']);
		expect(summary.features.find((item) => item.properties.city === 'toshima')?.properties.facilityCount).toBe(2);
		expect(summary.features.every((item) => item.properties.clusterRadiusScale === 1)).toBe(true);
	});

	it('groups facilities by prefecture at low zoom', () => {
		const summary = buildWardSummaryFeatureCollection([
			feature('tokyo-1', '東京都', 'toshima', '豊島区', [139.7, 35.7]),
			feature('tokyo-2', '東京都', 'chiyoda', '千代田区', [139.76, 35.69]),
			feature('osaka-1', '大阪府', 'osaka-city', '大阪市', [135.5, 34.7])
		], 'prefecture');

		expect(summary.features).toHaveLength(2);
		expect(summary.features.map((item) => item.properties.cityLabel).sort()).toEqual(['大阪府', '東京都']);
		expect(summary.features.find((item) => item.properties.city === '東京都')?.properties.facilityCount).toBe(2);
	});

	it('places summary circles at the average facility coordinate', () => {
		const summary = buildWardSummaryFeatureCollection([
			feature('west', '東京都', 'toshima', '豊島区', [0, 0]),
			feature('center', '東京都', 'toshima', '豊島区', [0, 0]),
			feature('east', '東京都', 'toshima', '豊島区', [6, 3])
		], 'municipality');

		expect(summary.features[0].geometry.coordinates).toEqual([2, 1]);
	});

	it('scales prefecture cluster circles by geographic area compared with municipality clusters', () => {
		const summary = buildWardSummaryFeatureCollection([
			feature('tokyo-west', '東京都', 'toshima', '豊島区', [139.65, 35.68]),
			feature('tokyo-east', '東京都', 'chiyoda', '千代田区', [139.82, 35.74]),
			feature('osaka-1', '大阪府', 'osaka-city', '大阪市', [135.5, 34.7]),
			feature('osaka-2', '大阪府', 'osaka-city', '大阪市', [135.51, 34.71])
		], 'prefecture');

		const tokyo = summary.features.find((item) => item.properties.city === '東京都');
		const osaka = summary.features.find((item) => item.properties.city === '大阪府');

		expect(tokyo?.properties.clusterRadiusScale).toBeGreaterThan(1);
		expect(tokyo?.properties.clusterRadiusScale).toBeGreaterThan(osaka?.properties.clusterRadiusScale ?? 0);
		expect(tokyo?.properties.clusterRadiusScale).toBeLessThanOrEqual(1.8);
	});

	it('skips facilities with invalid coordinates before building summary features', () => {
		const summary = buildWardSummaryFeatureCollection([
			feature('valid', '東京都', 'toshima', '豊島区', [139.7, 35.7]),
			feature('invalid', '東京都', 'chiyoda', '千代田区', [null as unknown as number, 35.69])
		], 'municipality');

		expect(summary.features).toHaveLength(1);
		expect(summary.features[0].properties.city).toBe('toshima');
	});
});

describe('buildMarkerFeatureCollection', () => {
	it('renders one marker feature for one public place even when it has multiple categories', () => {
		const markers = buildMarkerFeatureCollection([
			feature('kanda-park-office', '東京都', 'chiyoda', '千代田区', [139.768, 35.694], [
				'cooking-oil',
				'ink-cartridge'
			])
		], 'adaptive');

		expect(markers.features).toHaveLength(1);
		expect(markers.features[0].properties.facilityId).toBe('kanda-park-office');
	});

	it('keeps one marker for a place with three or more categories', () => {
		const markers = buildMarkerFeatureCollection([
			feature('multi-counter', '東京都', 'chiyoda', '千代田区', [139.769, 35.695], [
				'button-battery',
				'cooking-oil',
				'ink-cartridge'
			])
		], 'adaptive');

		expect(markers.features).toHaveLength(1);
		expect(markers.features[0].properties.iconKey).toContain('button-battery__cooking-oil__ink-cartridge');
	});

	it('skips marker features with invalid coordinates', () => {
		const markers = buildMarkerFeatureCollection([
			feature('valid', '東京都', 'chiyoda', '千代田区', [139.769, 35.695]),
			feature('invalid', '東京都', 'chiyoda', '千代田区', [139.769, null as unknown as number])
		], 'adaptive');

		expect(markers.features).toHaveLength(1);
		expect(markers.features[0].properties.facilityId).toBe('valid');
	});
});
