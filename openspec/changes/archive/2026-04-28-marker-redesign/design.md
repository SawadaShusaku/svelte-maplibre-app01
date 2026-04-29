## Context

Currently, map markers in `src/routes/+page.svelte` are rendered as inline SVGs using a diagonal `linearGradient` to blend multiple category colors. For facilities with 3+ categories, the gradient creates muddy, indistinct colors that make it hard to identify which categories are accepted at a glance. The marker rendering logic is embedded directly in the page component, making it difficult to maintain or extend with alternative styles.

## Goals / Non-Goals

**Goals:**
- Replace gradient-based multi-category markers with visually distinct, hard-edged color segmentation
- Support 1, 2, and 3+ category facilities with appropriate visual treatments
- Extract marker rendering into a reusable Svelte component
- Allow users to switch between marker styles via settings sidebar
- Persist style preference across sessions

**Non-Goals:**
- 3D markers or WebGL-based marker rendering (out of scope for this change)
- Changing the popup design or category bar
- Adding new map data sources or layers
- Animating marker colors over time

## Decisions

### 1. SVG Donut Ring for 3+ Categories
Instead of a full pie chart inside the pin shape, use a donut ring around the existing white center circle. The ring is divided into proportional segments using SVG arc paths clipped to the pin shape.

**Rationale:** The pin shape is taller than it is wide (32×42). A full pie chart at the top would leave the pointed bottom uncolored or force tiny segments near the tip. A donut ring around `(16,17)` with inner radius `r=7` and outer radius `r=13` fits cleanly within the pin body while preserving the white center circle as a visual anchor.

**Alternatives considered:**
- Full pin-shaped clipPath over a pie chart: Segments near the tip become too thin to distinguish
- Horizontal half-split for all multi-category cases: Doesn't scale beyond 2 categories
- Striped pattern: Visually noisy, looks like a barcode

### 2. Adaptive Default Style
Default to an adaptive style that switches rendering based on category count:
- 1 category → solid color
- 2 categories → vertical split
- 3+ categories → donut ring segments

**Rationale:** A single rendering approach doesn't work well across all category counts. Solid color is cleanest for 1, split is intuitive for 2, and ring segments are the only viable option for many categories.

### 3. localStorage for Persistence
Store the selected marker style in `localStorage` under key `recycling-map:marker-style`.

**Rationale:** Simple, synchronous, no server dependency. This is a pure UI preference with no security or privacy implications.

### 4. Extract to `MapMarker.svelte` Component
Move all marker SVG rendering from `+page.svelte` into a new `src/lib/components/MapMarker.svelte` component.

**Rationale:** Reduces page component complexity. Makes it easy to add new marker styles in the future without touching the map page. The component accepts `categories: CategoryId[]` and `style: MarkerStyle` props.

## Risks / Trade-offs

- **[Risk]** SVG arc path math for donut segments is more complex than the current gradient → **Mitigation**: Pre-compute path data with a helper function; segments are static (no animation)
- **[Risk]** Many categories (8-10) make donut segments very thin → **Mitigation**: The donut ring approach ensures segments remain visible as colored bands even when thin; adaptive style keeps single/double category cases clean
- **[Risk]** Users may not discover the marker style setting → **Mitigation**: Place setting prominently in SettingsSidebar; consider adding a tooltip on first visit
- **[Risk]** Existing users accustomed to gradient markers may be confused by the change → **Mitigation**: Keep "Gradient" as an available option; default to "Adaptive" which is intuitive

## Migration Plan

No migration needed. This is a UI-only change with no data model or API changes.

## Open Questions

- Should the vertical split for 2 categories be exactly 50/50, or weighted by some priority?
- Should the donut ring use equal-sized segments regardless of category count, or proportionally sized?
