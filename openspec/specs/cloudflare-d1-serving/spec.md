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
