## Context

The current national display mode already aggregates facilities by prefecture at low zoom and by municipality or ward at mid zoom, but it renders those aggregates as point features with circle layers. Those points are calculated from facility coordinates, so the visual summary can appear detached from the administrative area it represents.

The provided N03 files are public administrative boundary GeoJSON:

- `/Users/shusakusawada/Downloads/N03-20260101_prefecture.json`: 47 prefecture features, about 161 KB.
- `/Users/shusakusawada/Downloads/N03-20260101.json`: 1,905 municipality-level features, about 1.3 MB, with Polygon and MultiPolygon geometries plus a small number of missing geometries that must be filtered or reported.

These files should be treated as public map boundary assets, not facility source data. They must not be placed in `src/lib/data/**/*.geojson`, because that path is reserved for legacy point-facility GeoJSON audit/migration behavior.

## Goals / Non-Goals

**Goals:**

- Render low-zoom prefecture summaries as administrative polygon fills/lines.
- Render mid-zoom municipality or ward summaries as administrative polygon fills/lines.
- Preserve high-zoom individual facility marker behavior and existing place detail behavior.
- Join the currently filtered facility counts to administrative polygons so category filters, area filters, and search-driven facility sets continue to affect summary output.
- Keep boundary assets out of the initial SSR and JavaScript bundle by serving them as static files and fetching them only when the map needs summary layers.
- Validate GeoJSON shape and properties before using the files in the app.
- Keep a deterministic label/click target for each administrative area.

**Non-Goals:**

- Changing the D1 facility schema or the private facility data pipeline.
- Re-geocoding, deduplicating, or otherwise changing facility records.
- Replacing individual marker icons or facility popup/detail behavior.
- Implementing vector tiles or server-side geometry simplification in this change.
- Shipping raw private source data, geocoding caches, or facility seed files.

## Decisions

1. Store boundary assets under `static/geojson/admin-areas/`.

   The map can fetch `/geojson/admin-areas/prefectures.json` and `/geojson/admin-areas/municipalities.json` as public static assets. This avoids importing 1.5 MB of geometry into the app JavaScript bundle and keeps polygon data away from the legacy `src/lib/data/**/*.geojson` facility-data path.

   Alternative considered: import GeoJSON from `src/lib/map/polygons/`. That would simplify TypeScript references, but it would push large geometry into bundled app code unless carefully code-split. Static fetch is the safer first implementation.

2. Use N03 properties as the boundary identity contract.

   Prefecture features are keyed by `N03_001` for the prefecture label. Municipality features are keyed primarily by `N03_007` when present, with `N03_001` plus `N03_004` as the display identity. The join layer should normalize app area metadata and N03 fields into a small internal key shape rather than scattering raw N03 property reads through Svelte components.

   Required GeoJSON schema:
   - `type` must be `FeatureCollection`.
   - Feature `geometry.type` must be `Polygon` or `MultiPolygon`.
   - Prefecture features must include `properties.N03_001`.
   - Municipality features must include `properties.N03_001`, `properties.N03_004`, and preferably `properties.N03_007`.
   - Features with missing or unsupported geometry must be excluded from rendering and counted in validation output.

   Alternative considered: join only by display labels. Labels are easier to inspect, but they are more fragile across suffixes, duplicate municipality names, and future area naming changes.

3. Build display GeoJSON by joining summaries onto boundary features.

   `facility-rendering` should continue to compute summary counts from the currently loaded `GeoFeature[]`, but the rendering source for summaries should become a polygon `FeatureCollection`. Each rendered polygon should include properties such as `areaKey`, `city`, `cityLabel`, `summaryType`, `facilityCount`, and click/fit metadata. Areas with no matching facilities should remain visible with `facilityCount: 0` and the lightest fill color so users can understand geographic coverage gaps.

   Alternative considered: omit zero-count administrative polygons. That makes the map cleaner, but it hides the difference between "no boundary data" and "boundary exists but has no matching facilities".

4. Keep label points separate from polygon geometry.

   Fill and line layers should use polygon geometry. Count labels should be a separate point FeatureCollection generated from a stable center. The first implementation can use the existing facility summary centroid for labels and click zoom targets because it is deterministic for the currently filtered data. If label placement is poor for sparse or oddly shaped areas, a later change can add polygon interior points.

   Alternative considered: use MapLibre symbol placement on polygon features directly. That is simpler, but point labels give more control and preserve the current click-to-drill behavior.

5. Boundary data is not part of facility deduplication.

   Facility deduplication remains the responsibility of the private normalized data pipeline and D1 seed generation. This change only changes how already-deduplicated public place records are summarized on the map. Administrative boundary features should not merge, suppress, or create facility records.

6. Treat 1.3 MB municipality GeoJSON as acceptable with lazy loading and compression.

   A 1.3 MB static GeoJSON is reasonable for this app if it is not in the initial app bundle, is cached by the browser, and is served compressed by Cloudflare. Implementation should verify that the initial route does not eagerly fetch the municipality file before the map needs mid-zoom summaries. If interaction feels heavy on mobile, a follow-up can simplify geometry further or split municipality boundaries by prefecture.

## Risks / Trade-offs

- [Boundary asset size] → Lazy-fetch static assets, rely on CDN/browser caching, and verify the production build/network behavior. Consider topology-preserving simplification or prefecture-split assets only if the first implementation is slow.
- [N03/app area mismatch] → Centralize N03-to-app-area key normalization and add tests for Tokyo wards and non-Tokyo municipalities.
- [Missing geometries] → Exclude invalid features from rendering, expose validation counts, and keep facility markers usable even when an area polygon is unavailable.
- [Label placement on complex polygons] → Start with deterministic facility-summary label points; add polygon interior label points later if visual QA shows labels outside expected areas.
- [Layer ordering and click targets] → Put polygon fills below individual markers and labels, and keep clickable summary behavior limited to the visible summary zoom range.
- [SSR/browser API errors] → Fetch boundaries inside browser-safe map code and run `npm run smoke` because MapLibre and fetch timing can expose SSR issues.

## Migration Plan

1. Add the two N03 GeoJSON assets under `static/geojson/admin-areas/` with normalized filenames.
2. Add validation/join helpers and unit tests before changing Svelte map layers.
3. Replace summary circle sources/layers with polygon fill/line sources plus point label sources.
4. Verify desktop and mobile map rendering at prefecture, municipality, and individual marker zoom levels.
5. If rollback is needed, remove the static boundary assets and restore the existing `ward-summary-circles` and `ward-summary-halos` layers; the D1 facility serving contract does not need to change.

## Open Questions

- Should the first implementation simplify the municipality GeoJSON further, or ship the current 1.3 MB file and measure real browser behavior first?
- Should the municipality heat scale use fixed thresholds long-term, or should it become quantile-based once nationwide counts stabilize?
