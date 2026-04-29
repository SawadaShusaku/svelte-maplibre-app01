## ADDED Requirements

### Requirement: Database schema supports all recycling categories
The SQLite database SHALL store all recycling category definitions with their display properties.

#### Scenario: Category has display properties
- **WHEN** the system queries the categories table
- **THEN** it SHALL return id, label, color, and icon for each category

### Requirement: Category details support warnings and examples
The database SHALL support storing additional details for each category including warnings and usage examples.

#### Scenario: Category has safety warnings
- **WHEN** a category requires special handling (e.g., lithium batteries)
- **THEN** the category_details table SHALL store warning text about terminal insulation
- **AND** the system SHALL be able to retrieve examples of items (e.g., "mobile batteries")

### Requirement: Wards can have different available categories
The database SHALL support wards having different sets of available categories through a many-to-many relationship.

#### Scenario: Ward has limited category support
- **GIVEN** Toshima ward only accepts "dry-battery" and "fluorescent"
- **WHEN** querying ward_categories for "toshima"
- **THEN** it SHALL return only those two category IDs
- **AND** "rechargeable-battery" SHALL NOT be returned

### Requirement: Facilities can accept multiple categories
The database SHALL allow facilities to accept multiple recycling categories.

#### Scenario: Facility accepts batteries and fluorescent lights
- **GIVEN** a library accepts both dry batteries and fluorescent lights
- **WHEN** querying facility_categories for that facility
- **THEN** it SHALL return both category IDs

### Requirement: Collectors can be associated with facilities
The database SHALL support assigning collection organizations to facilities.

#### Scenario: JBRC collector assignment
- **GIVEN** "rechargeable-battery" category is collected by JBRC
- **WHEN** querying collectors for facilities accepting that category
- **THEN** it SHALL return JBRC with name and URL

### Requirement: Facilities have geographic coordinates
The database SHALL store facility locations with latitude and longitude for map display.

#### Scenario: Facility location retrieval
- **WHEN** querying a facility by ID
- **THEN** it SHALL return latitude and longitude coordinates
- **AND** it SHALL return the facility address and optional URL

### Requirement: URL fields support ward, collector, and facility information
The database SHALL include URL fields for wards, collectors, and facilities to link to official information.

#### Scenario: URLs are available
- **WHEN** querying ward "toshima"
- **THEN** it SHALL include the official ward recycling page URL
- **WHEN** querying collector "JBRC"
- **THEN** it SHALL include the JBRC website URL
- **WHEN** querying a facility
- **THEN** it MAY include the facility's official page URL
