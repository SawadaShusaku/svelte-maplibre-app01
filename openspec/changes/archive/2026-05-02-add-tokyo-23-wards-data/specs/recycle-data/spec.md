## MODIFIED Requirements

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
| `officialUrl` | string | | 区の公式サイトURL |
| `categoryUrls` | object | | カテゴリー別回収情報URL（キー: categoryId, 値: URL） |

#### Scenario: スキーマ検証
- **WHEN** GeoJSONファイルをロードする
- **THEN** 全Featureがid・prefecture・city・cityLabel・name・address・categoriesを持ち、wardフィールドを持たないこと

#### Scenario: URLプロパティの検証
- **WHEN** GeoJSONのpropertiesに `officialUrl` と `categoryUrls` が含まれる
- **THEN** `officialUrl` はstring型、`categoryUrls` はobject型であること

### Requirement: 都道府県別ディレクトリ構造
データファイルは `src/lib/data/{prefecture}/{city}.geojson` のパスで管理しなければならない（SHALL）。

#### Scenario: 豊島区ファイルパス
- **WHEN** 豊島区データを参照する
- **THEN** `src/lib/data/tokyo/toshima.geojson` からロードされる

#### Scenario: 千代田区ファイルパス
- **WHEN** 千代田区データを参照する
- **THEN** `src/lib/data/tokyo/chiyoda.geojson` からロードされる

#### Scenario: 新宿区ファイルパス
- **WHEN** 新宿区データを参照する
- **THEN** `src/lib/data/tokyo/shinjuku.geojson` からロードされる

## ADDED Requirements

### Requirement: DBスキーマ拡張
`facilities` テーブルは施設の公式サイトURLとカテゴリー別URLを保存できなければならない（SHALL）。

#### Scenario: スキーマカラム確認
- **WHEN** `facilities` テーブルのカラムを確認する
- **THEN** `official_url`（TEXT型）と `category_urls`（TEXT型、JSON文字列）カラムが存在すること

### Requirement: マイグレーション時のURL読み込み
ビルド時のマイグレーションスクリプトは、GeoJSONの `officialUrl` と `categoryUrls` をSQLiteに正しく書き込まなければならない（SHALL）。

#### Scenario: マイグレーション実行
- **WHEN** `npm run build:db` を実行する
- **THEN** `facilities` テーブルの `official_url` と `category_urls` にGeoJSONの値が保存される
