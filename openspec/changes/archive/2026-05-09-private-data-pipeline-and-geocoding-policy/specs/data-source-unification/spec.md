## MODIFIED Requirements

### Requirement: Private normalized data is the long-term source of truth
The system SHALL treat private upstream snapshots and normalized private data as the long-term authoritative source for facility data.

CSV files, raw HTML, raw JSON, geocoding caches, and full normalized private datasets SHALL NOT be committed to the public application repository or distributed as static public assets.

GeoJSON files and public-facing SQLite/D1 datasets SHALL be treated as derived serving artifacts when generated from the private data pipeline.

#### Scenario: Build database
- **WHEN** `npm run build:db` is executed
- **THEN** the current implementation may read GeoJSON files as a derived input
- **AND** the generated SQLite database is treated as a build artifact
- **AND** developers do not treat `static/recycling.db` as authoritative data

#### Scenario: Private collection snapshots
- **WHEN** external source data is collected from official upstream sites
- **THEN** generated CSV/raw snapshots are stored outside the public app repository
- **AND** only scripts, schemas, documentation, and non-sensitive policy artifacts are committed
- **AND** the public application receives only approved derived datasets or API responses

### Requirement: No private CSV snapshots in app repository
The application repository SHALL NOT contain private upstream CSV snapshots, raw source dumps, or geocoding caches.

#### Scenario: List application repository data files
- **WHEN** listing tracked files in the application repository
- **THEN** no generated private collection CSV files are present
- **AND** no raw upstream HTML/JSON dumps are present
- **AND** no geocoding cache files are present

### Requirement: Minimal scripts directory
The public application `scripts/` directory SHALL contain only scripts needed by the application build, validation, or maintenance workflow.

#### Scenario: List scripts directory
- **WHEN** listing files in `scripts/`
- **THEN** private upstream collection scripts are not present
- **AND** bulk geocoding scripts for private CSV snapshots are not present
- **AND** data collection and geocoding scripts live in the separate private data pipeline project

### Requirement: Data flow documentation
The AGENTS.md file SHALL document both the current app data flow and the long-term private data pipeline direction.

#### Scenario: Read AGENTS.md
- **WHEN** a developer reads AGENTS.md
- **THEN** they understand that current app builds derive SQLite from GeoJSON
- **AND** they understand that private upstream snapshots/normalized data are the long-term source of truth
- **AND** they know not to commit private CSV/raw/geocoding data to the public app
- **AND** they know to run `npm run build:db` after changing derived GeoJSON inputs in the current implementation
