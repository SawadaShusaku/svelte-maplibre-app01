## 1. Popup state consolidation

- [x] 1.1 `src/routes/+page.svelte` の選択施設管理を単一 state (`selectedFacilityId` / derived facility) に集約する
- [x] 1.2 デスクトップ用 `Popup` を施設ループの外へ移し、単一 Popup として描画する
- [x] 1.3 モバイルのボトムシートを単一選択 state に接続し、desktop popup と同じ施設解決ロジックを共有する

## 2. Rendering architecture separation

- [x] 2.1 地図表示用の施設派生データと popup 解決ロジックを `+page.svelte` から分離するユーティリティまたはモジュールを追加する
- [x] 2.2 フィルタ済み施設データをキャッシュし、検索・popup・描画で再利用できる形に整理する
- [x] 2.3 マーカー描画戦略の入力と出力を明確にし、page コンポーネントが描画方針を差し替えやすい構成にする

## 3. Marker rendering optimization

- [x] 3.1 低ズーム時に区単位サマリー表示へ切り替える `GeoJSONSource` / layer 構成を導入する
- [x] 3.2 高ズーム時の個別施設マーカーで現行デザインを維持できる再利用可能な描画資産キャッシュを実装する
- [x] 3.3 区単位サマリー表示から個別マーカー表示へ切り替わるズーム遷移とクリック挙動を調整する

## 4. Verification

- [x] 4.1 popup 単一化後にデスクトップとモバイルで施設詳細表示が 1 件のみになることを確認する
- [x] 4.2 ズームアウト時の区単位サマリー表示、ズームイン時の個別マーカー表示、カテゴリ・区フィルタ維持を確認する
- [x] 4.3 `npm run check`、`npm run test`、`npm run smoke` を実行し、回帰がないことを確認する
