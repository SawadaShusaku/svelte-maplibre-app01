## Context

The public app serves normalized `places` with category/source-specific `place_collection_entries`. The detail UI still hides practical destination details such as entrance, floor, counter, parking lot, or installation location behind a category-details tab. The data model already includes `place_collection_entries.location_hint`, but current normalization does not populate it.

The app marker design supports multiple categories on one marker. For this app, same-building records should generally become one `place`, with category-specific differences preserved in entry fields.

The current deduplication implementation depends on exact normalized-address buckets plus hand-maintained Japanese normalization rules. That does not scale for this project. The replacement should be deliberately small: use embeddings to find likely duplicate groups, review those groups, and only add automatic merging after real examples show that a simple rule is safe.

## Goals / Non-Goals

**Goals:**

- Make facility details action-oriented: address, category chips, destination hints, hours, conditions, source links, and routing in one readable flow.
- Preserve `place_collection_entries.location_hint` from explicit fields or clear public source text.
- Generate vector-based duplicate candidate groups so same-building records are easier to review and merge.
- Keep the implementation small enough for individual development and easy handoff to other agents.
- Reuse the same embedding text builder later for Cloudflare Vectorize user search.

**Non-Goals:**

- Do not build a production-grade automated entity-resolution system in the first pass.
- Do not require separate private and public Vectorize indexes for the initial deduplication work.
- Do not introduce public confidence scores.
- Do not expose embeddings, vector scores, private source rows, or review metadata through public D1/API responses.
- Do not split one building into multiple markers solely because categories use different entrances or counters.

## Decisions

### Decision: Start review-first, not auto-merge-first

The first vector implementation should produce grouped duplicate candidates for review. It should not need a complex `auto-merge / review / separate` rule engine at the start.

The simplest useful flow is:

```text
source rows
  -> embedding input text
  -> embeddings
  -> nearest-neighbor pairs
  -> connected duplicate groups
  -> review CSV/Markdown
```

After the candidate report looks good, a small auto-merge rule can be added for very obvious clusters. Until then, manual review of grouped candidates is acceptable and safer.

Alternative considered: implement full guardrails up front. That is overbuilt for this project and makes the first useful result slower.

### Decision: Private/public separation is a data-boundary rule, not an index requirement

For the initial implementation, vector candidate generation can run locally or in the private pipeline using private artifacts. It does not require a Cloudflare Vectorize index.

The required boundary is simple: do not commit or expose private source rows, embedding vectors, vector scores, or review metadata. Public D1/API should only contain the final `places` and `place_collection_entries`.

Later, public semantic search can use Cloudflare Vectorize with public-only `place` and `entry` vectors. That can be a separate implementation step using the same text builder.

Alternative considered: define separate private and public Vectorize indexes immediately. That is a reasonable future architecture, but it is not necessary for the first pass.

### Decision: Keep guardrails minimal

The first pass only needs a few low-cost checks:

- Do not auto-merge across clearly different administrative areas.
- Do not auto-merge records with clearly far-apart coordinates.
- Treat chain stores or same-name different-location rows as review candidates.
- Keep all uncertain vector groups in the review report.

Most safety comes from review-first output, not from enterprise-style guardrail complexity.

Alternative considered: model detailed contradiction signals for store identity, source identity, geocode quality, and threshold bands. That can come later if review reports show repeated failure modes.

### Decision: Use one detail flow instead of required basic/details tabs

The detail panel and bottom sheet should show destination-critical information without tab switching. Category-specific rows can still be grouped under category labels, but the UI should avoid hiding "where to bring it" behind a secondary tab.

### Decision: Store entrance and installation differences on entries

`places` remains the marker and building-level identity. `place_collection_entries.location_hint` stores per-category/source destination details such as entrance, floor, counter, lobby, parking lot, gate, stockyard, or reception location. `notes` remains for public conditions or caveats that are not just a location hint.

## Risks / Trade-offs

- Review-first means fewer automatic wins at first -> The first goal is to make duplicates visible and cheap to fix.
- Vector groups may contain false positives -> Keep the report grouped and reviewable, and avoid automatic merging until examples justify it.
- Public search may need a different index shape later -> Reuse the text builder, but defer Vectorize index design until search implementation.
- Location-hint extraction may misclassify conditions as location text -> Keep extraction conservative and preserve original public notes when unsure.

## Migration Plan

1. Add public-safe fixture examples for vector duplicate groups and location hints.
2. Add an embedding text builder that can be used by both dedupe and future public search.
3. Generate vector-neighbor duplicate groups and write a private review report.
4. Add simple reviewed merge application or obvious-cluster merge only after reviewing outputs.
5. Preserve `location_hint` in `place_collection_entries`.
6. Rework the popup/bottom-sheet content into one action-oriented flow.
7. Run `npm run test`; run `npm run smoke` if detail loading or SSR/browser rendering changes.

## Open Questions

- Which embedding model should be used for the first local/private candidate report?
- Should the first implementation use a local in-memory nearest-neighbor calculation, a lightweight local vector library, or Cloudflare Workers AI embeddings exported into a private artifact?
- Which source text patterns should become `location_hint` immediately, and which should remain `notes`?
- Should public semantic search be a later issue after dedupe review output proves useful?
