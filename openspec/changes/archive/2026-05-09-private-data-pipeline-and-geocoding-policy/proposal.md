## Why

Phase 1 data collection produced private nationwide CSV snapshots and geocoded outputs for multiple external recycling sources, while the public app still assumes GeoJSON/static SQLite as the practical data path. We need a formal change to preserve the new source-of-truth and geocoding policy before starting the larger DB/public-serving migration.

## What Changes

- Define the private data pipeline as the long-term authoritative source for upstream snapshots, normalized records, geocoding cache, and quality reports.
- Keep raw CSV/HTML/JSON/geocoding cache out of the public application repository and static public assets.
- Treat GeoJSON, static SQLite, D1, or other public-serving datasets as derived artifacts.
- Standardize geocoding policy: GSI first, Google Geocoding fallback only for failed or review-needed rows, no Nominatim for Japanese addresses.
- Standardize `geocode_confidence` as administrative-area consistency, not exact Japanese address string equality.
- Require review reasons for unresolved geocoding ambiguity and forbid silent fallback coordinates such as municipality centroids.
- Add implementation tasks to align documentation, validation, and generated public data with the private pipeline policy.

## Capabilities

### New Capabilities
- `private-data-pipeline`: Defines private upstream snapshots, normalized data, derived public artifacts, and repository boundaries.

### Modified Capabilities
- `data-source-unification`: Update source-of-truth requirements from current GeoJSON-only assumptions to private normalized data with derived GeoJSON/SQLite/public DB artifacts.
- `data-validation-pipeline`: Add geocoding provider, confidence, audit, and failure-handling requirements.

## Impact

- Affected repositories: public app repository and the separate private data collection repository.
- Affected app artifacts: `src/lib/data/**/*.geojson`, `static/recycling.db`, future D1/public API datasets, and related docs.
- Affected private artifacts: source CSVs, raw upstream responses, geocoding cache, normalized private DB, and quality reports.
- Affected documentation: `AGENTS.md`, `README.md`, OpenSpec specs, and future implementation tasks.
