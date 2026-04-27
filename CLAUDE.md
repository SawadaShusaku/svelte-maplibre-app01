# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev              # Start development server (http://localhost:5173)
npm run build            # Production build (includes DB migration)
npm run build:db         # Migrate GeoJSON to SQLite only
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

**New Ward**:
1. Add ward to `WARD_REGISTRY` in `src/lib/registry.ts`
2. Add GeoJSON file to `src/lib/data/{prefecture}/{city}.geojson`
3. Run `npm run build:db` to regenerate SQLite
4. Update ward's available categories in migration script if needed

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
