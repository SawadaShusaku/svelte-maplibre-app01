## Context

現在の `src/routes/+page.svelte` では、施設マーカークリック時に `svelte-maplibre-gl` の `<Popup>` コンポーネントを使用してカード形式のポップアップを表示している。ポップアップのスタイルは `:global(.maplibregl-popup-*)` で上書きしており、全viewportで同一の見た目になっている。

モバイル画面（viewport width < 640px）では、このカード形式は以下の問題がある：
- 画面幅に対してカードが大きすぎ、マーカーを隠してしまう
- タップ操作に対して閉じるエリア（背景）が小さい
- コンテンツが見切れやすい

本変更では、モバイル時のみボトムシート形式に切り替えるレスポンシブ対応を行う。

## Goals / Non-Goals

**Goals:**
- viewport width < 640px でポップアップをボトムシートとして表示する
- デスクトップ（>= 640px）では既存の `<Popup>` 表示を維持する
- ボトムシートはスライドインアニメーション付きで表示される
- ボトムシートはドラッグ/スワイプまたは閉じるボタンで閉じられる
- ボトムシート内のコンテンツは既存ポップアップと同一構造を保持する
- ボトムシート表示時、マップは該当マーカーを中心に保つ

**Non-Goals:**
- デスクトップ表示の変更
- ポップアップ内のコンテンツ変更（タブ、経路検索UI等）
- ボトムシートの複数段階の高さ変更（ミドル/フル等）
- ボトムシート背後のオーバーレイ（マップ操作は継続可能とする）

## Decisions

### 1. 表示方式: 同一ファイル内の条件分岐（コンポーネント分割なし）
**Decision**: `+page.svelte` 内で `{#if isMobile}` で `<Popup>` とボトムシートを切り替える。新規コンポーネントファイルは作成しない。
**Rationale**: 変更範囲が1箇所に集中し、状態（`openPopupId`, `popupTab`, `travelMode`）の受け渡しがシンプルになる。ボトムシートのマークアップ量も少ない（50行程度）。
**Alternative considered**: `MobileBottomSheet.svelte` コンポーネント化 → 却下。props の受け渡しが煩雑になり、メリットが小さい。

### 2. ブレークポイント: Tailwind の `sm`（640px）を使用
**Decision**: モバイル判定に `window.innerWidth < 640` を使用し、Tailwind の `sm` ブレークポイントと一致させる。
**Rationale**: プロジェクト内ですでに `@media (max-width: 640px)` が使用されており（`.map-title-anchor`）、統一感を保つため。

### 3. ボトムシート実装: CSS fixed + Svelte transition
**Decision**: `position: fixed` で画面下部に配置し、`fly` トランジションでスライドインさせる。タッチイベントは `touchstart`/`touchend` でスワイプダウンを検出。
**Rationale**: 外部ライブラリ（vaul-svelte 等）を追加せず、Svelte 標準機能で実現できる。WASM サイズ増加なし。
**Alternative considered**: `vaul-svelte` 使用 → 却下。依存追加のコストに対して機能が過剰。

### 4. マップ挙動: ボトムシート表示時にマーカーを中央にパン
**Decision**: モバイルでポップアップを開く際、`map.panTo([lng, lat])` を呼び出し、マーカーがボトムシート上部に来るようにする。
**Rationale**: ボトムシートが画面下部を覆うため、マーカーが見えなくなるのを防ぐ。パンオフセットはボトムシート高さの半分程度を見込む。

## Risks / Trade-offs

- [Risk] ボトムシート高さが可変（コンテンツ量に依存）なため、マーカーのパン量を固定値にするとずれる → Mitigation: コンテンツ高さではなく、ボトムシートの `max-height`（例: 50vh）を固定し、それに応じたオフセット量を計算する
- [Risk] `touchstart`/`touchend` でのスワイプ検出が誤検出（タップと区別がつかない） → Mitigation: 垂直方向の移動距離閾値（30px以上）と時間閾値（500ms以内）を設ける
- [Trade-off] ボトムシート表示中もマップは操作可能（オーバーレイなし）だが、ボトムシート下部のタップはボトムシート自身に奪われる。これは意図した挙動。

## Migration Plan

1. `+page.svelte` に `isMobile` リアクティブ状態を追加（`resize` イベントリスナー）
2. 既存 `<Popup>` ブロックを `{#if !isMobile}` でラップ
3. `{:else}` ブロックにボトムシートマークアップを追加
4. ポップアップを開く処理に `isMobile` 分岐で `panTo` を追加
5. `npm run smoke` でビルド確認
6. ブラウザ DevTools でモバイルビュー確認

## Open Questions

- ボトムシートの最大高さを 50vh とするか、60vh とするか（実機検証が必要）
- パンオフセット量の調整（ボトムシート高さに依存するため、実際のピクセル値は実装時に決定）
