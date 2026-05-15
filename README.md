# 全国リサイクルマップ (Japan Recycle Map)

廃電池・使用済み製品などの回収拠点を地図上で検索できるWebアプリケーションです。

**[ライブデモ](https://your-domain.example.com)**

## 主な機能

- 回収拠点の地図表示（OpenFreeMap使用）
- カテゴリ別フィルタリング（乾電池・充電池・ボタン電池など）
- 市区町村別検索
- 拠点詳細情報の表示

## 技術スタック

- [SvelteKit](https://kit.svelte.dev/) / [Svelte 5](https://svelte.dev/)
- [MapLibre GL](https://maplibre.org/)
- [Cloudflare Workers](https://workers.cloudflare.com/) / [D1](https://developers.cloudflare.com/d1/)
- [Tailwind CSS](https://tailwindcss.com/)
- [MIERUNE Arenarium](https://www.mierune.co.jp/) - マーカー/ポップアップレンダリング
- [OpenFreeMap](https://openfreemap.org/) - 地図タイル

## データソース

以下の外部データソースから取得・整形したデータを使用しています。

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

## セルフホスティング

ご自身の環境で本アプリケーションを構築・デプロイする場合は、[docs/self-hosting.md](docs/self-hosting.md) を参照してください。

## License

本プロジェクトのソースコードは [MIT License](LICENSE) の下で公開されています。

### データの取り扱い

- 回収拠点データは各自治体・データソースの利用規約に従います
- 地図タイルは [OpenFreeMap](https://openfreemap.org/) の利用規約に従います
