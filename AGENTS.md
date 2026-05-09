# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Vite dev server (no D1) |
| `npm run dev:d1` | Local Wrangler dev server with D1 |
| `npm run build` | Production build |
| `npm run check` | Type-check with svelte-check |
| `npm run test` | Unit tests (Vitest + MockRepository) |
| `npm run test:e2e` | E2E tests (Playwright) |
| `npm run smoke` | **Build + preview + HTTP 200** — run this for SSR/browser-API changes |
| `npm run build:db:local` | Dev-only SQLite validation DB → `.local/recycling-dev.db` |
| `npm run d1:schema:local` | Apply D1 schema to local D1 |
| `npm run audit:data` | GeoJSON data quality audit (read-only) |
| `npm run audit:private-data` | Fail if private data or bulk DB artifacts are tracked |
| `npm run validate:d1-seed` | Validate private D1 seed JSON before import |
| `npm run normalize:d1-seed` | Normalize legacy seed JSON → public D1 JSON/SQL |
| `npm run deploy:preview` | Deploy to preview Worker |
| `npm run deploy:prod` | Deploy to production Worker |

## Architecture

**SvelteKit + MapLibre GL + Cloudflare D1**, Svelte 5 runes mode.

- **Database**: Cloudflare D1 for production serving; SQLite only as dev/local validation outside `static/`.
- **Data flow**: private pipeline → D1 seed → Cloudflare D1 → Worker API → browser. See [docs/data-pipeline-policy.md](docs/data-pipeline-policy.md) for private-data boundaries and [docs/normalized-place-collection-model.md](docs/normalized-place-collection-model.md) for schema details.
- **Server access**: `src/lib/server/d1-repository.ts` (D1 queries), `src/routes/api/` (API routes), `src/lib/data.ts` (browser fetch wrapper).
- **Map**: OpenFreeMap tiles (no API key); one marker per deduplicated place; markers filter via active `place_collection_entries`.

### Key Implementation Details

- **Svelte 5 runes**: use `$state`, `$props`, `$derived`, `$effect` — never legacy `let` / `export let`. Spread proxies before passing to functions: `getFacilities([...selectedCities], [...selectedCategories])`.
- **Categories**: `dry-battery`, `rechargeable-battery`, `button-battery`. Each has color, icon, optional warnings/details.
- **Testing**: Unit (Vitest), E2E (Playwright). **`npm run check` and `npm run test` do NOT catch SSR runtime errors** — always run `npm run smoke` when changes involve `localStorage`, `window`, `document`, or SSR rendering.

### Adding New Data

1. Update/regenerate in the separate private data pipeline project.
2. Generate seed under a private path such as `../map-datasources-app/exports/d1/`.
3. Validate: `npm run validate:d1-seed -- <path>`.
4. Apply `d1/schema.sql` and import to **preview D1** first; verify counts, filters, search, and detail responses.
5. After preview verification, apply to production D1.

**Geocoding rules** (details in [docs/data-pipeline-policy.md](docs/data-pipeline-policy.md)):
- GSI Japan Address Search API first; Google Geocoding API fallback.
- Never Nominatim. Never assign fallback centroids without human approval.
- Do NOT add confidence score fields to public schema/API/seed.

**New category**:
1. Add to `src/lib/db/categories.json`.
2. Update `src/lib/types.ts` `CategoryId`.
3. Run `npm run build:db`.
4. Update migration script to assign category to facilities.

## Common Issues

- **D1 binding missing**: use `npm run dev:d1` (Wrangler preview env). Binding name is `RECYCLING_DB`.
- **Proxy object errors**: spread state arrays before passing to functions.
- **D1 query errors**: use `prepare(...).bind(...).all<T>()` / `first<T>()`. Keep API responses minimized.

## Deployment

Cloudflare **Workers with Static Assets**.

- **Adapter**: `@sveltejs/adapter-cloudflare`
- **Build**: `npm run build` → `.svelte-kit/cloudflare`
- **Required files**: `wrangler.toml` (root env = production; preview under `[env.preview]`), `worker-configuration.d.ts`
- **Binding**: `RECYCLING_DB`
- Do **not** use GitHub Actions — Cloudflare Git integration handles builds/deploys automatically.

### Safe Chain (Supply-chain Security)

This project uses [Aikido Safe Chain](https://github.com/AikidoSec/safe-chain) to protect against malicious npm packages during builds.

**Cloudflare Dashboard Build Command** (already configured):
```bash
curl -fsSL https://github.com/AikidoSec/safe-chain/releases/latest/download/install-safe-chain.sh | sh -s -- --ci && npm run build
```

**Deploy commands** (`npm run deploy:prod`, `npm run deploy:preview`) do **not** need modification — Safe Chain only intercepts package installs, not deployments.

**For local development**: See README.md for installation instructions.

## Skills & VCS

- **Jujutsu workflow**: see `.codex/skills/jujutsu-skill/SKILL.md`
- **OpenSpec skills**: see `.opencode/skills/`
- Use `jj`, never `git`. Launch agents through `.codex/with-agent-path.sh` so the git shim is active.

## Aliases

- `$lib` → `src/lib/` (SvelteKit default)
