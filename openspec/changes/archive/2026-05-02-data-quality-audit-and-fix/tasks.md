## 1. 監査スクリプトの基盤構築

- [x] 1.1 `scripts/audit-geojson.ts` を新規作成し、全GeoJSONファイルを読み込む基本構造を実装する（読み取り専用）
- [x] 1.2 `glob` または `fs` を使用して `src/lib/data/**/*.geojson` を列挙する機能を追加する
- [x] 1.3 各GeoJSONファイルをパースし、FeatureCollection形式であることを検証する
- [x] 1.4 コンソールへの進捗出力（処理中ファイル名、Feature数）を追加する
- [x] 1.5 **ガイドライン**: スクリプト内に `fs.writeFileSync` 等のファイル書き込み処理を含めないこと

## 2. 検証ルールの実装

- [x] 2.1 **文字化け検出**: `name` / `address` に `` (U+FFFD) または無効なUTF-8が含まれるかチェックする（`error`）
- [x] 2.2 `city` とファイルパスの整合性チェックを実装する（`tokyo/shinagawa.geojson` → `properties.city === 'shinagawa'`）
- [x] 2.3 必須プロパティ（`id`, `prefecture`, `city`, `cityLabel`, `name`, `address`, `categories`）の欠損チェックを実装する
- [x] 2.4 `id` の一意性チェック（全ファイル横断）を実装する
- [x] 2.5 `id` のフォーマットチェック（`{city}-{number}`）を実装する
- [x] 2.6 古いカテゴリID（`battery`）の検出を実装する
- [x] 2.7 未知のカテゴリID検出（`src/lib/db/categories.json` と照合）を実装する
- [x] 2.8 同一座標の重複Feature検出を実装する
- [x] 2.9 **住所重複検出（ファジー）**: 住所を正規化（全角→半角、空白除去）してから同一性をチェックする
- [x] 2.10 **住所完全性チェック**: 「区名のみ」「丁目のみ」などを検出し、番地・建物名の有無を確認する
- [x] 2.11 エラー・warningの重大度分離ロジックを実装する

## 3. レポート・一覧表出力機能

- [x] 3.1 人間が読めるコンソールレポート形式（ファイルごとの集計＋詳細リスト）を実装する
- [x] 3.2 **修正データ一覧表（Markdown表）** を出力する機能を実装する。列：ファイル、ID、施設名、住所、問題、備考
- [x] 3.3 `--csv <filepath>` オプションによるCSV一覧表出力を実装する（UTF-8 BOM付き）
- [x] 3.4 `--json` オプションによるJSONレポート出力を実装する
- [x] 3.5 exitコードの制御を実装する（error時は1、warningのみ時は0、 `--strict` 時はwarningでも1）

## 4. npmスクリプト統合

- [x] 4.1 `package.json` に `audit:data` スクリプトを追加する（`tsx scripts/audit-geojson.ts` 等）
- [x] 4.2 `build:db` スクリプトの先頭で `audit:data` を実行するよう変更する
- [x] 4.3 `audit:data --strict` オプションを手動実行用にドキュメント化する

## 5. 既知の誤データの修正（人間による手作業）

- [x] 5.1 `src/lib/data/tokyo/shinagawa.geojson` 内の `shinagawa-022`（総合体育館、東京都稲城市長峰1丁目1番地）を特定する
- [x] 5.2 稲城市の正しい回収拠点データを確認し、該当Featureを**人間が**修正または削除する
- [x] 5.3 **文字化けデータの全修正**: 47件の `` 混入Featureを**人間が**修正する
- [x] 5.4 修正後、該当ファイルが正しいGeoJSON形式であることを確認する
- [x] 5.5 `jj diff` で差分を確認し、意図した変更のみであることを検証する

## 6. 全 wards のデータ監査と修正（人間による手作業）

- [x] 6.1 `npm run audit:data` を実行し、全23区のGeoJSONファイルを監査する
- [x] 6.2 監査レポートを分析し、修正対象の問題を優順位付けする（error → warning）
- [x] 6.3 `adachi.geojson` の検出問題を**人間が**修正する
- [x] 6.4 `arakawa.geojson` の検出問題を**人間が**修正する
- [x] 6.5 `bunkyo.geojson` の検出問題を**人間が**修正する
- [x] 6.6 `chiyoda.geojson` の検出問題を**人間が**修正する
- [x] 6.7 `chuo.geojson` の検出問題を**人間が**修正する
- [x] 6.8 `edogawa.geojson` の検出問題を**人間が**修正する
- [x] 6.9 `itabashi.geojson` の検出問題を**人間が**修正する
- [x] 6.10 `katsushika.geojson` の検出問題を**人間が**修正する
- [x] 6.11 `kita.geojson` の検出問題を**人間が**修正する
- [x] 6.12 `koto.geojson` の検出問題を**人間が**修正する
- [x] 6.13 `meguro.geojson` の検出問題を**人間が**修正する
- [x] 6.14 `minato.geojson` の検出問題を**人間が**修正する
- [x] 6.15 `nakano.geojson` の検出問題を**人間が**修正する
- [x] 6.16 `nerima.geojson` の検出問題を**人間が**修正する
- [x] 6.17 `ota.geojson` の検出問題を**人間が**修正する
- [x] 6.18 `setagaya.geojson` の検出問題を**人間が**修正する
- [x] 6.19 `shibuya.geojson` の検出問題を**人間が**修正する
- [x] 6.20 `shinagawa.geojson` の検出問題を**人間が**修正する
- [x] 6.21 `shinjuku.geojson` の検出問題を**人間が**修正する
- [x] 6.22 `suginami.geojson` の検出問題を**人間が**修正する
- [x] 6.23 `sumida.geojson` の検出問題を**人間が**修正する
- [x] 6.24 `taito.geojson` の検出問題を**人間が**修正する
- [x] 6.25 `toshima.geojson` の検出問題を**人間が**修正する

## 7. ビルド・テスト検証

- [x] 7.1 `npm run audit:data` を実行し、全ファイルで `error` が0件であることを確認する
- [x] 7.2 `npm run build:db` を実行し、正常終了することを確認する
- [x] 7.3 `npm run check` を実行し、TypeScriptエラーがないことを確認する
- [x] 7.4 `npm run test` を実行し、既存のテストが全てパスすることを確認する
- [x] 7.5 `npm run smoke` を実行し、HTTP 200でパスすることを確認する

## 8. 変更履歴の記録

- [x] 8.1 `jj describe` で変更内容をまとめる（データ品質監査スクリプト追加＋誤データ修正）
- [x] 8.2 修正した各ファイルの変更理由をコミットメッセージまたは変更説明に記載する
- [x] 8.3 新規 `audit:data` コマンドの使い方を `AGENTS.md` または README に追記する
