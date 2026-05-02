## ADDED Requirements

### Requirement: 東京23区データの収集と追加
アプリは東京23区すべてのリサイクル拠点データをGeoJSONとして管理しなければならない（SHALL）。新規区のデータは `src/lib/data/tokyo/{city}.geojson` に追加する。

#### Scenario: 新宿区データ追加
- **WHEN** 新宿区の回収拠点データ（施設名、住所、カテゴリー）を受け取る
- **THEN** `src/lib/data/tokyo/shinjuku.geojson` を作成し、全拠点をFeatureCollectionとして保存する

#### Scenario: 23区すべてのデータ存在確認
- **WHEN** `src/lib/data/tokyo/` ディレクトリを参照する
- **THEN** 23区すべてのGeoJSONファイルが存在すること

### Requirement: 住所から座標の自動取得
新規施設データの住所から緯度経度は、GSI Japan Address Search API を使用して自動取得しなければならない（SHALL）。

#### Scenario: 住所のジオコーディング
- **WHEN** 「豊島区東池袋4-5-2」という住所をAPIに送信する
- **THEN** 緯度35.726、経度139.712程度の座標が返される

### Requirement: 区公式サイトURLの管理
各区のGeoJSON Featureには、その区の公式サイトURLを `officialUrl` プロパティとして含めなければならない（SHALL）。

#### Scenario: 豊島区公式URL
- **WHEN** 豊島区の施設データを参照する
- **THEN** `properties.officialUrl` が `https://www.city.toshima.lg.jp/` であること

### Requirement: カテゴリー別回収情報URLの管理
各区のGeoJSON Featureには、回収カテゴリーごとの情報ページURLを `categoryUrls` プロパティとして含めなければならない（SHALL）。

#### Scenario: 豊島区乾電池カテゴリーURL
- **WHEN** 豊島区の施設データを参照する
- **THEN** `properties.categoryUrls['dry-battery']` が `https://www.city.toshima.lg.jp/150/kurashi/gomi/shigen/2509251342.html` であること

### Requirement: 発泡スチロールの除外
発泡スチロール（`styrofoam`）は拠点回収ではないため、GeoJSONデータに含めてはならない（SHALL NOT）。

#### Scenario: カテゴリー一覧確認
- **WHEN** 任意の区のGeoJSONの `categories` 配列を確認する
- **THEN** `styrofoam` が含まれていないこと
