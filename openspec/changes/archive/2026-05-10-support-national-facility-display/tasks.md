## 1. Data And API Foundations

- [x] 1.1 Verify the D1 `wards` and `facilities` tables contain non-Tokyo area rows in preview/production before changing UI assumptions.
- [x] 1.2 Update D1 repository facility queries so omitted area filters mean national scope and explicit empty selection can still mean no results.
- [x] 1.3 Update search queries so national scope searches all D1 public areas and selected-area scope searches only selected areas.
- [x] 1.4 Add area-summary support for prefecture and municipality/ward counts from the currently loaded public facility set, respecting selected categories and selected areas.

## 2. Client Data Layer

- [x] 2.1 Add typed API/data helpers for loading D1 area metadata and using it as the runtime area catalog.
- [x] 2.2 Replace Tokyo-only city-key conversion as the national display source of truth while preserving `WARD_REGISTRY` as optional metadata fallback.
- [x] 2.3 Add explicit area scope state so national display and empty selected-area filtering are not confused.

## 3. UI And Map Behavior

- [x] 3.1 Update area selection UI to group D1 areas by prefecture and support nationwide mode.
- [x] 3.2 Update category filtering to work for national scope and selected-area scope.
- [x] 3.3 Add zoom-dependent display modes: individual facility markers at high zoom, municipality/ward summaries at mid zoom, and prefecture summaries at low zoom.
- [x] 3.4 Ensure Tokyo aggregates as marker -> ward -> Tokyo and non-Tokyo municipalities aggregate as marker -> municipality -> prefecture.
- [x] 3.5 Keep facility detail, route, source URL fallback, and search result behavior working for areas absent from `WARD_REGISTRY`.

## 4. Validation

- [x] 4.1 Add or update unit tests for national facility queries, category availability, search scope, and summary counts.
- [x] 4.2 Run `npm run check`, `npm run test`, and `npm run build`.
- [x] 4.3 Verify with preview D1 that non-Tokyo facilities render and low/mid/high zoom layers switch as expected.
- [x] 4.4 Run `jj describe` with a summary of completed national display work.
