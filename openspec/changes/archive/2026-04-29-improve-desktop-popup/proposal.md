## Why

The desktop MapLibre popup for facility details has accumulated several UX issues from user feedback: unnecessary prefecture label, cramped routing controls with an unstyled `<select>`, a small close button, insufficient padding, popup overlapping the marker, and lack of space for future URL/hours information. These issues degrade the experience when users interact with map markers to view facility details and request routes.

## What Changes

- Remove the prefecture label ("東京都") below the facility name in the popup
- Add `offset` to the MapLibre `Popup` so it appears above the marker instead of overlapping it
- Replace the "手段:" label and `<select>` dropdown for travel mode with an icon segment control (🚶‍♂️ / 🚲 / 🚗)
- Widen the "経路を検索" button and enlarge the close (✕) button for better click targets
- Tighten popup padding to create more usable space for content (hours, URL, notes)
- Ensure changes only affect desktop popup layout; mobile bottom-sheet redesign is out of scope for this change

## Capabilities

### New Capabilities
- `popup-ui`: Desktop popup layout, content structure, travel-mode selector, and close interaction

### Modified Capabilities
- `map-overlay-ui`: Minor visual adjustments to popup container styling (padding, offset)

## Impact

- `src/routes/+page.svelte` — popup content template and travel-mode controls
- `src/routes/layout.css` — MapLibre popup global style overrides
- No API or dependency changes
- No breaking changes
