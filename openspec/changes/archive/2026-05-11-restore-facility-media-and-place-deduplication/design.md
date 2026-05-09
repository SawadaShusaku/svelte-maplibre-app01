## Context

The app now serves public facility records through Cloudflare D1-backed API routes. The public app must not expose private normalized rows, raw upstream fields, geocoding cache data, or internal review notes. A current data-quality leak is that text such as "公式ページに緯度経度なし。必要に応じて後段でジオコーディングする。" can survive into public place/facility information even though it is an internal pipeline note.

The map UI already has Mapillary proxy code and detail-panel hero image behavior, but facility popup/detail media is no longer reliably visible. Restoring media should use only approved public image/media references and must degrade cleanly when no media exists.

The national D1 dataset contains source rows from different upstream organizations and categories. Some rows describe the same real-world collection place with different category-specific names or address notation, for example `神田公園出張所ストックヤード` for waste oil and `神田公園出張所` for ink cartridges. Users should see one place marker with multiple accepted categories when the rows are confidently the same place.

## Goals / Non-Goals

**Goals:**
- Restore approved facility image/media display in popups and detail surfaces.
- Strip internal geocoding/source-quality notes from all public facility API responses and derived public feature data.
- Add quality gates that fail before import or serving when internal notes leak into public fields.
- Define place-level deduplication that merges safe same-place rows into one public facility with multiple categories.
- Produce private review reports for ambiguous duplicate candidates.
- Keep GeoJSON/D1 public schemas explicit about allowed public fields and optional media fields.

**Non-Goals:**
- Do not publish private upstream snapshots, normalized private rows, geocoding caches, or review reports in this public app repository.
- Do not automatically merge ambiguous facility rows based only on vector similarity.
- Do not geocode rows during the public app runtime.
- Do not assign fallback coordinates such as municipality centroids when official coordinates are absent.
- Do not require Cloudflare Vectorize for the first implementation.

## Decisions

### Decision 1: Restore media through approved public media fields

Public facility records should support optional media fields such as `image_url`, `image_alt`, `image_credit`, `image_source_url`, or a Mapillary image reference. The UI renders the hero/media area only when at least one approved media reference is available. When absent, the popup/detail falls back to existing text, route, category, and source controls without a broken image frame.

Alternative considered: always fetch nearby Mapillary imagery by coordinate at popup-open time. This is useful as a fallback, but it can be slow, token-dependent, and may show a nearby street image that is not the facility. The safer contract is approved media first, optional nearby imagery second, and no placeholder if neither is available.

### Decision 2: Public outputs use an allowlist, not a denylist

D1 API serialization and seed generation should use an explicit public field allowlist. Internal strings such as geocoding notes, source review notes, confidence reasons, raw source fields, and cache metadata must never be copied through generic object spreading.

Alternative considered: strip only known bad note strings. This is too brittle because future internal notes may use different wording. The allowlist approach is easier to audit and test.

### Decision 3: Deduplicate by deterministic place keys first

The first pass should normalize candidate rows using:
- canonicalized address text, including Japanese numeral/address notation normalization where practical;
- administrative area match;
- coordinate distance threshold when both coordinates exist;
- normalized facility name similarity after removing category-specific suffixes such as `ストックヤード`, `回収箱`, or category labels;
- source/category compatibility rules.

Rows are automatically merged only when deterministic evidence is strong, for example same normalized administrative area, same normalized address, and compatible coordinates. The merged public facility keeps one place identity and associates all categories from source rows.

Alternative considered: use embeddings/vector search for automatic merging. It may help find candidates, but it can merge unrelated places with similar names or addresses. For this dataset, vector similarity should be optional review assistance only.

### Decision 4: Ambiguous candidates remain private review items

When rows are similar but not safely mergeable, the pipeline writes a private review report with candidate IDs, names, addresses, categories, coordinates, match reasons, and recommended action. Public D1 import either keeps them separate or blocks if the candidate is above a configured risk threshold and has no review decision.

### Decision 5: GeoJSON schema stays derived and public-only

During transition, any derived GeoJSON or public feature shape must contain only approved public fields: stable public ID, display name, address, prefecture/city labels, categories, coordinates, optional hours/notes that are public-facing, source display URL, and optional approved media fields. It must not contain geocoding process notes, raw source notes, confidence reasons, or "official page has no coordinates" style text.

## Risks / Trade-offs

- [Risk] Rule-based deduplication may miss subtle duplicates with different addresses. → Mitigation: generate private candidate reports and optionally rank them with vector similarity for human review.
- [Risk] Over-aggressive merging could combine different counters in one building. → Mitigation: require strong address/admin/coordinate evidence for automatic merges and leave borderline rows separate.
- [Risk] Public media can point to stale or unrelated imagery. → Mitigation: only render approved media references, include source credit where required, and fall back cleanly.
- [Risk] Adding media fields to API responses can expose unapproved source URLs. → Mitigation: serialize through a public allowlist and add tests for forbidden internal/public fields.
- [Risk] Existing specs contain some old delta-format main specs. → Mitigation: normalize touched main specs before archiving this change.

## Migration Plan

1. Inspect current popup/detail media code and restore the intended media data flow using approved fields or Mapillary fallback.
2. Add public serialization tests that reject internal notes and unapproved fields.
3. Add or update D1 schema/public types to carry optional approved media fields if they are not already available.
4. Implement deterministic deduplication in the private pipeline export or D1 seed generation path, with a private ambiguous-candidate report.
5. Regenerate/import preview D1 data, verify known examples such as 神田公園出張所 collapse into one public marker when the merge is safe.
6. Validate production dry-run and browser popup/media rendering.

Rollback is to redeploy the previous D1 public dataset and app build. Because private review reports are not public serving artifacts, rollback should not remove audit evidence.

## Open Questions

- Which media source should be considered canonical for facilities without approved image URLs: existing Mapillary proximity search, an upstream official image, or no image?
- Where will private deduplication review decisions live: the private pipeline repository, a private spreadsheet, or a D1/private table excluded from public API responses?
- Should ambiguous candidates block preview import only, production import only, or both?
