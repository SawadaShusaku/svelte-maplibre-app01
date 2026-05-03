## Purpose
Define the validation and geocoding quality rules that must be applied before recycling facility data is accepted into derived public datasets.

## Requirements

### Requirement: ビルド前検証統合
`npm run build:db` 実行前に、GeoJSONデータ品質チェックが自動的に実行されなければならない（SHALL）。

#### Scenario: ビルド前の自動検証
- **WHEN** `npm run build:db` を実行する
- **THEN** 最初にデータ品質チェックが実行されること
- **AND** `error` が検出された場合はビルドを中断し、非ゼロのexitコードで終了すること
- **AND** 中断理由として「修正データをご提供ください」と明確に表示すること

#### Scenario: クリーンビルド
- **WHEN** データ品質チェックがパスする
- **THEN** 通常通りSQLiteデータベースの生成が続行すること

### Requirement: 独立した監査コマンド
開発者はデータ品質チェックを独立して実行できなければならない（SHALL）。

#### Scenario: 手動監査実行
- **WHEN** `npm run audit:data` を実行する
- **THEN** 全GeoJSONファイルの品質チェックが実行されること
- **AND** コンソールに検出結果が出力されること
- **AND** 修正必要データ一覧表（Markdown表）が出力されること

### Requirement: 重大度レベルの制御
データ品質チェックは、重大度に応じてビルドを中断するかどうかを制御できなければならない（SHALL）。

#### Scenario: デフォルトモード
- **WHEN** 監査スクリプトを引数なしで実行する
- **THEN** `error` レベルの問題が1件以上ある場合のみビルドを中断すること
- **AND** `warning` レベルの問題は報告するがビルドを中断しないこと

#### Scenario: ストリクトモード
- **WHEN** 監査スクリプトに `--strict` フラグを指定する
- **THEN** `warning` レベルの問題もビルドを中断すること

### Requirement: 人間レビュー必須フロー
データ品質チェックで `error` が検出された場合、人間が修正したデータを提供するまでビルドを再開してはならない（SHALL）。

#### Scenario: エラー検出時のフロー
- **WHEN** 監査スクリプトが `error` を検出する
- **THEN** ビルドを停止すること
- **AND** 修正必要データ一覧表を出力すること
- **AND** 人間がGeoJSONファイルを直接修正すること
- **AND** 修正後に再度 `npm run audit:data` を実行してパスすること

### Requirement: CI統合
データ品質チェックはCIパイプラインで実行可能でなければならない（SHALL）。

#### Scenario: CIでの実行
- **WHEN** CI環境で `npm run audit:data` を実行する
- **THEN** 問題検出時に非ゼロexitコードで終了すること
- **AND** コンソール出力がCIログで可読であること
- **AND** 修正必要データ一覧表がCIログに出力され、開発者が確認できること

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
