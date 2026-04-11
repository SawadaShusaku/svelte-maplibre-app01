# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start development server (http://localhost:5173)
npm run build        # Production build
npm run preview      # Preview production build
npm run check        # Type-check with svelte-check
npm run check:watch  # Type-check in watch mode
```

No test framework is configured in this project.

## Architecture

This is a **SvelteKit + MapLibre GL** application using Svelte 5 runes mode.

**Key dependencies:**
- `svelte-maplibre-gl` — Svelte component wrapper around MapLibre GL JS
- `tailwindcss` (v4, Vite plugin) — utility CSS, loaded globally via `src/routes/layout.css`
- `@sveltejs/adapter-auto` — auto-detects deployment target

**Stack decisions:**
- Svelte 5 runes mode is enforced globally (configured in `svelte.config.js`); use `$state`, `$props`, `$derived`, `$effect` — not legacy `let`/`export let` reactivity
- Tailwind v4 is configured via the `@tailwindcss/vite` plugin (no `tailwind.config.js` file — configuration is done in CSS with `@import 'tailwindcss'`)
- Map tiles come from OpenFreeMap (`https://tiles.openfreemap.org/styles/liberty`) — no API key required

**Routing:**
- `src/routes/+layout.svelte` — root layout, imports global CSS and sets favicon
- `src/routes/+page.svelte` — main page, renders the MapLibre map

**Aliases:**
- `$lib` → `src/lib/` (SvelteKit default)