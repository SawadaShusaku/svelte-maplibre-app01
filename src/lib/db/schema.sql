-- SQLite Database Schema for Recycling Facility Map
-- 回収拠点マップ用 SQLite データベーススキーマ

-- Categories master table
CREATE TABLE categories (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    color TEXT NOT NULL,
    icon TEXT NOT NULL
);

-- Category details (warnings, examples, etc.)
CREATE TABLE category_details (
    category_id TEXT NOT NULL,
    field TEXT NOT NULL,
    content TEXT NOT NULL,
    PRIMARY KEY (category_id, field),
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Collection organizations
CREATE TABLE collectors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT
);

-- Wards/Cities
CREATE TABLE wards (
    id TEXT PRIMARY KEY,
    prefecture TEXT NOT NULL,
    city_label TEXT NOT NULL,
    url TEXT
);

-- Many-to-many: Wards to Categories
CREATE TABLE ward_categories (
    ward_id TEXT NOT NULL,
    category_id TEXT NOT NULL,
    PRIMARY KEY (ward_id, category_id),
    FOREIGN KEY (ward_id) REFERENCES wards(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Recycling facilities
CREATE TABLE facilities (
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

-- Many-to-many: Facilities to Categories
CREATE TABLE facility_categories (
    facility_id TEXT NOT NULL,
    category_id TEXT NOT NULL,
    PRIMARY KEY (facility_id, category_id),
    FOREIGN KEY (facility_id) REFERENCES facilities(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_facilities_ward ON facilities(ward_id);
CREATE INDEX idx_facilities_location ON facilities(latitude, longitude);
CREATE INDEX idx_facility_categories_category ON facility_categories(category_id);
CREATE INDEX idx_ward_categories_category ON ward_categories(category_id);
CREATE INDEX idx_category_details_category ON category_details(category_id);
