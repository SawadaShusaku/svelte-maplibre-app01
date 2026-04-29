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
