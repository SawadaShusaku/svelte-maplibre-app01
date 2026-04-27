# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev              # Build DB then start development server (http://localhost:5173)
npm run build            # Production build (includes DB migration)
npm run build:db         # Migrate GeoJSON to SQLite (src/lib/db/migrate.ts)
npm run preview          # Preview production build
npm run check            # Type-check with svelte-check
npm run check:watch      # Type-check in watch mode
npm run test             # Run unit tests (Vitest + MockRepository)
npm run test:e2e         # Run E2E tests (Playwright)
npm run smoke            # Build + start preview server + verify HTTP 200
```

## Architecture

This is a **SvelteKit + MapLibre GL + SQLite** application using Svelte 5 runes mode.

### Stack Overview

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | SvelteKit 2.x + Svelte 5 | UI framework with runes mode |
| **Database** | SQLite (sql.js) | Client-side embedded database |
| **Maps** | MapLibre GL + svelte-maplibre-gl | Interactive map rendering |
| **Styling** | Tailwind CSS v4 | Utility-first CSS |
| **Testing** | Vitest (unit) + Playwright (E2E) | Test framework |
| **Build** | Vite | Build tool and dev server |

### Database Architecture

**SQLite Database Schema** (`src/lib/db/schema.sql`):
- `categories` — Recycling categories (dry-battery, rechargeable-battery, etc.)
- `category_details` — Warnings and examples per category
- `collectors` — Collection organizations (JBRC, city offices)
- `wards` — City/ward information
- `ward_categories` — Many-to-many: which categories each ward accepts
- `facilities` — Recycling facility locations
- `facility_categories` — Many-to-many: which categories each facility accepts

**Repository Pattern** (`src/lib/db/`):
```
src/lib/db/
├── repository.ts          # Interface definition
├── sqljs-repository.ts    # Browser implementation (sql.js)
├── mock-repository.ts     # Test implementation (in-memory)
├── index.ts              # Factory and exports
├── init.ts               # Database initialization
├── schema.sql            # Database schema
└── categories.json       # Category definitions
```

**Data Flow**:
1. Build time: `scripts/migrate-to-sqlite.ts` converts GeoJSON → SQLite
2. Runtime: `sql.js` loads `static/recycling.db` in browser
3. Repository interface abstracts database operations
4. Components use `data.ts` functions which delegate to Repository

### Data Source of Truth

**GeoJSON files are the single source of truth** for facility data.

- `src/lib/data/tokyo/toshima.geojson` — Toshima ward facilities (master)
- `src/lib/data/tokyo/chiyoda.geojson` — Chiyoda ward facilities (master)

The SQLite database (`static/recycling.db`) is a **build artifact** generated from GeoJSON. It must never be edited directly. To change facility data, edit the GeoJSON files and run `npm run build:db`.

**Scripts directory** (`scripts/`) contains only two files:
- `migrate-to-sqlite.ts` — Build script that reads GeoJSON and produces SQLite
- `smoke-test.ts` — Build verification script

All other data transformation scripts (geocoding, CSV conversion, auditing) have been removed. Data corrections should be made directly in GeoJSON.

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
- For Japanese addresses, use **GSI Japan Address Search API** (`https://msearch.gsi.go.jp/address-search/AddressSearch?q=...`)
- Do NOT use Nominatim for Japanese addresses — it frequently returns no results or incorrect coordinates
- Example: `curl -s "https://msearch.gsi.go.jp/address-search/AddressSearch?q=豊島区東池袋4-5-2"`

**New Category**:
1. Add to `src/lib/db/categories.json`
2. Add category details (warnings, examples) if needed
3. Update `src/lib/types.ts` CategoryId type
4. Run `npm run build:db`
5. Update migration script to assign category to facilities

### Common Issues

**sql.js WASM loading**:
- Ensure `static/sql-wasm.wasm` exists
- Check `locateFile` in `init.ts` returns correct path

**Proxy object errors**:
- Spread state arrays: `getFacilities([...selectedCities], [...selectedCategories])`

**Type errors with sql.js**:
- sql.js doesn't have `.all()` method; use `step()` + `getAsObject()` loop
- See `SqlJsRepository` for correct pattern

## Aliases

- `$lib` → `src/lib/` (SvelteKit default)
