## 1. Type Definitions and Settings

- [x] 1.1 Add `MarkerStyle` type to `src/lib/types.ts` (`'adaptive' | 'solid' | 'gradient'`)
- [x] 1.2 Create `src/lib/marker-style.ts` with default style constant and localStorage read/write helpers

## 2. MapMarker Component

- [x] 2.1 Create `src/lib/components/MapMarker.svelte` with props: `categories: CategoryId[]`, `style: MarkerStyle`
- [x] 2.2 Implement solid color rendering for single-category markers
- [x] 2.3 Implement vertical/diagonal split rendering for 2-category markers
- [x] 2.4 Implement donut ring segment rendering for 3+ category markers (SVG arc path helper)
- [x] 2.5 Preserve existing visual elements: drop shadow, highlight gloss, white center circle

## 3. Settings UI

- [x] 3.1 Add marker style section to `src/lib/components/SettingsSidebar.svelte`
- [x] 3.2 Add radio buttons or segmented control for style options (Adaptive, Solid, Gradient)
- [x] 3.3 Wire up localStorage persistence via `marker-style.ts` helpers

## 4. Integration

- [x] 4.1 Replace inline marker SVG in `src/routes/+page.svelte` with `<MapMarker>` component
- [x] 4.2 Pass `markerStyle` state from settings into the marker component
- [x] 4.3 Ensure popup category bar (top colored strip) remains unchanged
- [x] 4.4 Verify markers update immediately when style setting changes

## 5. Verification

- [x] 5.1 Run `npm run check` for TypeScript errors
- [x] 5.2 Run `npm run test` to ensure existing tests pass
- [x] 5.3 Manual visual check: single category, 2 categories, 3+ categories with each style
