## Why

現在アプリケーションは豊島区と千代田区のみのデータに対応しているが、ユーザーから「他の区のデータも追加していきたい」という要望がある。東京23区すべてのリサイクル拠点データを網羅的に追加し、各区の公式サイトURLやカテゴリーごとの回収情報URLも管理できるようにすることで、より広範囲で実用的なリサイクルマップを提供する。

## What Changes

- 東京23区（豊島区・千代田区を除く21区）のGeoJSONデータファイルを新規作成
- 各区の回収拠点データ（施設名、住所、回収カテゴリー、営業時間、備考）を追加
- 各区の公式サイトURL（`officialUrl`）をGeoJSONに追加
- 各カテゴリーごとの回収情報ページURL（`categoryUrls`）をGeoJSONに追加
- **BREAKING**: `facilities` テーブルに `official_url` と `category_urls` カラムを追加
- `WARD_REGISTRY` に新規21区のメタデータを追加
- マイグレーションスクリプトを更新して新フィールドを読み込む
- `GeoFeature` 型と `data.ts` を更新して新フィールドをアプリに渡す
- 発泡スチロール（`styrofoam`）は拠点回収ではないため、データには含めない

## Capabilities

### New Capabilities
- `tokyo-23-wards-data`: 東京23区すべてのリサイクル拠点データの収集、管理、追加。各区の公式サイトURLやカテゴリー別回収情報URLの管理を含む。

### Modified Capabilities
- `multi-ward-data`: 複数区対応のデータ構造を拡張。施設データに `officialUrl` と `categoryUrls` を追加する要件変更。
- `recycle-data`: GeoJSON/DBのデータ構造を拡張。新規フィールド（`official_url`, `category_urls`）の追加と型定義の更新。

## Impact

- `src/lib/data/tokyo/` — 新規区のGeoJSONファイル（21ファイル）を追加
- `src/lib/registry.ts` — `WARD_REGISTRY` に21区を追加
- `src/lib/db/schema.sql` — `facilities` テーブルに2カラム追加
- `src/lib/db/migrate.ts` — GeoJSONの `officialUrl` / `categoryUrls` をDBに書き込む処理を追加
- `src/lib/db/types.ts` — `Facility` インターフェースに新フィールドを追加
- `src/lib/data.ts` — `GeoFeature` に新フィールドを追加し、DB値をアプリに渡す
- `static/recycling.db` — DB再ビルドによりデータ量が大幅に増加（現在118件→数百件規模）
