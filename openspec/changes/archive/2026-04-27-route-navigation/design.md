## Context

現在の `+page.svelte` はマーカーとポップアップのみを持ち、経路表示の仕組みは存在しない。svelte-maplibre-gl は `GeoJSONSource` / `LineLayer` を宣言的に扱えるため、Svelte 5 の `$state` との相性が良い。外部ルーティングエンジンとして OSRM Public API を使用する（APIキー不要）。

## Goals / Non-Goals

**Goals:**
- 現在地 → 施設の経路を徒歩・自転車・車の3モードで取得・描画する
- ポップアップを閉じても経路を地図上に保持し、フローティングカードで消去できる
- 経路取得後に現在地〜施設が収まるよう自動ズーム（fitBounds）する

**Non-Goals:**
- ターンバイターン型のナビゲーション（音声案内、ステップ表示）
- 複数経路の同時表示
- OSRM 以外のルーティングプロバイダへの対応
- オフライン対応

## Decisions

### 1. 現在地取得: `navigator.geolocation` を直接呼ぶ（GeolocateControl のイベントに依存しない）

`GeolocateControl` の `ongeolocate` はユーザーがボタンを押した後しか発火しない。「経路を表示」ボタン押下時に位置が取れていないケースが多いため、`navigator.geolocation.getCurrentPosition()` をボタン押下時に直接呼ぶ方が信頼性が高い。

### 2. ルーティング: OSRM Public API

- URL: `https://router.project-osrm.org/route/v1/{foot|bike|car}/{lng1},{lat1};{lng2},{lat2}?overview=full&geometries=geojson`
- APIキー不要、プロトタイプ用途として適切
- レスポンスの `routes[0].geometry`（LineString）をそのまま GeoJSON として利用できる
- `routes[0].distance`（メートル）と `routes[0].duration`（秒）で距離・時間を表示

### 3. 描画: `GeoJSONSource` + `LineLayer`（svelte-maplibre-gl の宣言的 API）

`routeGeoJSON` ステートを `GeoJSONSource` の `data` prop に渡す。`null` のときは Source/Layer ごと `{#if}` で非表示にする。命令的な `map.addSource/addLayer` は使わない。

### 4. fitBounds: `bind:map` で MapLibre インスタンスを取得

`MapLibre` コンポーネントは `bind:map` で `maplibregl.Map` インスタンスを公開している。経路取得後に `map.fitBounds(bounds, { padding: 80 })` を呼ぶ。

### 5. 経路クリア: 地図下部のフローティングカード

ポップアップは閉じても経路は残る設計のため、独立した UI が必要。地図エリアの `absolute` 要素として下部中央に配置し、距離・時間・クリアボタンを表示する。

## Risks / Trade-offs

- **OSRM Public API の不安定性** → `try/catch` でエラーをキャッチし、ボタンに「取得に失敗しました」と表示する
- **位置情報の権限拒否** → `GeolocationPositionError` をハンドリングし、「位置情報の許可が必要です」と表示する
- **車ルートの精度（都市部の一方通行など）** → OSRM の OSM データに依存。精度の問題はデータ品質の問題であり本実装のスコープ外
- **`GeoJSONSource` の動的更新** → `data` prop を変更するとソース全体が差し替わる。経路データは1件のみなのでパフォーマンス問題はない
