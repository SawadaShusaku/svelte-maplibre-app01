## Why

The facility detail UI currently separates basic information and category details in a way that can hide the practical destination details users need at the point of use, such as entrance, floor, counter, or installation location. The public place model already has room for category/source-specific location hints, but seed generation and display behavior do not yet treat those hints as first-class user-facing information.

This also affects marker deduplication. The current address-rule approach is expensive to maintain because small Japanese notation differences require continuous rule work. The marker integration process should start with a simpler vector-based candidate report and clustering workflow, while preserving per-category entrance and reception differences.

## What Changes

- Replace the current exact-address-bucket deduplication strategy with vector-based candidate discovery and clustering for public place generation.
- Start with review-first vector clusters instead of a complex automatic merge system.
- Treat "same real-world place" for this app as the same building or destination-level place, not only exact same source listing or exact same address string.
- Preserve category/source-specific entrance, floor, counter, parking lot, reception, or installation details in collection entries instead of splitting same-building records into separate markers.
- Rework the popup/bottom-sheet detail content so practical destination details are visible in the main detail flow rather than hidden behind a category-details tab.
- Remove low-value generic notes, source classifications, or facility-type artifacts from the primary basic information area when they do not help users find or use the collection point.
- Keep source metadata and listing details available as supporting detail, but make them visually secondary to address, accepted categories, destination hints, hours, and conditions.
- Add tests and fixture examples covering vector duplicate detection, same-building grouping, location-hint extraction/preservation, and detail UI rendering.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `popup-ui`: Facility details should prioritize user action information in one readable flow, with destination/location hints visible without requiring users to switch tabs.
- `place-collection-data-model`: Collection entries should preserve category/source-specific destination hints as first-class public fields used by the UI.
- `place-deduplication-quality`: Public place generation should use vector-based candidate discovery and clustering to produce reviewable same-building groups, with simple optional auto-merge only after examples prove it safe.

## Impact

- `src/routes/+page.svelte` detail panel and bottom-sheet content structure.
- `src/lib/data.ts` and facility detail loading if collection entries are needed when opening a marker.
- `src/lib/server/d1-repository.ts` and `src/lib/server/public-facility.ts` if the list/detail API split needs adjustment for collection entries.
- `scripts/normalize-d1-public-data.ts`, deduplication helpers, and private pipeline seed preparation for vector candidate generation, clustering, review output, and location-hint extraction/preservation.
- Future Cloudflare Vectorize search work can reuse the same text builder, but public search does not need to be implemented in the first marker-deduplication pass.
- D1 public seed output for `place_collection_entries.location_hint`; no new public confidence fields.
- Unit/component tests for public facility serialization, place deduplication, and popup/detail rendering.
