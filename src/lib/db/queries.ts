import { getDatabase } from './init';
import type { Facility, FacilityWithCategories, Category, Ward, WardWithCategories, Collector } from './types';

/**
 * Helper to execute query and get all results as array of objects
 * sql.js doesn't have .all() method, so we use step() + getAsObject()
 */
function execQuery(db: any, sql: string, params?: any[]): any[] {
	const stmt = db.prepare(sql);
	try {
		const results: any[] = [];
		if (params) {
			stmt.bind(params);
		}
		while (stmt.step()) {
			results.push(stmt.getAsObject());
		}
		return results;
	} finally {
		stmt.free();
	}
}

/**
 * Get all facilities matching the given ward IDs and category IDs
 */
export function getFacilities(wardIds: string[], categoryIds: string[]): FacilityWithCategories[] {
	const db = getDatabase();
	
	if (wardIds.length === 0 || categoryIds.length === 0) {
		return [];
	}
	
	const wardPlaceholders = wardIds.map(() => '?').join(',');
	const categoryPlaceholders = categoryIds.map(() => '?').join(',');
	
	// First, get facilities that match the criteria
	const facilityQuery = `
		SELECT DISTINCT f.*
		FROM facilities f
		JOIN facility_categories fc ON f.id = fc.facility_id
		WHERE f.ward_id IN (${wardPlaceholders})
		AND fc.category_id IN (${categoryPlaceholders})
	`;
	
	const facilities = execQuery(db, facilityQuery, [...wardIds, ...categoryIds]) as Array<{
		id: string;
		ward_id: string;
		name: string;
		address: string;
		latitude: number;
		longitude: number;
		url: string | null;
		official_url: string | null;
		category_urls: string | null;
		collector_id: string | null;
		hours: string | null;
		notes: string | null;
	}>;
	
	// Then get categories for each facility
	const result: FacilityWithCategories[] = [];
	for (const f of facilities) {
		const catQuery = `SELECT category_id FROM facility_categories WHERE facility_id = ?`;
		const categories = execQuery(db, catQuery, [f.id]) as Array<{ category_id: string }>;
		
		result.push({
			id: f.id,
			ward_id: f.ward_id,
			name: f.name,
			address: f.address,
			latitude: f.latitude,
			longitude: f.longitude,
			url: f.url,
			official_url: f.official_url,
			category_urls: f.category_urls,
			collector_id: f.collector_id,
			hours: f.hours,
			notes: f.notes,
			categories: categories.map(c => c.category_id)
		});
	}
	
	return result;
}

/**
 * Get available categories for selected wards
 */
export function getAvailableCategories(wardIds: string[]): Category[] {
	const db = getDatabase();
	
	if (wardIds.length === 0) {
		return [];
	}
	
	const placeholders = wardIds.map(() => '?').join(',');
	
	const query = `
		SELECT DISTINCT c.*
		FROM categories c
		JOIN ward_categories wc ON c.id = wc.category_id
		WHERE wc.ward_id IN (${placeholders})
		ORDER BY c.label
	`;
	
	return execQuery(db, query, wardIds) as Category[];
}

/**
 * Get all wards
 */
export function getWards(): Ward[] {
	const db = getDatabase();
	return execQuery(db, 'SELECT * FROM wards ORDER BY city_label') as Ward[];
}

/**
 * Get all categories
 */
export function getCategories(): Category[] {
	const db = getDatabase();
	return execQuery(db, 'SELECT * FROM categories ORDER BY label') as Category[];
}

/**
 * Get all collectors
 */
export function getCollectors(): Collector[] {
	const db = getDatabase();
	return execQuery(db, 'SELECT * FROM collectors ORDER BY name') as Collector[];
}

/**
 * Get a single facility by ID
 */
export function getFacilityById(id: string): FacilityWithCategories | null {
	const db = getDatabase();
	
	const facilities = execQuery(db, 'SELECT * FROM facilities WHERE id = ?', [id]) as Facility[];
	if (facilities.length === 0) return null;
	
	const f = facilities[0];
	const categories = execQuery(db, 'SELECT category_id FROM facility_categories WHERE facility_id = ?', [id]) as Array<{ category_id: string }>;
	
	return {
		...f,
		categories: categories.map(c => c.category_id)
	};
}

/**
 * Search facilities by name or address
 */
export function searchFacilities(query: string, wardIds: string[]): FacilityWithCategories[] {
	const db = getDatabase();
	
	if (!query.trim() || wardIds.length === 0) {
		return [];
	}
	
	const wardPlaceholders = wardIds.map(() => '?').join(',');
	const searchTerm = `%${query.trim()}%`;
	
	const facilityQuery = `
		SELECT DISTINCT f.*
		FROM facilities f
		JOIN facility_categories fc ON f.id = fc.facility_id
		WHERE f.ward_id IN (${wardPlaceholders})
		AND (f.name LIKE ? OR f.address LIKE ?)
		LIMIT 50
	`;
	
	const facilities = execQuery(db, facilityQuery, [...wardIds, searchTerm, searchTerm]) as Array<{
		id: string;
		ward_id: string;
		name: string;
		address: string;
		latitude: number;
		longitude: number;
		url: string | null;
		official_url: string | null;
		category_urls: string | null;
		collector_id: string | null;
		hours: string | null;
		notes: string | null;
	}>;
	
	const result: FacilityWithCategories[] = [];
	for (const f of facilities) {
		const categories = execQuery(db, 'SELECT category_id FROM facility_categories WHERE facility_id = ?', [f.id]) as Array<{ category_id: string }>;
		
		result.push({
			id: f.id,
			ward_id: f.ward_id,
			name: f.name,
			address: f.address,
			latitude: f.latitude,
			longitude: f.longitude,
			url: f.url,
			official_url: f.official_url,
			category_urls: f.category_urls,
			collector_id: f.collector_id,
			hours: f.hours,
			notes: f.notes,
			categories: categories.map(c => c.category_id)
		});
	}
	
	return result;
}

/**
 * Get category details (warnings, examples, etc.)
 */
export function getCategoryDetails(categoryId: string): Record<string, string> {
	const db = getDatabase();
	
	const rows = execQuery(db, 'SELECT field, content FROM category_details WHERE category_id = ?', [categoryId]) as Array<{ field: string; content: string }>;
	
	const details: Record<string, string> = {};
	for (const row of rows) {
		details[row.field] = row.content;
	}
	return details;
}
