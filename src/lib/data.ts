import { WARD_REGISTRY } from './registry';
import type { Category } from './db/types';

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

function toGeoFeature(f: PublicFacilityRecord): GeoFeature {
	return {
		type: 'Feature' as const,
		geometry: {
			type: 'Point' as const,
			coordinates: [f.longitude, f.latitude] as [number, number]
		},
		properties: {
			id: f.id,
			prefecture: 'tokyo',
			city: f.ward_id,
			cityLabel: getWardLabel(f.ward_id),
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
	selectedCategories: string[]
): Promise<GeoFeature[]> {
	const cacheKey = JSON.stringify({
		cities: [...selectedCities].sort(),
		categories: [...selectedCategories].sort()
	});
	const cached = facilitiesCache.get(cacheKey);
	if (cached) {
		return cached;
	}

	const promise = loadFacilities(selectedCities, selectedCategories).catch(error => {
		facilitiesCache.delete(cacheKey);
		throw error;
	});
	facilitiesCache.set(cacheKey, promise);
	return promise;
}

async function loadFacilities(
	selectedCities: string[],
	selectedCategories: string[]
): Promise<GeoFeature[]> {
	// Convert city keys to ward IDs (e.g., "tokyo/toshima" -> "toshima")
	const wardIds = toWardIds(selectedCities);
	const params = new URLSearchParams({
		wards: encodeList(wardIds),
		categories: encodeList(selectedCategories)
	});

	const data = await fetchJson<{ facilities: PublicFacilityRecord[] }>(`/api/facilities?${params}`);
	return data.facilities.map(toGeoFeature);
}

/**
 * Get available categories for selected wards
 */
export async function getAvailableCategories(wardIds: string[]): Promise<string[]> {
	const params = new URLSearchParams({ wards: encodeList(wardIds) });
	const { categories } = await fetchJson<{ categories: Category[] }>(`/api/categories?${params}`);
	return categories.map(c => c.id);
}

/**
 * Search facilities by query
 */
export async function searchFacilities(
	query: string,
	wardIds: string[]
): Promise<GeoFeature[]> {
	const params = new URLSearchParams({
		wards: encodeList(wardIds),
		q: query
	});
	const data = await fetchJson<{ facilities: PublicFacilityRecord[] }>(`/api/facilities?${params}`);
	return data.facilities.map(toGeoFeature);
}

// Helper to get ward label
function getWardLabel(wardId: string): string {
	const ward = WARD_REGISTRY.find(w => w.city === wardId);
	return ward?.cityLabel || wardId;
}
