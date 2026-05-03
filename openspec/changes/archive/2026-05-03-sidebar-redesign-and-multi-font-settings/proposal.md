## Why

The current sidebar mixes all display settings inline, making it visually cluttered as more options are added. Additionally, font customization is limited to the logo only, while users want to personalize typography across the entire UI including popups and other text elements. This change improves information architecture and user personalization.

## What Changes

- **Redesign sidebar settings into section-based navigation**: Group display settings (marker design, font settings, etc.) under collapsible title rows. Tapping a section title switches the sidebar view to show that section's detailed options, similar to how native iOS Settings app works.
- **Add multi-element font settings**: Allow users to choose fonts individually for the logo, popup headings/body, and general UI text. Each element gets its own font selector.
- **Persist all settings to localStorage**: Store sidebar view state, selected sections, and all font choices in localStorage so they survive page reloads.
- **Refactor SettingsSidebar component**: Extract section navigation and detail views into sub-components for maintainability.

## Capabilities

### New Capabilities
- `multi-element-font-settings`: Allow per-element font customization (logo, popup text, general UI) with localStorage persistence.
- `sidebar-section-navigation`: Replace inline settings with a section list view that drills down into detail views when tapped.

### Modified Capabilities
- `sidebar-navigation`: The requirement for how display settings are presented changes from inline controls to section-based drill-down navigation. The sidebar SHALL now show a top-level list of setting categories, and tapping one SHALL navigate into a detail view for that category.

## Impact

- `src/lib/components/SettingsSidebar.svelte` — Major refactor for section navigation and detail views
- `src/lib/font-style.ts` — Extend to support multiple font targets (logo, popup, ui)
- `src/routes/layout.css` — Add CSS custom properties for popup and UI fonts
- `src/routes/+page.svelte` — Pass additional font state props to sidebar
- `src/lib/types.ts` — Add new types for font targets
- `src/lib/db/categories.ts` or new module — Font option definitions
