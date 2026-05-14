## 1. Data Validation Baseline

- [ ] 1.1 Create a small public-safe fixture set for vector duplicate detection, including at least one same-building group, one separate-store example, and one uncertain review example.
- [ ] 1.2 Add fixture coverage for category-specific entrance, floor, counter, parking lot, and installation-location text.
- [ ] 1.3 Collect visible duplicate marker examples by ward, starting with Chiyoda, Bunkyo, Meguro, Nerima, Shinjuku, Koto, Shinagawa, and Setagaya.
- [ ] 1.4 Document the first embedding input text shape and keep it shared with future public search work.

## 2. Simple Vector Candidate Report

- [ ] 2.1 Add an embedding-input builder for source rows using public place identity text: facility name, listing name, address, administrative area, category labels, source name, and approved public notes/location text.
- [ ] 2.2 Add tests for embedding-input generation so low-value boilerplate and private metadata are excluded.
- [ ] 2.3 Implement a local/private vector-neighbor candidate generator against fixture embeddings or generated private embeddings.
- [ ] 2.4 Group vector-neighbor pairs into connected duplicate candidate groups.
- [ ] 2.5 Write a private/local grouped review report with representative names, addresses, categories, coordinates, and source IDs.
- [ ] 2.6 Keep automatic merge disabled or limited to a clearly marked experimental obvious-merge path.

## 3. Reviewed Merge And Location Hints

- [ ] 3.1 Add a simple way to apply reviewed duplicate groups to public place generation.
- [ ] 3.2 Preserve all category/source-specific listing fields when reviewed groups merge into one place.
- [ ] 3.3 Add conservative `location_hint` extraction from explicit fields and approved public note text.
- [ ] 3.4 Preserve extracted or explicit location hints on `place_collection_entries.location_hint` during D1 seed normalization.
- [ ] 3.5 Keep generic source classifications and low-value notes out of place-level basic notes.
- [ ] 3.6 Add unit tests for reviewed group merge, separate-store non-merge, candidate report output, and location-hint extraction.

## 4. API And Detail Data Flow

- [ ] 4.1 Decide whether selected place collection entries are loaded in the list response or fetched lazily from `/api/facilities/[id]`.
- [ ] 4.2 Implement selected-place detail loading so popup and bottom sheet have active `collection_entries` when rendering destination hints.
- [ ] 4.3 Ensure public facility serialization includes `location_hint` and does not expose embedding vectors, vector scores, normalized source addresses, or private review metadata.
- [ ] 4.4 Add API tests for detail responses with multiple entries and category-specific location hints.

## 5. Detail UI

- [ ] 5.1 Replace the required basic/details tab split with one action-oriented detail flow.
- [ ] 5.2 Keep existing facility name, address, and category chips while removing low-value orange basic-note output from the primary area.
- [ ] 5.3 Render shared destination hints once when multiple entries have identical hints.
- [ ] 5.4 Render category-specific destination hints with category labels when entries have different hints.
- [ ] 5.5 Keep source metadata and listing details visually secondary to destination, hours, conditions, and routing.
- [ ] 5.6 Verify desktop side panel and mobile bottom sheet preserve the same information structure.

## 6. Ward-by-Ward Verification

- [ ] 6.1 Verify Chiyoda candidate groups and run `jj describe` after completing the Chiyoda verification.
- [ ] 6.2 Verify Bunkyo candidate groups and run `jj describe` after completing the Bunkyo verification.
- [ ] 6.3 Verify Meguro candidate groups and run `jj describe` after completing the Meguro verification.
- [ ] 6.4 Verify Nerima candidate groups and run `jj describe` after completing the Nerima verification.
- [ ] 6.5 Verify Shinjuku candidate groups and run `jj describe` after completing the Shinjuku verification.
- [ ] 6.6 Verify Koto, Shinagawa, and Setagaya entrance/location examples and run `jj describe` after each ward verification.

## 7. Final Validation

- [ ] 7.1 Run `npm run test`.
- [ ] 7.2 Run `npm run smoke` if detail loading, browser-only code, or SSR rendering changed.
- [ ] 7.3 Run `npm run validate:d1-seed -- <private-normalized-seed-path>` on the generated private seed artifact.
- [ ] 7.4 Review generated duplicate reports and confirm no private seed, raw source, embedding vectors, vector scores, or review output is committed.
- [ ] 7.5 Summarize reviewed group count, applied merge count, and representative before/after UI examples.
