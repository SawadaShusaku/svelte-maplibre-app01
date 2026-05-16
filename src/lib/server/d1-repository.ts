import type { Category, Collector, Facility, FacilityWithCategories, PublicCollectionEntry, Ward } from '$lib/db/types';

type FacilityRow = Facility & {
	categories: string | null;
	prefecture: string;
	city_label: string;
};

type CategoryDetailRow = {
	field: string;
	content: string;
};

type PlaceRow = {
	id: string;
	area_id: string;
	canonical_name: string;
	display_address: string;
	latitude: number;
	longitude: number;
	url: string | null;
	image_url: string | null;
	image_alt: string | null;
	image_credit: string | null;
	image_source_url: string | null;
	mapillary_image_id: string | null;
	categories: string | null;
	prefecture: string;
	city_label: string;
	hours: string | null;
	notes: string | null;
	source_url: string | null;
};

type PlaceCategoryRow = {
	place_id: string;
	category_id: string;
	hours: string | null;
	notes: string | null;
	source_url: string | null;
};

type CollectionEntryRow = PublicCollectionEntry & {
	data_source_name: string | null;
	data_source_url: string | null;
};

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
		prefecture: row.prefecture,
		city_label: row.city_label,
		categories: parseCategories(row.categories)
	};
}

function toFacilityFromPlace(row: PlaceRow): FacilityWithCategories {
	return {
		id: row.id,
		ward_id: row.area_id,
		name: row.canonical_name,
		address: row.display_address,
		latitude: row.latitude,
		longitude: row.longitude,
		url: row.url,
		official_url: row.source_url,
		category_urls: null,
		collector_id: null,
		hours: row.hours,
		notes: row.notes,
		image_url: row.image_url,
		image_alt: row.image_alt,
		image_credit: row.image_credit,
		image_source_url: row.image_source_url,
		mapillary_image_id: row.mapillary_image_id,
		prefecture: row.prefecture,
		city_label: row.city_label,
		categories: parseCategories(row.categories)
	};
}

function attachCategories(rows: PlaceRow[], categoryRows: PlaceCategoryRow[]): FacilityWithCategories[] {
	const byPlace = new Map<string, { categories: Set<string>; hours: string | null; notes: string | null; sourceUrl: string | null }>();
	for (const row of categoryRows) {
		const existing = byPlace.get(row.place_id) ?? { categories: new Set<string>(), hours: null, notes: null, sourceUrl: null };
		existing.categories.add(row.category_id);
		existing.hours ??= row.hours;
		existing.notes ??= row.notes;
		existing.sourceUrl ??= row.source_url;
		byPlace.set(row.place_id, existing);
	}
	return rows.map((row) => {
		const facility = toFacilityFromPlace(row);
		const entry = byPlace.get(row.id);
		facility.categories = entry ? [...entry.categories].sort() : [];
		facility.hours = entry?.hours ?? facility.hours;
		facility.notes = entry?.notes ?? facility.notes;
		facility.official_url = entry?.sourceUrl ?? facility.official_url;
		return facility;
	});
}

export class D1Repository {
	constructor(private readonly db: D1Database) {}

	async getWards(): Promise<Ward[]> {
		const result = await this.db
			.prepare('SELECT id, prefecture, city_label, url FROM areas WHERE is_active = 1 ORDER BY prefecture, city_label')
			.all<Ward>();
		return result.results ?? [];
	}

	async getCategories(): Promise<Category[]> {
		const result = await this.db
			.prepare('SELECT id, label, color, icon, sort_order FROM categories ORDER BY sort_order, id')
			.all<Category>();
		return result.results ?? [];
	}

	async getAvailableCategories(wardIds: string[]): Promise<Category[]> {
		const params: string[] = [];
		const areaFilter = wardIds.length > 0 ? `p.area_id IN (${placeholders(wardIds)})` : '1 = 1';
		params.push(...wardIds);

		const result = await this.db
			.prepare(`
				SELECT DISTINCT c.id, c.label, c.color, c.icon, c.sort_order
				FROM categories c
				JOIN place_collection_entries pce ON c.id = pce.category_id
				JOIN places p ON p.id = pce.place_id
				WHERE p.is_active = 1
				AND pce.is_active = 1
				AND ${areaFilter}
				ORDER BY c.sort_order, c.id
			`)
			.bind(...params)
			.all<Category>();

		return result.results ?? [];
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

	async getAllCategoryDetails(): Promise<Record<string, Record<string, string>>> {
		const result = await this.db
			.prepare('SELECT category_id, field, content FROM category_details')
			.all<CategoryDetailRow & { category_id: string }>();

		const detailsByCategory: Record<string, Record<string, string>> = {};
		for (const row of result.results ?? []) {
			detailsByCategory[row.category_id] ??= {};
			detailsByCategory[row.category_id][row.field] = row.content;
		}
		return detailsByCategory;
	}

	async getCollectors(): Promise<Collector[]> {
		const result = await this.db
			.prepare('SELECT id, name, url, organization_name, license_note, last_fetched_at, is_active, created_at, updated_at FROM data_sources WHERE is_active = 1 ORDER BY name')
			.all<Collector>();
		return result.results ?? [];
	}

	async getFacilities(wardIds: string[], categoryIds: string[]): Promise<FacilityWithCategories[]> {
		const params: string[] = [];
		const areaFilter = wardIds.length > 0 ? `p.area_id IN (${placeholders(wardIds)})` : '1 = 1';
		let categoryJoin = '';

		if (categoryIds.length > 0) {
			categoryJoin = `
				JOIN place_collection_entries selected_pce
					ON selected_pce.place_id = p.id
					AND selected_pce.is_active = 1
					AND selected_pce.category_id IN (${placeholders(categoryIds)})
			`;
			params.push(...categoryIds);
		}
		params.push(...wardIds);

		const result = await this.db
			.prepare(`
				SELECT
					p.id,
					p.area_id,
					p.canonical_name,
					p.display_address,
					p.latitude,
					p.longitude,
					p.url,
					p.image_url,
					p.image_alt,
					p.image_credit,
					p.image_source_url,
					p.mapillary_image_id,
					a.prefecture,
					a.city_label,
					NULL AS hours,
					NULL AS notes,
					NULL AS source_url,
					NULL AS categories
				FROM places p
				JOIN areas a ON a.id = p.area_id
				${categoryJoin}
				WHERE p.is_active = 1
				AND ${areaFilter}
				GROUP BY p.id
				ORDER BY p.area_id, p.canonical_name
			`)
			.bind(...params)
			.all<PlaceRow>();

		const places = result.results ?? [];
		const categoryRows = await this.getCategoryRowsForFacilities(wardIds, categoryIds);
		return attachCategories(places, categoryRows);
	}

	async getFacilityById(id: string): Promise<FacilityWithCategories | null> {
		const row = await this.db
			.prepare(`
				SELECT
					p.id,
					p.area_id,
					p.canonical_name,
					p.display_address,
					p.latitude,
					p.longitude,
					p.url,
					p.image_url,
					p.image_alt,
					p.image_credit,
					p.image_source_url,
					p.mapillary_image_id,
					a.prefecture,
					a.city_label,
					MIN(pce.hours) AS hours,
					MIN(pce.notes) AS notes,
					MIN(pce.source_url) AS source_url,
					GROUP_CONCAT(DISTINCT pce.category_id) AS categories
				FROM places p
				JOIN areas a ON a.id = p.area_id
				LEFT JOIN place_collection_entries pce ON p.id = pce.place_id AND pce.is_active = 1
				WHERE p.id = ?
				AND p.is_active = 1
				GROUP BY p.id
			`)
			.bind(id)
			.first<PlaceRow>();

		if (!row) return null;
		const facility = toFacilityFromPlace(row);
		facility.collection_entries = await this.getCollectionEntries([id]);
		return facility;
	}

	async searchFacilities(query: string, wardIds: string[]): Promise<FacilityWithCategories[]> {
		const keywords = query.trim().split(/\s+/).filter(Boolean);
		if (keywords.length === 0) return [];

		const params: string[] = [];
		const areaFilter = wardIds.length > 0 ? `p.area_id IN (${placeholders(wardIds)})` : '1 = 1';
		params.push(...wardIds);
		const clauses = keywords.map((keyword) => {
			const term = `%${escapeLikePattern(keyword)}%`;
			params.push(term, term, term, term, term, term);
			return `
				(
					p.canonical_name LIKE ? ESCAPE '\\'
					OR p.display_address LIKE ? ESCAPE '\\'
					OR EXISTS (
						SELECT 1
						FROM place_collection_entries search_pce
						JOIN categories search_c ON search_c.id = search_pce.category_id
						WHERE search_pce.place_id = p.id
						AND search_pce.is_active = 1
						AND (
							search_c.label LIKE ? ESCAPE '\\'
							OR search_pce.source_display_name LIKE ? ESCAPE '\\'
							OR search_pce.source_address LIKE ? ESCAPE '\\'
							OR search_pce.notes LIKE ? ESCAPE '\\'
						)
					)
				)
			`;
		});

		const result = await this.db
			.prepare(`
				SELECT
					p.id,
					p.area_id,
					p.canonical_name,
					p.display_address,
					p.latitude,
					p.longitude,
					p.url,
					p.image_url,
					p.image_alt,
					p.image_credit,
					p.image_source_url,
					p.mapillary_image_id,
					a.prefecture,
					a.city_label,
					MIN(pce.hours) AS hours,
					MIN(pce.notes) AS notes,
					MIN(pce.source_url) AS source_url,
					GROUP_CONCAT(DISTINCT pce.category_id) AS categories
				FROM places p
				JOIN areas a ON a.id = p.area_id
				LEFT JOIN place_collection_entries pce ON p.id = pce.place_id AND pce.is_active = 1
				WHERE p.is_active = 1
				AND ${areaFilter}
				AND ${clauses.join(' AND ')}
				GROUP BY p.id
				ORDER BY p.area_id, p.canonical_name
				LIMIT 50
			`)
			.bind(...params)
			.all<PlaceRow>();

		return (result.results ?? []).map(toFacilityFromPlace);
	}

	private async getCollectionEntries(placeIds: string[]): Promise<PublicCollectionEntry[]> {
		if (placeIds.length === 0) return [];
		const result = await this.db
			.prepare(`
				SELECT
					pce.*,
					ds.name AS data_source_name,
					ds.url AS data_source_url
				FROM place_collection_entries pce
				JOIN data_sources ds ON ds.id = pce.data_source_id
				WHERE pce.is_active = 1
				AND pce.place_id IN (${placeholders(placeIds)})
				ORDER BY pce.category_id, ds.name
			`)
			.bind(...placeIds)
			.all<CollectionEntryRow>();
		return result.results ?? [];
	}

	private async getCategoryRowsForFacilities(wardIds: string[], categoryIds: string[]): Promise<PlaceCategoryRow[]> {
		const params: string[] = [];
		const areaFilter = wardIds.length > 0 ? `p.area_id IN (${placeholders(wardIds)})` : '1 = 1';
		let categoryJoin = '';
		if (categoryIds.length > 0) {
			categoryJoin = `
				JOIN place_collection_entries selected_pce
					ON selected_pce.place_id = p.id
					AND selected_pce.is_active = 1
					AND selected_pce.category_id IN (${placeholders(categoryIds)})
			`;
			params.push(...categoryIds);
		}
		params.push(...wardIds);
		const result = await this.db
			.prepare(`
				SELECT
					pce.place_id,
					pce.category_id,
					pce.hours,
					pce.notes,
					pce.source_url
				FROM place_collection_entries pce
				JOIN places p ON p.id = pce.place_id
				${categoryJoin}
				WHERE p.is_active = 1
				AND pce.is_active = 1
				AND ${areaFilter}
				GROUP BY pce.id
				ORDER BY pce.place_id, pce.category_id
			`)
			.bind(...params)
			.all<PlaceCategoryRow>();
		return result.results ?? [];
	}
}

export function getD1Repository(platform: App.Platform | undefined): D1Repository {
	const db = platform?.env?.RECYCLING_DB;
	if (!db) {
		throw new Error('D1 binding RECYCLING_DB is not available. Use wrangler dev or configure D1 for this environment.');
	}
	return new D1Repository(db);
}
