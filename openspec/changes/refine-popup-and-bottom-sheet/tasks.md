## 1. UI Refactoring for Popup

- [ ] 1.1 Remove the close button (X) element and its associated event handlers from the popup/bottom sheet component.
- [ ] 1.2 Adjust the CSS of the image container to reduce its vertical height to make it more visually compact.
- [ ] 1.3 Add `jj describe -m "Update popup UI: remove close button and reduce image height"` to document progress.

## 2. Interaction Refactoring for Bottom Sheet

- [ ] 2.1 Update the touch event handlers to attach to the entire bottom sheet container instead of just the top drag handle.
- [ ] 2.2 Add event target filtering to ensure swipes starting on interactive elements (buttons, inputs) do not trigger the bottom sheet drag behavior.
- [ ] 2.3 Verify the "swipe down to close" behavior works across the non-interactive body.
- [ ] 2.4 Add `jj describe -m "Expand swipeable area of bottom sheet"` to document progress.

## 3. Testing and Verification

- [ ] 3.1 Run `npm run smoke` to ensure no build or runtime errors.
- [ ] 3.2 Verify the UI on a mobile viewport (responsive view) to ensure the bottom sheet swipe behavior matches expectations and doesn't conflict with inner scrolling.
- [ ] 3.3 Verify the UI on a desktop viewport to ensure the popup functions correctly without the close button (e.g., clicking outside to close).
