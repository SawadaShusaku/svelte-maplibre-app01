# メモ（主要コマンド一覧）

## 開発・サーバー起動関連

Viteの開発サーバーを起動する（ローカルD1データベースを使用）
```bash
npm run dev
```

ビルド済みのWorker出力を使用して、ローカルWranglerの開発サーバーを起動する
```bash
npm run dev:worker
```

リモートのプレビュー用D1データベースに接続して、Wranglerの開発サーバーを起動する
```bash
npm run dev:remote
```

## データベース・D1関連

本番環境（Cloudflare D1）のデータをローカル環境のDBに同期・コピーし、ローカルでの開発・検証で本番と同じデータを使えるようにする
```bash
npm run d1:sync:local
```
※ `-- --from=preview` を付けるとプレビュー環境から同期

ローカルのD1データベースにスキーマ（テーブル構造）を適用する
```bash
npm run d1:schema:local
```

ローカルのD1データベースにカテゴリのメタデータ（ラベル、色、アイコン、順序など）を適用する
```bash
npm run d1:categories:local
```

検証用のローカルSQLiteデータベースを構築する（`.local/recycling-dev.db`）
```bash
npm run build:db:local
```

## テスト・検証関連

Svelteの型チェックを実行する（svelte-check）
```bash
npm run check
```

ユニットテストを実行する（Vitest + MockRepository）
```bash
npm run test
```

E2Eテストを実行する（Playwright）
```bash
npm run test:e2e
```

ビルド＋プレビュー＋HTTP 200のステータス確認を行う（SSRやブラウザAPI変更時の動作確認用）
```bash
npm run smoke
```

## データ監査・シード関連

GeoJSONデータの品質監査を実行する（読み取り専用）
```bash
npm run audit:data
```

非公開データや巨大なDBアーティファクトがGitで追跡されていないか監査する（エラーがあれば終了）
```bash
npm run audit:private-data
```

インポート前に非公開のD1シードJSONデータを検証する
```bash
npm run validate:d1-seed
```

レガシーなシードJSONを公開用のD1 JSON/SQL形式に正規化する
```bash
npm run normalize:d1-seed
```

## ビルド・デプロイ関連

プロダクション（本番用）ビルドを実行する
```bash
npm run build
```

プレビュー環境のWorkerにデプロイする
```bash
npm run deploy:preview
```

本番環境のWorkerにデプロイする
```bash
npm run deploy:prod
```
