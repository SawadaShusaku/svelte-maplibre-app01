# Cloudflare D1 Serving

## Purpose
Define production public data serving through Cloudflare D1 bindings and Worker/SvelteKit API endpoints.
## Requirements
### Requirement: Production data served through D1
The production app SHALL serve recycling facility data through Cloudflare D1 bindings accessed by Worker/SvelteKit server code, not by downloading a static SQLite database in the browser.

#### Scenario: Production facility query
- **WHEN** the browser requests facility data in production
- **THEN** the request is handled by an app API route or server load function
- **AND** the server queries Cloudflare D1 through an environment binding
- **AND** the browser does not fetch `static/recycling.db` or any other bulk database file

#### Scenario: D1 binding configured
- **WHEN** the Worker is deployed to production
- **THEN** a D1 database binding for recycling data is available to server code
- **AND** missing D1 bindings cause startup, build, or smoke verification to fail before users receive empty data

### Requirement: Environment-specific D1 databases
The system SHALL separate local, preview, and production D1 databases so development and test imports do not mutate production data.

#### Scenario: Local development database
- **WHEN** a developer runs the app locally with D1-backed data
- **THEN** the app uses a local or development D1 database
- **AND** local seed or migration commands do not target the production D1 database by default

#### Scenario: Preview database
- **WHEN** a preview deployment is used for validation
- **THEN** the app uses a preview or staging D1 database distinct from production
- **AND** preview imports can be repeated without changing production data

### Requirement: Minimized public API responses
The D1-backed public API SHALL return only fields required by the user-facing app and SHALL NOT expose private upstream snapshots, raw source payloads, geocoding cache data, or internal review metadata.

#### Scenario: Facility list response
- **WHEN** the app requests facilities for map display
- **THEN** each response item contains only approved public facility fields such as id, name, address, coordinates, ward, categories, hours, notes, and display URLs
- **AND** the response does not include raw upstream rows, source query details, provider response payloads, or geocoding cache entries

#### Scenario: Category and ward response
- **WHEN** the app requests category or ward metadata
- **THEN** the response contains only display and filtering metadata needed by the UI
- **AND** private pipeline provenance fields are omitted

### Requirement: API-backed repository
The app SHALL provide a data access implementation that preserves existing UI behavior while reading from D1-backed API routes instead of browser-loaded `sql.js` in production.

#### Scenario: Filter facilities
- **WHEN** users select wards and categories
- **THEN** the UI receives matching facilities from the API-backed data layer
- **AND** map markers, search, and detail views behave consistently with the previous SQLite-backed UI

#### Scenario: Search facilities
- **WHEN** users search by facility name, address, or category text
- **THEN** the D1-backed data path returns matching facilities without exposing the full database file to the browser

### Requirement: No production static database artifact
The production build SHALL NOT include a public static database file containing facility data.

#### Scenario: Build public assets
- **WHEN** the production app is built
- **THEN** `static/recycling.db` or equivalent generated bulk database artifacts are absent from the deployable public asset output
- **AND** data-boundary audits fail if a bulk database file is present in a public static asset path

### Requirement: National facility queries
The D1-backed facility API SHALL support national queries without requiring callers to send every area ID.

#### Scenario: Omitted area filter
- **WHEN** the browser requests `/api/facilities` without a `wards` parameter
- **THEN** the API returns public facilities across all D1 areas subject to category and result constraints
- **AND** the API does not treat the omitted parameter as an empty result set

#### Scenario: Selected area filter
- **WHEN** the browser requests `/api/facilities` with selected area IDs
- **THEN** the API returns only facilities whose area IDs match the selected IDs

### Requirement: National area metadata API
The D1-backed API SHALL expose public area metadata needed for national filtering and aggregation.

#### Scenario: Area metadata response
- **WHEN** the browser requests area metadata
- **THEN** the API returns each public area ID, prefecture, display label, and optional public URL
- **AND** the response does not include private pipeline provenance or raw upstream fields

### Requirement: Administrative summary data
The D1-backed serving layer SHALL provide enough public data for prefecture and municipality summary display.

#### Scenario: Summary counts
- **WHEN** the app needs low-zoom or mid-zoom summary counts
- **THEN** the serving layer can produce counts grouped by prefecture and by municipality or ward
- **AND** those counts respect active category and area filters

#### Scenario: Summary coordinates
- **WHEN** the map renders administrative summaries
- **THEN** each summary has a deterministic display coordinate derived from public facility locations or public area metadata

### Requirement: Public facility media response
The D1-backed public facility API SHALL return approved media fields when they are available for a facility.

#### Scenario: Facility media exists
- **WHEN** the browser requests facilities and a matching public facility has approved media metadata
- **THEN** the API response includes the media URL or provider reference, alt text, and attribution/source link needed by the UI
- **AND** the response does not include token-bearing URLs or provider response bodies

### Requirement: Public facility response excludes internal notes
The D1-backed public facility API SHALL exclude internal geocoding/source-quality notes and private review metadata from all public facility responses.

#### Scenario: Internal note exists in source data
- **WHEN** a source or normalized private row contains an internal geocoding note
- **THEN** `/api/facilities` and `/api/facilities/:id` do not include that note in `notes`, `description`, `source`, or any other public field
- **AND** the API serialization uses explicit public fields rather than spreading raw database or source rows

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

