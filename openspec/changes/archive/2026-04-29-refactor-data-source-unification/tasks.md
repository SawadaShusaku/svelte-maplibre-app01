## 1. Remove CSV Files

- [x] 1.1 Delete `scripts/toshima.csv`
- [x] 1.2 Delete `scripts/chiyoda.csv`
- [x] 1.3 Delete `scripts/facilities.csv`

## 2. Remove Obsolete Scripts

- [x] 2.1 Delete `scripts/geocode-facilities.ts`
- [x] 2.2 Delete `scripts/geocode.ts`
- [x] 2.3 Delete `scripts/geocode-failed.json`
- [x] 2.4 Delete `scripts/to-geocode.json`
- [x] 2.5 Delete `scripts/audit-toshima.ts`
- [x] 2.6 Delete `scripts/find-missing-facilities.ts`
- [x] 2.7 Delete `scripts/update-toshima-categories.ts`

## 3. Verify Build Scripts

- [x] 3.1 Confirm `scripts/migrate-to-sqlite.ts` reads only GeoJSON
- [x] 3.2 Confirm `scripts/smoke-test.ts` is present and functional
- [x] 3.3 Run `npm run build:db` to verify it works
- [x] 3.4 Run `npm run smoke` to verify full build works

## 4. Update Documentation

- [x] 4.1 Add "Data Source of Truth" section to AGENTS.md
- [x] 4.2 Document the GeoJSON → SQLite → Browser flow
- [x] 4.3 Document how to add/modify facilities (edit GeoJSON, run build:db)

## 5. Final Verification

- [x] 5.1 Run `npm run check` to ensure no TypeScript errors
- [x] 5.2 Run `npm run test` to ensure tests pass
- [x] 5.3 Verify only 2 files remain in `scripts/` directory
