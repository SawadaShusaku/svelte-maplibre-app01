# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project
npx sv create my-app
```

To recreate this project with the same configuration:

```sh
# recreate this project
npx sv@0.13.2 create --template minimal --types ts --install npm svelte-maplibre-app01
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

公開設定は `.env.example` を元に `.env` を作成して設定します。

```env
PUBLIC_GTAG_ID=G-XXXXXXXXXX
PUBLIC_OSRM_BASE_URL=https://router.project-osrm.org
PUBLIC_MAP_STYLE_URL=https://tiles.openfreemap.org/styles/liberty
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.


## データの管理・更新方法

このアプリケーションの本番データ配信は、Cloudflare D1 を Worker/SvelteKit API 経由で読む方針です。ブラウザへ `static/recycling.db` のような一括取得可能なDBファイルを配布しません。

長期的な source of truth は、別プロジェクトの非公開データパイプラインで管理します。SQLite は開発・検証用には使えますが、配信される静的アセットには置きません。

### データフロー

```
private data pipeline  →  private D1 seed/import  →  Cloudflare D1  →  Worker API  →  browser
```

- **非公開データパイプライン** が、上流CSV/raw/geocoding cache/正規化データの長期的なsource of truthです
- **Cloudflare D1** は本番の public serving DB です。source of truth ではなく派生成果物です
- **Worker API** はアプリ表示に必要な最小限の施設・区・カテゴリ情報だけを返します
- **GeoJSONファイル** (`src/lib/data/tokyo/toshima.geojson` など) は移行期間中の派生入力です
- **ローカルSQLite** は開発・検証用に `.local/` など配信されない場所へ生成します
- 上流CSV、raw HTML/JSON、geocoding cache、正規化済みの完全データセット、D1 seed/import、SQLite DB は公開アプリリポジトリや静的配布物に置きません
- 詳細な方針は [docs/data-pipeline-policy.md](docs/data-pipeline-policy.md) を参照してください

### D1 の推奨名

- dev/local: `recycling-facilities-dev`
- preview/staging: `recycling-facilities-preview`
- production: `recycling-facilities-prod`
- binding name: `RECYCLING_DB`

作成後、`wrangler.toml` の `database_id` placeholder を差し替えてください。

### D1 schema の適用

```sh
npm run d1:schema:local
npm run d1:schema:preview
npm run d1:schema:prod
```

データ入り seed/import SQL は非公開データパイプライン側で生成し、公開アプリリポジトリにはコミットしません。

### デプロイ

Cloudflare Git 連携の production deploy command は、root 環境ではなく Wrangler の production 環境を明示します。

```sh
npm run deploy:prod
```

preview 環境へ手動デプロイする場合:

```sh
npm run deploy:preview
```

bare `npx wrangler deploy` は使わないでください。`[env.production]` を選ばず、dev 用 D1 binding を参照してビルド/デプロイが失敗する可能性があります。

`wrangler.toml` の root `name` は production と同名にしません。root は `svelte-maplibre-app01-dev` のような dev 専用 Worker 名にしておき、誤って bare deploy しても production Worker を dev binding で上書きしない構成にします。

### ローカルSQLite検証

移行期間中の GeoJSON をローカル SQLite として確認する場合:

```sh
npm run build:db:local
```

出力先は `.local/recycling-dev.db` です。`static/` には生成しません。

### 自治体のURL・出典URLを更新する場合

- 自治体ごとの公式URLやカテゴリ別の出典URLは [src/lib/registry.ts](/Volumes/ASMT%202462%20NVME%20Media/Projects/svelte-maplibre-app01/src/lib/registry.ts) で管理します
- 施設データ本体はこれまで通り GeoJSON が source of truth です
- URL メタデータを将来 DB から引きたくなった場合も、まずは `registry.ts` などのリポジトリ内データを元に migration する方針を推奨します

### 新しい市区町村を追加する場合

1. `src/lib/registry.ts` の `WARD_REGISTRY` に市区町村を追加
2. `src/lib/data/{都道府県}/{市区町村}.geojson` にGeoJSONファイルを作成
3. `npm run build:db` を実行

## データソース

以下の外部データソースから取得・整形した上流データのスナップショットは、別プロジェクトの非公開データパイプラインで管理します。公開アプリリポジトリにはCSVスナップショットを置きません。

### 一般社団法人電池工業会
- http://www.botankaishu.jp/srch/srch10.php


### 一般社団法人JBRC
- https://www.jbrc-system.com/page/pc/techc010/

### インクカートリッジ里帰りプロジェクト
- https://www.inksatogaeri.jp/

### 使用済み食用油の都内回収所
- https://www.kankyo.metro.tokyo.lg.jp/resource/recycle/wastecookingoil/collectionpoint

### 加熱式たばこ機器等の回収・リサイクル活動
- https://www.tioj.or.jp/recycling/index.html
