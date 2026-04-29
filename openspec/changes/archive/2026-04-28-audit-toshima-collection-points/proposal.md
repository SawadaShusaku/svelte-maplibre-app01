## Why

現在の豊島区の回収拠点データ（`src/lib/data/tokyo/toshima.geojson`）は、豊島区の公式オープンデータと比較して正確性を確認する必要がある。ユーザーが提供した公式URLに基づき、各カテゴリ（蛍光灯、乾電池、廃食用油、インクカートリッジ、小型家電）の回収拠点リストを照合し、データの不備や誤りを修正する。

## What Changes

- **回収拠点データの照合**: 豊島区公式サイトの情報と現在のGeoJSONデータを比較し、不足・誤りを特定
- **カテゴリ名の統一**: 古い `battery` 等のカテゴリ名を `dry-battery` / `rechargeable-battery` / `button-battery` に分離・統一
- **不要施設の削除**: 公式リストに存在しない施設を削除
- **新規施設の追加**: 公式リストにあってDBにない施設を追加
- **カテゴリ割り当ての修正**: 各施設が正しいカテゴリを受け付けているか確認・修正
- **ビルド更新**: `npm run build:db` でSQLiteを再生成

## Capabilities

### New Capabilities
- `data-audit`: 回収拠点データの公式ソースとの照合・検証プロセス

### Modified Capabilities
- `map-markers`: マーカー表示対象の施設データが変更される（追加・削除・カテゴリ変更）

## Impact

- `src/lib/data/tokyo/toshima.geojson` — 大幅な追加・削除・修正
- `static/recycling.db` — `npm run build:db` で再生成
- マーカー表示数が変動する可能性あり
