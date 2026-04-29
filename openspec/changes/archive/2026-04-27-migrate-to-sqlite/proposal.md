## Why

現在のGeoJSONファイルベースのデータ管理は、カテゴリごとの回収拠点情報を管理する上で限界があります。各区が対応するカテゴリが異なる、注意事項が異なる、回収団体が異なるなどの複雑な要件に対応するため、リレーショナルデータベース(SQLite)への移行が必要です。これにより、データの整合性を保ちつつ、柔軟なクエリと拡張性を実現します。

## What Changes

- **SQLiteデータベースの導入**: 7つのテーブル（categories, category_details, collectors, wards, ward_categories, facilities, facility_categories）を作成
- **データ移行**: 既存のGeoJSONデータをSQLiteに移行するスクリプトを作成
- **データアクセス層の修正**: `data.ts`をSQLite対応に書き換え、既存のインターフェースを維持
- **ビルドプロセスの更新**: SQLiteデータベースをビルド成果物に含める設定を追加
- **新しいカテゴリ体系**: 充電式電池とボタン電池を分離、廃食用油、紙パック、発泡スチロールなどの区独自カテゴリに対応

## Capabilities

### New Capabilities

- `sqlite-database`: SQLiteデータベーススキーマの設計と実装。カテゴリ、区、回収拠点、回収団体の管理
- `data-migration`: GeoJSONからSQLiteへのデータ移行スクリプトとバッチ処理
- `dynamic-category-filtering`: 選択中の区に応じたカテゴリ表示の動的フィルタリング

### Modified Capabilities

- なし（新規データ管理方法の導入のため、既存機能の要件変更はなし）

## Impact

- **データ層**: `src/lib/data.ts`の完全書き換え。GeoJSON直接アクセスからSQLite経由アクセスへ変更
- **ビルド設定**: Vite設定にSQLiteファイルの静的アセットとしての取り扱いを追加
- **カテゴリ定義**: `categories.ts`からJSONファイルベースに移行し、将来的なデータベース移行への準備
- **型定義**: 新しいデータベーススキーマに合わせた型定義の更新
