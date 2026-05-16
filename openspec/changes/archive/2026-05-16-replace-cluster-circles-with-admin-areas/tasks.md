## 1. Boundary Data Validation And Assets

- [x] 1.1 Inspect `/Users/shusakusawada/Downloads/N03-20260101_prefecture.json` and `/Users/shusakusawada/Downloads/N03-20260101.json` for FeatureCollection shape, Polygon/MultiPolygon geometry counts, required N03 properties, and missing geometry counts.
- [x] 1.2 Add normalized public assets at `static/geojson/admin-areas/prefectures.json` and `static/geojson/admin-areas/municipalities.json`, keeping them out of `src/lib/data/**/*.geojson`.
- [x] 1.3 Add or update a validation script/test helper that rejects unsupported boundary GeoJSON shape and reports skipped missing-geometry features.
- [x] 1.4 Run the validation against the prefecture file and the municipality file, then record the result in the working change description with `jj describe`.

## 2. Summary Join Helpers

- [x] 2.1 Add typed administrative boundary models and N03 key normalization helpers for prefecture and municipality features.
- [x] 2.2 Add helpers that join current filtered facility summaries to boundary polygons and omit zero-count areas.
- [x] 2.3 Add helpers that produce separate label point features with summary metadata for count labels and click targets.
- [x] 2.4 Add unit tests for prefecture joins, municipality joins, Tokyo ward matching, non-Tokyo municipality matching, and missing geometry exclusion.
- [x] 2.5 Run the relevant unit tests and update the working change description with `jj describe`.

## 3. Map Rendering Migration

- [x] 3.1 Add browser-safe lazy loading for prefecture and municipality boundary assets, with in-session caching and no SSR-time fetch dependency.
- [x] 3.2 Replace `ward-summary-halos` and `ward-summary-circles` with administrative fill and outline layers for the active summary zoom range.
- [x] 3.3 Keep summary labels as a symbol layer sourced from label point features, including area label and facility count.
- [x] 3.4 Wire polygon and label click handling to the existing summary drill-down behavior without opening facility detail panels.
- [x] 3.5 Ensure polygon fills/outlines render below individual markers and do not interfere with high-zoom place marker clicks.
- [x] 3.6 Verify the map behavior at prefecture, municipality, and individual-marker zoom levels, then update the working change description with `jj describe`.

## 4. Validation And Performance

- [x] 4.1 Run `npm run check` and address any type errors caused by the boundary summary work.
- [x] 4.2 Run `npm run test` for helper and rendering behavior coverage.
- [x] 4.3 Run `npm run smoke` because this change touches browser-only map fetching and SSR-sensitive rendering.
- [x] 4.4 Use browser verification to confirm the initial route does not eagerly fetch the 1.3 MB municipality GeoJSON before summary rendering needs it.
- [x] 4.5 Verify mobile and desktop map views for readable polygon styling, labels, and click targets.
- [x] 4.6 Finalize the working change description with `jj describe` summarizing the completed administrative-area summary migration.
