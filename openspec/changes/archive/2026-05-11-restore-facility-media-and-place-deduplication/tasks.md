## 1. Data Validation And Leak Detection

- [x] 1.1 Inspect current D1/API facility payloads and UI feature objects for internal notes such as "公式ページに緯度経度なし。必要に応じて後段でジオコーディングする。"
- [x] 1.2 Add public field allowlist tests for `/api/facilities` and `/api/facilities/:id` so internal geocoding/source-quality notes cannot be serialized.
- [x] 1.3 Add or update seed/export validation to fail when public fields contain internal geocoding workflow notes, private review comments, raw source payloads, or token-bearing media URLs.
- [x] 1.4 Normalize touched OpenSpec main specs that still use delta-only headers before archive so this change can sync cleanly later.

## 2. Facility Media Restoration

- [x] 2.1 Trace the current Mapillary/facility media data flow and identify why popup/detail facility imagery stopped rendering.
- [x] 2.2 Add typed approved media fields to public facility types and D1 API serialization if they are missing.
- [x] 2.3 Restore popup and detail-panel media rendering with a clean no-media fallback and required attribution/source links.
- [x] 2.4 Add browser or component verification that a facility with media shows the image and a facility without media shows no broken placeholder.

## 3. Place Deduplication Rules

- [x] 3.1 Implement deterministic place-key helpers for Japanese address normalization, administrative-area matching, coordinate distance checks, and category-suffix name cleanup.
- [x] 3.2 Add unit tests for the known Tokyo sample: 神田公園出張所ストックヤード / 神田公園出張所 should become one public place only when address and coordinate evidence is compatible.
- [x] 3.3 Add private ambiguous-candidate report output for rows that are similar but not safe to merge automatically.
- [x] 3.4 Keep vector similarity or Cloudflare Vectorize out of the automatic merge path; document it as optional candidate-ranking support only.
- [x] 3.5 Run `jj describe` after completing the known Tokyo deduplication sample work.

## 4. D1 Seed And Marker Integration

- [x] 4.1 Apply deduplication in the D1 seed/public export path so merged places have one public facility ID and multiple category relationships.
- [x] 4.2 Update repository/API behavior if needed so merged multi-category facilities still filter correctly for each accepted category.
- [x] 4.3 Update map marker rendering verification so one merged public place creates one marker with multiple category chips/badges.
- [x] 4.4 Regenerate/import preview D1 data and verify the known Tokyo duplicate example no longer appears as two nearby markers.
- [x] 4.5 Run `jj describe` after completing preview D1 deduplication verification.

## 5. Validation

- [x] 5.1 Run `npm run check`.
- [x] 5.2 Run `npm run test`.
- [x] 5.3 Run `npm run build`.
- [x] 5.4 Run `npm run smoke`.
- [x] 5.5 Run `npm run deploy:preview -- --dry-run`.
- [x] 5.6 Validate the OpenSpec change and summarize remaining manual review items, especially any ambiguous duplicate candidates.
