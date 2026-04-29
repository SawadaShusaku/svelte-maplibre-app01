## ADDED Requirements

### Requirement: GeoJSONスキーマ準拠
全拠点データはGeoJSON FeatureCollection形式で管理しなければならない（SHALL）。各Featureは以下のプロパティを持つ。

| プロパティ | 型 | 必須 | 説明 |
|---|---|---|---|
| `id` | string | ✓ | 一意識別子（例: `toshima-001`） |
| `ward` | string | ✓ | 区識別子（例: `toshima`） |
| `name` | string | ✓ | 施設名 |
| `address` | string | ✓ | 住所（豊島区○○1-2-3形式） |
| `categories` | string[] | ✓ | カテゴリ識別子の配列（`battery`/`fluorescent`/`cooking-oil`/`ink-cartridge`/`small-appliance`） |
| `hours` | string | | 営業時間・回収時間 |
| `notes` | string | | 補足事項（回収方式など） |

#### Scenario: 必須フィールド検証
- **WHEN** GeoJSONファイルをロードする
- **THEN** 全Featureがid・ward・name・address・categoriesを持ち、coordinatesが[経度, 緯度]形式であること

### Requirement: 区別ファイル分割
データは区ごとのGeoJSONファイルとして管理しなければならない（SHALL）。ファイルパスは `src/lib/data/<ward>.geojson` とする。

#### Scenario: 豊島区データファイル
- **WHEN** アプリが起動する
- **THEN** `src/lib/data/toshima.geojson` がロードされ、全豊島区拠点データが取得できる

#### Scenario: 将来の区追加
- **WHEN** 新しい区のデータを追加する
- **THEN** `src/lib/data/<ward>.geojson` を追加するだけで地図に表示できる（既存コードの変更は不要）
