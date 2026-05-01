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

このアプリケーションの施設データは **GeoJSONファイル** を唯一のマスター情報源として管理しています。

### データフロー

```
src/lib/data/{都道府県}/{市区町村}.geojson  →  npm run build:db  →  static/recycling.db
```

- **GeoJSONファイル** (`src/lib/data/tokyo/toshima.geojson` など) が**唯一の正確な情報源**です
- **SQLiteデータベース** (`static/recycling.db`) はビルド成果物です。直接編集しないでください
- CSVファイルは以前に使用していましたが、現在は削除済みです

### 施設データを修正・追加する場合

1. 対象のGeoJSONファイルを直接編集します
   ```sh
   src/lib/data/tokyo/toshima.geojson
   src/lib/data/tokyo/chiyoda.geojson
   ```
2. SQLiteデータベースを再生成します
   ```sh
   npm run build:db
   ```
3. ビルドが正常に完了することを確認します
   ```sh
   npm run smoke
   ```

### 自治体のURL・出典URLを更新する場合

- 自治体ごとの公式URLやカテゴリ別の出典URLは [src/lib/registry.ts](/Volumes/ASMT%202462%20NVME%20Media/Projects/svelte-maplibre-app01/src/lib/registry.ts) で管理します
- 施設データ本体はこれまで通り GeoJSON が source of truth です
- URL メタデータを将来 DB から引きたくなった場合も、まずは `registry.ts` などのリポジトリ内データを元に migration する方針を推奨します

### 新しい市区町村を追加する場合

1. `src/lib/registry.ts` の `WARD_REGISTRY` に市区町村を追加
2. `src/lib/data/{都道府県}/{市区町村}.geojson` にGeoJSONファイルを作成
3. `npm run build:db` を実行

## 参考URL

### 一般社団法人電池工業会
- http://www.botankaishu.jp/srch/srch10.php


### 一般社団法人JBRC
- https://www.jbrc-system.com/page/pc/techc010/

### インクカートリッジ里帰りプロジェクト
- https://www.inksatogaeri.jp/