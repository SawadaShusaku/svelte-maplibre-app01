## Why

Facility detail popups no longer show the facility imagery that was expected in the map experience, reducing confidence that users are inspecting the intended place. At the same time, public facility records still expose internal data-quality notes such as "公式ページに緯度経度なし。必要に応じて後段でジオコーディングする。" and duplicated source rows can create multiple nearby markers for what users understand as the same collection place.

## What Changes

- Restore facility media display in marker/detail popups when an approved public image or street-level media reference is available.
- Remove internal geocoding and source-quality notes from public facility feature/place information.
- Add data quality gates so rows containing internal pipeline notes cannot enter public API responses or public serving artifacts.
- Define a place-level deduplication workflow that can merge category-specific source rows into one public facility with multiple categories.
- Use deterministic rule-based deduplication first; reserve vector similarity or Cloudflare Vectorize for ambiguous review assistance, not automatic merging in the first implementation.
- Produce private review reports for ambiguous same-place candidates rather than silently merging or publishing duplicates.

## Capabilities

### New Capabilities
- `facility-media-display`: Public facility detail and popup media behavior, including approved image/media references and fallback behavior.
- `place-deduplication-quality`: Place-level deduplication and public data quality gates for removing internal notes from served facility records.

### Modified Capabilities
- `cloudflare-d1-serving`: Public API responses must include approved media fields when available and exclude internal geocoding/source-quality notes.
- `d1-seed-generation`: Seed generation must merge same-place category rows where safe and report ambiguous candidates for private review.
- `map-markers`: Marker rendering should represent one public place once, with combined categories, rather than category-specific duplicate markers.
- `popup-ui`: Facility popups should render approved facility media when available.
- `private-data-pipeline`: Normalized private data may retain geocoding/source-quality metadata, but public outputs must strip internal notes and preserve review reports privately.

## Impact

- Affected UI: marker popup/detail components, facility media rendering, marker category badges/counts.
- Affected data path: private normalized data export, D1 seed generation, D1 public API field mapping, public response audits.
- Affected tests: repository/API serialization tests, data-boundary audits, deduplication unit tests, popup rendering tests, and smoke/browser verification.
- Dependencies: no mandatory new external service for first pass; Cloudflare Vectorize may be evaluated later for candidate ranking only if deterministic rules are insufficient.
