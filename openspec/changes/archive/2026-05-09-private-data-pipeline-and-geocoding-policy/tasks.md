## 1. Spec And Documentation Alignment

- [x] 1.1 Update `openspec/config.yaml` to describe private normalized data as the long-term source of truth and GeoJSON/SQLite as transitional derived artifacts.
- [x] 1.2 Update `openspec/specs/data-source-unification/spec.md` with the private source-of-truth and public artifact boundary.
- [x] 1.3 Update `openspec/specs/data-validation-pipeline/spec.md` with geocoding provider, confidence, review, and fallback-coordinate rules.
- [x] 1.4 Update public app `AGENTS.md` and `README.md` so developers do not treat private CSV/raw/cache files as public app assets.
- [x] 1.5 Run `openspec validate data-source-unification --type spec` and `openspec validate data-validation-pipeline --type spec`.

## 2. Public Repository Guardrails

- [x] 2.1 Add or verify ignore rules that prevent private CSV/raw/geocoding cache files from being tracked in the public app repository.
- [x] 2.2 Add a lightweight audit command or script check that fails if generated private collection CSVs or geocoding caches are present in tracked app files.
- [x] 2.3 Document how to keep Phase 1 outputs in the private data pipeline repository instead of the public app repository.

## 3. Geocoding Policy Implementation

- [x] 3.1 Ensure the private data pipeline geocoder records `coordinate_source`, `geocoded_at`, `geocode_query`, `geocode_match_address`, `geocode_status`, `geocode_confidence`, and `geocode_review_reason`.
- [x] 3.2 Ensure GSI is the first geocoder for Japanese addresses and Google Geocoding is only used for failed or review-needed rows.
- [x] 3.3 Ensure `geocode_confidence` does not use exact Japanese address string equality and does not mark normal notation differences as `low`.
- [x] 3.4 Ensure failed geocoding rows remain unresolved until reviewed, without assigning municipality centroids or other silent fallback coordinates.

## 4. Derived Public Data Rules

- [x] 4.1 Define the approved public facility fields for derived GeoJSON/SQLite/D1 outputs.
- [x] 4.2 Define deduplication inputs and review thresholds using normalized address, coordinates, source IDs, and name similarity.
- [x] 4.3 Ensure facilities accepting multiple categories are represented as one public facility with multiple categories where appropriate.
- [x] 4.4 Add a report for ambiguous duplicate candidates that require human review.

## 5. Verification And Handoff

- [x] 5.1 Verify Phase 1 source outputs remain complete: no missing address, no missing lat/lon, no duplicate `source_id` for the six generated CSV outputs.
- [x] 5.2 Record remaining `medium` geocoding review cases and confirm that no `low` geocoding cases remain unresolved before deriving public data.
- [x] 5.3 Run relevant app checks after documentation or guardrail changes, at minimum `npm run check` if app code changes and `npm run smoke` if build/runtime data flow changes.
- [x] 5.4 Use `jj describe` to describe the completed change after tasks are finished.
