## Context

The facility detail popup is rendered inside `src/routes/+page.svelte` using `svelte-maplibre-gl`'s `<Popup>` component, which wraps MapLibre GL JS's native popup. The popup content is a custom Tailwind-styled card that includes a color bar, facility name, prefecture label, address, category chips, optional hours/notes, and a routing action row with a `<select>` for travel mode and a "経路を検索" button.

Current pain points:
- The prefecture label (`東京都`) is redundant because all data is currently Tokyo-only.
- The popup anchor is at the marker coordinate, so the popup bottom overlaps the marker icon.
- The travel mode `<select>` is visually unpolished and the "手段:" label adds clutter.
- The close button (✕) is only 24 px, making it hard to hit.
- The "経路を検索" button is narrow.
- Padding (`p-5`) consumes too much of the popup's limited width (320 px), leaving almost no room for future URL/hours content.

## Goals / Non-Goals

**Goals:**
- Remove redundant prefecture label
- Raise popup above the marker via MapLibre `offset`
- Replace the `<select>` travel-mode picker with a compact icon segment control
- Enlarge close button and routing CTA for better accessibility
- Reduce padding to reclaim content space
- Keep all changes within the existing desktop popup component

**Non-Goals:**
- Mobile bottom-sheet redesign (out of scope; will be handled in a separate change)
- Adding new data fields (URL, hours) to the database or data layer
- Changing marker icons or map behavior beyond popup positioning

## Decisions

### 1. Icon segment control instead of styled `<select>`
- **Rationale:** A row of three icon buttons (🚶‍♂️ / 🚲 / 🚗) is more compact, requires no custom select styling (which can be flaky inside map popups), and communicates the options instantly. It also removes the need for the "手段:" label.
- **Alternative considered:** Styling the native `<select>` with Tailwind's `appearance-none`. Rejected because MapLibre popup content has historically had issues with certain form control interactions, and the visual result is still inferior to a purpose-built segment control.

### 2. Use MapLibre `offset` for vertical clearance
- **Rationale:** MapLibre's `Popup` supports an `offset` option that accepts a pixel offset `[x, y]`. Setting `offset={[0, -24]}` moves the popup upward by 24 px, creating visual clearance above the marker without changing the anchor logic.
- **Alternative considered:** Adding margin to the popup content itself. Rejected because it would break the tip alignment and the glass-morphism CSS in `layout.css`.

### 3. Reduce padding uniformly
- **Rationale:** Changing `p-5` (20 px) to `p-4` (16 px) on the main content area and adjusting action-row padding from `px-5 pb-5 pt-3` to `px-4 pb-4 pt-3` reclaims ~16 px of horizontal space without making the popup feel cramped.

### 4. Close button: 32 px with increased contrast
- **Rationale:** The current 24 px button is below the WCAG 2.5.5 target size recommendation (44 px). While we can't always hit 44 px in dense UIs, 32 px is a reasonable compromise. We'll also darken the hover state for better affordance.

## Risks / Trade-offs

- **[Risk]** MapLibre `offset` may cause the popup to render partially off-screen near map edges if the offset is too large.  
  → **Mitigation:** Use a modest offset (24 px) and rely on MapLibre's built-in anchor auto-switching (`top`, `bottom`, etc.) to keep the popup in view.
- **[Risk]** Reducing padding could make the popup feel too tight on very small desktop viewports.  
  → **Mitigation:** The width remains 320 px (`w-80`), which is comfortable down to ~360 px viewports. If issues arise, we can add a media-query override later.
- **[Risk]** The icon segment control uses emoji, which may render differently across OSes.  
  → **Mitigation:** Emoji are widely supported on modern OSes. If consistency becomes critical, we can swap in SVG icons in a future iteration without changing the component structure.

## Migration Plan

No migration needed. This is a pure UI change with no data or API impact.

## Open Questions

None.
