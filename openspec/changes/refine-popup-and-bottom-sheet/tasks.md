## 1. UI Refactoring for Popup

- [x] 1.1 Remove the close button (X) element and its associated event handlers from the popup/bottom sheet component.
- [x] 1.2 Adjust the CSS of the image container to reduce its vertical height to make it more visually compact.
- [x] 1.3 Add `jj describe -m "Update popup UI: remove close button and reduce image height"` to document progress.

## 2. Interaction Refactoring for Bottom Sheet

- [x] 2.1 Update the touch event handlers to attach to the entire bottom sheet container instead of just the top drag handle.
- [x] 2.2 Add event target filtering to ensure swipes starting on interactive elements (buttons, inputs) do not trigger the bottom sheet drag behavior.
- [x] 2.3 Verify the "swipe down to close" behavior works across the non-interactive body.
- [x] 2.4 Add `jj describe -m "Expand swipeable area of bottom sheet"` to document progress.

## 3. Testing and Verification

- [x] 3.1 Run `npm run smoke` to ensure no build or runtime errors.
- [x] 3.2 Verify the UI on a mobile viewport (responsive view) to ensure the bottom sheet swipe behavior matches expectations and doesn't conflict with inner scrolling.
- [x] 3.3 Verify the UI on a desktop viewport to ensure the popup functions correctly without the close button (e.g., clicking outside to close).
