import type { Category, Collector, Facility, FacilityWithCategories, Ward } from '$lib/db/types';

type FacilityRow = Facility & {
	categories: string | null;
};

type CategoryDetailRow = {
	field: string;
	content: string;
};

const CATEGORY_ORDER = [
	'rechargeable-battery',
	'e-bike-rechargeable-battery',
	'dry-battery',
	'button-battery',
	'small-appliance',
	'fluorescent',
	'ink-cartridge',
	'cooking-oil',
	'used-clothing',
	'paper-pack',
	'styrofoam',
	'heated-tobacco-device'
];

function placeholders(values: string[]): string {
	return values.map(() => '?').join(',');
}

const LIKE_ESCAPE_CHAR = '\\';

export function escapeLikePattern(value: string): string {
	return value.replace(/[\\%_]/g, (match) => `${LIKE_ESCAPE_CHAR}${match}`);
}

function parseCategories(value: string | null): string[] {
	if (!value) return [];
	return value.split(',').filter(Boolean);
}

function toFacility(row: FacilityRow): FacilityWithCategories {
	return {
		id: row.id,
		ward_id: row.ward_id,
		name: row.name,
		address: row.address,
		latitude: row.latitude,
		longitude: row.longitude,
		url: row.url,
		official_url: row.official_url,
		category_urls: row.category_urls,
		collector_id: row.collector_id,
		hours: row.hours,
		notes: row.notes,
		categories: parseCategories(row.categories)
	};
}

function sortCategories(categories: Category[]): Category[] {
	const order = new Map(CATEGORY_ORDER.map((id, index) => [id, index]));
	return [...categories].sort((a, b) => {
		const aOrder = order.get(a.id) ?? 999;
		const bOrder = order.get(b.id) ?? 999;
		return aOrder - bOrder || a.label.localeCompare(b.label, 'ja');
	});
}

export class D1Repository {
	constructor(private readonly db: D1Database) {}

	async getWards(): Promise<Ward[]> {
		const result = await this.db.prepare('SELECT * FROM wards ORDER BY city_label').all<Ward>();
		return result.results ?? [];
	}

	async getCategories(): Promise<Category[]> {
		const result = await this.db
			.prepare('SELECT id, label, color, icon FROM categories ORDER BY sort_order, id')
			.all<Category>();
		return sortCategories(result.results ?? []);
	}

	async getAvailableCategories(wardIds: string[]): Promise<Category[]> {
		if (wardIds.length === 0) return [];

		const result = await this.db
			.prepare(`
				SELECT DISTINCT c.id, c.label, c.color, c.icon
				FROM categories c
				JOIN ward_categories wc ON c.id = wc.category_id
				WHERE wc.ward_id IN (${placeholders(wardIds)})
			`)
			.bind(...wardIds)
			.all<Category>();

		return sortCategories(result.results ?? []);
	}

	async getCategoryDetails(categoryId: string): Promise<Record<string, string>> {
		const result = await this.db
			.prepare('SELECT field, content FROM category_details WHERE category_id = ?')
			.bind(categoryId)
			.all<CategoryDetailRow>();

		const details: Record<string, string> = {};
		for (const row of result.results ?? []) {
			details[row.field] = row.content;
		}
		return details;
	}

	async getCollectors(): Promise<Collector[]> {
		const result = await this.db.prepare('SELECT * FROM collectors ORDER BY name').all<Collector>();
		return result.results ?? [];
	}

	async getFacilities(wardIds: string[], categoryIds: string[]): Promise<FacilityWithCategories[]> {
		if (wardIds.length === 0) return [];

		const params: string[] = [...wardIds];
		let categoryFilter = '';

		if (categoryIds.length > 0) {
			categoryFilter = `
				AND EXISTS (
					SELECT 1
					FROM facility_categories selected_fc
					WHERE selected_fc.facility_id = f.id
					AND selected_fc.category_id IN (${placeholders(categoryIds)})
				)
			`;
			params.push(...categoryIds);
		}

		const result = await this.db
			.prepare(`
				SELECT
					f.*,
					GROUP_CONCAT(fc.category_id) AS categories
				FROM facilities f
				LEFT JOIN facility_categories fc ON f.id = fc.facility_id
				WHERE f.ward_id IN (${placeholders(wardIds)})
				${categoryFilter}
				GROUP BY f.id
				ORDER BY f.ward_id, f.name
			`)
			.bind(...params)
			.all<FacilityRow>();

		return (result.results ?? []).map(toFacility);
	}

	async getFacilityById(id: string): Promise<FacilityWithCategories | null> {
		const row = await this.db
			.prepare(`
				SELECT
					f.*,
					GROUP_CONCAT(fc.category_id) AS categories
				FROM facilities f
				LEFT JOIN facility_categories fc ON f.id = fc.facility_id
				WHERE f.id = ?
				GROUP BY f.id
			`)
			.bind(id)
			.first<FacilityRow>();

		return row ? toFacility(row) : null;
	}

	async searchFacilities(query: string, wardIds: string[]): Promise<FacilityWithCategories[]> {
		const keywords = query.trim().split(/\s+/).filter(Boolean);
		if (keywords.length === 0 || wardIds.length === 0) return [];

		const params: string[] = [...wardIds];
		const clauses = keywords.map((keyword) => {
			const term = `%${escapeLikePattern(keyword)}%`;
			params.push(term, term, term);
			return `
				(
					f.name LIKE ? ESCAPE '\\'
					OR f.address LIKE ? ESCAPE '\\'
					OR EXISTS (
						SELECT 1
						FROM facility_categories search_fc
						JOIN categories search_c ON search_c.id = search_fc.category_id
						WHERE search_fc.facility_id = f.id
						AND search_c.label LIKE ? ESCAPE '\\'
					)
				)
			`;
		});

		const result = await this.db
			.prepare(`
				SELECT
					f.*,
					GROUP_CONCAT(fc.category_id) AS categories
				FROM facilities f
				LEFT JOIN facility_categories fc ON f.id = fc.facility_id
				WHERE f.ward_id IN (${placeholders(wardIds)})
				AND ${clauses.join(' AND ')}
				GROUP BY f.id
				ORDER BY f.ward_id, f.name
				LIMIT 50
			`)
			.bind(...params)
			.all<FacilityRow>();

		return (result.results ?? []).map(toFacility);
	}
}

export function getD1Repository(platform: App.Platform | undefined): D1Repository {
	const db = platform?.env?.RECYCLING_DB;
	if (!db) {
		throw new Error('D1 binding RECYCLING_DB is not available. Use wrangler dev or configure D1 for this environment.');
	}
	return new D1Repository(db);
}
