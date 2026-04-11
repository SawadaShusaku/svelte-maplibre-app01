## 1. データ準備

- [x] 1.1 豊島区の各品目ページから施設名・住所・カテゴリ・営業時間を収集し、CSVにまとめる
- [x] 1.2 国土地理院ジオコーディングAPIで住所→緯度経度を変換するスクリプト（`scripts/geocode.ts`）を作成する
- [x] 1.3 `src/lib/data/toshima.geojson` をGeoJSON FeatureCollection形式で生成する（スキーマ: id/ward/name/address/categories/hours/notes）

## 2. 型定義とデータローダー

- [x] 2.1 `src/lib/types.ts` にGeoJSONプロパティの型（`RecycleFacility`）とカテゴリ識別子のユニオン型を定義する
- [x] 2.2 `src/lib/data.ts` に `toshima.geojson` をインポートし、カテゴリでフィルタして返す関数を実装する

## 3. フィルタUIコンポーネント

- [x] 3.1 `src/lib/components/CategoryFilter.svelte` を作成する（5カテゴリのトグルボタン、Svelte 5 runes使用）
- [x] 3.2 カテゴリごとの色定義（`battery`=黄, `fluorescent`=緑, `cooking-oil`=橙, `ink-cartridge`=青, `small-appliance`=紫）を定数として定義する

## 4. 地図マーカーとポップアップ

- [x] 4.1 `src/routes/+page.svelte` にフィルタ状態（`$state`）と絞り込み済みデータ（`$derived`）を追加する
- [x] 4.2 `svelte-maplibre-gl` の `Marker` コンポーネントで拠点をループ表示し、カテゴリ色を適用する
- [x] 4.3 `Popup` コンポーネントでマーカークリック時に施設名・住所・品目・営業時間を表示する
- [x] 4.4 `CategoryFilter` コンポーネントを地図上にオーバーレイ配置する（Tailwind CSS使用）

## 5. 動作確認

- [x] 5.1 開発サーバーで全拠点が地図上に表示されることを確認する
- [ ] 5.2 カテゴリフィルタのON/OFFでマーカーが正しく切り替わることを確認する
- [ ] 5.3 マーカークリックでポップアップが開き、正しい情報が表示されることを確認する
- [x] 5.4 `npm run check` で型エラーがないことを確認する

## 6. ヘッダーとフォント（見出し）

- [x] 6.1 ヘッダーの見出し文言を定義（「東京リサイクルマップ：{区名}版」）。初期は豊島区を適用
- [x] 6.2 Dela Gothic One を読み込む（Google Fonts）。`font-display: swap` と `preconnect` を設定
- [x] 6.3 見出しのフォント指定を見出し用途に限定（本文はSans系のまま）
- [x] 6.4 固定ヘッダーの高さ/余白/背景/境界線ガイドに沿ってレイアウトを整える
- [x] 6.5 モバイルで地図コントロールと干渉しないことを確認（重なり/タップ領域）
- [x] 6.6 コントラスト・可読性・読み上げでの見出し認識を確認
