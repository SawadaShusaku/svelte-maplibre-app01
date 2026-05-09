-- Cloudflare D1 public serving schema for the recycling facility map.
-- Data rows are generated from the private data pipeline and imported into D1.
-- Do not commit data-bearing seed/import dumps to the public app repository.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS categories (
	id TEXT PRIMARY KEY,
	label TEXT NOT NULL,
	color TEXT NOT NULL,
	icon TEXT NOT NULL,
	sort_order INTEGER NOT NULL DEFAULT 999
);

CREATE TABLE IF NOT EXISTS category_details (
	category_id TEXT NOT NULL,
	field TEXT NOT NULL,
	content TEXT NOT NULL,
	PRIMARY KEY (category_id, field),
	FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS collectors (
	id TEXT PRIMARY KEY,
	name TEXT NOT NULL,
	url TEXT
);

CREATE TABLE IF NOT EXISTS wards (
	id TEXT PRIMARY KEY,
	prefecture TEXT NOT NULL,
	city_label TEXT NOT NULL,
	url TEXT
);

CREATE TABLE IF NOT EXISTS areas (
	id TEXT PRIMARY KEY,
	prefecture TEXT NOT NULL,
	city_label TEXT NOT NULL,
	normalized_label TEXT,
	url TEXT,
	is_active INTEGER NOT NULL DEFAULT 1,
	created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
	updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE TABLE IF NOT EXISTS data_sources (
	id TEXT PRIMARY KEY,
	name TEXT NOT NULL,
	url TEXT NOT NULL,
	organization_name TEXT,
	license_note TEXT,
	last_fetched_at TEXT,
	is_active INTEGER NOT NULL DEFAULT 1,
	created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
	updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE TABLE IF NOT EXISTS ward_categories (
	ward_id TEXT NOT NULL,
	category_id TEXT NOT NULL,
	PRIMARY KEY (ward_id, category_id),
	FOREIGN KEY (ward_id) REFERENCES wards(id) ON DELETE CASCADE,
	FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS facilities (
	id TEXT PRIMARY KEY,
	ward_id TEXT NOT NULL,
	name TEXT NOT NULL,
	address TEXT NOT NULL,
	latitude REAL NOT NULL,
	longitude REAL NOT NULL,
	url TEXT,
	official_url TEXT,
	category_urls TEXT,
	collector_id TEXT,
	hours TEXT,
	notes TEXT,
	image_url TEXT,
	image_alt TEXT,
	image_credit TEXT,
	image_source_url TEXT,
	mapillary_image_id TEXT,
	FOREIGN KEY (ward_id) REFERENCES wards(id) ON DELETE CASCADE,
	FOREIGN KEY (collector_id) REFERENCES collectors(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS places (
	id TEXT PRIMARY KEY,
	area_id TEXT NOT NULL,
	canonical_name TEXT NOT NULL,
	display_address TEXT NOT NULL,
	normalized_address TEXT NOT NULL,
	latitude REAL NOT NULL,
	longitude REAL NOT NULL,
	dedupe_key TEXT NOT NULL,
	url TEXT,
	image_url TEXT,
	image_alt TEXT,
	image_credit TEXT,
	image_source_url TEXT,
	mapillary_image_id TEXT,
	is_active INTEGER NOT NULL DEFAULT 1,
	created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
	updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
	FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS place_collection_entries (
	id TEXT PRIMARY KEY,
	place_id TEXT NOT NULL,
	category_id TEXT NOT NULL,
	data_source_id TEXT NOT NULL,
	source_display_name TEXT,
	source_address TEXT,
	normalized_source_address TEXT,
	source_url TEXT,
	hours TEXT,
	notes TEXT,
	location_hint TEXT,
	image_url TEXT,
	image_alt TEXT,
	image_credit TEXT,
	image_source_url TEXT,
	mapillary_image_id TEXT,
	source_fetched_at TEXT,
	source_published_at TEXT,
	is_active INTEGER NOT NULL DEFAULT 1,
	created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
	updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
	FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE,
	FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
	FOREIGN KEY (data_source_id) REFERENCES data_sources(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS facility_categories (
	facility_id TEXT NOT NULL,
	category_id TEXT NOT NULL,
	PRIMARY KEY (facility_id, category_id),
	FOREIGN KEY (facility_id) REFERENCES facilities(id) ON DELETE CASCADE,
	FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_facilities_ward ON facilities(ward_id);
CREATE INDEX IF NOT EXISTS idx_facilities_location ON facilities(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_facility_categories_category ON facility_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_ward_categories_category ON ward_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_category_details_category ON category_details(category_id);
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON categories(sort_order);
CREATE INDEX IF NOT EXISTS idx_areas_active_label ON areas(is_active, prefecture, city_label);
CREATE INDEX IF NOT EXISTS idx_places_area_active ON places(area_id, is_active);
CREATE INDEX IF NOT EXISTS idx_places_location ON places(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_places_dedupe_key ON places(dedupe_key);
CREATE INDEX IF NOT EXISTS idx_place_entries_place_active ON place_collection_entries(place_id, is_active);
CREATE INDEX IF NOT EXISTS idx_place_entries_category_active ON place_collection_entries(category_id, is_active);
CREATE INDEX IF NOT EXISTS idx_place_entries_category_place ON place_collection_entries(category_id, is_active, place_id);
CREATE INDEX IF NOT EXISTS idx_place_entries_place_category ON place_collection_entries(place_id, is_active, category_id);
CREATE INDEX IF NOT EXISTS idx_place_entries_source_active ON place_collection_entries(data_source_id, is_active);
CREATE INDEX IF NOT EXISTS idx_place_entries_text ON place_collection_entries(source_display_name, source_address);
