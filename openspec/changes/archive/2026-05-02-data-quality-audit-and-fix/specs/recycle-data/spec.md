## MODIFIED Requirements

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

## ADDED Requirements

### Requirement: 既知の誤データ修正
既に発見されている誤データは、自動監査の対象として追跡し、修正済みであることを検証しなければならない（SHALL）。

#### Scenario: 品川区の稲城市施設
- **WHEN** `src/lib/data/tokyo/shinagawa.geojson` を監査する
- **THEN** `address` が「東京都稲城市長峰1丁目1番地」のFeatureが存在しないこと
- **AND** 存在する場合は `error` として「市区町村と住所が不整合な誤データが残存しています」と報告すること
