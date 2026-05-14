# Data Pipeline Policy

## Purpose

This project separates private upstream data collection from public application serving data.

The long-term source of truth is the private normalized data pipeline. The public app repository contains app code, schema-only D1 migrations, documentation, and derived GeoJSON inputs during the transition. It must not contain full upstream CSV snapshots, raw upstream responses, private geocoding caches, D1 seed/import dumps, local validation databases, or downloadable static facility databases.

## Phase 1 Outputs

Phase 1 private collection outputs live in the separate private data pipeline project, not in this public app repository.

Expected Phase 1 sources:

- JBRC small rechargeable battery collection points
- JBRC bicycle rechargeable battery collection points
- Ink cartridge Satogaeri collection points
- Battery Association of Japan button battery collection points
- Tokyo used cooking oil collection points
- TIOJ heated tobacco device collection points

Before public data derivation, each source output must have:

- no missing `address`
- no missing `lat` / `lon`
- no duplicate `source_id`
- no replacement characters in text fields

## Private Data Boundary

Do not commit these to the public app repository:

- generated upstream CSV snapshots
- raw upstream HTML, JSON, or API responses
- geocoding caches
- full normalized private datasets
- generated D1 seed/import SQL, JSON, or dumps containing facility rows
- generated SQLite validation databases
- static public database files such as `static/recycling.db`
- bulk source collection scripts that are only meaningful for private snapshots

The public app may contain:

- OpenSpec policy and design docs
- application build and validation scripts
- derived GeoJSON during the transition
- schema-only D1 migration files
- Worker/SvelteKit API code that returns minimized public fields

## Public Serving Rules

Production serving uses Cloudflare D1 through the `RECYCLING_DB` Worker binding. The browser must call app API routes and must not download a full database file.

Recommended D1 database names:

- `recycling-facilities-dev`
- `recycling-facilities-preview`
- `recycling-facilities-prod`

Use the same binding name, `RECYCLING_DB`, for all environments.

Local SQLite is allowed only as a development or validation artifact outside public static assets, for example under `.local/` or in the private data pipeline project.

## Approved Public Serving Fields

Derived public outputs should be minimized to fields required by the app.

Place-level fields:

- stable public place ID
- canonical display name
- display address and normalized address
- latitude and longitude
- area identifiers and labels
- approved place-level media fields
- active flag and update timestamps
- deterministic dedupe key

Collection-entry fields:

- stable public entry ID
- place ID, category ID, and data source ID
- listing name and listing address from the public source
- source URL
- hours, notes, and location hints when approved for display
- approved entry-level media fields
- source fetched/published timestamps where available
- active flag and update timestamps

Private-only fields such as raw payloads, full source query details, private cache entries, private review metadata, full upstream snapshots, and confidence-like fields must remain private.

## Geocoding Rules

Use Google Geocoding API as the unified address-to-coordinate provider for public map coordinates. Existing upstream coordinates, including source CSV coordinates, must not be mixed into public serving data without an explicit migration decision; regenerate them through the same Google Geocoding workflow so distance-based place grouping uses one coordinate basis.

Use GSI Japan Address Search API only for comparison, audit, or exception investigation. Do not use a chained public coordinate workflow that tries GSI before Google, because GSI can return a coarse or wrong representative point while still appearing to succeed.

Never assign municipality centroids, city hall coordinates, or category representative points as silent fallbacks. Failed rows must remain unresolved until reviewed or explicitly approved.

Do not use confidence score fields in the public schema, public API, or public seed output. Normal notation differences such as `491-3` versus `491番地`, full-width digits, kanji numerals, postal codes, or building-name omission are address normalization issues, not public confidence states.

Rows that fail geocoding or contradict the source area must stay in the private pipeline with deterministic review status and review reasons until reviewed or explicitly approved.

## Deduplication Rules

The private pipeline should preserve source provenance per upstream row. Public outputs should deduplicate real-world facilities before display.

Use these signals:

- normalized address
- coordinates
- source IDs and source names
- normalized facility name and name similarity
- category overlap

If two rows represent the same physical facility and accept multiple categories, publish one facility with multiple categories. Do not create duplicate public markers for the same location.

If two sources differ only by normal Japanese address notation, corporate notation, or category-specific facility suffixes, normalize those differences before deduplication.

The public D1 model stores one deduplicated `place` and multiple `place_collection_entries` for category-specific source details. If a duplicate decision is ambiguous, leave records unmerged and report group-oriented review candidates. Do not generate left/right pair reports for new review output.
