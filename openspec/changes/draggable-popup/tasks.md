## 1. ポップアップ表示の仕組みをリファクタリング

- [ ] 1.1 `+page.svelte` から `svelte-maplibre-gl` の `<Popup>` コンポーネントを削除します。
- [ ] 1.2 `maplibregl.Popup` のインスタンスを保持するための新しい状態変数を `+page.svelte` に追加します (例: `let activePopup = $state<maplibregl.Popup | null>(null)`)。
- [ ] 1.3 `Popup` の中身を表示するための新しいSvelteコンポーネント `src/lib/components/PopupContent.svelte` を作成します。
- [ ] 1.4 `+page.svelte` の `{#if openPopupId === id}` ブロック内にあるポップアップのコンテンツマークアップを `PopupContent.svelte` に移動します。この新しいコンポーネントは `feature` プロパティを `prop` として受け取るようにします。

## 2. 手動でのポップアップ管理ロジックを実装

- [ ] 2.1 `+page.svelte` に、`openPopupId` を監視する `$effect` を作成します。
- [ ] 2.2 `$effect` 内で、`openPopupId` が変更されたときに、既存の `activePopup` があれば `remove()` メソッドで地図から削除し、関連するSvelteコンポーネントを破棄する処理を追加します。
- [ ] 2.3 `openPopupId` に有効なIDが設定されている場合、以下の処理を実装します。
    - [ ] 2.3.1 選択された施設(`feature`)のデータを取得します。
    - [ ] 2.3.2 `PopupContent` コンポーネントをマウントするためのコンテナ `div` を作成します。
    - [ ] 2.3.3 `new PopupContent({ target: container, props: { feature } })` のようにして、コンポーネントをコンテナにマウントします。
    - [ ] 2.3.4 `new maplibregl.Popup({ draggable: true })` を使って、ドラッグ可能な新しいポップアップインスタンスを作成します。
    - [ ] 2.3.5 `setLngLat()` でポップアップの位置を設定します。
    - [ ] 2.3.6 `setDOMContent()` で、`PopupContent` をマウントしたコンテナ `div` をポップアップの中身として設定します。
    - [ ] 2.3.7 `addTo(map)` でポップアップを地図に追加し、そのインスタンスを `activePopup` に保存します。
- [ ] 2.4 ポップアップの閉じるボタンがクリックされたとき、またはポップアップが `close` イベントを発行したときに `openPopupId` を `null` に設定する処理を追加します。

## 3. スタイルの調整

- [ ] 3.1 新しいポップアップが `draggable` であることを示すため、`maplibregl-popup-content` クラスに `cursor: move` または `cursor: grab` スタイルを適用します。
