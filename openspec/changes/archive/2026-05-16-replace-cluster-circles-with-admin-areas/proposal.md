## Why

Low-zoom and mid-zoom summary circles currently represent administrative groups at average facility coordinates, which makes national browsing compact but visually disconnected from the actual prefecture and municipality areas. The app now has prepared N03 administrative boundary GeoJSON, so summary rendering can move from abstract circles to recognizable administrative polygons while preserving the existing zoom-level aggregation behavior.

## What Changes

- Add administrative boundary GeoJSON assets for prefecture and municipality summary rendering.
- Replace the low/mid zoom summary circle and halo layers with MapLibre fill/line polygon layers keyed by administrative area.
- Keep count labels and click-to-drill behavior on administrative summaries, using deterministic label points derived from the area geometry or matching facility summary data.
- Join current filtered facility counts to the corresponding administrative polygons so category and area filters continue to affect summary counts, while keeping zero-count areas visible in the lightest color.
- Load the boundary data as public static assets or map-only lazy data instead of bundling it into initial SSR or app JavaScript.
- Validate the provided N03 GeoJSON shape, required properties, geometry types, and missing geometries before using it in the map.

## Capabilities

### New Capabilities
- `administrative-area-summaries`: Covers administrative boundary GeoJSON assets, polygon summary rendering, count joins, label placement, and boundary data validation.

### Modified Capabilities
- `national-facility-display`: Zoom-level administrative aggregation changes from point-circle summaries to prefecture/municipality polygon summaries.
- `map-markers`: Individual place markers remain unchanged, but summary marker behavior changes because administrative aggregates are no longer rendered as circle markers.

## Impact

- `src/routes/+page.svelte` summary layers need to render fill/line/symbol layers from administrative polygon GeoJSON rather than only point circle layers.
- `src/lib/map/facility-rendering.ts` needs helpers for joining current facility summaries to administrative area features and for deriving stable label/click metadata.
- New public GeoJSON assets should be added outside the legacy `src/lib/data/**/*.geojson` path so old point-data audit and migration scripts do not treat polygon boundaries as facility input.
- `/Users/shusakusawada/Downloads/N03-20260101.json` is about 1.3 MB and `/Users/shusakusawada/Downloads/N03-20260101_prefecture.json` is about 161 KB; this is acceptable if fetched lazily by the map and served compressed, but implementation should verify build output and browser network behavior.
- Unit tests should cover count-to-boundary joining, missing geometry handling, and filter-aware summary output.
- Browser/smoke validation should confirm that the map still loads in SSR, that boundaries render at the expected zoom levels, and that clicking an administrative area drills into the existing marker view.
