## Why

豊島区のみ対応した現状のリサイクルマップを、千代田区を皮切りに東京全区・将来は日本全国へ拡張できるアーキテクチャに刷新する。現在のデータスキーマ（`ward`フィールド単一、カテゴリ5品目固定）では都道府県・市区町村の階層を持てず、区ごとに異なる品目（例: 千代田区の「古布」）にも対応できない。

## What Changes

- **BREAKING** GeoJSONスキーマ変更: `ward` フィールドを廃止し `prefecture` / `city` / `cityLabel` の3フィールドに分割
- カテゴリに `used-clothing`（古布）を追加
- データ読み込みを `import.meta.glob` による動的ロードに変更（ファイル追加だけで区が増える）
- ファイル構造を `src/lib/data/{prefecture}/{city}.geojson` に変更
- 千代田区データ（小型家電・廃食用油・古布）を追加
- サイドバーに都道府県・区フィルタを追加
- アプリ名を「豊島区リサイクルマップ」→「東京リサイクルマップ」に変更（将来「日本リサイクルマップ」へ）

## Capabilities

### New Capabilities
- `ward-filter`: サイドバーで都道府県・区を選択して地図を絞り込む
- `multi-ward-data`: 複数区のGeoJSONを動的に読み込み統合して表示する

### Modified Capabilities
- `recycle-data`: GeoJSONスキーマ変更（`ward` → `prefecture`/`city`/`cityLabel`）・ファイル構造変更・古布カテゴリ追加
- `recycle-filter`: 古布カテゴリの追加によりフィルタ対象が6品目に増える

## Impact

- `src/lib/data/toshima.geojson` → `src/lib/data/tokyo/toshima.geojson` に移動・スキーマ更新
- `src/lib/data/tokyo/chiyoda.geojson` を新規追加
- `scripts/facilities.csv` / `scripts/geocode.ts` のスキーマ更新
- `src/lib/categories.ts` に `used-clothing` 追加
- `src/lib/data.ts` を動的ロード方式に全面書き換え
- `src/lib/types.ts` のスキーマ型更新
- `src/routes/+page.svelte` サイドバーに都道府県・区フィルタUI追加・タイトル変更
