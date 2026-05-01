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

export interface Collector {
	id: string;
	name: string;
	url: string | null;
}

export interface Ward {
	id: string;
	prefecture: string;
	city_label: string;
	url: string | null;
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
}

export interface FacilityCategory {
	facility_id: string;
	category_id: string;
}

// Extended types with joined data
export interface FacilityWithCategories extends Facility {
	categories: string[];
}

export interface WardWithCategories extends Ward {
	availableCategories: string[];
}

export interface CategoryWithDetails extends Category {
	details: Record<string, string>;
}
