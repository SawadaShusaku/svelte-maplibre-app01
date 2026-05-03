## Context

The current `SettingsSidebar` component renders all display settings inline: marker style radio buttons, color picker, and logo font radio buttons are all visible at once in a single scrollable panel. As more customization options are added (additional font targets, future theme settings), this inline approach becomes cluttered and hard to scan.

The current font system uses a single `font-style.ts` module that only supports logo font selection via CSS custom property `--logo-font`. Users have requested the ability to customize fonts for other text elements, particularly popup content which uses a different font family (`Noto Serif JP` / `Iowan Old Style`).

## Goals / Non-Goals

**Goals:**
- Restructure sidebar settings into a two-level navigation: a top-level section list, and detail views per section
- Support per-element font customization: logo title, popup text (headings + body), and general UI text
- Persist sidebar view state and all font choices to localStorage
- Maintain existing Tailwind CSS + Svelte 5 runes architecture

**Non-Goals:**
- Changing popup layout, positioning, or responsive behavior (bottom sheet vs floating)
- Adding new map markers, filters, or data sources
- Supporting arbitrary font uploads (only curated Google Fonts)
- Theme/color scheme customization beyond what's already implemented

## Decisions

### Decision: Single `currentSection` state for sidebar navigation
Instead of multiple boolean flags (`showMarkerSettings`, `showFontSettings`, etc.), use a single string state `currentSection: 'home' | 'marker' | 'fonts' | 'info'`.
- **Rationale**: Simpler to extend when adding new sections. Matches native settings app patterns.
- **Alternative considered**: Separate boolean flags — rejected because it allows invalid states (multiple sections open) and requires more boilerplate.

### Decision: CSS custom properties for all font targets
Define `--font-logo`, `--font-popup`, and `--font-ui` as CSS variables on `:root`. The `font-style.ts` module updates these variables directly via `document.documentElement.style.setProperty()`.
- **Rationale**: Avoids prop-drilling font choices through multiple component layers. Any component can reference the CSS variable.
- **Alternative considered**: Svelte context or global store — rejected because CSS variables are the native web platform solution for theming and work instantly without re-rendering Svelte components.

### Decision: One Google Fonts `@import` with all weights
Load all needed font families and weights in a single CSS `@import` in `layout.css`.
- **Rationale**: Reduces HTTP requests. Current approach already does this for Dela Gothic One.
- **Alternative considered**: Dynamic font loading per selection — rejected because it would cause visible font swap delays when users change settings.

### Decision: localStorage over cookies
Store preferences in localStorage, not cookies.
- **Rationale**: These are purely client-side UI preferences. No server-side rendering depends on them. localStorage has larger capacity and simpler API.
- **Alternative considered**: Cookies — rejected because this is a static site deployed to Cloudflare Workers; cookies add unnecessary request overhead.

### Decision: Reuse existing `brand-display` class pattern
Apply fonts through the existing `.brand-display` class mechanism, extended with additional utility classes like `.font-popup` and `.font-ui`.
- **Rationale**: Minimizes CSS changes. The existing architecture already uses CSS variables + class names.

## Risks / Trade-offs

- **[Risk] Flash of Unstyled Content (FOUC)** when switching fonts: Google Fonts are already loaded, but switching CSS variables to a different family may cause a brief re-layout. 
  → **Mitigation**: All fonts are preloaded via `@import`. The swap is typically imperceptible for single-word logo text. For longer popup text, the effect is acceptable for a settings change.

- **[Risk] Sidebar state lost on deep-link**: If a user shares a URL while in a section detail view, the recipient sees the default home view.
  → **Mitigation**: This is intentional — sidebar view state is transient UI state, not application state. Only persistent preferences (font choices, marker style) are stored.

- **[Trade-off] Increased CSS bundle size**: Preloading 4+ font families increases initial CSS payload.
  → **Mitigation**: Google Fonts `@import` is non-blocking. Fonts are loaded lazily. The increase is small (<50KB) compared to the existing map library payload.

## Migration Plan

No database or API migration needed. This is a pure client-side UI change.

1. Deploy new code
2. Existing localStorage keys (`recycling-map:logo-font`) will be migrated/deprecated gracefully — if old key exists, read it as the logo font default, then save to new key format
3. Rollback: Revert commit — no data loss since preferences are client-side only

## Open Questions

- Should font choices apply to map attribution text as well? (Currently excluded — applying to MapLibre internal UI is complex and may conflict with map tile styles.)
- Should we add a "Reset to defaults" button in the sidebar? (Not in initial scope, but easy to add later.)
