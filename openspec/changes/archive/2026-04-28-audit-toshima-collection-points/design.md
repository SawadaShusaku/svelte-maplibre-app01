## Context

Current `src/lib/data/tokyo/toshima.geojson` contains 46 facilities for Toshima ward. However, the data uses legacy category names like `battery` instead of the current type system's split (`dry-battery`, `rechargeable-battery`, `button-battery`). Additionally, the user has provided official Toshima city URLs for each category that need to be cross-checked against the current dataset to ensure accuracy.

## Goals / Non-Goals

**Goals:**
- Cross-reference current GeoJSON data with official Toshima city collection point lists
- Update category assignments to match current type system
- Add missing facilities, remove non-existent ones, fix incorrect locations/names
- Rebuild SQLite database after data correction

**Non-Goals:**
- Modifying Chiyoda ward data (out of scope)
- Changing application UI or marker design
- Adding new categories to the type system

## Decisions

### 1. Manual Web Audit Over Scraping
We will manually review the official Toshima city pages rather than building a scraper. The pages are structured differently per category and scraping would be brittle.

**Rationale:** Long-term maintainability. Manual audit is a one-time cost for a stable dataset.

### 2. In-Place GeoJSON Update
Update `toshima.geojson` directly rather than creating a migration script.

**Rationale:** The source of truth for facilities is the GeoJSON file. The SQLite DB is a build artifact generated from it.

### 3. Category Mapping Strategy
Legacy `battery` entries will be mapped based on facility context:
- Libraries/community centers with battery collection → `dry-battery` (most common public collection type)
- Specialized electronics recycling → `rechargeable-battery` + `button-battery`
- Verify per official source

## Risks / Trade-offs

- **[Risk]** Official websites may have updated since the URLs were provided → **Mitigation**: Check each page and note the access date
- **[Risk]** Some facilities may accept multiple battery types not explicitly listed → **Mitigation**: Conservative approach - only list what is explicitly confirmed
- **[Risk]** Coordinate accuracy may vary → **Mitigation**: Use official addresses and geocode if needed; keep existing coordinates if no better source exists

## Migration Plan

1. Backup current `toshima.geojson`
2. Audit each official URL and compare with current data
3. Update GeoJSON with corrected data
4. Run `npm run build:db` to regenerate SQLite
5. Run `npm run smoke` to verify build

## Open Questions

- Should we add `hours` and `notes` fields based on official data?
- What is the correct category split for facilities that previously just had `battery`?
