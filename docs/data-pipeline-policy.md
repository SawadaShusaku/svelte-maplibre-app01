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

## Approved Public Facility Fields

Derived public facility outputs should be minimized to fields required by the app:

- stable public facility ID
- name
- normalized address
- latitude and longitude
- categories
- city/ward identifiers and labels
- hours, notes, official URL, and category URLs when approved for display
- collector/source label suitable for public UI

Private-only fields such as raw payloads, full source query details, private cache entries, and full upstream snapshots must remain private.

## Geocoding Rules

Use GSI Japan Address Search API first for Japanese address-to-coordinate geocoding.

Use Google Geocoding API only for rows that fail GSI or need focused review. Google Places may be useful for name repair, but it is not the default address-to-coordinate provider.

Never assign municipality centroids, city hall coordinates, or category representative points as silent fallbacks. Failed rows must remain unresolved until reviewed or explicitly approved.

`geocode_confidence` is not an exact Japanese address string equality score. Normal notation differences such as `491-3` versus `491番地`, full-width digits, kanji numerals, postal codes, or building-name omission do not make a row low confidence by themselves.

Use:

- `high`: administrative area is consistent
- `medium`: parent city is consistent but ward/district changed or needs review
- `low`: prefecture or municipality clearly contradicts the source row

Rows with `medium` or `low` confidence must carry `geocode_review_reason`.

## Deduplication Rules

The private pipeline should preserve source provenance per upstream row. Public outputs should deduplicate real-world facilities before display.

Use these signals:

- normalized address
- coordinates
- source IDs and source names
- normalized facility name and name similarity
- category overlap

If two rows represent the same physical facility and accept multiple categories, publish one facility with multiple categories. Do not create duplicate public markers for the same location.

If a duplicate decision is ambiguous, leave records unmerged and report them for human review.
