## ADDED Requirements

### Requirement: D1 schema generation
The system SHALL define D1-compatible schema migration files for public recycling facility serving data.

#### Scenario: Apply schema locally
- **WHEN** a developer applies the D1 schema to a local D1 database
- **THEN** the required tables, indexes, and relationships for categories, wards, facilities, and facility categories are created successfully
- **AND** the schema can be re-applied through the documented migration workflow

#### Scenario: Apply schema to preview or production
- **WHEN** the schema migration is applied to preview or production D1
- **THEN** the same public serving schema is created without requiring private CSV/raw/geocoding files in the public app repository

### Requirement: Seed data generated from private normalized data
The system SHALL generate D1 seed or import artifacts from the private normalized data pipeline using approved public fields only.

#### Scenario: Generate seed artifact
- **WHEN** the private pipeline exports D1 seed data
- **THEN** the output contains public serving tables derived from normalized private records
- **AND** the output omits raw upstream payloads, full source snapshots, geocoding provider response bodies, and nonessential private audit fields

#### Scenario: Prevent committing seed data
- **WHEN** reviewing tracked files in the public app repository
- **THEN** generated data-bearing D1 seed/import artifacts are not present
- **AND** schema-only migration files may be present when they contain no facility rows

### Requirement: Local SQLite validation is private and dev-only
The system MAY generate a local SQLite validation database, but it SHALL keep that database outside public static assets and outside committed public app files.

#### Scenario: Generate local validation database
- **WHEN** a developer generates a SQLite database for local inspection
- **THEN** the database is written to a private or temporary path outside `static/`
- **AND** it is ignored by version control and excluded from Cloudflare static assets

#### Scenario: Validate seed equivalence
- **WHEN** local SQLite validation and D1 seed generation are both run from the same normalized data
- **THEN** row counts, required field presence, category relationships, and coordinate validity are checked before production import

### Requirement: Deduplicated public facilities
The seed generation pipeline SHALL produce public facility records after deduplication and human review of ambiguous merge candidates.

#### Scenario: Merge same public facility
- **WHEN** multiple source rows represent the same facility at the same normalized address and compatible coordinates
- **THEN** the generated public facility is represented once
- **AND** all accepted categories are associated with that facility

#### Scenario: Report ambiguous duplicates
- **WHEN** rows have similar names, nearby coordinates, or matching normalized addresses but cannot be safely merged
- **THEN** the pipeline writes a private review report
- **AND** ambiguous rows are not silently merged without human review or explicit rule approval

### Requirement: Seed quality gates
D1 seed generation SHALL fail before import when required public fields are missing, coordinates are invalid, duplicate public IDs exist, or unresolved low-confidence geocoding rows would enter public serving data.

#### Scenario: Missing required field
- **WHEN** a public facility row lacks id, name, address, coordinates, ward, or category data
- **THEN** seed generation fails
- **AND** the failure report identifies the affected source or normalized record

#### Scenario: Unresolved geocoding issue
- **WHEN** a row has failed or low-confidence geocoding without human resolution
- **THEN** the row is excluded from production seed output or the seed generation fails
- **AND** the issue is recorded in a private review report
