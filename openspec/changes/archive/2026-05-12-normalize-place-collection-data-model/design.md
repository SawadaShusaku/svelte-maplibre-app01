## Context

The current public D1 schema treats a `facilities` row as both the map place and the source-specific collection record. That was workable while rows mostly came from one local GeoJSON/SQLite path, but national D1 data exposes the mismatch: the same real-world place can appear in multiple source datasets with different listing names, address notation, hours, notes, and URLs.

The app needs one marker per real-world place, but it also needs to keep category-specific collection information. For example, one public office may collect ink cartridges and cooking oil, with different listing names and data-source notes. The model must therefore distinguish:

- the map place shown to users
- the category-specific collection entries available at that place
- the data source that supplied each entry

Private raw CSV/HTML/geocoding artifacts remain outside this public app repository. Public D1 only stores approved serving fields.

## Goals / Non-Goals

**Goals:**

- Make `places` the marker/search/detail identity for a real-world collection location.
- Make `place_collection_entries` the category/source-specific data unit.
- Rename `collectors` to `data_sources` because these records describe public data sources, not always collection operators.
- Support multiple active categories at one place, including three or more categories.
- Preserve category-specific listing names, listing addresses, source URLs, hours, notes, and location hints.
- Add `is_active`, `created_at`, and `updated_at` to mutable public serving tables.
- Add `source_fetched_at` and optional `source_published_at` to collection entries/data sources where the private pipeline can provide them.
- Use stronger deterministic normalization and `dedupe_key` for stable place identity.
- Avoid `confidence` fields and score-based public serving decisions.

**Non-Goals:**

- Do not store raw upstream source payloads, scraping request data, geocoding provider response bodies, or private review comments in public D1.
- Do not introduce vector search as an automatic merge authority.
- Do not solve every historical ambiguous duplicate manually in this change; the model should make the next dedupe/import safer.
- Do not keep long-term compatibility with `facilities` as the canonical public table after the migration is complete.

## Decisions

### Use `places` for the map unit

`places` stores the canonical map identity: area, display name, display address, normalized address, coordinates, `dedupe_key`, active state, and timestamps.

This separates marker identity from category/source details. It also makes low-zoom clustering and marker filtering easier because each marker corresponds to one place.

Alternative considered: keep `facilities` and add more columns. That would preserve less code, but it keeps mixing source-specific fields with place-level fields and makes future updates harder.

### Use `place_collection_entries` for category/source rows

Each active collection entry links one place, one category, and one data source. It stores the data-source listing fields:

- `source_display_name`
- `source_address`
- `normalized_source_address`
- `source_url`
- `hours`
- `notes`
- `location_hint`
- `source_fetched_at`
- `source_published_at`
- `is_active`
- `created_at`
- `updated_at`

This is intentionally more specific than a pure join table. A plain `place_categories` table cannot preserve data-source-specific display and update information.

Alternative names considered:

- `place_category_offerings`: accurate but less readable.
- `place_collection_services`: sounds like a business service rather than a data row.
- `place_collection_entries`: best fit because it represents a public collection listing entry at a place.

### Rename `collectors` to `data_sources`

The existing `collectors` table name implies the organization that physically collects items. In practice, the row represents the public data source or listing organization: JBRC, Battery Association, Ink Cartridge Satogaeri, Tokyo cooking-oil collection page, and similar sources.

The new `data_sources` table stores source identity, URL, optional organization name, optional public license/use note, fetch timestamp, active state, and timestamps.

### Normalize addresses before dedupe, but keep source listing addresses

The private pipeline should normalize full-width/half-width numbers, Japanese address notation such as `丁目`, `番地`, `番`, `号`, hyphen variants, and common postal-code prefixes before grouping. This normalized value belongs in comparison fields:

- `places.normalized_address`
- `place_collection_entries.normalized_source_address`

The source listing address should still be retained in `source_address` when it is useful public information. The representative `places.display_address` should be the app's chosen public display address.

### Normalize names for dedupe, not for source display

Dedupe should normalize common corporate and source notation such as:

- `㈱`
- `（株）`
- `株式会社`
- spacing differences
- municipality prefixes like `城陽市 保健センター` vs `保健センター`
- category/location suffixes such as `ストックヤード`, `回収拠点`, `回収ボックス`

The source listing name should still be retained in `source_display_name`.

### Keep `dedupe_key`, avoid `confidence`

`dedupe_key` is a deterministic identity helper derived from normalized area, address, and name evidence. It helps keep place IDs stable across imports.

`confidence` is intentionally excluded. It invites expanding subjective scoring, human-check status, and ambiguous decision states. The model should instead use deterministic keys, active flags, validation failures, and private review reports.

### API compatibility through mapping

The browser-facing data shape can remain close to the current `PublicFacility` shape initially. Server repository queries should aggregate active collection entries per place and serialize:

- place id/name/address/coordinates/area
- list of active categories
- entry-level source details for detail panels
- approved media fields where available

This keeps UI migration manageable while the storage model changes underneath.

### GeoJSON/local validation path

Any transitional GeoJSON or local SQLite validation output must be able to represent the new model explicitly:

- a place-level object for marker identity
- nested or joined collection entries for categories/source listing information

The public app must not reintroduce committed bulk seed data or static database artifacts.

## Risks / Trade-offs

- [Risk] D1 migration touches core serving queries and may break production filtering/search if partially deployed. → Use preview D1 first, validate counts and known duplicates, then import production after schema and API are deployed.
- [Risk] Renaming `facilities` can create a large code diff. → Keep public TypeScript/API adapters stable during the first implementation, then rename frontend types only if it reduces confusion.
- [Risk] Stronger dedupe normalization may merge colocated but distinct counters in the same building. → Preserve collection entries with `location_hint` and data-source listing fields; only merge at `places` level when same-place evidence is deterministic.
- [Risk] Timestamps from sources may be unavailable. → Require `created_at`/`updated_at`; make `source_published_at` nullable.
- [Risk] Existing review CSV was pair-oriented. → Replace future review output with group-oriented reports keyed by proposed `dedupe_key`/place group; delete obsolete left/right reports when no longer needed.
- [Risk] Public D1 schema migration cannot be fully rolled back without reimporting data. → Keep previous seed artifacts private, import preview first, and make production rollback a reimport of the previous known-good seed.

## Migration Plan

1. Add new schema tables: `areas`, `data_sources`, `places`, `place_collection_entries`, and supporting indexes.
2. Update private seed/export tooling to generate the new tables from normalized private data.
3. Strengthen normalization and `dedupe_key` generation before grouping rows into places.
4. Update D1 repository queries to read from places and active collection entries.
5. Update API serialization to aggregate categories and expose entry-level details without private fields.
6. Update frontend types/UI only where needed to show category-specific source details.
7. Validate private seed JSON, import preview D1, and verify known duplicate examples and three-category places.
8. Import production D1 after preview verification.
9. Remove or deprecate obsolete `facilities`/`facility_categories` paths once the new model is stable.
