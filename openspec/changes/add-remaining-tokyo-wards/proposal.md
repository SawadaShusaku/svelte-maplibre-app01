## Why

東京23区のうち、豊島区・千代田区・中央区・港区・新宿区・文京区・台東区・墨田区・江東区・品川区・目黒区・大田区・世田谷区・渋谷区・中野区の15区が完了しているが、残りの杉並区・北区・荒川区・板橋区・練馬区・足立区・葛飾区・江戸川区の8区（+武蔵野市など必要に応じて）のデータが未対応である。これらの区のリサイクル拠点データを追加し、東京23区全てのカバーを達成する。

## What Changes

- 新規8区のGeoJSONファイルを `src/lib/data/tokyo/` に追加
- 各区の回収拠点データをCSVまたはURLから取得・解析
- GSI Japan Address Search APIで住所から緯度経度を取得
- `migrate.ts` に新規区のcollectorとWARDSエントリを追加
- DBをビルドして smoke テストを実行
- jujutsu (jj) でchange descriptionを更新し、区完結ごとにpush

## Capabilities

### New Capabilities
- `tokyo-remaining-wards-data`: 残り8区のリサイクル拠点データ収集・追加

### Modified Capabilities
- なし（既存のデータ追加ワークフローに従う）

## Impact

- `src/lib/data/tokyo/` に新規8ファイル（suginami.geojson, kita.geojson, arakawa.geojson, itabashi.geojson, nerima.geojson, adachi.geojson, katsushika.geojson, edogawa.geojson）
- `src/lib/db/migrate.ts` に新規区のcollectorとWARDS追加
- `static/recycling.db` が再生成される
