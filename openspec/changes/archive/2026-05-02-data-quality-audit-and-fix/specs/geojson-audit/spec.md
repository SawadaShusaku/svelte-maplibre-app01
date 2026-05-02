## ADDED Requirements

### Requirement: 文字化け検出
監査スクリプトは、全Featureの `name` および `address` に文字化け文字（`` U+FFFD）または無効なUTF-8シーケンスが含まれていないことを検証しなければならない（SHALL）。

#### Scenario: 文字化けの検出
- **WHEN** GeoJSONファイルを監査する
- **THEN** `name` または `address` に `` が含まれるFeatureを `error` として報告すること
- **AND** 該当Featureの `id`、`name`、`address`、および文字化けの位置を出力すること

#### Scenario: 無効なUTF-8の検出
- **WHEN** GeoJSONファイルを監査する
- **THEN** ファイルのパース時に無効なUTF-8シーケンスが検出された場合、そのファイル名と行番号（可能であれば）を `error` として報告すること

### Requirement: 市区町村ファイル整合性チェック
監査スクリプトは、各GeoJSONファイルの `properties.city` がファイルパスの市区町村IDと一致することを検証しなければならない（SHALL）。

#### Scenario: ファイルパスとcityの一致
- **WHEN** `src/lib/data/tokyo/shinagawa.geojson` を監査する
- **THEN** 全Featureの `properties.city` が `shinagawa` であること

#### Scenario: 不整合検出
- **WHEN** `shinagawa.geojson` 内に `properties.city` が `inagi` のFeatureが存在する
- **THEN** `error` として「ファイルパスとcityプロパティが不整合」と報告すること

### Requirement: 必須プロパティの欠損チェック
監査スクリプトは、全Featureが必須プロパティを持つことを検証しなければならない（SHALL）。

#### Scenario: 必須プロパティの検証
- **WHEN** GeoJSONファイルを監査する
- **THEN** 全Featureが `id`, `prefecture`, `city`, `cityLabel`, `name`, `address`, `categories` を持つこと
- **AND** いずれかが欠損している場合は `error` として報告すること

### Requirement: ID重複およびフォーマットチェック
監査スクリプトは、全ファイルを通じて `id` の一意性とフォーマットを検証しなければならない（SHALL）。

#### Scenario: ID重複検出
- **WHEN** 複数のGeoJSONファイルを横断して監査する
- **THEN** 同じ `id` を持つFeatureが2つ以上存在する場合は `error` として報告すること

#### Scenario: IDフォーマット
- **WHEN** Featureの `id` を検証する
- **THEN** `{city}-{number}` 形式（例：`shinagawa-022`）であること

### Requirement: カテゴリIDの正当性チェック
監査スクリプトは、`categories` 配列に有効なカテゴリIDのみが含まれることを検証しなければならない（SHALL）。

#### Scenario: 古いカテゴリIDの検出
- **WHEN** GeoJSONファイルを監査する
- **THEN** `battery` などの廃止されたカテゴリIDが含まれている場合は `error` として報告すること

#### Scenario: 未知のカテゴリIDの検出
- **WHEN** GeoJSONファイルを監査する
- **THEN** `src/lib/db/categories.json` に定義されていないカテゴリIDが含まれている場合は `error` として報告すること

### Requirement: 重複施設検出
監査スクリプトは、同一座標または同一住所を持つ重複Featureを検出しなければならない（SHALL）。住所比較は正規化（全角→半角、空白除去）後に行うこと。

#### Scenario: 同一座標の重複
- **WHEN** 2つ以上のFeatureが同一座標（緯度・経度）を持つ
- **THEN** `warning` として「重複する座標を持つ施設があります」と報告すること
- **AND** 重複しているFeatureの `id` と `name` を列挙すること

#### Scenario: 同一住所の重複
- **WHEN** 2つ以上のFeatureが正規化後の `address` が同一である
- **THEN** `warning` として「重複する住所を持つ施設があります」と報告すること
- **AND** 意図的な重複（1つの施設が複数カテゴリを持つ場合は1Featureにマージ済み）でない場合は修正を促すこと

### Requirement: 住所の完全性チェック
監査スクリプトは、`address` が完全な住所であることを検証しなければならない（SHALL）。番地・建物名まで含まれているかを確認する。

#### Scenario: 不完全な住所の検出
- **WHEN** GeoJSONファイルを監査する
- **THEN** `address` が「区名のみ」「丁目のみ」など不完全な場合は `warning` として報告すること
- **AND** 番地、号、建物名などの具体的な所在地情報が含まれているかを確認すること

### Requirement: 修正データ一覧表の出力
監査スクリプトは、検出した問題を人間が修正作業に使える形式の一覧表で出力しなければならない（SHALL）。

#### Scenario: Markdown一覧表
- **WHEN** 監査スクリプトを実行する
- **THEN** 全 `error` について、以下の列を持つMarkdown表を出力すること
  - ファイルパス、Feature ID、施設名、住所、問題の種類、備考

#### Scenario: CSV一覧表
- **WHEN** 監査スクリプトに `--csv <filepath>` オプションを指定する
- **THEN** 同じ内容のCSVファイルを指定パスに出力すること
- **AND** CSVはExcelやGoogleスプレッドシートで開けるUTF-8 BOM付きとすること

### Requirement: レポート出力
監査スクリプトは、検出結果を人間が読める形式とJSON形式の両方で出力しなければならない（SHALL）。

#### Scenario: コンソールレポート
- **WHEN** 監査スクリプトを実行する
- **THEN** ファイルごとのエラー数・warning数をコンソールに出力すること
- **AND** 各問題の詳細（ファイルパス、Feature ID、問題の種類、説明）を出力すること
- **AND** 最後に「=== 修正必要データ一覧 ===」としてMarkdown表を再度出力すること

#### Scenario: JSONレポート
- **WHEN** 監査スクリプトに `--json` オプションを指定する
- **THEN** 構造化されたJSONレポートを標準出力または指定ファイルに出力すること
- **AND** レポートは `{ errors: [...], warnings: [...], summary: { files: N, features: N, errorCount: N, warningCount: N } }` 形式を持つこと
