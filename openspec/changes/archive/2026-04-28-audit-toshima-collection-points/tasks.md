## 1. Data Audit

- [ ] 1.1 Backup current `src/lib/data/tokyo/toshima.geojson`
- [ ] 1.2 Audit 蛍光灯 collection points from https://www.city.toshima.lg.jp/150/kurashi/gomi/shigen/026267.html
- [ ] 1.3 Audit 乾電池 collection points from https://www.city.toshima.lg.jp/150/kurashi/gomi/shigen/2509251342.html
- [ ] 1.4 Audit 廃食用油 collection points from https://www.city.toshima.lg.jp/150/kurashi/gomi/shigen/013326.html
- [ ] 1.5 Audit インクカートリッジ collection points from https://www.city.toshima.lg.jp/150/kurashi/gomi/shigen/022688.html
- [ ] 1.6 Audit 小型家電 collection points from https://www.city.toshima.lg.jp/150/kurashi/gomi/shigen/034106.html
- [ ] 1.7 Audit 区では収集できないもの page https://www.city.toshima.lg.jp/kurashi/gomi/katei/shushu/index.html
- [ ] 1.8 Document discrepancies: missing facilities, extra facilities, wrong categories

## 2. GeoJSON Update

- [ ] 2.1 Update legacy `battery` categories to specific types (`dry-battery`, `rechargeable-battery`, `button-battery`)
- [ ] 2.2 Add missing facilities from official sources
- [ ] 2.3 Remove facilities not listed on official sources
- [ ] 2.4 Correct facility names and addresses if needed
- [ ] 2.5 Update facility category assignments per official data
- [ ] 2.6 Verify GeoJSON is valid JSON

## 3. Database Rebuild & Verification

- [ ] 3.1 Run `npm run build:db` to regenerate SQLite
- [ ] 3.2 Run `npm run check` for TypeScript errors
- [ ] 3.3 Run `npm run test` to ensure tests pass
- [ ] 3.4 Run `npm run smoke` to verify HTTP 200
- [ ] 3.5 Manual visual check: confirm marker count and categories on map
