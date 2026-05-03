# Private Data Pipeline

## Purpose
Define the private upstream data boundary and the normalized data pipeline that produces minimized public recycling facility artifacts.

## Requirements

### Requirement: Private upstream snapshots
The system SHALL store full upstream CSV snapshots, raw HTML/JSON responses, geocoding caches, normalized private datasets, data-bearing D1 seed/import artifacts, and local validation databases outside the public application repository and outside static public assets.

#### Scenario: Store private collection outputs
- **WHEN** a data collection script fetches source data from an upstream recycling site
- **THEN** the generated CSV/raw/cache outputs are stored in the private data pipeline project or private storage
- **AND** the public app repository receives only scripts, schemas, documentation, or approved derived artifacts

#### Scenario: Prevent public snapshot commits
- **WHEN** reviewing tracked files in the public app repository
- **THEN** full upstream CSV snapshots are not present
- **AND** raw upstream HTML/JSON responses are not present
- **AND** private geocoding cache files are not present
- **AND** data-bearing D1 seed/import dumps and local validation databases are not present

### Requirement: Normalized private source of truth
The system SHALL treat normalized private data, including source provenance and geocoding metadata, as the long-term authoritative data source for public recycling facility outputs.

#### Scenario: Preserve source provenance
- **WHEN** source rows are normalized
- **THEN** each normalized record retains source name, source URL, source ID or deterministic source ID, source query, fetched timestamp, original address, normalized address, category, and coordinate source fields

#### Scenario: Generate public artifacts
- **WHEN** public app data is produced
- **THEN** GeoJSON, dev-only SQLite, D1 seed data, or Worker API responses are generated from the normalized private source
- **AND** generated public artifacts are treated as derived serving outputs
- **AND** data-bearing seed/import artifacts remain private operational artifacts unless served through minimized API responses

### Requirement: Public output minimization
The system SHALL publish only the fields required for the user-facing app experience and SHALL avoid distributing full upstream snapshots or full derived facility databases as static downloads.

#### Scenario: Build derived public data
- **WHEN** generating a public dataset
- **THEN** the output contains only approved facility fields needed by the app
- **AND** the output omits private cache fields, raw source payloads, and nonessential upstream snapshot data

#### Scenario: Serve public data through API
- **WHEN** production users access facility data
- **THEN** the app serves minimized records through Worker/SvelteKit API responses
- **AND** the app does not expose data-bearing SQLite, D1 seed, CSV, or dump files as public static assets

### Requirement: Private geocoding cache
The system SHALL keep geocoding cache and provider response metadata private while preserving enough audit metadata in normalized data to review coordinate quality.

#### Scenario: Cache geocoding results
- **WHEN** a geocoding request succeeds or fails
- **THEN** the private cache stores the provider result for reproducible reruns
- **AND** the public app repository does not track that cache file
