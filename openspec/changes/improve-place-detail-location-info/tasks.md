## 1. Coordinate Baseline

- [x] 1.1 Regenerate all private normalized source CSV coordinates with Google Geocoding API and Places refinement, including JBRC and ink rows that already contain upstream coordinates.
- [x] 1.2 Preserve upstream official coordinates and optional GSI comparison results only as private audit data, not as public place coordinates.
- [x] 1.3 Review Google geocoding failures, `APPROXIMATE` location types, and source-area contradictions before public seed export.
- [x] 1.4 Validate that public D1 seed output uses one Google-generated coordinate basis for `places.latitude` / `places.longitude`.

## 2. Data Validation Baseline

- [x] 2.1 Create a small public-safe fixture set for duplicate detection, including at least one same-display-coordinate auto group, one separate-building same-address example, and one uncertain review example.
- [ ] 2.2 Add fixture coverage for category-specific entrance, floor, counter, parking lot, and installation-location text.
- [ ] 2.3 Collect visible duplicate marker examples by ward, starting with Chiyoda, Bunkyo, Meguro, Nerima, Shinjuku, Koto, Shinagawa, and Setagaya.
- [ ] 2.4 Document the first embedding input text shape and keep it shared with future public search work.

## 3. Simple Vector Candidate Report

- [ ] 3.1 Add an embedding-input builder for source rows using public place identity text after coordinate unification.
- [ ] 3.2 Add tests for embedding-input generation so low-value boilerplate and private metadata are excluded.
- [ ] 3.3 Implement a local/private vector-neighbor candidate generator against fixture embeddings or generated private embeddings.
- [ ] 3.4 Group vector-neighbor pairs into connected duplicate candidate groups.
- [ ] 3.5 Write a private/local grouped review report with representative names, addresses, categories, Google coordinates, and source IDs.
- [x] 3.6 Auto-merge same-display-coordinate groups during public seed normalization, and keep address/vector candidates as review output.

## 4. Reviewed Merge And Location Hints

- [ ] 4.1 Add a simple way to apply reviewed duplicate groups to public place generation.
- [ ] 4.2 Preserve all category/source-specific listing fields when reviewed groups merge into one place.
- [ ] 4.3 Add conservative `location_hint` extraction from explicit fields and approved public note text.
- [ ] 4.4 Preserve extracted or explicit location hints on `place_collection_entries.location_hint` during D1 seed normalization.
- [ ] 4.5 Preserve the standard coordinate notice for remaining coarse Google fallback coordinates without exposing raw geocoding audit fields.
- [ ] 4.6 Keep generic source classifications and low-value notes out of place-level basic notes.
- [ ] 4.7 Add unit tests for same-display-coordinate merge, separate-building same-address non-merge, candidate report output, coordinate notice output, and location-hint extraction.

## 5. API And Detail Data Flow

- [ ] 5.1 Decide whether selected place collection entries are loaded in the list response or fetched lazily from `/api/facilities/[id]`.
- [ ] 5.2 Implement selected-place detail loading so popup and bottom sheet have active `collection_entries` when rendering destination hints.
- [ ] 5.3 Ensure public facility serialization includes `location_hint` and the standard coordinate notice, and does not expose embedding vectors, vector scores, normalized source addresses, geocoding audit fields, or private review metadata.
- [ ] 5.4 Add API tests for detail responses with multiple entries and category-specific location hints.

## 6. Detail UI

- [ ] 6.1 Replace the required basic/details tab split with one action-oriented detail flow.
- [ ] 6.2 Keep existing facility name, address, and category chips while removing low-value orange basic-note output from the primary area.
- [ ] 6.3 Render the standard coordinate notice near the address for remaining coarse Google fallback coordinates.
- [ ] 6.4 Render shared destination hints once when multiple entries have identical hints.
- [ ] 6.5 Render category-specific destination hints with category labels when entries have different hints.
- [ ] 6.6 Keep source metadata and listing details visually secondary to destination, hours, conditions, and routing.
- [ ] 6.7 Verify desktop side panel and mobile bottom sheet preserve the same information structure.

## 7. Ward-by-Ward Verification

- [ ] 7.1 Verify Chiyoda candidate groups and run `jj describe` after completing the Chiyoda verification.
- [ ] 7.2 Verify Bunkyo candidate groups and run `jj describe` after completing the Bunkyo verification.
- [ ] 7.3 Verify Meguro candidate groups and run `jj describe` after completing the Meguro verification.
- [ ] 7.4 Verify Nerima candidate groups and run `jj describe` after completing the Nerima verification.
- [ ] 7.5 Verify Shinjuku candidate groups and run `jj describe` after completing the Shinjuku verification.
- [ ] 7.6 Verify Koto, Shinagawa, and Setagaya entrance/location examples and run `jj describe` after each ward verification.

## 8. Final Validation

- [x] 8.1 Run `npm run test`.
- [ ] 8.2 Run `npm run smoke` if detail loading, browser-only code, or SSR/browser rendering changed.
- [x] 8.3 Run `npm run validate:d1-seed -- <private-normalized-seed-path>` on the generated private seed artifact.
- [x] 8.4 Review generated duplicate reports and confirm no private seed, raw source, embedding vectors, vector scores, geocoding cache, or review output is committed.
- [x] 8.5 Summarize Google geocoding failure/review counts, reviewed group count, applied merge count, and representative before/after UI examples.
