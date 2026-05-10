import { describe, it, expect, beforeEach } from 'vitest';
import { MockRepository } from '../mock-repository';
import type { Category, FacilityWithCategories, Ward } from '../types';

describe('MockRepository', () => {
	let repo: MockRepository;

	beforeEach(() => {
		repo = new MockRepository();
	});

	describe('getWards', () => {
		it('should return empty array by default', () => {
			const wards = repo.getWards();
			expect(wards).toEqual([]);
		});

		it('should return set wards', () => {
			const testWards: Ward[] = [
				{ id: 'toshima', prefecture: 'tokyo', city_label: '豊島区', url: null },
				{ id: 'chiyoda', prefecture: 'tokyo', city_label: '千代田区', url: null }
			];
			repo.setWards(testWards);
			
			const wards = repo.getWards();
			expect(wards).toHaveLength(2);
			expect(wards[0].id).toBe('toshima');
		});
	});

	describe('getAvailableCategories', () => {
		it('should return categories for given wards', () => {
			const categories: Category[] = [
				{ id: 'dry-battery', label: '乾電池', color: '#7dd3fc', icon: 'Battery' },
				{ id: 'rechargeable-battery', label: '充電式電池', color: '#dc2626', icon: 'Battery' }
			];
			repo.setCategories(categories);
			repo.setWardCategories('toshima', ['dry-battery']);
			repo.setWardCategories('chiyoda', ['dry-battery', 'rechargeable-battery']);

			const toshimaCats = repo.getAvailableCategories(['toshima']);
			expect(toshimaCats).toHaveLength(1);
			expect(toshimaCats[0].id).toBe('dry-battery');

			const combinedCats = repo.getAvailableCategories(['toshima', 'chiyoda']);
			expect(combinedCats).toHaveLength(2);
		});

		it('should return empty array for empty ward list', () => {
			const cats = repo.getAvailableCategories([]);
			expect(cats).toEqual([]);
		});
	});

	describe('getFacilities', () => {
		it('should filter facilities by ward and category', () => {
			const facilities: FacilityWithCategories[] = [
				{
					id: 'fac-1',
					ward_id: 'toshima',
					prefecture: '東京都',
					city_label: '豊島区',
					name: '池袋図書館',
					address: '豊島区池袋',
					latitude: 35.73,
					longitude: 139.71,
					url: null,
					official_url: null,
					category_urls: null,
					collector_id: null,
					hours: null,
					notes: null,
					categories: ['dry-battery']
				},
				{
					id: 'fac-2',
					ward_id: 'chiyoda',
					prefecture: '東京都',
					city_label: '千代田区',
					name: '千代田区役所',
					address: '千代田区',
					latitude: 35.69,
					longitude: 139.76,
					url: null,
					official_url: null,
					category_urls: null,
					collector_id: null,
					hours: null,
					notes: null,
					categories: ['rechargeable-battery']
				}
			];
			repo.setFacilities(facilities);

			// Filter by ward
			const toshimaFacs = repo.getFacilities(['toshima'], ['dry-battery', 'rechargeable-battery']);
			expect(toshimaFacs).toHaveLength(1);
			expect(toshimaFacs[0].id).toBe('fac-1');

			// Filter by category
			const batteryFacs = repo.getFacilities(['toshima', 'chiyoda'], ['rechargeable-battery']);
			expect(batteryFacs).toHaveLength(1);
			expect(batteryFacs[0].id).toBe('fac-2');
		});

		it('should return empty array when no match', () => {
			repo.setFacilities([]);
			const facs = repo.getFacilities(['toshima'], ['dry-battery']);
			expect(facs).toEqual([]);
		});
	});

	describe('getFacilityById', () => {
		it('should return facility by id', () => {
			const facility: FacilityWithCategories = {
				id: 'fac-1',
				ward_id: 'toshima',
				prefecture: '東京都',
					city_label: '豊島区',
				name: '池袋図書館',
				address: '豊島区池袋',
				latitude: 35.73,
				longitude: 139.71,
				url: null,
				official_url: null,
				category_urls: null,
				collector_id: null,
				hours: null,
				notes: null,
				categories: ['dry-battery']
			};
			repo.setFacilities([facility]);

			const found = repo.getFacilityById('fac-1');
			expect(found).not.toBeNull();
			expect(found?.name).toBe('池袋図書館');
		});

		it('should return null for non-existent id', () => {
			const found = repo.getFacilityById('non-existent');
			expect(found).toBeNull();
		});
	});

	describe('searchFacilities', () => {
		it('should search by name', () => {
			const facilities: FacilityWithCategories[] = [
				{
					id: 'fac-1',
					ward_id: 'toshima',
					prefecture: '東京都',
					city_label: '豊島区',
					name: '池袋図書館',
					address: '豊島区池袋',
					latitude: 35.73,
					longitude: 139.71,
					url: null,
					official_url: null,
					category_urls: null,
					collector_id: null,
					hours: null,
					notes: null,
					categories: ['dry-battery']
				},
				{
					id: 'fac-2',
					ward_id: 'toshima',
					prefecture: '東京都',
					city_label: '豊島区',
					name: '豊島区役所',
					address: '豊島区',
					latitude: 35.73,
					longitude: 139.71,
					url: null,
					official_url: null,
					category_urls: null,
					collector_id: null,
					hours: null,
					notes: null,
					categories: ['dry-battery']
				}
			];
			repo.setFacilities(facilities);

			const results = repo.searchFacilities('図書館', ['toshima']);
			expect(results).toHaveLength(1);
			expect(results[0].name).toBe('池袋図書館');
		});

		it('should return empty array for no matches', () => {
			repo.setFacilities([]);
			const results = repo.searchFacilities('図書館', ['toshima']);
			expect(results).toEqual([]);
		});
	});
});
