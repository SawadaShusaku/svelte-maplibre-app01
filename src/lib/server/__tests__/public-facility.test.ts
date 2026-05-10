import { describe, expect, it } from 'vitest';
import { toPublicFacility } from '../public-facility';
import type { FacilityWithCategories } from '$lib/db/types';

describe('toPublicFacility', () => {
	it('omits internal collector identifiers from API responses', () => {
		const facility: FacilityWithCategories = {
			id: 'facility-1',
			ward_id: 'ward-1',
			prefecture: '東京都',
			city_label: '千代田区',
			name: '回収店',
			address: '東京都千代田区',
			latitude: 35.69,
			longitude: 139.76,
			url: null,
			official_url: 'https://example.com',
			category_urls: null,
			collector_id: 'collector-private',
			hours: null,
			notes: null,
			categories: ['button-battery']
		};

		const publicFacility = toPublicFacility(facility);

		expect(publicFacility).toEqual({
			id: 'facility-1',
			ward_id: 'ward-1',
			prefecture: '東京都',
			city_label: '千代田区',
			name: '回収店',
			address: '東京都千代田区',
			latitude: 35.69,
			longitude: 139.76,
			url: null,
			official_url: 'https://example.com',
			category_urls: null,
			hours: null,
			notes: null,
			categories: ['button-battery']
		});
		expect('collector_id' in publicFacility).toBe(false);
	});
});
