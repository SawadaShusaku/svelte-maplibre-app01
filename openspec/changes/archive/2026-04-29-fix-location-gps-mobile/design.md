## Context

現在、MapLibre GL の `GeolocateControl` を `svelte-maplibre-gl` 経由で使用しているが、スマートフォン（iOS Safari / Android Chrome）で位置情報ボタンをタップしても反応しない。PCブラウザでは正常に動作する。

原因として考えられるのは：
1. `GeolocateControl` のデフォルト設定では `positionOptions.enableHighAccuracy` が `false` のため、モバイルで位置情報取得が不安定または失敗する
2. パーミッション拒否時や取得失敗時のエラーハンドリングがなく、ユーザーに何もフィードバックされない（静默失敗）
3. モバイルブラウザでは HTTPS 必須、かつ `timeout` 設定がない場合、位置情報取得が無限にハングする可能性がある
4. `trackUserLocation={true}` と組み合わせた際の iOS Safari 特有の挙動問題

## Goals / Non-Goals

**Goals:**
- スマートフォンで位置情報ボタンを押した際に、現在地が正しく取得・表示される
- 位置情報取得失敗時にユーザーに理由を通知する
- iOS Safari / Android Chrome での動作安定性を向上させる
- 位置情報パーミッションの拒否/許可フローを適切にハンドリングする

**Non-Goals:**
- 高精度な継続的トラッキングの実装（バッテリー消費を考慮し、必要最小限の取得）
- 位置情報のバックグラウンド取得
- 新しいUIコンポーネントの大規模追加（既存のトースト/alert機構を活用）

## Decisions

### Decision 1: `GeolocateControl` の `positionOptions` を明示的に設定する
- **選択**: `enableHighAccuracy: true`、`timeout: 10000`、`maximumAge: 0` を設定
- **理由**: モバイルブラウザ（特にiOS Safari）は `enableHighAccuracy` が `false` の場合、位置情報取得を拒否するか不安定な動作を示すことがある。`timeout` を設定することで無限ハングを防ぐ。
- **代替案**: カスタムボタン + `navigator.geolocation.getCurrentPosition` を自前実装 → 採用しない。`GeolocateControl` のUI/UXを維持しつつ設定で解決可能なため。

### Decision 2: エラーハンドリングは MapLibre の `geolocate` イベント + `error` イベントを利用
- **選択**: `GeolocateControl` の `on('error')` と `on('geolocate')` イベントをリッスンし、エラー時にトースト/alertで通知
- **理由**: MapLibre のコントロールに統合されたイベントシステムを使うことで、実装がシンプルになり、MapLibre の内部状態と整合性が保たれる
- **代替案**: ラップして自前の位置情報取得ロジックを作る → 採用しない。冗長になり、MapLibre のコントロール状態とずれる可能性がある

### Decision 3: 経路検索の `getCurrentPosition` も同様にオプションを最適化
- **選択**: `getRoute` 関数内の `navigator.geolocation.getCurrentPosition` にも `enableHighAccuracy: true`、`timeout: 10000` を追加
- **理由**: 経路検索でも同じモバイル問題が発生する可能性がある。一貫したエラーメッセージを提供する

## Risks / Trade-offs

- **[Risk] `enableHighAccuracy: true` でバッテリー消費が増加する** → Mitigation: `maximumAge: 0` と `timeout: 10000` で取得時間を制限。継続トラッキングではなく単発取得が主な用途。
- **[Risk] パーミッション拒否後、ブラウザの設定変更を促す必要がある** → Mitigation: エラーメッセージに「ブラウザの設定で位置情報を許可してください」を含める。
- **[Risk] HTTPS 環境でないと動作しない** → Mitigation: 本番環境はHTTPS前提。開発時は `localhost` では動作するが、同一ネットワークのスマホテスト時は ngrok 等のHTTPSトンネルを推奨（READMEに追記）。
