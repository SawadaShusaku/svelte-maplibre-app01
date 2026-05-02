## Requirements

### Requirement: 残り8区のGeoJSONデータ追加

アプリは残りの8区（杉並区、北区、荒川区、板橋区、練馬区、足立区、葛飾区、江戸川区）のリサイクル拠点データをGeoJSONとして追加しなければならない（SHALL）。

#### Scenario: 杉並区データ追加
- **WHEN** 杉並区の回収拠点データを取得する
- **THEN** `src/lib/data/tokyo/suginami.geojson` を作成し、全拠点をFeatureCollectionとして保存する
- **AND** 各Featureには正確な住所と緯度経度が含まれる

#### Scenario: データ品質チェック
- **WHEN** GeoJSONファイルを作成する
- **THEN** 住所が「区名のみ」になっていないことを確認する
- **AND** 同じ住所の施設はcategories配列でマージされる
- **AND** `battery` という古いカテゴリIDが含まれていない

#### Scenario: DB反映
- **WHEN** `npm run build:db` を実行する
- **THEN** 新規区のデータがSQLiteに正しく反映される
- **AND** `npm run smoke` がパスする

### Requirement: migrate.tsの更新

新規区をDBに登録するため、`src/lib/db/migrate.ts` を更新しなければならない（SHALL）。

#### Scenario: 新規区のcollector追加
- **WHEN** 新しい区のGeoJSONを追加する
- **THEN** COLLECTORS配列に `{ id: '{city}-city', name: '{区名}環境課', url: '...' }` を追加する
- **AND** WARDS配列に `{ id: '{city}', prefecture: 'tokyo', city_label: '{区名}', url: '...' }` を追加する
- **AND** collectorId分岐に `{city}` のケースを追加する

### Requirement: 住所ジオコーディング

新規施設データの住所から緯度経度は、GSI Japan Address Search API を使用して自動取得しなければならない（SHALL）。

#### Scenario: 住所のジオコーディング
- **WHEN** 「杉並区阿佐谷南1-25-24」という住所をAPIに送信する
- **THEN** 正確な緯度経度が返される
- **AND** 失敗した場合は報告し、フォールバック座標を勝手に割り当てない
