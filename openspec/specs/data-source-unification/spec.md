# Data Source Unification

## ADDED Requirements

### Requirement: GeoJSON is the single source of truth
The system SHALL use GeoJSON files under `src/lib/data/` as the only authoritative data source for facilities.

#### Scenario: Build database
- **WHEN** `npm run build:db` is executed
- **THEN** it reads only GeoJSON files
- **AND** it does not read any CSV files

### Requirement: No CSV files in scripts directory
The `scripts/` directory SHALL NOT contain any `.csv` files.

#### Scenario: List scripts directory
- **WHEN** listing files in `scripts/`
- **THEN** no files with `.csv` extension exist

### Requirement: Minimal scripts directory
The `scripts/` directory SHALL contain only `migrate-to-sqlite.ts` and `smoke-test.ts`.

#### Scenario: List scripts directory
- **WHEN** listing files in `scripts/`
- **THEN** only `migrate-to-sqlite.ts` and `smoke-test.ts` are present
- **AND** no geocoding, audit, or update scripts remain

### Requirement: Data flow documentation
The AGENTS.md file SHALL document the data flow from GeoJSON to SQLite to Browser.

#### Scenario: Read AGENTS.md
- **WHEN** a developer reads AGENTS.md
- **THEN** they understand that GeoJSON is the source of truth
- **AND** they know to edit GeoJSON files directly
- **AND** they know to run `npm run build:db` after editing
