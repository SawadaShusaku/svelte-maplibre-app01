## Context

After the previous change (`improve-desktop-popup`), we discovered that the data layer had become fragmented:

- `src/lib/data/*.geojson` — supposed to be the master
- `scripts/*.csv` — legacy files that were mistakenly being treated as authoritative
- `scripts/migrate-to-sqlite.ts` — was reading CSV instead of GeoJSON due to a past refactor

This caused a critical bug where 39 facilities were added to CSV but not GeoJSON, and the `mapBatteryCategory` function (with hardcoded store names) was accidentally kept alive longer than it should have been.

## Goals / Non-Goals

**Goals:**
- Establish GeoJSON as the single source of truth
- Remove all CSV files to prevent future confusion
- Remove all obsolete/one-off scripts
- Document the data flow clearly in AGENTS.md

**Non-Goals:**
- Changing the SQLite schema
- Changing runtime behavior
- Adding new features
- Moving build scripts out of `scripts/` (they belong there by convention)

## Decisions

### 1. GeoJSON as single source of truth

**Rationale:** GeoJSON natively supports coordinates (Point geometry), is human-readable (JSON), and is the standard format for map applications. The team confirmed this is the preferred master format.

**Alternative considered:** Keep CSV as master and generate GeoJSON at build time. Rejected because it adds an unnecessary transformation step and CSV doesn't natively support nested structures or coordinates.

### 2. Delete CSV files entirely

**Rationale:** If GeoJSON is the master, CSV is redundant and dangerous. Having two formats invites the next developer to edit the wrong one.

**Alternative considered:** Keep CSV as a "readable backup". Rejected because Git already provides history; a second format creates drift.

### 3. Keep only 2 scripts in `scripts/`

**Rationale:** `migrate-to-sqlite.ts` and `smoke-test.ts` are the only scripts referenced from `package.json`. Everything else is either:
- One-off geocoding scripts (`geocode*.ts`, `to-geocode.json`, `geocode-failed.json`)
- Audit scripts (`audit-toshima.ts`, `find-missing-facilities.ts`)
- Category update scripts (`update-toshima-categories.ts`)

These can be recovered from Git history if needed.

### 4. Do NOT move build scripts to `src/`

**Rationale:** Build scripts belong in `scripts/` by Node.js convention. `src/` is for application code that runs in the browser. `migrate-to-sqlite.ts` uses `better-sqlite3` (Node.js-only) and should not be in `src/`.

## Risks / Trade-offs

- **[Risk]** Deleting CSV files means losing the "easy spreadsheet editing" workflow.
  → **Mitigation:** GeoJSON can be edited with geojson.io or any text editor. If spreadsheet editing is needed later, we can build a one-way import tool.
- **[Risk]** `audit-toshima.ts` or other deleted scripts might be needed again.
  → **Mitigation:** Everything is in Git history. We can restore with `git show`.

## Migration Plan

No migration needed. This is a cleanup change.

## Open Questions

None.
