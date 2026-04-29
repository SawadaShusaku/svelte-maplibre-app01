## Why

The project currently has multiple data sources (GeoJSON, CSV, SQLite) and scripts scattered across the `scripts/` directory, creating confusion about which file is the "source of truth." This has led to mistakes where CSV was incorrectly modified instead of GeoJSON, and where legacy code (`mapBatteryCategory`) was accidentally reintroduced. A complete cleanup is needed to prevent future inconsistencies.

## What Changes

- **Remove all CSV files** (`scripts/*.csv`) — GeoJSON is the single source of truth
- **Remove obsolete scripts** (`geocode*.ts`, `audit-toshima.ts`, `find-missing-facilities.ts`, `update-toshima-categories.ts`, etc.)
- **Keep only essential build scripts** (`migrate-to-sqlite.ts`, `smoke-test.ts`)
- **Update `AGENTS.md`** to clearly document the data flow: GeoJSON → SQLite → Browser
- **Update `package.json`** if script paths change
- **Clean up `src/lib/data/`** — ensure only valid GeoJSON files remain

## Capabilities

### New Capabilities
- `data-source-unification`: Single source of truth (GeoJSON) with clear build pipeline

### Modified Capabilities
- `recycle-data`: Update data migration to remove CSV dependencies

## Impact

- `scripts/` directory will contain only `migrate-to-sqlite.ts` and `smoke-test.ts`
- All `*.csv` files removed
- `AGENTS.md` updated with authoritative data flow documentation
- No runtime code changes
- No breaking changes to user-facing features
