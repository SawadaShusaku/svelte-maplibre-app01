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
});
