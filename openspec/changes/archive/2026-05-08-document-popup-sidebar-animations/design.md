## Context

This change documents animation behavior that has already been added to popup and sidebar interactions. It does not introduce new implementation scope.

## Decisions

- Treat animation as part of the UI behavior contract for popups, bottom sheets, and sidebar navigation.
- Keep requirements implementation-agnostic so the UI can use CSS transitions, Svelte transitions, or equivalent mechanisms.
- Include reduced motion behavior as an explicit accessibility requirement.

## Risks

- Overly specific animation timings could make future tuning harder, so the spec describes brief transitions without locking exact durations.
