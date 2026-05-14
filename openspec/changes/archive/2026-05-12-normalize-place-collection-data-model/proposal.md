## Why

The current public D1 model stores place-level data and category/source-specific collection data on the same `facilities` row, which makes deduplication, source attribution, and category-specific display data awkward once multiple data sources describe the same real-world place. We need a normalized model that keeps one map marker per place while preserving the per-category source details needed for accurate public display and future updates.

## What Changes

- **BREAKING** Replace the public serving model centered on `facilities` + `facility_categories` with a normalized place collection model centered on `places` + `place_collection_entries`.
- Rename the source master concept from `collectors` to `data_sources` because the table represents public data sources and listing organizations, not always the real-world collection operator.
- Store place-level fields on `places`: canonical display name, display address, normalized address, coordinates, area, stable `dedupe_key`, active flag, and timestamps.
- Store category/source-specific fields on `place_collection_entries`: category, data source, data-source listing name/address, normalized listing address, listing URL, hours, public notes, location hint, active flag, source fetch/publish dates, and timestamps.
- Preserve a single marker per real-world place while allowing multiple category collection entries, including three or more categories at one place.
- Strengthen address and name normalization before deduplication, including full-width/half-width numeric differences, Japanese address notation, corporate abbreviations such as `㈱` / `（株）` / `株式会社`, and municipality/name prefixes.
- Keep `confidence` out of the public and private decision model; use deterministic normalization, `dedupe_key`, `is_active`, and private review output instead.
- Update D1 seed generation, repository queries, public API serialization, tests, and private-data validation to use the new model without committing data-bearing seed artifacts to this public repository.

## Capabilities

### New Capabilities
- `place-collection-data-model`: Defines the normalized public serving model for map places, category-specific collection entries, data sources, active-state handling, timestamps, and dedupe keys.

### Modified Capabilities
- `cloudflare-d1-serving`: Public D1 queries and API responses must read from the normalized place/collection-entry model while preserving map, search, detail, and filtering behavior.
- `d1-seed-generation`: Seed export/import must produce `places`, `place_collection_entries`, `data_sources`, and related tables from the private normalized pipeline.
- `place-deduplication-quality`: Deduplication must generate stable place identities using stronger address/name normalization and group-level merging rather than pair-oriented output.
- `map-markers`: Marker rendering must treat `places` as the marker unit and aggregate all active collection entries for category badges and filters.
- `facility-search`: Search must work across place display fields and category-specific collection entry fields.
- `facility-media-display`: Approved media must attach to the appropriate place or collection entry without exposing token-bearing URLs or source internals.
- `private-data-pipeline`: Private pipeline outputs must keep source-specific listing data and update timestamps without leaking raw upstream data into the public repository.

## Impact

- D1 schema and migration/import scripts under `d1/`, `src/lib/db/`, and `scripts/`.
- Server repository and API serialization under `src/lib/server/` and `src/routes/api/`.
- Browser data adapter and map/detail UI under `src/lib/data.ts`, `src/lib/types.ts`, `src/routes/+page.svelte`, and map helper modules.
- Private pipeline seed artifacts in the separate data project; generated JSON/SQL remain private and must not be committed here.
- Tests for repository behavior, public API shape, deduplication, marker rendering, search, and private-data boundary audits.
