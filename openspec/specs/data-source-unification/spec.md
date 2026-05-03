# Data Source Unification

## Purpose
Define the authoritative data flow for recycling facility data, including D1-backed public serving and the separation between private upstream data collection and public application artifacts.

## Requirements

### Requirement: Private normalized data is the long-term source of truth
The system SHALL treat private upstream snapshots and normalized private data as the long-term authoritative source for facility data.

CSV files, raw HTML, raw JSON, geocoding caches, full normalized private datasets, data-bearing D1 seed/import artifacts, and local validation databases SHALL NOT be committed to the public application repository or distributed as static public assets.

GeoJSON files, local SQLite validation databases, D1 datasets, and Worker API responses SHALL be treated as derived artifacts when generated from the private data pipeline.

#### Scenario: Build database
- **WHEN** a developer builds or validates data locally
- **THEN** the current implementation may read GeoJSON files as a transitional derived input
- **AND** any generated SQLite database is treated as a dev-only or transitional build artifact
- **AND** developers do not treat `static/recycling.db` as authoritative data
- **AND** production builds do not publish a bulk SQLite database as a static asset

#### Scenario: Private collection snapshots
- **WHEN** external source data is collected from official upstream sites
- **THEN** generated CSV/raw snapshots are stored outside the public app repository
- **AND** only scripts, schemas, documentation, and non-sensitive policy artifacts are committed
- **AND** the public application receives only approved derived datasets or API responses

#### Scenario: Production public serving
- **WHEN** the app is deployed to production
- **THEN** public facility data is served from Cloudflare D1 through Worker/SvelteKit server code
- **AND** the browser receives minimized API responses rather than a downloadable database file

### Requirement: No private CSV snapshots in app repository
The application repository SHALL NOT contain private upstream CSV snapshots, raw source dumps, geocoding caches, data-bearing D1 seed/import dumps, or generated local validation databases.

#### Scenario: List application repository data files
- **WHEN** listing tracked files in the application repository
- **THEN** no generated private collection CSV files are present
- **AND** no raw upstream HTML/JSON dumps are present
- **AND** no geocoding cache files are present
- **AND** no data-bearing D1 seed/import dumps or local validation databases are present

### Requirement: Minimal scripts directory
The public application `scripts/` directory SHALL contain only scripts needed by the application build, validation, deployment guardrails, or public serving migration workflow.

#### Scenario: List scripts directory
- **WHEN** listing files in `scripts/`
- **THEN** private upstream collection scripts are not present
- **AND** bulk geocoding scripts for private CSV snapshots are not present
- **AND** data collection and geocoding scripts live in the separate private data pipeline project
- **AND** D1 schema or deployment guardrail scripts in the public app do not embed data-bearing facility rows

### Requirement: Data flow documentation
The AGENTS.md file SHALL document both the current app data flow and the long-term private data pipeline to D1 public-serving direction.

#### Scenario: Read AGENTS.md
- **WHEN** a developer reads AGENTS.md
- **THEN** they understand that current app builds may derive local SQLite from GeoJSON during transition
- **AND** they understand that private upstream snapshots/normalized data are the long-term source of truth
- **AND** they know not to commit private CSV/raw/geocoding data, D1 seed dumps, or local validation databases to the public app
- **AND** they know production serving must use D1/Worker API responses rather than public static database downloads after migration
