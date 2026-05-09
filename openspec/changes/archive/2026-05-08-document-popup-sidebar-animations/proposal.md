## Why

Popup and sidebar interactions now include motion. The main OpenSpec documents should describe the expected animation behavior so future UI changes preserve the interaction contract.

## What Changes

- Document popup enter and exit transitions for desktop popups and mobile bottom sheets.
- Document sidebar open, close, and settings drill-down transitions.
- Require popup and sidebar animations to respect reduced motion preferences.

## Impact

- Affected specs: `popup-ui`, `sidebar-navigation`
- Affected code areas: popup rendering, mobile bottom sheet, sidebar navigation
