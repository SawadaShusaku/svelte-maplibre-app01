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
The system SHALL publish only the fields required for the user-facing app experience and SHALL avoid distributing full upstream snapshots, full derived facility databases as static downloads, internal geocoding notes, source-quality notes, and private review metadata.

#### Scenario: Build derived public data
- **WHEN** generating a public dataset
- **THEN** the output contains only approved facility fields needed by the app
- **AND** the output omits private cache fields, raw source payloads, nonessential upstream snapshot data, internal geocoding notes, and private review comments

#### Scenario: Serve public data through API
- **WHEN** production users access facility data
- **THEN** the app serves minimized records through Worker/SvelteKit API responses
- **AND** the app does not expose data-bearing SQLite, D1 seed, CSV, or dump files as public static assets
- **AND** the app does not expose internal pipeline notes through public `notes`, `description`, source, media, or metadata fields

#### Scenario: Preserve internal notes privately
- **WHEN** normalized private data contains notes needed for geocoding review or source-quality auditing
- **THEN** those notes remain available only in private pipeline storage or private review reports
- **AND** public artifacts receive only approved user-facing notes

### Requirement: Private geocoding cache
The system SHALL keep geocoding cache and provider response metadata private while preserving enough audit metadata in normalized data to review coordinate quality.

#### Scenario: Cache geocoding results
- **WHEN** a geocoding request succeeds or fails
- **THEN** the private cache stores the provider result for reproducible reruns
- **AND** the public app repository does not track that cache file

### Requirement: Private pipeline preserves source-specific listing fields
The private data pipeline SHALL preserve the source-specific fields needed to export normalized public collection entries.

#### Scenario: Source row becomes collection entry
- **WHEN** a normalized private source row is approved for public serving
- **THEN** the pipeline can export its category, data source, listing name, listing address, normalized listing address, listing URL, hours, public notes, location hint, source fetched timestamp, and optional source published timestamp
- **AND** private-only raw payloads and review comments remain outside the public app repository

### Requirement: Private pipeline produces group-oriented dedupe review
The private data pipeline SHALL produce review output organized around candidate place groups.

#### Scenario: Ambiguous same-place group
- **WHEN** candidate rows share normalized address or place identity evidence but are not merged automatically
- **THEN** the review artifact lists all rows in the candidate group
- **AND** the artifact avoids left/right terminology that implies only two rows can be involved

### Requirement: Obsolete review artifacts can be removed
Private generated review artifacts that no longer match the current dedupe workflow SHALL NOT be used as the primary review artifact after group-oriented output exists.

#### Scenario: Pair report superseded
- **WHEN** a group-oriented duplicate review artifact has been generated
- **THEN** the older pair-oriented duplicate review artifact is not required for the public app workflow

