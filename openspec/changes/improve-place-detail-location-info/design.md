## Context

The public app serves normalized `places` with category/source-specific `place_collection_entries`. The detail UI still hides practical destination details such as entrance, floor, counter, parking lot, or installation location behind a category-details tab. The data model already includes `place_collection_entries.location_hint`, but current normalization does not populate it.

The app marker design supports multiple categories on one marker. For this app, same-building records should generally become one `place`, with category-specific differences preserved in entry fields.

The current deduplication implementation depends on exact normalized-address buckets plus hand-maintained Japanese normalization rules. It also compares rows whose coordinates came from different coordinate-generation policies: upstream official CSV coordinates and mixed geocoder outputs. That does not scale for this project. The first correction is to regenerate public map coordinates through one Google coordinate workflow: Geocoding first, with Places API refinement for coarse address results. After that, use embeddings to find likely duplicate groups, review those groups, and keep automatic merging limited to simple safe cases.

## Goals / Non-Goals

**Goals:**

- Make facility details action-oriented: address, category chips, destination hints, hours, conditions, source links, and routing in one readable flow.
- Preserve `place_collection_entries.location_hint` from explicit fields or clear public source text.
- Regenerate all public map coordinates with Google Geocoding API, including rows that already have upstream latitude/longitude, and refine coarse Geocoding results with Places API when the facility-name/address match is plausible.
- Automatically merge source rows that have the same display coordinate into one public marker/place.
- Generate vector-based duplicate candidate groups for near-but-not-identical coordinate cases so same-building records are easier to review and merge.
- Keep the implementation small enough for individual development and easy handoff to other agents.
- Reuse the same embedding text builder later for Cloudflare Vectorize user search.

**Non-Goals:**

- Do not build a production-grade automated entity-resolution system in the first pass.
- Do not require separate private and public Vectorize indexes for the initial deduplication work.
- Do not introduce public confidence scores.
- Do not expose embeddings, vector scores, private source rows, or review metadata through public D1/API responses.
- Do not mix upstream official coordinates, GSI-generated coordinates, and Google-generated coordinates as if they were the same basis.
- Do not split one building into multiple markers solely because categories use different entrances or counters.

## Decisions

### Decision: Regenerate map coordinates with Google Geocoding plus Places refinement

All public map coordinates should be regenerated through one Google coordinate workflow before marker integration is redesigned. The current dataset mixes coordinate sources, which makes distance thresholds unreliable and increases the later cost of building-level deduplication.

The normal first step is Google Geocoding by address. When that returns a coarse `APPROXIMATE`, `GEOMETRIC_CENTER`, or `RANGE_INTERPOLATED` result, the private pipeline should query Google Places API with facility name plus address. If Places returns a candidate address without an administrative-area contradiction, the pipeline may accept it because the source address can be stale, old notation, or less precise than Google Places.

The private pipeline may still keep upstream-provided coordinates and GSI comparison results as audit fields, but public `places.latitude` / `places.longitude` should come from the unified Google output unless a row is explicitly reviewed and manually corrected.

GSI Japan Address Search API remains useful for comparison and exception analysis. It should not be part of the normal public coordinate generation path because GSI can return coarse or wrong representative points while still producing a successful response.

Google `location_type`, matched name, formatted address, and `place_id` are private audit metadata. They help find `APPROXIMATE` or suspicious results but must not become public confidence fields.

When a row remains on a coarse Google Geocoding coordinate after Places refinement, the public app should still show it unless it is known to be closed or invalid. This is partly a data-source freshness issue, not only an app-side geocoding issue. The public UI should expose a short user-facing coordinate notice instead of hiding the row:

```text
この地点は、データ提供元の住所をもとにGoogle APIが推定した位置です。
```

The notice is only for coarse fallback coordinates such as remaining `APPROXIMATE`, `GEOMETRIC_CENTER`, or `RANGE_INTERPOLATED` results. It should not appear for Google `ROOFTOP`, accepted Places `PLACE`, or manually reviewed coordinates. The app should not expose raw `location_type`, `place_id`, vector scores, or confidence fields.

### Decision: Auto-merge same display coordinates first

After Google coordinate regeneration, source rows with the same display coordinate should be merged into one public `place` automatically. The marker UI cannot show separate markers at the same displayed position, so leaving those rows separate makes the map misleading: the user sees only one location but the data still behaves like multiple places.

The display-coordinate key is the Google-generated latitude and longitude rounded to the coordinate precision used for public marker placement. In the first implementation this is six decimal places. That is tighter than ordinary building-scale distance thresholds, and it makes the rule easy to explain and test.

The automatic rule only applies to reliable display coordinates: Google `ROOFTOP`, accepted Places `PLACE` results, or explicitly reviewed manual coordinates. Google `GEOMETRIC_CENTER`, `RANGE_INTERPOLATED`, and `APPROXIMATE` can collapse unrelated rows onto a representative point, so those same-coordinate pairs must stay separate or be reviewed by address/vector candidates instead of being merged automatically.

The simplest useful flow is:

```text
source rows
  -> unified Google coordinates
  -> same-display-coordinate automatic groups
  -> public places plus collection entries
  -> address-key/vector candidate report for remaining nearby cases
```

Rows merged by the coordinate rule still preserve source/category-specific listing names, addresses, hours, notes, and location hints on `place_collection_entries`. The canonical place name/address can remain simple and deterministic; the detail UI is responsible for exposing the multiple entries when they matter.

Alternative considered: start review-first for every duplicate. That misses the immediate UI problem: same-coordinate markers are already visually collapsed for the user, so the data should explicitly represent that collapse.

### Decision: Use address keys and vector search for remaining candidates

Address-key and vector similarity should not block same-coordinate grouping. They should be used after same-coordinate grouping to find candidates that may be the same building even though their coordinates are close rather than identical.

The first review flow can stay small:

```text
remaining public places
  -> building/address key buckets
  -> embedding input variants
  -> nearest-neighbor pairs
  -> connected duplicate groups
  -> private review CSV/Markdown
```

Same normalized address alone is not enough for automatic merging. The Misato example shows why: a community center and a child center can share the same block-level address while being separate buildings. Those pairs should remain separate unless they also share the same display coordinate or are later explicitly reviewed.

Alternative considered: implement full guardrails up front. That is overbuilt for this project and makes the first useful result slower.

### Decision: Private/public separation is a data-boundary rule, not an index requirement

For the initial implementation, vector candidate generation can run locally or in the private pipeline using private artifacts. It does not require a Cloudflare Vectorize index.

The required boundary is simple: do not commit or expose private source rows, embedding vectors, vector scores, or review metadata. Public D1/API should only contain the final `places` and `place_collection_entries`.

Later, public semantic search can use Cloudflare Vectorize with public-only `place` and `entry` vectors. That can be a separate implementation step using the same text builder.

Alternative considered: define separate private and public Vectorize indexes immediately. That is a reasonable future architecture, but it is not necessary for the first pass.

### Decision: Keep guardrails minimal

The first pass only needs a few low-cost checks:

- Only auto-merge same-display-coordinate rows when coordinates are reliable `ROOFTOP` or manual points.
- Do not auto-merge same-address or near-coordinate rows without the reliable same-coordinate signal.
- Treat chain stores or same-name different-location rows as review candidates.
- Keep all uncertain vector groups in the review report.
- Keep coarse Google fallback rows visible with the standard coordinate notice unless a manual review marks them inactive.

Most safety comes from review-first output, not from enterprise-style guardrail complexity.

Alternative considered: model detailed contradiction signals for store identity, source identity, geocode quality, and threshold bands. That can come later if review reports show repeated failure modes.

### Decision: Use one detail flow instead of required basic/details tabs

The detail panel and bottom sheet should show destination-critical information without tab switching. Category-specific rows can still be grouped under category labels, but the UI should avoid hiding "where to bring it" behind a secondary tab.

### Decision: Store entrance and installation differences on entries

`places` remains the marker and building-level identity. `place_collection_entries.location_hint` stores per-category/source destination details such as entrance, floor, counter, lobby, parking lot, gate, stockyard, or reception location. `notes` remains for public conditions or caveats that are not just a location hint.

## Risks / Trade-offs

- ROOFTOP-only auto merge misses some legitimate same-building groups -> Those remain in the address/vector review report instead of being silently wrong.
- Vector groups may contain false positives -> Keep the report grouped and reviewable; only same reliable display-coordinate groups merge automatically.
- Public search may need a different index shape later -> Reuse the text builder, but defer Vectorize index design until search implementation.
- Location-hint extraction may misclassify conditions as location text -> Keep extraction conservative and preserve original public notes when unsure.

## Migration Plan

1. Regenerate all private normalized source CSV coordinates through Google Geocoding API with `--force`, including JBRC and ink rows that already had upstream coordinates.
2. Keep previous upstream coordinates and optional GSI comparison outputs private for audit only; do not mix them into public `places`.
3. Refine coarse Google Geocoding results through Places API and validate remaining Google failures, `APPROXIMATE` results, and source-area contradictions before exporting a public D1 seed.
4. Add public-safe fixture examples for vector duplicate groups and location hints.
5. Add an embedding text builder that can be used by both dedupe and future public search.
6. Automatically group same-display-coordinate rows during public seed normalization.
7. Generate address/vector-neighbor duplicate groups for remaining nearby candidates and write a private review report.
8. Preserve `location_hint` in `place_collection_entries`.
9. Add the standard coordinate notice for remaining coarse Google fallback coordinates.
10. Rework the popup/bottom-sheet content into one action-oriented flow.
11. Run `npm run test`; run `npm run smoke` if detail loading or SSR/browser rendering changes.

## Open Questions

- Which embedding model should be used for the first local/private candidate report?
- Should the first implementation use a local in-memory nearest-neighbor calculation, a lightweight local vector library, or Cloudflare Workers AI embeddings exported into a private artifact?
- Which source text patterns should become `location_hint` immediately, and which should remain `notes`?
- Should public semantic search be a later issue after dedupe review output proves useful?
