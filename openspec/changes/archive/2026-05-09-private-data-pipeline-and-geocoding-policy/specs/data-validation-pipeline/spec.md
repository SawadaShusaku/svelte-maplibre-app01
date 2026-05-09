## ADDED Requirements

### Requirement: ジオコーディング方針
住所から座標を付与する処理は、日本住所に適したジオコーダを使用し、失敗や確認候補を監査可能な形で残さなければならない（SHALL）。

#### Scenario: 日本住所のジオコーディング
- **WHEN** 住所から緯度経度を取得する
- **THEN** GSI Japan Address Search APIを第一候補として使用すること
- **AND** GSIで取得できない、または確認が必要な場合のみGoogle Geocoding APIをフォールバックとして使用してよい
- **AND** Nominatimを日本住所の第一候補として使用しないこと

#### Scenario: 座標出典の保持
- **WHEN** 座標をCSVまたは正規化データへ保存する
- **THEN** `coordinate_source` に `official`, `gsi_address_search`, `google_geocoding`, `manual` などの出典を保存すること
- **AND** `geocoded_at`, `geocode_query`, `geocode_match_address`, `geocode_status` を監査用に保持すること

#### Scenario: フォールバック座標の禁止
- **WHEN** ジオコーディングが失敗する
- **THEN** 自治体中心点、庁舎座標、カテゴリ代表座標などを勝手に割り当てないこと
- **AND** 失敗行をレポートし、人間の確認または明示承認を待つこと

### Requirement: ジオコーディング信頼度判定
`geocode_confidence` は、日本住所文字列の完全一致度ではなく、行政区域レベルの整合性と取得結果の監査可能性で判定しなければならない（SHALL）。

#### Scenario: 表記正規化差を低信頼にしない
- **WHEN** 元住所が `491-3` でジオコーダ返却住所が `491番地` のように表記差を含む
- **THEN** その表記差だけを理由に `low` と判定しないこと
- **AND** 漢数字・全角半角・丁目番地号・郵便番号・建物名の有無などの正規化差だけで低信頼にしないこと

#### Scenario: 行政区域の整合性
- **WHEN** 元データの都道府県・市区町村とジオコーダ返却住所の行政区域が整合する
- **THEN** 座標取得結果を原則 `high` と判定すること
- **AND** 旧区名と現行区名のように親市が一致し、行政区画変更の可能性が高い場合は `medium` としてレビュー理由を残すこと

#### Scenario: 明確な行政区域不一致
- **WHEN** 元データの都道府県または市区町村とジオコーダ返却住所が明確に矛盾する
- **THEN** `low` と判定すること
- **AND** `geocode_review_reason` に不一致内容を保存すること
