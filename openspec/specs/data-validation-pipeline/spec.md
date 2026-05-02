## ADDED Requirements

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
