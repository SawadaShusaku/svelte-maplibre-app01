## ADDED Requirements

### Requirement: GeoJSONスキーマ準拠
全拠点データはGeoJSON FeatureCollection形式で管理しなければならない（SHALL）。各Featureは以下のプロパティを持つ。

| プロパティ | 型 | 必須 | 説明 |
|---|---|---|---|
| `id` | string | ✓ | 一意識別子（例: `toshima-001`） |
| `prefecture` | string | ✓ | 都道府県ID（例: `tokyo`） |
| `city` | string | ✓ | 市区町村ID（例: `toshima`） |
| `cityLabel` | string | ✓ | 表示名（例: `豊島区`） |
| `name` | string | ✓ | 施設名 |
| `address` | string | ✓ | 住所 |
| `categories` | string[] | ✓ | カテゴリ識別子の配列 |
| `hours` | string | | 営業時間・回収時間 |
| `notes` | string | | 補足事項 |

#### Scenario: スキーマ検証
- **WHEN** GeoJSONファイルをロードする
- **THEN** 全Featureがid・prefecture・city・cityLabel・name・address・categoriesを持ち、wardフィールドを持たないこと

### Requirement: 都道府県別ディレクトリ構造
データファイルは `src/lib/data/{prefecture}/{city}.geojson` のパスで管理しなければならない（SHALL）。

#### Scenario: 豊島区ファイルパス
- **WHEN** 豊島区データを参照する
- **THEN** `src/lib/data/tokyo/toshima.geojson` からロードされる

#### Scenario: 千代田区ファイルパス
- **WHEN** 千代田区データを参照する
- **THEN** `src/lib/data/tokyo/chiyoda.geojson` からロードされる

### Requirement: データ品質チェック
GeoJSONファイルを作成または修正する際、以下の品質チェックを行わなければならない（SHALL）。手動でのチェックに加え、自動監査スクリプトによる検証も必須とする。

#### Scenario: 住所の完全性チェック
- **WHEN** 新規GeoJSONファイルを作成する
- **THEN** 住所が「区名のみ」になっていないことを確認する
- **AND** 番地・建物名まで含まれた完全な住所であること

#### Scenario: 重複施設のマージ
- **WHEN** 同じ住所の施設が複数のカテゴリで登録される場合
- **THEN** 1つのFeatureにcategories配列で複数カテゴリを持たせる
- **AND** 異なる住所のFeatureは分割して保持する

#### Scenario: 古いカテゴリIDの排除
- **WHEN** GeoJSONファイルを検証する
- **THEN** `battery` という古いカテゴリIDが含まれていないことを確認する

#### Scenario: ファイルパスと市区町村の整合性
- **WHEN** GeoJSONファイルを作成または修正する
- **THEN** ファイルパスの市区町村IDと、各Featureの `properties.city` が一致していることを確認する
- **AND** 住所の行政区名と `properties.cityLabel` が一致していることを確認する

#### Scenario: IDの一意性
- **WHEN** GeoJSONファイルを作成または修正する
- **THEN** 全ファイルを通じて `id` が重複していないことを確認する
- **AND** `id` が `{city}-{number}` の形式であることを確認する

#### Scenario: 文字化けの排除
- **WHEN** GeoJSONファイルを作成または修正する
- **THEN** `name` および `address` に `` (U+FFFD) または無効なUTF-8シーケンスが含まれていないことを確認する
- **AND** 含まれている場合は修正後にコミットすること

#### Scenario: 自動監査の実行
- **WHEN** GeoJSONファイルの修正を完了する
- **THEN** `npm run audit:data` を実行し、`error` が0件であることを確認する
- **AND** `error` が検出された場合は修正を完了させてからコミットすること

### Requirement: 既知の誤データ修正
既に発見されている誤データは、自動監査の対象として追跡し、修正済みであることを検証しなければならない（SHALL）。

#### Scenario: 品川区の稲城市施設
- **WHEN** `src/lib/data/tokyo/shinagawa.geojson` を監査する
- **THEN** `address` が「東京都稲城市長峰1丁目1番地」のFeatureが存在しないこと
- **AND** 存在する場合は `error` として「市区町村と住所が不整合な誤データが残存しています」と報告すること

### Requirement: 新規区データ追加フロー
新しい区のリサイクル拠点データを追加する際、以下のフローに従わなければならない（SHALL）。

#### Scenario: データ収集
- **WHEN** 新しい区のデータを追加する
- **THEN** 区の公式サイトから回収拠点一覧を取得する
- **AND** 共通CSVデータ（インク、JBRC、ボタン電池、廃食用油等）をフィルタする

#### Scenario: 住所のジオコーディング
- **WHEN** 住所から緯度経度を取得する
- **THEN** GSI Japan Address Search API を使用する
- **AND** 失敗した場合は報告し、フォールバック座標を勝手に割り当てない

#### Scenario: DB反映
- **WHEN** `npm run build:db` を実行する
- **THEN** 新規区のデータがSQLiteに正しく反映される
- **AND** `npm run smoke` がHTTP 200でパスする

#### Scenario: migrate.tsの更新
- **WHEN** 新しい区のGeoJSONを追加する
- **THEN** COLLECTORS配列に `{ id: '{city}-city', name: '{区名}環境課', url: '...' }` を追加する
- **AND** WARDS配列に `{ id: '{city}', prefecture: 'tokyo', city_label: '{区名}', url: '...' }` を追加する
- **AND** collectorId分岐に `{city}` のケースを追加する
