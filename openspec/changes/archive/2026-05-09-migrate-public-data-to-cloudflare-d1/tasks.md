## 1. Data Boundary And Validation

- [x] 1.1 Update `.gitignore` and private-data boundary audit rules to reject data-bearing D1 seed/import dumps, generated local SQLite validation databases, and static public database artifacts.
- [x] 1.2 Add a validation command that fails when required public fields, valid coordinates, unique public facility IDs, or category relationships are missing from the D1 import source.
- [x] 1.3 Verify existing Phase 1 private pipeline outputs can provide all approved public fields needed by the app before any D1 import is generated.
- [x] 1.4 Document which artifacts are private operational artifacts versus committed schema/config artifacts.

## 2. D1 Schema And Environment Setup

- [x] 2.1 Add D1-compatible schema migration files for categories, category details, collectors, wards, ward categories, facilities, and facility categories.
- [x] 2.2 Add local, preview, and production D1 binding configuration to `wrangler.toml` without using production as the default development target.
- [x] 2.3 Generate or update Cloudflare environment types so server code can access the D1 binding safely.
- [x] 2.4 Add documented commands for applying schema migrations to local, preview, and production D1.

## 3. Private Pipeline D1 Seed Generation

- [x] 3.1 Add private pipeline export logic that generates D1 seed/import data from normalized private records using approved public fields only.
- [x] 3.2 Add optional dev-only SQLite validation output outside public static assets and outside tracked public app files.
- [x] 3.3 Add deduplication output that merges same-facility categories and writes ambiguous duplicate candidates to a private review report.
- [x] 3.4 Add geocoding quality gates that block unresolved failed or low-confidence rows from production D1 seed output.
- [x] 3.5 Import seed data into local D1 and verify row counts, category relationships, and sample facility queries.

## 4. Worker API And Data Layer

- [x] 4.1 Add SvelteKit server routes or server load functions for category, ward, facility list, facility detail, and search/filter queries backed by D1.
- [x] 4.2 Ensure API responses expose only approved public fields and omit raw source, geocoding cache, provider payload, and internal review fields.
- [x] 4.3 Add an API-backed repository/data access implementation that preserves existing UI data shapes.
- [x] 4.4 Switch the UI data path to the API-backed implementation for D1 environments while keeping any transitional fallback explicit and non-production.
- [x] 4.5 Add tests for D1 query mapping, API response minimization, filtering, and search behavior.

## 5. Remove Production Static SQLite Serving

- [x] 5.1 Stop producing or bundling `static/recycling.db` in production builds once the D1 API path is active.
- [x] 5.2 Remove browser production dependence on `sql.js` and `static/recycling.db`, or gate it as dev-only fallback.
- [x] 5.3 Update `README.md`, `AGENTS.md`, and `docs/data-pipeline-policy.md` to describe the D1 production path and dev-only SQLite validation path.
- [x] 5.4 Run `npm run audit:private-data`, schema/seed validation, and app checks after static SQLite production serving is disabled.

## 6. Verification And Rollout

- [x] 6.1 Run local D1-backed development verification and confirm map markers, ward/category filters, search, and facility details match expected behavior.
- [x] 6.2 Deploy or run against preview D1 and verify API responses do not expose bulk database artifacts or private fields.
- [x] 6.3 Run `npm run check`, `npm run test`, and `npm run smoke`; run E2E tests if the data-loading path changes substantially.
- [x] 6.4 Import validated seed data to production D1 only after preview verification passes.
- [x] 6.5 Run final production smoke verification against the D1-backed Worker deployment.
- [x] 6.6 Use `jj describe` to describe the completed D1 migration change after tasks are finished.
