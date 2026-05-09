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
	FOREIGN KEY (ward_id) REFERENCES wards(id) ON DELETE CASCADE,
	FOREIGN KEY (collector_id) REFERENCES collectors(id) ON DELETE SET NULL
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
