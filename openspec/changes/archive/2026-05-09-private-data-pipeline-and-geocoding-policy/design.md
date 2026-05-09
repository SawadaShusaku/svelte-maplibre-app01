## Context

The public SvelteKit app currently builds `static/recycling.db` from GeoJSON files under `src/lib/data/`. Phase 1 collection has now produced private CSV snapshots and geocoded outputs for JBRC, ink cartridge, button battery, Tokyo cooking oil, and heated tobacco device collection points in a separate data pipeline project.

Those CSVs and raw source responses may contain upstream site data that should not be published as full static downloads. The app therefore needs a documented boundary: private data collection and normalization happen outside the public app, while the public app consumes only approved derived artifacts.

## Goals / Non-Goals

**Goals:**

- Define private normalized data as the long-term source of truth.
- Keep CSV/raw/geocoding cache out of the public app repository.
- Preserve current GeoJSON-to-SQLite behavior as a transitional implementation detail.
- Define how future public artifacts are generated from private data.
- Define geocoding provider order, confidence semantics, and audit fields.
- Make duplicate handling and GeoJSON schema expectations explicit.

**Non-Goals:**

- Do not implement the full private DB or D1 serving migration in this change.
- Do not remove current GeoJSON or `static/recycling.db` until public serving replacement is designed.
- Do not publish source CSV snapshots or raw upstream responses.
- Do not make Google Places the default geocoder for address-to-coordinate work.

## Decisions

### Decision: Separate Private Source Data From Public Serving Artifacts

Private upstream snapshots, normalized private tables, geocoding cache, and quality reports live outside the public app repository. The public app receives only derived GeoJSON, SQLite, D1 data, or Worker API responses.

Alternatives considered:

- Keep CSVs in the public app: rejected because full source snapshots may be legally and operationally risky to redistribute.
- Keep GeoJSON as the permanent source of truth: rejected for long-term nationwide data because it does not preserve upstream provenance, geocoding state, and private/public boundaries well enough.

### Decision: Current GeoJSON Remains a Transitional Derived Input

The current app may continue to build SQLite from GeoJSON while the serving architecture is redesigned. GeoJSON must be treated as derived from private normalized data once the pipeline is connected.

The current GeoJSON schema remains explicit for derived outputs: each Feature is a Point with `id`, `prefecture`, `city`, `cityLabel`, `name`, `address`, and `categories`, plus optional hours/notes/URLs and coordinates.

### Decision: Deduplicate Before Public Output

The private pipeline should preserve source provenance per upstream row, but public artifacts should merge duplicate facilities when they represent the same real-world location.

Deduplication should use normalized address, coordinates, source IDs, and name similarity. A facility that accepts multiple categories should become one public facility with multiple categories, not duplicated markers. Ambiguous duplicates should be reported for human review rather than silently merged.

### Decision: Geocode With GSI First, Google Fallback Second

Japanese address geocoding uses GSI Japan Address Search API first. Google Geocoding API is only a fallback for failed rows or review-needed rows. Nominatim is not used for Japanese addresses.

Google Places is useful for place/name repair, but ordinary address-to-coordinate work should use Geocoding API rather than Places as the primary fallback.

### Decision: Confidence Is Administrative Consistency, Not String Equality

`geocode_confidence` must not compare Japanese addresses by exact string equality. Japanese geocoders normalize addresses aggressively: `491-3`, `491番地`, full-width digits, kanji numerals, building names, and postal codes may differ while still identifying the same place.

Confidence should be based on whether the returned coordinate and match address are administratively plausible:

- `high`: source prefecture/municipality and match administrative area are consistent.
- `medium`: same parent city or plausible administrative rename, such as old ward name to current ward name.
- `low`: clear prefecture or municipality contradiction.

Each `medium` or `low` row should include `geocode_review_reason`.

## Risks / Trade-offs

- [Risk] Public artifacts may lag private source updates. → Mitigation: document generated artifact timestamps and source snapshots.
- [Risk] Over-aggressive deduplication can merge distinct facilities. → Mitigation: keep provenance and require review for ambiguous duplicates.
- [Risk] Under-aggressive deduplication can show duplicate map markers. → Mitigation: add audit reports for same address/coordinate and similar names.
- [Risk] Google fallback can incur cost or quota usage. → Mitigation: use only for failed/review-needed rows and cache results privately.
- [Risk] Current app still serves a static SQLite artifact. → Mitigation: treat it as transitional and plan the D1/Worker serving migration separately.
- [Risk] OpenSpec currently contains older GeoJSON-first assumptions. → Mitigation: update specs and docs to distinguish current implementation from long-term source of truth.

## Migration Plan

1. Keep Phase 1 private collection outputs outside the public app repository.
2. Update specs and documentation with private source-of-truth and geocoding policy.
3. Add validation checks that fail if private CSV/raw/cache files appear in the public app repo.
4. Add/adjust audit tooling to preserve coordinate source and geocode review fields.
5. Design the next change for private normalized DB to public D1/Worker/derived GeoJSON generation.
6. Only after the public serving replacement is ready, seal or remove static full-download artifacts that should not remain public.

Rollback is documentation-only for this change: revert the OpenSpec/docs updates if the project chooses to keep the old GeoJSON-first model.

## Open Questions

- Which private normalized DB format should be the first implementation target: SQLite, DuckDB, Cloudflare D1 seed, or another format?
- Should the public app ultimately query Cloudflare D1 directly through Workers, or generate a reduced static artifact?
- What minimum public fields are safe and useful for each category?
- Which deduplication thresholds require human review before public output?
