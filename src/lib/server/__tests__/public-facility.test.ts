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
			image_url: null,
			image_alt: null,
			image_credit: null,
			image_source_url: null,
			mapillary_image_id: null,
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
			image_url: null,
			image_alt: null,
			image_credit: null,
			image_source_url: null,
			mapillary_image_id: null,
			categories: ['button-battery'],
			collection_entries: []
		});
		expect('collector_id' in publicFacility).toBe(false);
	});

	it('strips internal geocoding notes from public text fields', () => {
		const facility: FacilityWithCategories = {
			id: 'facility-2',
			ward_id: 'ward-1',
			prefecture: '東京都',
			city_label: '千代田区',
			name: '回収店',
			address: '東京都千代田区',
			latitude: 35.69,
			longitude: 139.76,
			url: null,
			official_url: null,
			category_urls: null,
			collector_id: null,
			hours: null,
			notes: '公式ページに緯度経度なし。必要に応じて後段でジオコーディングする。',
			image_url: 'https://images.example/facility.jpg?access_token=secret',
			image_alt: '要確認: 内部メモ',
			image_credit: 'Mapillary',
			image_source_url: 'https://example.com/image',
			mapillary_image_id: 'mly-1',
			categories: ['ink-cartridge']
		};

		const publicFacility = toPublicFacility(facility);

		expect(publicFacility.notes).toBeNull();
		expect(publicFacility.image_url).toBeNull();
		expect(publicFacility.image_alt).toBeNull();
		expect(publicFacility.image_credit).toBe('Mapillary');
		expect(publicFacility.image_source_url).toBe('https://example.com/image');
		expect(publicFacility.mapillary_image_id).toBe('mly-1');
	});

	it('publishes active collection entry details without private or token-bearing fields', () => {
		const facility: FacilityWithCategories = {
			id: 'facility-3',
			ward_id: 'chiyoda',
			prefecture: '東京都',
			city_label: '千代田区',
			name: '神田公園出張所',
			address: '東京都千代田区神田司町2-2',
			latitude: 35.694,
			longitude: 139.768,
			url: null,
			official_url: null,
			category_urls: null,
			collector_id: null,
			hours: null,
			notes: null,
			image_url: null,
			image_alt: null,
			image_credit: null,
			image_source_url: null,
			mapillary_image_id: null,
			categories: ['cooking-oil', 'ink-cartridge'],
			collection_entries: [
				{
					id: 'entry-1',
					place_id: 'facility-3',
					category_id: 'cooking-oil',
					data_source_id: 'source-tokyo-oil',
					source_display_name: '神田公園出張所ストックヤード',
					source_address: '東京都千代田区神田司町2-2',
					normalized_source_address: '東京都千代田区神田司町2-2',
					source_url: 'https://example.com/oil',
					hours: '平日',
					notes: '入口横',
					location_hint: '1階',
					image_url: 'https://images.example/oil.jpg?token=secret',
					image_alt: '公式ページに緯度経度なし。必要に応じて後段でジオコーディングする。',
					image_credit: 'Tokyo',
					image_source_url: 'https://example.com/image',
					mapillary_image_id: 'mly-entry',
					source_fetched_at: '2026-05-12T00:00:00Z',
					source_published_at: null,
					is_active: 1,
					created_at: '2026-05-12T00:00:00Z',
					updated_at: '2026-05-12T00:00:00Z',
					data_source_name: '使用済み食用油の都内回収所',
					data_source_url: 'https://example.com/source'
				}
			]
		};

		const publicFacility = toPublicFacility(facility);

		expect(publicFacility.collection_entries).toEqual([
			{
				id: 'entry-1',
				place_id: 'facility-3',
				category_id: 'cooking-oil',
				data_source_id: 'source-tokyo-oil',
				source_display_name: '神田公園出張所ストックヤード',
				source_address: '東京都千代田区神田司町2-2',
				source_url: 'https://example.com/oil',
				hours: '平日',
				notes: '入口横',
				location_hint: '1階',
				image_url: null,
				image_alt: null,
				image_credit: 'Tokyo',
				image_source_url: 'https://example.com/image',
				mapillary_image_id: 'mly-entry',
				data_source_name: '使用済み食用油の都内回収所',
				data_source_url: 'https://example.com/source'
			}
		]);
		expect('normalized_source_address' in publicFacility.collection_entries[0]).toBe(false);
		expect(JSON.stringify(publicFacility)).not.toContain('confidence');
	});
});
