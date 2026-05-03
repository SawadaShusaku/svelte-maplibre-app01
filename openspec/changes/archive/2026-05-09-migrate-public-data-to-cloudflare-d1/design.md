## Context

The public app currently builds `static/recycling.db` from GeoJSON and loads that database in the browser through `sql.js`. This is simple and fast, but it makes the full derived database publicly downloadable as a static asset. Because the project now has a private data pipeline for nationwide source snapshots, geocoding metadata, and quality reports, production serving needs to move to a narrower API surface.

Cloudflare D1 fits the existing deployment target because the app already deploys to Cloudflare Workers with Static Assets. D1 also keeps the serving database behind Worker bindings, allowing the app to return only approved fields per request instead of exposing a complete SQLite file.

## Goals / Non-Goals

**Goals:**

- Serve production facility data through Cloudflare D1 and SvelteKit/Worker API routes.
- Stop bundling `static/recycling.db` as a production static asset.
- Keep SQLite useful as a local/dev validation format, but store it outside public static assets and outside committed distributable files.
- Generate D1 schema and seed/import artifacts from private normalized data using only approved public fields.
- Support separate local, preview, and production D1 databases so development never writes to production by accident.
- Preserve the current UI workflows: ward/category filtering, facility search, map markers, and popup/detail display.
- Document deduplication and GeoJSON transitional requirements explicitly.

**Non-Goals:**

- This change does not expand data coverage or collect new upstream sources.
- This change does not publish private CSV/raw/geocoding cache data.
- This change does not require removing every GeoJSON file immediately; GeoJSON may remain as a transitional derived input until D1 generation is fully connected.
- This change does not make D1 a source of truth. D1 is a public-serving database derived from the private normalized pipeline.

## Decisions

### Decision: D1 is the production serving database

Production SvelteKit server routes will query D1 through Cloudflare environment bindings, such as `env.RECYCLING_DB`. Browser code will call app API routes rather than downloading a database file.

Rationale: D1 prevents bulk static database download and allows the Worker to minimize response fields. It also aligns with the Cloudflare Workers deployment target.

Alternative considered: Continue serving static SQLite and hide the URL. This does not solve redistribution risk because static assets remain directly fetchable.

### Decision: Use separate local, preview, and production databases

`wrangler.toml` will define distinct D1 bindings/environments for local development, preview/staging, and production. Seed and migration commands must target the intended environment explicitly.

Rationale: D1 migrations and imports can alter real data. Separate databases reduce the chance of test imports affecting production.

Alternative considered: Use one shared D1 database for all environments. This is operationally simpler but too risky for a data pipeline that regenerates seed artifacts.

### Decision: Local SQLite remains dev-only

Local SQLite may be generated for validation and fast inspection, but it must live outside `static/`, outside public build outputs, and outside committed private data. The production build must fail if a bulk database is present in static public assets.

Rationale: SQLite remains valuable for schema checks and local diffing, but public static distribution is the issue to remove.

Alternative considered: Ban SQLite entirely. That would remove a useful validation tool and make D1 import debugging harder.

### Decision: D1 seed artifacts are private operational artifacts

The private data pipeline will generate D1 schema/seed/import files from normalized records. These artifacts are not committed to the public app repository unless they contain only schema without data. Data-bearing seed dumps are treated like private CSV snapshots.

Rationale: A seed file can be equivalent to redistributing the dataset. Keeping it private preserves the same boundary as CSV/raw/cache files.

Alternative considered: Commit seed SQL for reproducible deployments. This is convenient but conflicts with the non-redistribution policy.

### Decision: API responses expose approved public fields only

Server routes will return fields needed by the app, such as facility id, name, address, coordinates, categories, ward, display URLs, hours, and notes. Raw source rows, geocoding cache/provider payloads, source query details, and internal review metadata remain private.

Rationale: The app needs display data, not the full provenance dataset. Field minimization reduces accidental redistribution and preserves future flexibility.

### Decision: Deduplication happens before D1 import

The private pipeline will merge facilities that represent the same public place using normalized address, coordinate proximity, source IDs, category overlap, and name similarity. Ambiguous matches will be reported for human review and not silently merged.

Rationale: D1 should receive app-ready public facilities. Merging inside request handlers would make behavior unpredictable and harder to audit.

Alternative considered: Import every source row and deduplicate at query time. This leaks source-row structure into production and makes multi-category facilities harder to reason about.

### Decision: GeoJSON is transitional

Current GeoJSON files may remain during migration, but new D1 import generation should target a public facility model rather than requiring GeoJSON as an intermediate. If GeoJSON is generated, it must use the existing schema and be treated as a derived artifact.

Rationale: This avoids blocking migration on a full data pipeline rewrite while making clear that GeoJSON is no longer the long-term source of truth.

## Risks / Trade-offs

- [Risk] D1 request latency may be higher than reading in-memory `sql.js`. → Mitigation: add indexes, keep response shapes small, and consider endpoint-level caching for category/ward metadata.
- [Risk] D1 local/preview/prod environments can drift. → Mitigation: use the same schema migration files and seed validation across environments.
- [Risk] Removing `static/recycling.db` can break browser-only code paths. → Mitigation: introduce API-backed repository behind the existing data access functions before removing the old path.
- [Risk] D1 seed artifacts may accidentally be committed. → Mitigation: expand private data boundary audits and ignore rules for seed dumps and generated local databases.
- [Risk] Deduplication may merge distinct facilities at the same address. → Mitigation: require name/category/source review thresholds and generate a human review report for ambiguous candidates.

## Migration Plan

1. Add D1 schema and Wrangler environment bindings for local, preview, and production.
2. Add private pipeline export scripts that generate validated D1 seed/import artifacts and optional dev-only SQLite inspection databases outside public assets.
3. Add server API routes for categories, wards, facilities, and search/filter queries.
4. Add an API-backed repository implementation and switch UI data loading to it.
5. Run local D1 import and smoke tests through `wrangler dev` or equivalent Worker execution.
6. Deploy to preview D1 and verify API responses and UI behavior.
7. Remove production dependence on `static/recycling.db` and add guardrails that fail if bulk DB artifacts are in public assets.
8. Import to production D1 and deploy the Worker-backed app.

Rollback: Keep the current static SQLite path until preview validation passes. If production D1 serving fails during rollout, revert the app route switch while keeping private seed artifacts out of public assets.

## Open Questions

- What exact D1 database names should be used for local, preview, and production?
- Should public API endpoints return all facilities for the initial map load, or page/filter results by bounding box and selected categories?
- Should preview deployments always use a dedicated preview D1 database, or one staging database shared across previews?
