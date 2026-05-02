## Why

位置情報（GPS）ボタンをスマートフォンで押しても反応しない問題がある。PCブラウザでは正常に動作するが、スマホ（iOS Safari / Android Chrome）ではボタンタップ後に一切反応しない。これによりモバイルユーザーが現在地からの経路検索や現在地周辺の施設探索ができず、UX上大きな損失となっている。

## What Changes

- `GeolocateControl` のモバイル対応を修正：タップ時のイベント処理、位置情報オプション、パーミッションエラーハンドリングを改善
- 位置情報取得失敗時のユーザー通知を追加（静默エラーを排除）
- iOS Safari / Android Chrome での動作検証と、必要に応じたフォールバック処理の追加
- `getCurrentPosition` の `enableHighAccuracy` と `timeout` オプションを最適化

## Capabilities

### New Capabilities
- `mobile-geolocation`: スマートフォンでの位置情報取得とエラーハンドリング、ユーザーへのフィードバック

### Modified Capabilities
- `map-markers`: 現在地取得後のマップ連携（ズーム・パン動作）にモバイル最適化を追加

## Impact

- `src/routes/+page.svelte` — GeolocateControl の設定変更、位置情報エラーハンドリング追加
- `src/lib/components/` — 必要に応じてトースト/通知コンポーネントの利用
- ユーザーフロー — 位置情報許可ダイアログ後のフィードバックが追加される
