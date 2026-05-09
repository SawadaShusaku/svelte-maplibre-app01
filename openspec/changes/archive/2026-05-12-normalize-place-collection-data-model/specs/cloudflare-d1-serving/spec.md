## ADDED Requirements

### Requirement: Normalized place serving queries
The D1-backed serving layer SHALL query active places and active collection entries from the normalized place collection model.

#### Scenario: Facility list from places
- **WHEN** the browser requests facility data for map display
- **THEN** the server queries `places` joined to active `place_collection_entries`
- **AND** each returned map item represents one active place with aggregated active categories

#### Scenario: Category-specific details returned
- **WHEN** the browser requests a place detail response
- **THEN** the response includes the active collection entries for that place with data-source listing name, listing address, source URL, hours, public notes, and location hint when available
- **AND** the response does not expose raw upstream payloads, private review fields, or dedupe keys

### Requirement: Data source metadata response
The public API SHALL expose only approved public data-source metadata needed to explain collection entries.

#### Scenario: Entry has data source
- **WHEN** a place detail response includes a collection entry
- **THEN** the entry can include the data source name and public URL
- **AND** it does not include private scraping metadata or unpublished source fields

### Requirement: Backward-compatible facility adapter
The server data layer SHALL preserve the existing browser-facing map behavior during migration even if the storage tables are renamed.

#### Scenario: Existing map UI loads
- **WHEN** the frontend asks for facilities through the current data adapter
- **THEN** the adapter receives place-backed records with the fields required for marker rendering, filtering, search, and detail display
- **AND** the browser does not need to understand the old `facilities` table during the migration
