## Why

The app currently serves `static/recycling.db` as a public static asset, which allows bulk download of the derived facility database and is too close to redistributing upstream collection data. Phase 1 private data collection is complete enough to design the public-serving migration now: keep SQLite useful for local validation, but stop shipping a downloadable database in production.

## What Changes

- **BREAKING**: Production data access moves from browser-loaded `sql.js` + `static/recycling.db` to Cloudflare Worker/SvelteKit server endpoints backed by Cloudflare D1.
- Add Cloudflare D1 configuration, schema/migration files, and separate development/production database bindings.
- Add a private-data-pipeline export step that produces D1 seed/import artifacts from approved public fields only.
- Keep local SQLite or local D1 as a dev-only validation target, stored outside public static assets and not committed as redistributable data.
- Add server API endpoints that return only minimized app-facing facility/category/ward data, not full upstream snapshots or raw private fields.
- Update the repository data layer so the UI can read through the same app-facing API in production and development.
- Add build/deploy guardrails to prevent `static/recycling.db`, CSV snapshots, raw dumps, geocoding caches, or D1 seed dumps from being bundled as public assets.

## Capabilities

### New Capabilities
- `cloudflare-d1-serving`: Public app data serving through Cloudflare D1 bindings and Worker/SvelteKit API endpoints.
- `d1-seed-generation`: Generation and validation of D1 schema/seed artifacts from the private normalized pipeline while keeping local SQLite dev-only.

### Modified Capabilities
- `private-data-pipeline`: Clarify that D1 import/seed artifacts and local SQLite validation databases are private operational artifacts unless explicitly minimized and served through APIs.
- `data-source-unification`: Replace production static SQLite serving with D1/Worker serving as the public data path, while treating GeoJSON/static SQLite as transitional or dev-only artifacts.

## Impact

- `wrangler.toml`, Cloudflare D1 database bindings, local/preview/production environment configuration.
- New D1 schema/migration/seed files or scripts, likely under `d1/` or a private pipeline export target.
- `src/lib/db/*`, `src/lib/data.ts`, and SvelteKit server routes for facility/category/ward queries.
- Removal or production exclusion of `static/recycling.db` and `sql.js` as the primary public-serving path.
- Private pipeline project `map-datasources-app`, which will generate approved public D1 seed/import artifacts from normalized private data.
- Build, smoke, and data-boundary audits to ensure no bulk redistributable database is published as a static asset.
