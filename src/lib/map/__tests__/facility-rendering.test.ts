import { describe, expect, it } from 'vitest';
import type { GeoFeature } from '$lib/data';
import { buildWardSummaryFeatureCollection } from '../facility-rendering';

function feature(
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
