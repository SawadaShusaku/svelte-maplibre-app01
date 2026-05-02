## Context

現在15区（豊島区〜中野区）のデータが完了し、東京23区のリサイクル拠点データをGeoJSONとして管理している。データはCSV（tokyo_ink_collection.csv, tokyo_jbrc_battery_shops.csv, tokyo_button_battery.csv, tokyo_used_cooking_oil_collection.csv）から抽出し、GSI Japan Address Search APIで住所をジオコーディングしている。

残り8区（杉並区、北区、荒川区、板橋区、練馬区、足立区、葛飾区、江戸川区）は未対応。各区の公式サイトから回収拠点データを取得し、同じワークフローでGeoJSONを作成する。

## Goals / Non-Goals

**Goals:**
- 残り8区のGeoJSONファイルを作成
- 各区の回収拠点データを網羅的に収集
- 住所から正確な緯度経度を取得
- 既存の15区と同じデータ品質（重複なし、住所正確）を達成
- DBをビルドし、smokeテストをパス

**Non-Goals:**
- 既存15区のデータ再編集（住所修正は完了済み）
- 新しい回収カテゴリの追加
- UI/UXの変更

## Decisions

1. **データソース優先順位**
   - 1位: 各区公式サイトの回収拠点一覧
   - 2位: tokyo_ink_collection.csv など共通CSV
   - 3位: ユーザーの直接提供（URLやテキスト）

2. **重複対策**
   - 同じ住所のFeatureはcategories配列でマージ
   - 異なる住所のFeatureは分割
   - CSVで住所が欠落している場合はSTOPして報告（config.yamlルール準拠）

3. **ジオコーディング**
   - GSI Japan Address Search APIのみ使用
   - 失敗時は報告し、フォールバック座標を勝手に割り当てない

4. **バージョン管理**
   - jujutsu (jj) を使用
   - 区完結ごとに `jj describe` + `jj new` + `jj git push`
   - カテゴリごとではなく区単位でchangeを分ける

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| CSVの住所が区名のみで詳細欠落 | STOPして報告。前回の反省を活かし、欠落データを放置しない |
| GSI APIで住所が解決できない | 手動でGoogle Maps等から座標を取得し、notesに「手動座標」と記載 |
| 大量の郵便局データの住所取得 | tokyo_ink_collection.csvの住所列を優先。ない場合は日本郵便公式サイトから取得 |
| 作業量が膨大（8区） | 区単位でタスク分割。1区ずつ確実に完了させる |

## Open Questions

- 各区の公式サイトURLはユーザーから提供されるか？
- ボタン電池の回収店データはCSVに含まれているか？
