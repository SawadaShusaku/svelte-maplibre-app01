## Context

The app now serves public facility data through Cloudflare D1, and the D1 dataset contains national rows. However, the runtime UI still builds its selectable city keys from `WARD_REGISTRY`, which is Tokyo-focused legacy metadata, and the D1 repository treats an empty ward list as "no facilities" instead of "national scope". As a result, production can show the existing Tokyo-oriented surface but cannot naturally display the nationwide data already present in D1.

The long-term source of truth remains the private data pipeline. This change only consumes public D1 serving tables and must not introduce committed CSV snapshots, raw source dumps, geocoding caches, or data-bearing seed/import files.

## Goals / Non-Goals

**Goals:**
- Display nationwide D1 facility rows without requiring every area to exist in `WARD_REGISTRY`.
- Fetch selectable area metadata from `/api/wards` and use it as the runtime area catalog.
- Allow the default map to operate in a national scope and allow users to narrow by prefecture/municipality.
- Use zoom-appropriate aggregation so national zoom levels show prefecture-level summaries before drilling into municipality/facility markers.
- Preserve current category filtering, facility search, map marker, and detail panel behavior.
- Keep public API responses minimized and avoid exposing private pipeline fields.
- Keep large-result behavior predictable enough for the current D1 dataset.

**Non-Goals:**
- Rebuilding the private data pipeline or changing upstream scraping/geocoding logic.
- Publishing CSV, GeoJSON, seed SQL, or local SQLite data artifacts in the public app repository.
- Adding new geocoding or deduplication rules for data generation.
- Replacing MapLibre rendering architecture beyond what is needed to render the national facility set.

## Decisions

1. Use D1 `wards` as the runtime area catalog.

   The `/api/wards` response becomes the source for selectable prefecture/municipality items. `WARD_REGISTRY` remains a legacy fallback for source URLs and Tokyo-specific metadata, but national display must not depend on it. This avoids adding thousands of municipalities to app code.

   Alternative considered: generate a large static registry from D1 data. This would duplicate D1 state in the public repo and would drift from the private pipeline.

2. Treat missing `wards` query parameter as national scope.

   `/api/facilities` and search queries should interpret omitted/empty `wards` as "all public D1 facilities" rather than "none". Explicit selected area IDs continue to narrow results. This avoids sending a very long query string containing every municipality ID.

   Alternative considered: initialize every area as selected and send all IDs. This is fragile for URL length, slower to serialize, and makes "all" hard to distinguish from "none".

3. Model UI state as area scope plus selected area IDs.

   The UI should distinguish `scope = "all"` from `scope = "selected"`. Empty selected IDs inside selected scope means no facilities; all scope means national facilities. This avoids ambiguity in components where an empty list currently means no selection.

4. Keep existing D1 schema for this phase.

   The existing `wards(id, prefecture, city_label, url)` table is sufficient for nationwide grouping. If later UX needs prefecture labels, municipality codes, or display ordering beyond current fields, those can be added in a separate schema migration.

5. Deduplication remains a data-pipeline responsibility.

   The app will render rows imported into D1 and will not merge or suppress possible duplicates client-side. UI-side deduplication could hide legitimate multiple collection programs at the same location and would make public output diverge from the private normalized dataset.

6. GeoJSON remains a legacy/local validation input only.

   New national display behavior must read D1-backed API responses. It must not require creating GeoJSON files for every municipality. Any GeoJSON schema expectations remain limited to legacy local validation and must not become the national serving contract.

7. Add zoom-level display modes for national browsing.

   The map should not show all individual facilities at Japan-wide zoom levels. It should transition by zoom from individual facility markers to municipality/ward summaries and then to prefecture summaries. For Tokyo, this means facility markers at high zoom, 23 ward summaries at mid zoom, and a Tokyo prefecture summary at low zoom. For municipalities that are not subdivided further in the dataset, the high-zoom state remains facility markers, the mid-zoom state groups by municipality, and the low-zoom state groups by prefecture. The summary data may be computed from D1 area/facility counts or from the currently loaded facility set, but it must preserve selected category and area filters.

   Alternative considered: always use MapLibre client clustering on all facility points. This is simpler, but it produces arbitrary spatial clusters rather than administrative summaries, which is less helpful for nationwide recycling coverage browsing.

## Risks / Trade-offs

- [Large national payloads] → Start with the current D1 dataset size and existing marker rendering, but keep API and data layer structured so viewport or pagination limits can be added if performance becomes unacceptable.
- [Overloaded low-zoom map] → Use prefecture/municipality summary layers at low and mid zoom before showing individual facility markers.
- [Ambiguous empty selection] → Introduce an explicit area-scope state so "all Japan" and "nothing selected" cannot be confused.
- [Tokyo source URL fallback gaps] → Use `WARD_REGISTRY` only when metadata exists; missing source URLs should not block facility display.
- [Category availability over national scope] → No-area category requests return all public categories, while selected-area requests return only categories available in those areas.
- [Search cost] → National search may scan more rows; retain keyword escaping, result limits where appropriate, and D1 indexes where available.
