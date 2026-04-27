## ADDED Requirements

### Requirement: Migration script converts GeoJSON to SQLite
The system SHALL provide a migration script that converts existing GeoJSON files to SQLite database format.

#### Scenario: Migrate toshima.geojson
- **GIVEN** toshima.geojson contains 50 facilities with categories
- **WHEN** running the migration script
- **THEN** it SHALL create SQLite database with all facilities
- **AND** it SHALL populate ward_categories based on unique categories found in the data
- **AND** it SHALL populate facility_categories for each facility-category relationship

### Requirement: Migration preserves existing data integrity
The migration SHALL maintain all existing facility information including names, addresses, coordinates, and categories.

#### Scenario: Facility data integrity
- **GIVEN** a facility in GeoJSON with name "池袋図書館" and categories ["battery"]
- **WHEN** migrated to SQLite
- **THEN** the facilities table SHALL contain "池袋図書館"
- **AND** facility_categories SHALL link it to "battery" category
- **AND** coordinates SHALL be preserved exactly

### Requirement: Migration generates collectors from known sources
The migration script SHALL identify collection organizations from category patterns and create collector records.

#### Scenario: JBRC identification
- **GIVEN** facilities accepting "rechargeable-battery" are typically collected by JBRC
- **WHEN** migrating data
- **THEN** the script SHALL create a JBRC collector record
- **AND** associate relevant facilities with that collector

### Requirement: Migration supports incremental updates
The migration script SHALL support re-running without duplicating data for incremental updates.

#### Scenario: Re-run migration
- **GIVEN** database already exists with some data
- **WHEN** re-running migration with updated GeoJSON
- **THEN** it SHALL update existing records
- **AND** it SHALL insert new records
- **AND** it SHALL NOT create duplicates

### Requirement: Category separation for batteries
The migration SHALL separate the existing battery category into "dry-battery" and "rechargeable-battery" based on facility patterns.

#### Scenario: Battery category split
- **GIVEN** old category "battery" existed in GeoJSON
- **WHEN** analyzing facility patterns
- **THEN** convenience stores SHALL be mapped to "rechargeable-battery"
- **AND** ward offices SHALL be mapped to "dry-battery"
- **AND** libraries accepting both SHALL be linked to both categories
