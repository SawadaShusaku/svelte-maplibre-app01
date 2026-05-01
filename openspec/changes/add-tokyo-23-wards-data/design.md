## Context

現在アプリケーションは豊島区（96拠点）と千代田区（22拠点）のみ対応。ユーザーから「他の区も追加したい」という要望がある。データのソースオブジェクトはGeoJSONで、ビルド時にSQLiteに変換される。各区の公式サイトURLやカテゴリー別回収情報URLも管理したい。発泡スチロールは拠点回収ではなくプラスチックごみの日に回収されるため、データには含めない。

## Goals / Non-Goals

**Goals:**
- 東京23区すべてのリサイクル拠点データをGeoJSONとして追加
- 各区の公式サイトURL（`officialUrl`）をGeoJSONに含める
- 各カテゴリーごとの回収情報ページURL（`categoryUrls`）をGeoJSONに含める
- DBスキーマを拡張して新フィールドを保存
- アプリケーションで新フィールドを利用可能にする

**Non-Goals:**
- 発泡スチロール（`styrofoam`）の拠点データを追加（拠点回収ではないため）
- UIでURLを表示する機能の追加（データ基盤のみ対象）
- 既存の豊島区・千代田区データの内容修正

## Decisions

### Decision: GeoJSONにURL情報を直接含める
**Rationale**: ソースオブジェクトはGeoJSONであるべき。外部ファイルや別テーブルにURLを持たせると管理が複雑になる。GeoJSONのpropertiesに `officialUrl`（string）と `categoryUrls`（object）を追加し、マイグレーション時にDBに書き込む。

### Decision: categoryUrlsはJSON文字列としてSQLiteに保存
**Rationale**: SQLiteにネイティブのJSONサポートはあるが、sql.js（クライアントサイド）での互換性を考慮し、テキストカラムにJSON文字列として保存し、アプリ側で `JSON.parse()` する。これによりオブジェクト構造を柔軟に保てる。

### Decision: GSI Japan Address Search APIで座標を自動取得
**Rationale**: 住所から緯度経度を取得する際、Nominatimは日本の住所で精度が低い。GSI Japan Address Search API（`https://msearch.gsi.go.jp/address-search/AddressSearch?q=...`）を使用して正確な座標を取得する。

### Decision: データ追加はカテゴリーごとに区別して受け取る
**Rationale**: ユーザーは「URLを直接渡すかページの文章をコピーしたものしか渡せない」。こちらでテキスト解析、住所からのジオコーディング、GeoJSON整形を自動化する。

## Risks / Trade-offs

- [Risk] 23区すべてのデータ収集は時間がかかる → Mitigation: ユーザーがカテゴリーごとに区別してデータを渡す形式にし、段階的に追加する
- [Risk] 住所のジオコーディングで座標が取得できない場合がある → Mitigation: 手動で座標を調整するプロセスを用意
- [Risk] DBサイズが大きくなる → Mitigation: sql.jsは軽量だが、静的ファイルサイズに注意。不要なカテゴリー（styrofoam）は含めない
- [Risk] `battery` という古いカテゴリーIDが残っている（千代田区に4件） → Mitigation: マイグレーション時に警告を出し、手動分類を促す

## Migration Plan

1. GeoJSONファイルに `officialUrl` / `categoryUrls` を追加（スクリプトで一括）
2. DBスキーマに `official_url` / `category_urls` を追加
3. マイグレーションスクリプトを更新
4. `npm run build:db` でDB再生成
5. `npm run smoke` でビルド確認
6. 新規区のGeoJSONを `src/lib/data/tokyo/{city}.geojson` に追加するたびに `npm run build:db` を実行

## Open Questions

- UI側で `officialUrl` / `categoryUrls` をどう表示するか（別changeで対応予定）
- 複数区のデータを一度に追加する際の効率的なワークフロー
