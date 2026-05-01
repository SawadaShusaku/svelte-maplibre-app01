import { browser } from '$app/environment';
import { initDatabase, getRepository } from './db';
import type { Repository } from './db';
import { WARD_REGISTRY } from './registry';

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

// Initialize database on first load (client-side only)
let dbInitialized = false;

async function ensureDb(): Promise<Repository> {
	if (!browser) {
		throw new Error('Database can only be accessed in the browser');
	}
	if (!dbInitialized) {
		await initDatabase();
		dbInitialized = true;
	}
	return getRepository();
}

/**
 * Load facilities for selected wards and categories
 */
export async function getFacilities(
	selectedCities: string[],
	selectedCategories: string[]
): Promise<GeoFeature[]> {
	// Convert city keys to ward IDs (e.g., "tokyo/toshima" -> "toshima")
	const wardIds = selectedCities.map(key => key.split('/')[1]).filter(Boolean);
	
	const repo = await ensureDb();
	const facilities = repo.getFacilities(wardIds, selectedCategories);
	
	// Convert to GeoJSON format
	return facilities.map(f => ({
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
	}));
}

/**
 * Get available categories for selected wards
 */
export async function getAvailableCategories(wardIds: string[]): Promise<string[]> {
	const repo = await ensureDb();
	const categories = repo.getAvailableCategories(wardIds);
	return categories.map(c => c.id);
}

/**
 * Search facilities by query
 */
export async function searchFacilities(
	query: string,
	wardIds: string[]
): Promise<GeoFeature[]> {
	const repo = await ensureDb();
	const facilities = repo.searchFacilities(query, wardIds);
	
	return facilities.map(f => ({
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
	}));
}

// Helper to get ward label
function getWardLabel(wardId: string): string {
	const ward = WARD_REGISTRY.find(w => w.city === wardId);
	return ward?.cityLabel || wardId;
}
