## 1. 杉並区 (suginami)

- [ ] 1.1 杉並区の公式サイトから回収拠点データを取得
- [ ] 1.2 CSVデータ（インク、JBRC、ボタン電池、廃食用油）を抽出・フィルタ
- [ ] 1.3 住所をGSI APIでジオコーディング
- [ ] 1.4 GeoJSON作成（重複チェック含む）
- [ ] 1.5 `migrate.ts` に杉並区追加
- [ ] 1.6 `npm run build:db && npm run smoke`
- [ ] 1.7 `jj describe` + `jj git push`

## 2. 北区 (kita)

- [ ] 2.1 北区の公式サイトから回収拠点データを取得
- [ ] 2.2 CSVデータを抽出・フィルタ
- [ ] 2.3 住所をGSI APIでジオコーディング
- [ ] 2.4 GeoJSON作成（重複チェック含む）
- [ ] 2.5 `migrate.ts` に北区追加
- [ ] 2.6 `npm run build:db && npm run smoke`
- [ ] 2.7 `jj describe` + `jj git push`

## 3. 荒川区 (arakawa)

- [ ] 3.1 荒川区の公式サイトから回収拠点データを取得
- [ ] 3.2 CSVデータを抽出・フィルタ
- [ ] 3.3 住所をGSI APIでジオコーディング
- [ ] 3.4 GeoJSON作成（重複チェック含む）
- [ ] 3.5 `migrate.ts` に荒川区追加
- [ ] 3.6 `npm run build:db && npm run smoke`
- [ ] 3.7 `jj describe` + `jj git push`

## 4. 板橋区 (itabashi)

- [ ] 4.1 板橋区の公式サイトから回収拠点データを取得
- [ ] 4.2 CSVデータを抽出・フィルタ
- [ ] 4.3 住所をGSI APIでジオコーディング
- [ ] 4.4 GeoJSON作成（重複チェック含む）
- [ ] 4.5 `migrate.ts` に板橋区追加
- [ ] 4.6 `npm run build:db && npm run smoke`
- [ ] 4.7 `jj describe` + `jj git push`

## 5. 練馬区 (nerima)

- [ ] 5.1 練馬区の公式サイトから回収拠点データを取得
- [ ] 5.2 CSVデータを抽出・フィルタ
- [ ] 5.3 住所をGSI APIでジオコーディング
- [ ] 5.4 GeoJSON作成（重複チェック含む）
- [ ] 5.5 `migrate.ts` に練馬区追加
- [ ] 5.6 `npm run build:db && npm run smoke`
- [ ] 5.7 `jj describe` + `jj git push`

## 6. 足立区 (adachi)

- [ ] 6.1 足立区の公式サイトから回収拠点データを取得
- [ ] 6.2 CSVデータを抽出・フィルタ
- [ ] 6.3 住所をGSI APIでジオコーディング
- [ ] 6.4 GeoJSON作成（重複チェック含む）
- [ ] 6.5 `migrate.ts` に足立区追加
- [ ] 6.6 `npm run build:db && npm run smoke`
- [ ] 6.7 `jj describe` + `jj git push`

## 7. 葛飾区 (katsushika)

- [ ] 7.1 葛飾区の公式サイトから回収拠点データを取得
- [ ] 7.2 CSVデータを抽出・フィルタ
- [ ] 7.3 住所をGSI APIでジオコーディング
- [ ] 7.4 GeoJSON作成（重複チェック含む）
- [ ] 7.5 `migrate.ts` に葛飾区追加
- [ ] 7.6 `npm run build:db && npm run smoke`
- [ ] 7.7 `jj describe` + `jj git push`

## 8. 江戸川区 (edogawa)

- [ ] 8.1 江戸川区の公式サイトから回収拠点データを取得
- [ ] 8.2 CSVデータを抽出・フィルタ
- [ ] 8.3 住所をGSI APIでジオコーディング
- [ ] 8.4 GeoJSON作成（重複チェック含む）
- [ ] 8.5 `migrate.ts` に江戸川区追加
- [ ] 8.6 `npm run build:db && npm run smoke`
- [ ] 8.7 `jj describe` + `jj git push`

## 9. 最終確認

- [ ] 9.1 全8区のGeoJSONファイルが存在することを確認
- [ ] 9.2 `npm run build:db` で全15+8=23区のデータが正しく反映されることを確認
- [ ] 9.3 `npm run smoke` でHTTP 200を確認
- [ ] 9.4 総施設数を記録
