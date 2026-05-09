# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev              # Start Vite dev server without D1 binding
npm run dev:d1           # Start local Cloudflare Worker/D1 development server
npm run build            # Production build (D1/API path; no static DB generation)
npm run build:db:local   # Generate dev-only local SQLite validation DB in .local/
npm run d1:schema:local  # Apply D1 schema to local D1
npm run audit:data       # Audit GeoJSON data quality (read-only)
npm run audit:private-data # Fail if private data or bulk DB artifacts are tracked
npm run validate:d1-seed # Validate private D1 seed JSON before import
npm run deploy:preview   # Deploy Worker using wrangler env.preview
npm run deploy:prod      # Deploy Worker using wrangler env.production
npm run preview          # Preview production build
npm run check            # Type-check with svelte-check
npm run check:watch      # Type-check in watch mode
npm run test             # Run unit tests (Vitest + MockRepository)
npm run test:e2e         # Run E2E tests (Playwright)
npm run smoke            # Build + start preview server + verify HTTP 200
```

## Architecture

This is a **SvelteKit + MapLibre GL + Cloudflare D1** application using Svelte 5 runes mode. SQLite remains available only as a dev/local validation format.

### Stack Overview

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | SvelteKit 2.x + Svelte 5 | UI framework with runes mode |
| **Database** | Cloudflare D1 | Production public serving database behind Worker API |
| **Maps** | MapLibre GL + svelte-maplibre-gl | Interactive map rendering |
| **Styling** | Tailwind CSS v4 | Utility-first CSS |
| **Testing** | Vitest (unit) + Playwright (E2E) | Test framework |
| **Build** | Vite | Build tool and dev server |
| **Version Control** | Jujutsu (jj) | Primary VCS (git colocated) |

### Database Architecture

Production data is served from Cloudflare D1 through Worker/SvelteKit API routes. The browser must not download a bulk SQLite database from static assets.

**D1 Public Serving Schema** (`d1/schema.sql`):
- `categories` — Recycling categories (dry-battery, rechargeable-battery, etc.)
- `category_details` — Warnings and examples per category
- `collectors` — Collection organizations (JBRC, city offices)
- `wards` — City/ward information
- `ward_categories` — Many-to-many: which categories each ward accepts
- `facilities` — Recycling facility locations
- `facility_categories` — Many-to-many: which categories each facility accepts

**Server Data Access**:
```
src/lib/server/d1-repository.ts    # D1 query implementation for server API routes
src/routes/api/                   # Minimized public API responses
src/lib/data.ts                   # Browser-facing fetch wrapper used by components
```

**Data Flow**:
1. Private pipeline generates private D1 seed/import artifacts from normalized data
2. Cloudflare D1 stores public serving tables
3. Worker/SvelteKit API routes query D1 through the `RECYCLING_DB` binding
4. Browser code fetches minimized API responses through `src/lib/data.ts`
5. Local SQLite may be generated only as a dev-only validation artifact outside `static/`

### Data Source of Truth

The long-term source of truth is the separate private data pipeline: upstream snapshots, raw source responses, normalized private data, geocoding cache, and quality reports.

The current repository still contains GeoJSON as a transitional derived input:

- `src/lib/data/tokyo/toshima.geojson` — Toshima ward facilities (derived app input)
- `src/lib/data/tokyo/chiyoda.geojson` — Chiyoda ward facilities (derived app input)

Do not publish `static/recycling.db` or any other bulk database file. If local SQLite inspection is needed, run `npm run build:db:local`, which writes `.local/recycling-dev.db`.

Private CSV snapshots, raw HTML/JSON responses, geocoding caches, complete normalized private datasets, D1 seed/import dumps, and local validation databases must not be committed to this public app repository. See `docs/data-pipeline-policy.md`.

**Scripts directory** (`scripts/`) contains current build/audit scripts:
- `src/lib/db/migrate.ts` — Dev-only local SQLite validation script that reads transitional GeoJSON
- `tests/smoke.ts` — Build verification script
- `scripts/audit-geojson.ts` — GeoJSON data quality audit
- `scripts/audit-private-data-boundary.ts` — public repository private-data boundary audit
- `scripts/validate-d1-public-data.ts` — validates private D1 seed JSON before import

CSV files that were removed earlier were old app/runtime data sources or intermediate files. New upstream snapshots and D1 seed/import outputs are kept in the private data pipeline project, not under `docs/`.

### Key Implementation Details

**Svelte 5 Runes Mode**:
- Use `$state`, `$props`, `$derived`, `$effect` — NOT legacy `let`/`export let`
- State proxies must be spread `[...array]` when passing to functions

**Category System**:
- Battery types are split: `dry-battery`, `rechargeable-battery`, `button-battery`
- Categories are filtered by selected wards dynamically
- Each category has color, icon, and optional warnings/details

**Map Rendering**:
- Tiles from OpenFreeMap (no API key)
- 68 facilities displayed as markers
- Markers filter based on selected categories

**Testing Strategy**:
- **Unit tests**: MockRepository for business logic (Vitest)
- **E2E tests**: Real browser with SQLite (Playwright)
- **Smoke tests**: Build + preview server + HTTP 200 check (`npm run smoke`)
- **Critical**: `npm run check` and `npm run test` do NOT catch SSR runtime errors.
  Always run `npm run smoke` (or manually `curl` the dev server) when changes involve
  browser-only APIs (`localStorage`, `window`, `document`) or SvelteKit SSR rendering.
- Run `npm run test` before committing

### File Organization

```
src/
├── lib/
│   ├── components/        # Svelte components
│   │   ├── AppHeader.svelte
│   │   ├── CategoryBar.svelte
│   │   ├── SearchBar.svelte
│   │   ├── WardSelector.svelte
│   │   └── SettingsSidebar.svelte
│   ├── db/               # Database layer
│   ├── data.ts           # Data access API
│   ├── registry.ts       # Ward registry
│   └── types.ts          # TypeScript types
├── routes/
│   ├── +layout.svelte    # Root layout
│   ├── +page.svelte      # Main map page
│   └── layout.css        # Global styles
```

### Adding New Data

**Modify Facilities**:
1. Edit the relevant GeoJSON file in `src/lib/data/{prefecture}/{city}.geojson`
2. Run `npm run build:db` to regenerate SQLite
3. Verify with `npm run smoke`

**New Ward**:
1. Add ward to `WARD_REGISTRY` in `src/lib/registry.ts`
2. Add GeoJSON file to `src/lib/data/{prefecture}/{city}.geojson`
3. Run `npm run build:db` to regenerate SQLite
4. Update ward's available categories in migration script if needed

**Geocoding (for new facility coordinates)**:
- For Japanese addresses, use **GSI Japan Address Search API** first (`https://msearch.gsi.go.jp/address-search/AddressSearch?q=...`)
- Use Google Geocoding API only as a fallback for failed or review-needed rows.
- Do NOT use Nominatim for Japanese addresses — it frequently returns no results or incorrect coordinates
- Do NOT rate geocoding confidence by exact Japanese address string equality. Differences like `491-3` versus `491番地` are normal notation changes, not low-confidence evidence by themselves.
- Do NOT assign fallback coordinates such as municipality centroids without explicit human approval.
- Example: `curl -s "https://msearch.gsi.go.jp/address-search/AddressSearch?q=豊島区東池袋4-5-2"`

**New Category**:
1. Add to `src/lib/db/categories.json`
2. Add category details (warnings, examples) if needed
3. Update `src/lib/types.ts` CategoryId type
4. Run `npm run build:db`
5. Update migration script to assign category to facilities

### Common Issues

**D1 binding missing**:
- Local D1-backed development should use `npm run dev:d1`, which runs Wrangler with the preview environment locally
- `wrangler.toml` uses the binding name `RECYCLING_DB`
- Root Wrangler config intentionally has no D1 binding; preview and production bindings live under explicit environments

**Proxy object errors**:
- Spread state arrays: `getFacilities([...selectedCities], [...selectedCategories])`

**D1 query errors**:
- D1 uses `prepare(...).bind(...).all<T>()` and `first<T>()`
- Keep API responses minimized; do not add private pipeline fields to public responses

## Deployment

This project is deployed to **Cloudflare Workers with Static Assets**.

**Important context**: Cloudflare is consolidating Pages into the Workers platform. New projects are created under **Workers & Pages** (unified) in the Cloudflare dashboard, where the deployment model is essentially Workers with Static Assets. The legacy standalone "Cloudflare Pages" project type is being phased out.

### Configuration

- **Adapter**: `@sveltejs/adapter-cloudflare` (not `adapter-cloudflare-workers`)
- **Build command**: `npm run build`
- **Build output**: `.svelte-kit/cloudflare`
- **Required files**:
  - `wrangler.toml` — Must include `main`, `[assets]` block with `directory` and `binding`
  - `worker-configuration.d.ts` — Generated via `npx wrangler types`

### Example `wrangler.toml`

```toml
name = "svelte-maplibre-app01-dev"
main = ".svelte-kit/cloudflare/_worker.js"
compatibility_date = "2026-04-29"

[assets]
directory = ".svelte-kit/cloudflare"
binding = "ASSETS"

[env.preview]
name = "svelte-maplibre-app01-preview"

[[env.preview.d1_databases]]
binding = "RECYCLING_DB"
database_name = "recycling-facilities-preview"
database_id = "<replace-with-preview-d1-id>"

[env.production]
name = "svelte-maplibre-app01"

[[env.production.d1_databases]]
binding = "RECYCLING_DB"
database_name = "recycling-facilities-prod"
database_id = "<replace-with-production-d1-id>"
```

### Deploy settings (Cloudflare Dashboard)

| Setting | Value |
|---------|-------|
| Build command | `npm run build` |
| Deploy command | `npm run deploy:prod` |
| Root directory | `/` |

Do **not** use bare `npx wrangler deploy` in the Cloudflare Git integration for production. It uses the root Wrangler environment, which is dev-only and has no production D1 binding. Use `npm run deploy:prod` so `[env.production]` and `recycling-facilities-prod` are selected.

The root Wrangler worker name must remain distinct from `[env.production].name`. Keep the root name dev-only, for example `svelte-maplibre-app01-dev`, so an accidental bare deploy cannot update the production Worker. Root config must not contain placeholder D1 database IDs.

Do **not** use GitHub Actions for deployment — the Cloudflare Git integration handles builds and deployments automatically.

## Skills

This repository includes a local Jujutsu skill for agents that support project-level skills:

- `.agents/skills/jujutsu-skill/SKILL.md`
- `.codex/skills/jujutsu-skill/SKILL.md`

Use this skill when working with `jj` commands, bookmarks, rebasing, revsets, or conflict resolution in this repository.

### Jujutsu Workflow

- For any new feature, fix, or OpenSpec change, prefer a separate `jj workspace` over a bookmark-only workflow. Use sibling directories named `{repo}.{workspace}` and keep the workspace name equal to the directory name.
- Workspace creation patterns:
  - Pattern A: derive from `main` for normal isolated work, for example `jj workspace add ../svelte-maplibre-app01.feature-a -r main`
  - Pattern B: omit `-r` to inherit the current working state when you want an agent to continue what you are already editing, for example `jj workspace add ../svelte-maplibre-app01.feature-a`
  - Pattern C: derive from any specific revision, such as `jj workspace add ../svelte-maplibre-app01.feature-a -r @-`, `jj workspace add ../svelte-maplibre-app01.feature-a -r abc123`, or `jj workspace add ../svelte-maplibre-app01.feature-a -r my-branch`
- Always use `../...` or an absolute path with `jj workspace add`. Do not run `jj workspace add feature-a`, which would create a nested workspace inside the current one.
- Use one workspace per concurrent AI agent. Do not rely on `jj new` alone inside the same workspace when agents may touch the same files or generated assets. Use bookmarks for publishing and remote tracking, not as the primary isolation boundary.
- Recommended one-time setup: `jj config set --user snapshot.auto-update-stale true`. Optional zsh safeguard: `preexec() { [[ -d .jj ]] && jj status >/dev/null 2>&1 }`.
- Dependencies, caches, and untracked files are workspace-local. Run installs inside each workspace as needed, and manually link or copy files such as `.env`.
- Cleanup requires both `jj workspace forget <name>` and removal of the sibling workspace directory.

### Agent Harness

- This repository uses `jj` as the only supported VCS CLI for agent work. Do not use the `git` command in this repo, even for read-only inspection. Use `jj st`, `jj log`, `jj diff`, `jj git fetch`, and `jj git push` instead.
- A repo-local shim is provided at `.codex/shims/git` to hard-block any `git` invocation and print the `jj` equivalent. This is intentional.
- Launch agent shells and agent commands through `.codex/with-agent-path.sh` so the shim is placed first on `PATH`. Example: `.codex/with-agent-path.sh codex` or `.codex/with-agent-path.sh zsh`.
- When operationally feasible, prefer non-colocated Jujutsu/Git repos as an additional guardrail. For an existing repo, use `jj git colocation disable`. For new repos, use `jj git clone --no-colocate` or set `git.colocate = false`.
## Aliases

- `$lib` → `src/lib/` (SvelteKit default)
