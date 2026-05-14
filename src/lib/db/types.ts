// Database entity types for SQLite schema

export interface Category {
	id: string;
	label: string;
	color: string;
	icon: string;
}

export interface CategoryDetail {
	category_id: string;
	field: string;
	content: string;
}

export interface DataSource {
	id: string;
	name: string;
	url: string;
	organization_name?: string | null;
	license_note?: string | null;
	last_fetched_at?: string | null;
	is_active?: number;
	created_at?: string;
	updated_at?: string;
}

export type Collector = DataSource;

export interface Ward {
	id: string;
	prefecture: string;
	city_label: string;
	url: string | null;
}

export interface Area extends Ward {
	normalized_label?: string | null;
	is_active?: number;
	created_at?: string;
	updated_at?: string;
}

export interface WardCategory {
	ward_id: string;
	category_id: string;
}

export interface Facility {
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
	image_url?: string | null;
	image_alt?: string | null;
	image_credit?: string | null;
	image_source_url?: string | null;
	mapillary_image_id?: string | null;
}

export interface FacilityCategory {
	facility_id: string;
	category_id: string;
}

export interface Place {
	id: string;
	area_id: string;
	canonical_name: string;
	display_address: string;
	normalized_address: string;
	latitude: number;
	longitude: number;
	dedupe_key: string;
	url: string | null;
	image_url?: string | null;
	image_alt?: string | null;
	image_credit?: string | null;
	image_source_url?: string | null;
	mapillary_image_id?: string | null;
	is_active: number;
	created_at: string;
	updated_at: string;
}

export interface PlaceCollectionEntry {
	id: string;
	place_id: string;
	category_id: string;
	data_source_id: string;
	source_display_name: string | null;
	source_address: string | null;
	normalized_source_address: string | null;
	source_url: string | null;
	hours: string | null;
	notes: string | null;
	location_hint: string | null;
	image_url?: string | null;
	image_alt?: string | null;
	image_credit?: string | null;
	image_source_url?: string | null;
	mapillary_image_id?: string | null;
	source_fetched_at: string | null;
	source_published_at: string | null;
	is_active: number;
	created_at: string;
	updated_at: string;
}

export interface PublicCollectionEntry extends PlaceCollectionEntry {
	category_label?: string;
	data_source_name?: string;
	data_source_url?: string;
}

// Extended types with joined data
export interface FacilityWithCategories extends Facility {
	prefecture?: string;
	city_label?: string;
	categories: string[];
	collection_entries?: PublicCollectionEntry[];
}

export interface WardWithCategories extends Ward {
	availableCategories: string[];
}

export interface CategoryWithDetails extends Category {
	details: Record<string, string>;
}
