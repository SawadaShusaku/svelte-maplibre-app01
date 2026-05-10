import { WARD_REGISTRY } from './registry';
import type { Category } from './db/types';

export type AreaScope = 'all' | 'selected';

export interface PublicArea {
	id: string;
	prefecture: string;
	city_label: string;
	url: string | null;
}

export interface GeoFeature {
	type: 'Feature';
	geometry: { type: 'Point'; coordinates: [number, number] };
	properties: {
		id: string;
		prefecture: string;
		city: string;
		cityLabel: string;
		name: string;
		address: string;
		categories: string[];
		hours: string | null;
		notes: string | null;
		officialUrl: string | null;
		categoryUrls: Record<string, string> | null;
	};
}

type PublicFacilityRecord = {
	id: string;
	ward_id: string;
	prefecture: string;
	city_label: string;
	name: string;
	address: string;
	latitude: number;
	longitude: number;
	url: string | null;
	official_url: string | null;
	category_urls: string | null;
	hours: string | null;
	notes: string | null;
	categories: string[];
};

const facilitiesCache = new Map<string, Promise<GeoFeature[]>>();
const areasCache = new Map<string, Promise<PublicArea[]>>();

async function fetchJson<T>(url: string): Promise<T> {
	const response = await fetch(url);
	if (!response.ok) {
		const message = await response.text();
		throw new Error(`API request failed: ${response.status} ${message}`);
	}
	return response.json() as Promise<T>;
}

function toWardIds(selectedCities: string[]): string[] {
	return selectedCities.map(key => key.split('/')[1]).filter(Boolean);
}

function encodeList(values: string[]): string {
	return values.join(',');
}

function appendListParam(params: URLSearchParams, name: string, values: string[]): void {
	if (values.length > 0) {
		params.set(name, encodeList(values));
	}
}

function toGeoFeature(f: PublicFacilityRecord): GeoFeature {
	return {
		type: 'Feature' as const,
		geometry: {
			type: 'Point' as const,
			coordinates: [f.longitude, f.latitude] as [number, number]
		},
		properties: {
			id: f.id,
			prefecture: f.prefecture,
			city: f.ward_id,
			cityLabel: f.city_label || getWardLabel(f.ward_id),
			name: f.name,
			address: f.address,
			categories: f.categories,
			hours: f.hours,
			notes: f.notes,
			officialUrl: f.official_url,
			categoryUrls: f.category_urls ? JSON.parse(f.category_urls) : null
		}
	};
}

/**
 * Load facilities for selected wards and categories
 */
export async function getFacilities(
	selectedCities: string[],
	selectedCategories: string[],
	areaScope: AreaScope = 'selected'
): Promise<GeoFeature[]> {
	const cacheKey = JSON.stringify({
		areaScope,
		cities: [...selectedCities].sort(),
		categories: [...selectedCategories].sort()
	});
	const cached = facilitiesCache.get(cacheKey);
	if (cached) {
		return cached;
	}

	const promise = loadFacilities(selectedCities, selectedCategories, areaScope).catch(error => {
		facilitiesCache.delete(cacheKey);
		throw error;
	});
	facilitiesCache.set(cacheKey, promise);
	return promise;
}

async function loadFacilities(
	selectedCities: string[],
	selectedCategories: string[],
	areaScope: AreaScope
): Promise<GeoFeature[]> {
	// Convert city keys to ward IDs (e.g., "tokyo/toshima" -> "toshima")
	const wardIds = toWardIds(selectedCities);
	if (areaScope === 'selected' && wardIds.length === 0) return [];

	const params = new URLSearchParams();
	if (areaScope === 'selected') appendListParam(params, 'wards', wardIds);
	appendListParam(params, 'categories', selectedCategories);

	const data = await fetchJson<{ facilities: PublicFacilityRecord[] }>(`/api/facilities?${params}`);
	return data.facilities.map(toGeoFeature);
}

export async function getAreas(): Promise<PublicArea[]> {
	const cached = areasCache.get('areas');
	if (cached) return cached;

	const promise = fetchJson<{ wards: PublicArea[] }>('/api/wards')
		.then(({ wards }) => wards)
		.catch(error => {
			areasCache.delete('areas');
			throw error;
		});
	areasCache.set('areas', promise);
	return promise;
}

/**
 * Get available categories for selected wards
 */
export async function getAvailableCategories(
	wardIds: string[],
	areaScope: AreaScope = 'selected'
): Promise<string[]> {
	if (areaScope === 'selected' && wardIds.length === 0) return [];

	const params = new URLSearchParams();
	if (areaScope === 'selected') appendListParam(params, 'wards', wardIds);
	const { categories } = await fetchJson<{ categories: Category[] }>(`/api/categories?${params}`);
	return categories.map(c => c.id);
}

/**
 * Search facilities by query
 */
export async function searchFacilities(
	query: string,
	wardIds: string[],
	areaScope: AreaScope = 'selected'
): Promise<GeoFeature[]> {
	if (areaScope === 'selected' && wardIds.length === 0) return [];

	const params = new URLSearchParams({ q: query });
	if (areaScope === 'selected') appendListParam(params, 'wards', wardIds);
	const data = await fetchJson<{ facilities: PublicFacilityRecord[] }>(`/api/facilities?${params}`);
	return data.facilities.map(toGeoFeature);
}

// Helper to get ward label
function getWardLabel(wardId: string): string {
	const ward = WARD_REGISTRY.find(w => w.city === wardId);
	return ward?.cityLabel || wardId;
}
