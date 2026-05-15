## Context

The map UI components (popup and mobile bottom sheet) need UI/UX improvements to enhance touch interactions. The bottom sheet hit area for swipes is currently restricted to the top handle. We need to expand this hit area to the entire component without interfering with inner interactive elements (e.g., buttons). Furthermore, the map popup's image takes up too much vertical space and the close button is redundant.

## Goals / Non-Goals

**Goals:**
- Improve mobile touch ergonomics by expanding the swipeable area of the bottom sheet.
- Streamline the popup UI by reducing image height and removing the close button.
- Ensure inner buttons and scrollable content in the bottom sheet still function correctly without triggering the drag event.

**Non-Goals:**
- Refactoring the entire map overlay architecture.
- Adding new features to the map.

## Decisions

- **Bottom Sheet Interaction Handling**: The swipe behavior is likely managed by touch event listeners (`touchstart`, `touchmove`, `touchend`). We will attach the drag/swipe handlers to the main container instead of just the handle (`.drag-handle`). We will check `e.target.closest('button, a, input, [data-prevent-drag]')` to ignore interactions on specific UI elements so the sheet doesn't drag when users try to interact.
- **Popup UI Styles**: Adjust the height of the image container to a smaller value. Remove the HTML element and logic associated with the close (`X`) button.

## Risks / Trade-offs

- **Risk**: Expanded hit area could interfere with internal component scrolling or button presses.
  **Mitigation**: Implement robust event target filtering so swipe events are ignored if the interaction starts on a scrollable container or an interactive button.
