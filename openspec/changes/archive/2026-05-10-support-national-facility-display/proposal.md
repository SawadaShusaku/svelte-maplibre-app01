## Why

The production D1 database now contains nationwide facility rows, but the app UI and data-access flow still assume Tokyo ward keys from the static registry. This prevents users from seeing national data even though the serving database is already populated.

## What Changes

- Add national-scope facility browsing so the app can display facilities outside the current Tokyo ward registry.
- Replace Tokyo-only selected city keys as the runtime source of truth with D1-provided area metadata.
- Support area selection across prefectures and municipalities while preserving current map markers, category filtering, search, and detail behavior.
- Ensure the API can return available areas, categories, and facilities for nationwide datasets without exposing private upstream data.
- Add safeguards for large nationwide result sets, including initial viewport/selection behavior, loading states, and predictable query limits or pagination where needed.
- Update documentation so future data additions come from the private D1 pipeline rather than app-local GeoJSON registry expansion.

## Capabilities

### New Capabilities
- `national-facility-display`: Covers nationwide area metadata, initial display behavior, large-result handling, and map/list behavior across multiple prefectures.

### Modified Capabilities
- `cloudflare-d1-serving`: D1-backed API behavior changes from ward-only Tokyo serving to national public serving with scalable query parameters.
- `ward-filter`: The filtering contract changes from Tokyo ward-only selection to D1-backed prefecture/municipality area selection while preserving existing multi-select behavior.
- `facility-search`: Search must work over the currently selected national area scope and avoid unintentionally searching only Tokyo registry rows.

## Impact

- `src/routes/api/wards/+server.ts` and D1 repository area queries need to expose nationwide area metadata from D1.
- `src/routes/api/facilities/+server.ts` and `src/lib/data.ts` need to support D1 area identifiers that are not derived from `WARD_REGISTRY`.
- `src/routes/+page.svelte`, sidebar controls, and category filtering need to initialize from API-provided areas rather than hard-coded Tokyo registry keys.
- `src/lib/registry.ts` remains useful for legacy Tokyo metadata/source URLs but must not be required for national facility display.
- Tests should cover non-Tokyo areas, mixed prefecture selection, category availability, search, and transient API failures.
