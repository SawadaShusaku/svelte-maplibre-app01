## 1. DB構造変更

- [x] 1.1 `src/lib/db/schema.sql` の `facilities` テーブルに `official_url` と `category_urls` カラムを追加
- [x] 1.2 `src/lib/db/types.ts` の `Facility` インターフェースに `official_url` と `category_urls` を追加
- [x] 1.3 `src/lib/db/migrate.ts` を更新してGeoJSONの `officialUrl` / `categoryUrls` をDBに書き込む
- [x] 1.4 `npm run build:db` を実行してDBを再生成し、エラーがないことを確認

## 2. アプリケーション連携

- [x] 2.1 `src/lib/data.ts` の `GeoFeature` 型に `officialUrl` と `categoryUrls` を追加
- [x] 2.2 `getFacilities()` と `searchFacilities()` でDB値をGeoJSONプロパティに含める
- [x] 2.3 `npm run check` で型エラーがないことを確認
- [x] 2.4 `npm run smoke` で本番ビルドとHTTP 200を確認

## 3. 既存データのURL追加

- [x] 3.1 豊島区のGeoJSON全Featureに `officialUrl` と `categoryUrls` を追加
- [x] 3.2 千代田区のGeoJSON全Featureに `officialUrl` と `categoryUrls` を追加（空オブジェクトでも可）
- [x] 3.3 `npm run build:db` で反映確認
- [x] 3.4 `npm run test` で既存テストが通ることを確認

## 4. 新規区データ追加（ユーザー提供データを順次処理）

- [x] 4.1 ユーザーから提供された区のデータ（URLまたはテキスト）を解析
- [x] 4.2 施設名・住所・カテゴリーを抽出
- [x] 4.3 GSI Japan Address Search APIで住所から緯度経度を取得
- [x] 4.4 GeoJSON FeatureCollection形式に整形して `src/lib/data/tokyo/{city}.geojson` に保存
- [x] 4.5 `src/lib/registry.ts` の `WARD_REGISTRY` に新規区を追加（後に動的ロードに変更）
- [x] 4.6 `npm run build:db` でDBに反映
- [x] 4.7 `npm run smoke` で動作確認

### 完了済み区（13区 / 23区）

- [x] **豊島区** (toshima.geojson) — 96 features
- [x] **千代田区** (chiyoda.geojson) — 60 features
- [x] **中央区** (chuo.geojson) — 80 features
  - 公共施設＋土曜回収: 31 features
  - インクカートリッジ回収 (CSV): 32 features
  - JBRC充電池回収店 (CSV): 4 features
  - ボタン電池回収店 (CSV + ジオコーディング): 13 features
- [x] **港区** (minato.geojson) — 81 features
- [x] **新宿区** (shinjuku.geojson) — 121 features
- [x] **文京区** (bunkyo.geojson) — 51 features
- [x] **台東区** (taito.geojson) — 87 features
- [x] **墨田区** (sumida.geojson) — 127 features
- [x] **江東区** (koto.geojson) — 98 features
- [x] **品川区** (shinagawa.geojson) — 103 features
- [x] **目黒区** (meguro.geojson) — 78 features
- [x] **大田区** (ota.geojson) — 183 features
- [x] **世田谷区** (setagaya.geojson) — 137 features
- [x] **渋谷区** (shibuya.geojson) — 139 features
  - インク: 17, JBRC: 6, ボタン電池: 19, 廃食用油: 19, 小型家電: 26, 古布: 16, 紙パック: 36
- [x] **中野区** (nakano.geojson) — 80 features（重複マージ済）
  - インク: 10, JBRC: 5, ボタン電池: 19, 廃食用油: 18, 小型家電: 18, 蛍光灯: 18, 乾電池: 45（施設重複マージ済）

### 未対応区（残り10区）

- [ ] **杉並区** (suginami)
- [ ] **北区** (kita)
- [ ] **荒川区** (arakawa)
- [ ] **板橋区** (itabashi)
- [ ] **練馬区** (nerima)
- [ ] **足立区** (adachi)
- [ ] **葛飾区** (katsushika)
- [ ] **江戸川区** (edogawa)
- [ ] **豊島区以外の区**（武蔵野市等、必要に応じて）

## 5. 品質管理

- [x] 5.1 追加したGeoJSONの `categories` に `styrofoam` が含まれていないことを確認
- [x] 5.2 `battery` という古いカテゴリーIDが含まれていないことを確認（含まれる場合は手動分類）
- [x] 5.3 各区の `officialUrl` が正しく設定されていることを確認
- [x] 5.4 `npm run test` と `npm run smoke` を最終実行して問題がないことを確認
- [x] 5.5 同じ住所の施設はカテゴリーをマージし、重複Featureを削除（中野区で適用）

## 6. 技術スタック・ワークフロー更新

- [x] 6.1 `AGENTS.md` に jujutsu (jj) を Version Control として追記
- [x] 6.2 `WARD_REGISTRY` を動的ロード（`import.meta.glob`）に変更し、手動登録を不要化
- [x] 6.3 共通CSV（tokyo_ink_collection.csv, tokyo_jbrc_battery_shops.csv, tokyo_button_battery.csv, tokyo_used_cooking_oil_collection.csv）を活用した自動化スクリプト (`scripts/process-ward-csvs.cjs`) を作成

## 7. 開発ワークフローの教訓

- [ ] 7.1 **jujutsuを使用** — gitではなくjjでバージョン管理（このchangeではgitを誤用）
- [ ] 7.2 **openspec skillを使用** — 通常の対話モードではなく、skill経由でタスク管理
- [ ] 7.3 **区単位でまとめてテスト・コミット** — カテゴリごとではなく、1区完結ごとに `build:db` + `smoke` + `jj commit`
- [ ] 7.4 **重複マージは慎重に** — 同じ住所のFeatureをマージする際、Featureを上書きしないよう注意（Mapのキー管理）
