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
- [x] 4.5 `src/lib/registry.ts` の `WARD_REGISTRY` に新規区を追加
- [x] 4.6 `npm run build:db` でDBに反映
- [x] 4.7 `npm run smoke` で動作確認

### 完了済み区

- [x] **豊島区** (toshima.geojson) — 96 features
- [x] **千代田区** (chiyoda.geojson) — 60 features
- [x] **中央区** (chuo.geojson) — 80 features
  - 公共施設＋土曜回収: 31 features
  - インクカートリッジ回収 (CSV): 32 features
  - JBRC充電池回収店 (CSV): 4 features
  - ボタン電池回収店 (CSV + ジオコーディング): 13 features

## 5. 品質管理

- [x] 5.1 追加したGeoJSONの `categories` に `styrofoam` が含まれていないことを確認
- [x] 5.2 `battery` という古いカテゴリーIDが含まれていないことを確認（含まれる場合は手動分類）
- [x] 5.3 各区の `officialUrl` が正しく設定されていることを確認
- [x] 5.4 `npm run test` と `npm run smoke` を最終実行して問題がないことを確認
