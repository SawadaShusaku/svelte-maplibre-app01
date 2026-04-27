## 1. Setup mobile detection

- [x] 1.1 Add `isMobile` reactive state using `window.innerWidth` with 640px breakpoint
- [x] 1.2 Add `resize` event listener in `$effect` and clean up on destroy

## 2. Extract popup content into reusable snippet

- [x] 2.1 Create a `{#snippet popupContent(facility)}` containing the popup card markup (color bar, name, close button, tabs, content, routing controls)
- [x] 2.2 Verify the snippet renders correctly inside the existing `<Popup>` without visual changes

## 3. Implement bottom sheet markup

- [x] 3.1 Add `{#if isMobile}` branch in the marker loop: render fixed-position bottom sheet instead of `<Popup>`
- [x] 3.2 Include drag handle indicator in the bottom sheet header
- [x] 3.3 Apply `fly` transition (`y: 100%`, `duration: 300`) for slide-in animation
- [x] 3.4 Add `max-height` (e.g. 60vh) and `overflow-y-auto` to the bottom sheet content area
- [x] 3.5 Ensure the bottom sheet uses the same `{@render popupContent(f)}` snippet as desktop

## 4. Add swipe-to-close interaction

- [x] 4.1 Implement `touchstart`/`touchend` handlers on the bottom sheet header area
- [x] 4.2 Detect downward swipe: deltaY > 30px and duration < 500ms
- [x] 4.3 On valid swipe, close the bottom sheet (set `openPopupId = null`)
- [x] 4.4 Ensure close button tap also closes the bottom sheet

## 5. Add map pan on mobile popup open

- [x] 5.1 In `selectFacility` and search result click handlers, check `isMobile`
- [x] 5.2 If mobile, call `map.panTo([lng, lat], { offset: [0, -bottomSheetOffset] })` after opening popup
- [x] 5.3 Calculate `bottomSheetOffset` based on bottom sheet max-height (e.g. 30vh upward offset)

## 6. Styling and polish

- [x] 6.1 Add rounded top corners (`rounded-t-2xl`) to the bottom sheet
- [x] 6.2 Ensure safe-area-inset-bottom padding for devices with home indicator
- [x] 6.3 Verify the bottom sheet does not obscure the bottom navigation or page controls
- [x] 6.4 Test that map interactions (pan, zoom) work while bottom sheet is open

## 7. Verification

- [x] 7.1 Run `npm run check` and fix any TypeScript errors
- [x] 7.2 Run `npm run test` and ensure existing tests pass
- [x] 7.3 Run `npm run smoke` to verify production build succeeds
- [x] 7.4 Manually test in browser DevTools mobile viewport (iPhone SE, iPhone 14 Pro)
- [x] 7.5 Manually test in desktop viewport to ensure no regression
