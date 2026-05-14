# D1 Seed Generation

## Purpose
Define how private normalized data is converted into validated D1 seed/import artifacts and dev-only local validation databases.
## Requirements
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
The seed generation pipeline SHALL produce public facility records after deterministic place-level deduplication and human review of ambiguous merge candidates.

#### Scenario: Merge same public facility
- **WHEN** multiple source rows represent the same facility at the same normalized administrative area and address with compatible coordinates
- **THEN** the generated public facility is represented once
- **AND** all accepted categories are associated with that facility
- **AND** the merged facility keeps approved public display fields without exposing source-row internals

#### Scenario: Merge category-specific place names
- **WHEN** category-specific names such as a stockyard suffix and a base public office name share a normalized address and compatible coordinates
- **THEN** seed generation MAY merge them into one public facility
- **AND** the merged display name uses the best public place name rather than a category-specific artifact when that is clearer to users

#### Scenario: Report ambiguous duplicates
- **WHEN** rows have similar names, nearby coordinates, or matching normalized addresses but cannot be safely merged
- **THEN** the pipeline writes a private review report
- **AND** ambiguous rows are not silently merged without human review or explicit rule approval

### Requirement: Seed quality gates
D1 seed generation SHALL fail before import when required public fields are missing, coordinates are invalid, duplicate public IDs exist, unresolved low-confidence geocoding rows would enter public serving data, or internal pipeline notes would appear in public fields.

#### Scenario: Missing required field
- **WHEN** a public facility row lacks id, name, address, coordinates, ward, or category data
- **THEN** seed generation fails
- **AND** the failure report identifies the affected source or normalized record

#### Scenario: Unresolved geocoding issue
- **WHEN** a row has failed or low-confidence geocoding without human resolution
- **THEN** the row is excluded from production seed output or the seed generation fails
- **AND** the issue is recorded in a private review report

#### Scenario: Internal note in public field
- **WHEN** a public output candidate contains an internal note about missing official coordinates, geocoding workflow, source scraping, or review status
- **THEN** seed generation fails before import
- **AND** the failure report identifies the field and record that must be remapped or removed

### Requirement: Normalized D1 seed export
Seed generation SHALL export the normalized public serving tables needed by the place collection data model.

#### Scenario: Export normalized tables
- **WHEN** the private pipeline generates a public D1 seed artifact
- **THEN** the artifact includes `areas`, `categories`, `data_sources`, `places`, and `place_collection_entries`
- **AND** the artifact does not rely on `facilities` as the canonical public serving table

#### Scenario: Public source fields only
- **WHEN** collection entries are exported
- **THEN** they include only approved public listing fields and timestamps
- **AND** raw CSV rows, raw HTML, raw JSON responses, geocoding provider payloads, private review comments, and token-bearing media URLs are omitted

### Requirement: Strong address and name normalization before place grouping
Seed generation SHALL normalize Japanese address and name notation before deriving place groups and dedupe keys.

#### Scenario: Address notation differs only by representation
- **WHEN** source rows differ by full-width and half-width numbers, `丁目`, `番地`, `番`, `号`, postal-code prefixes, or hyphen variants
- **THEN** normalization treats them as the same address for dedupe-key generation when the administrative area is compatible

#### Scenario: Corporate or municipality name notation differs
- **WHEN** source rows differ by common corporate notation such as `㈱`, `（株）`, `株式会社`, spacing, municipality prefixes, or category/location suffixes
- **THEN** name normalization treats them as compatible evidence for same-place grouping when address and coordinate evidence is compatible

### Requirement: Group-oriented duplicate review
Seed generation SHALL report unresolved duplicate candidates as place groups rather than left/right pairs.

#### Scenario: Multiple candidate rows share a dedupe group
- **WHEN** three or more source rows may represent one place but cannot be automatically merged
- **THEN** the review output groups all candidate rows under one group ID
- **AND** each row includes its category, data source, listing name, listing address, normalized address, source URL, and match reasons

#### Scenario: Obsolete pair report removed
- **WHEN** group-oriented review output is generated
- **THEN** obsolete left/right duplicate review reports are no longer used as the primary review artifact

