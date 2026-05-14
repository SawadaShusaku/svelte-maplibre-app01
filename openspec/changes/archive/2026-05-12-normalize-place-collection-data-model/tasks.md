## 1. Schema And Contract Validation

- [x] 1.1 Confirm current production and preview D1 table shapes and record counts for `facilities`, `facility_categories`, and media columns.
- [x] 1.2 Add tests or validation fixtures for the target normalized shape: `areas`, `data_sources`, `places`, and `place_collection_entries`.
- [x] 1.3 Define the public TypeScript contract for place-backed facility responses, including aggregated categories and collection entry details.
- [x] 1.4 Validate that `confidence` fields are not introduced in public D1 schema, public API responses, or seed validation output.

## 2. D1 Schema Migration

- [x] 2.1 Add D1 schema definitions for `areas`, `data_sources`, `places`, and `place_collection_entries` with `is_active`, timestamps, `dedupe_key`, normalized address fields, and indexes.
- [x] 2.2 Decide and document whether legacy `wards` aliases to `areas` during migration or is replaced directly.
- [x] 2.3 Add indexes for active place queries, category filtering, area filtering, dedupe key lookup, and search-relevant text fields.
- [x] 2.4 Add local schema validation that can create the normalized schema without private data files.

## 3. Seed Generation And Data Normalization

- [x] 3.1 Update private/public seed generation adapter to emit normalized public tables from the existing private seed JSON without committing generated data.
- [x] 3.2 Strengthen Japanese address normalization for full-width and half-width numbers, `丁目`, `番地`, `番`, `号`, postal-code prefixes, and hyphen variants.
- [x] 3.3 Strengthen name normalization for `㈱`, `（株）`, `株式会社`, spacing, municipality prefixes, and category/location suffixes.
- [x] 3.4 Generate deterministic `dedupe_key` values and stable place IDs from normalized area/address/name evidence.
- [x] 3.5 Replace pair-oriented duplicate review output with group-oriented review output and remove obsolete left/right terminology from new reports.
- [x] 3.6 Generate a normalized private D1 seed JSON/SQL and validate row counts, active flags, timestamps, category relationships, and absence of internal notes.

## 4. Repository And API Migration

- [x] 4.1 Update D1 repository queries to read active `places` and active `place_collection_entries`.
- [x] 4.2 Preserve browser-facing map list behavior by aggregating active categories per place.
- [x] 4.3 Add place detail serialization with category-specific collection entry details and public data source metadata.
- [x] 4.4 Update category filtering so a place matches when any active collection entry matches the selected category.
- [x] 4.5 Update search to match place display fields and active collection entry listing fields.
- [x] 4.6 Ensure public serialization excludes raw source payloads, private review metadata, dedupe keys, and confidence-like fields.

## 5. UI And Marker Integration

- [x] 5.1 Update frontend types and data adapter to accept place-backed responses while keeping existing map workflows working.
- [x] 5.2 Update marker rendering tests for places with two categories and places with three or more categories.
- [x] 5.3 Update detail or popup UI to show category-specific listing name/address/source/hours/notes/location hint where useful.
- [x] 5.4 Verify approved media rendering works for place-level and entry-level media without token-bearing URLs.

## 6. Preview And Production Data Migration

- [x] 6.1 Apply the normalized schema and import normalized seed data to preview D1.
- [x] 6.2 Verify preview D1 counts, known duplicate groups, three-category places, category filters, search, and detail responses.
- [x] 6.3 Run `npm run check`, `npm run test`, `npm run build`, and `npm run smoke`.
- [x] 6.4 Run `npm run deploy:preview -- --dry-run` after build validation.
- [x] 6.5 After preview verification, apply the normalized schema and import normalized seed data to production D1.
- [x] 6.6 Verify production D1 counts, known duplicate groups, three-category places, category filters, search, and detail responses.
- [x] 6.7 Run `jj describe` after production data verification.

## 7. OpenSpec And Cleanup

- [x] 7.1 Update docs and AGENTS guidance for the normalized model, relative private export paths, and data-source terminology.
- [x] 7.2 Remove or deprecate obsolete duplicate review artifacts that use left/right terminology once group-oriented output exists.
- [x] 7.3 Validate the OpenSpec change and touched specs.
- [x] 7.4 Summarize migration results, remaining private review items, and rollback notes.
