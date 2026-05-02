import { getDatabase } from './init';
import type { Repository } from './repository';
import type { Category, Collector, Facility, FacilityWithCategories, Ward } from './types';
import categoriesData from './categories.json';

/**
 * sql.js implementation of Repository
 * Used in browser environment
 */
export class SqlJsRepository implements Repository {
	private execQuery(sql: string, params?: any[]): any[] {
		const db = getDatabase();
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

	getWards(): Ward[] {
		return this.execQuery('SELECT * FROM wards ORDER BY city_label');
	}

	getCategories(): Category[] {
		const categories = this.execQuery('SELECT * FROM categories') as Category[];
		// Sort by categories.json order
		const orderMap = new Map(categoriesData.categories.map((c, i) => [c.id, i]));
		return categories.sort((a, b) => {
			const orderA = orderMap.get(a.id) ?? 999;
			const orderB = orderMap.get(b.id) ?? 999;
			return orderA - orderB;
		});
	}

	getAvailableCategories(wardIds: string[]): Category[] {
		if (wardIds.length === 0) return [];
		
		const placeholders = wardIds.map(() => '?').join(',');
		const query = `
			SELECT DISTINCT c.*
			FROM categories c
			JOIN ward_categories wc ON c.id = wc.category_id
			WHERE wc.ward_id IN (${placeholders})
		`;
		const categories = this.execQuery(query, wardIds) as Category[];
		
		// Sort by categories.json order
		const orderMap = new Map(categoriesData.categories.map((c, i) => [c.id, i]));
		return categories.sort((a, b) => {
			const orderA = orderMap.get(a.id) ?? 999;
			const orderB = orderMap.get(b.id) ?? 999;
			return orderA - orderB;
		});
	}

	getCategoryDetails(categoryId: string): Record<string, string> {
		const rows = this.execQuery(
			'SELECT field, content FROM category_details WHERE category_id = ?',
			[categoryId]
		) as Array<{ field: string; content: string }>;
		
		const details: Record<string, string> = {};
		for (const row of rows) {
			details[row.field] = row.content;
		}
		return details;
	}

	getCollectors(): Collector[] {
		return this.execQuery('SELECT * FROM collectors ORDER BY name');
	}

	getFacilities(wardIds: string[], categoryIds: string[]): FacilityWithCategories[] {
		if (wardIds.length === 0 || categoryIds.length === 0) return [];

		const wardPlaceholders = wardIds.map(() => '?').join(',');
		const categoryPlaceholders = categoryIds.map(() => '?').join(',');
		const facilityQuery = `
			SELECT DISTINCT f.*
			FROM facilities f
			JOIN facility_categories fc ON f.id = fc.facility_id
			WHERE f.ward_id IN (${wardPlaceholders})
			AND fc.category_id IN (${categoryPlaceholders})
		`;
		const queryParams = [...wardIds, ...categoryIds];

		const facilities = this.execQuery(facilityQuery, queryParams) as Facility[];

		// Get categories for each facility
		return facilities.map(f => {
			const categories = this.execQuery(
				'SELECT category_id FROM facility_categories WHERE facility_id = ?',
				[f.id]
			) as Array<{ category_id: string }>;

			return {
				...f,
				categories: categories.map(c => c.category_id)
			};
		});
	}

	getFacilityById(id: string): FacilityWithCategories | null {
		const facilities = this.execQuery('SELECT * FROM facilities WHERE id = ?', [id]) as Facility[];
		if (facilities.length === 0) return null;

		const f = facilities[0];
		const categories = this.execQuery(
			'SELECT category_id FROM facility_categories WHERE facility_id = ?',
			[id]
		) as Array<{ category_id: string }>;

		return {
			...f,
			categories: categories.map(c => c.category_id)
		};
	}

	searchFacilities(query: string, wardIds: string[]): FacilityWithCategories[] {
		if (!query.trim() || wardIds.length === 0) return [];

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

		const facilities = this.execQuery(facilityQuery, [...wardIds, searchTerm, searchTerm]) as Facility[];

		return facilities.map(f => {
			const categories = this.execQuery(
				'SELECT category_id FROM facility_categories WHERE facility_id = ?',
				[f.id]
			) as Array<{ category_id: string }>;

			return {
				...f,
				categories: categories.map(c => c.category_id)
			};
		});
	}
}
