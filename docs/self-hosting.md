# セルフホスティングガイド

このドキュメントでは、本アプリケーションをご自身の環境で構築・デプロイする手順を説明します。

## 前提条件

- Node.js 18以上
- npm
- Cloudflareアカウント（Workers + D1使用時）
- Wrangler CLI（`npm install -g wrangler`）

## アーキテクチャ概要

**SvelteKit + MapLibre GL + Cloudflare D1**、Svelte 5 runesモード。

- **データベース**: Cloudflare D1（本番）、SQLite（開発/検証用）
- **データフロー**: 非公開データパイプライン → D1 seed → Cloudflare D1 → Worker API → ブラウザ
- **地図**: OpenFreeMapタイル（APIキー不要）

詳細な設計は以下を参照：
- [docs/data-pipeline-policy.md](data-pipeline-policy.md) - データパイプラインのポリシー
- [docs/normalized-place-collection-model.md](normalized-place-collection-model.md) - スキーマ詳細

## 開発環境のセットアップ

### 1. リポジトリのクローンと依存関係のインストール

```sh
git clone <repository-url>
cd svelte-maplibre-app01
npm install
```

### 2. 環境変数の設定

`.env.example` をコピーして `.env` を作成し、必要に応じて設定します。

```env
PUBLIC_GTAG_ID=G-XXXXXXXXXX
PUBLIC_OSRM_BASE_URL=https://router.project-osrm.org
PUBLIC_MAP_STYLE_URL=https://tiles.openfreemap.org/styles/liberty
```

### 3. 開発サーバーの起動

**DBなし（UIのみ）**:
```sh
npm run dev
```

**D1接続あり（推奨）**:
実際のマップデータやAPIの動作を確認する場合はこちらを使用してください。
```sh
npm run dev
```

## D1データベースの設定

### D1名の推奨

| 環境 | 名前 |
|------|------|
| local | `recycling-facilities-local` |
| preview/staging | `recycling-facilities-preview` |
| production | `recycling-facilities-prod` |
| バインディング名 | `RECYCLING_DB` |

### スキーマの適用

```sh
npm run d1:schema:local
npm run d1:schema:preview
npm run d1:schema:prod
```

カテゴリのラベル・色・アイコン・表示順は D1 の `categories` / `category_details` を source of truth とします。

```sh
npm run d1:categories:local
npm run d1:categories:preview
npm run d1:categories:prod
```

### データのインポート

データ入りseed/import SQLは非公開データパイプライン側で生成します。公開アプリリポジトリにはコミットしません。

ローカルD1をリモートD1と同期する場合は、次のコマンドでローカルD1を上書きします。

```sh
npm run d1:sync:local
npm run d1:sync:local -- --from=preview
```

詳細は [docs/data-pipeline-policy.md](data-pipeline-policy.md) を参照してください。

## デプロイ

Cloudflare Workers with Static Assetsとしてデプロイします。

### 前提ファイル

- `wrangler.toml`（root環境 = production、`[env.preview]` でプレビュー環境を分離）
- `worker-configuration.d.ts`
- バインディング: `RECYCLING_DB`

### コマンド

**プレビュー環境へデプロイ**:
```sh
npm run deploy:preview
```

**本番環境へデプロイ**:
```sh
npm run deploy:prod
```

Cloudflare Git連携を使用している場合、root `name` はDashboardのWorker名と一致している必要があります。GitHub Actionsは使用せず、Cloudflare Git連携がビルド/デプロイを自動的に処理します。

## 主要コマンドリファレンス

| コマンド | 用途 |
|---------|------|
| `npm run dev` | Vite devサーバー（Cloudflare platform proxy経由でローカルD1接続） |
| `npm run dev:worker` | ローカルWrangler devサーバー（build済みWorker出力を使用） |
| `npm run dev:remote` | preview D1を使うリモートWrangler dev |
| `npm run build` | 本番ビルド |
| `npm run check` | タイプチェック（svelte-check） |
| `npm run test` | ユニットテスト（Vitest + MockRepository） |
| `npm run test:e2e` | E2Eテスト（Playwright） |
| `npm run smoke` | ビルド + プレビュー + HTTP 200確認 |
| `npm run build:db:local` | 開発用SQLite検証DB → `.local/recycling-dev.db` |
| `npm run d1:schema:local` | ローカルD1にスキーマ適用 |
| `npm run d1:categories:local` | ローカルD1にカテゴリ表示メタデータを適用 |
| `npm run d1:sync:local` | production D1からローカルD1を上書き同期 |
| `npm run audit:data` | GeoJSONデータ品質監査（読み取り専用） |
| `npm run validate:d1-seed` | D1 seed JSONの検証 |
| `npm run normalize:d1-seed` | レガシーseed JSON → 公開D1 JSON/SQLに変換 |

## 実装上の注意点

- **Svelte 5 runes**: `$state`、`$props`、`$derived`、`$effect` を使用。従来の `let` / `export let` は使用しない
- **プロキシオブジェクト**: 関数に渡す前に配列をスプレッドする例: `getFacilities([...selectedCities], [...selectedCategories])`
- **カテゴリ**: `dry-battery`、`rechargeable-battery`、`button-battery`。それぞれ色、アイコン、警告/詳細情報を持つ
- **D1クエリ**: `prepare(...).bind(...).all<T>()` / `first<T>()` を使用。APIレスポンスは最小限に保つ
- **SSRエラー**: `npm run check` と `npm run test` はSSRランタイムエラーを検出しない。`localStorage`、`window`、`document`、SSRレンダリングに関わる変更時は必ず `npm run smoke` を実行

## 新しいカテゴリの追加

1. `src/lib/db/categories.json` に追加
2. `src/lib/types.ts` の `CategoryId` を更新
3. `npm run build:db` を実行
4. マイグレーションスクリプトで施設にカテゴリを割り当て

## トラブルシューティング

- **D1バインディングが見つからない**: `npm run dev`（Vite + Cloudflare platform proxy）を使用。バインディング名は `RECYCLING_DB`
- **プロキシオブジェクトエラー**: 状態配列を関数に渡す前にスプレッドする
- **D1クエリエラー**: `prepare(...).bind(...).all<T>()` / `first<T>()` を使用
