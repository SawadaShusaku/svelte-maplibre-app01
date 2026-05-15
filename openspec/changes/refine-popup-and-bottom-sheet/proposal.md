## Why

The current map UI has a few usability issues, particularly on mobile devices. The bottom sheet's swipeable area is too restricted (only the horizontal bar), making it difficult for users to naturally expand or collapse the sheet. Additionally, the popup's image section takes up too much vertical space, and the redundant close button clutters the UI. These changes will improve touch interaction ergonomics and clean up the visual presentation.

## What Changes

- Reduce the height of the image section in the map popup.
- Remove the close (X) button from the map popup.
- Expand the swipeable area of the mobile bottom sheet so that the entire sheet (excluding interactive buttons) responds to upward and downward swipe gestures, similar to the behavior found in applications like Google Maps.

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- `popup-ui`: Adjusting the popup's visual layout by reducing the image section height and removing the close button.
- `map-overlay-ui`: Updating the mobile bottom sheet interaction to expand the swipeable hit area across the entire non-interactive surface.

## Impact

- `popup-ui` Svelte components (CSS/style updates, removal of the close button element).
- `map-overlay-ui` Svelte components handling the bottom sheet (updating event listeners for touch/pointer events to cover a wider area).
