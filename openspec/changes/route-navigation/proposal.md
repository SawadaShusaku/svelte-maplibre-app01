## Why

リサイクル施設の場所が分かっても「どうやって行くか」が分からないと実際の利用につながらない。ポップアップ内に経路ボタンを追加し、現在地から施設までのルートを地図上に表示することで、アプリの実用性を高める。

## What Changes

- ポップアップに「経路を表示」ボタンと移動手段選択（徒歩・自転車・車）を追加
- ボタン押下時にブラウザの Geolocation API で現在地を取得し、OSRM Public API でルートを計算
- 計算したルートを地図上に LineLayer で描画し、現在地〜施設が収まるよう自動ズーム（fitBounds）
- 経路はポップアップを閉じても残り、地図下部のフローティングカード（距離・所要時間表示 + クリアボタン）で消去できる

## Capabilities

### New Capabilities

- `route-display`: 現在地から選択施設までの経路を取得・描画・クリアする一連の機能

### Modified Capabilities

（なし）

## Impact

- `src/routes/+page.svelte` — 経路状態の追加、GeoJSONSource/LineLayer の追加、ポップアップ内UI拡張、フローティングカード追加
- 外部依存: OSRM Public API（`router.project-osrm.org`）— APIキー不要、プロトタイプ用途
- `maplibre-gl` の `map.fitBounds()` を使用するため `bind:map` を追加
