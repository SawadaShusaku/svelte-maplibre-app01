## Why

23区対応で施設数が大きく増え、地図をズームアウトした際にマーカー描画と再レイアウトの負荷が目立つようになった。既存のマーカーデザインは維持したまま、低ズーム時の描画方式と popup 管理を見直し、滑らかな操作感を回復する必要がある。

## What Changes

- 低ズーム時は個別マーカーをそのまま並べず、区単位のサマリー表示へ切り替えて描画負荷を抑える
- 高ズーム時の施設マーカーは現行デザインを保持したまま、再利用可能な描画資産として管理する
- popup 表示状態を 1 件の選択施設に集約し、デスクトップでは単一 Popup、モバイルでは単一ボトムシートとして表示する
- 施設データとマーカー描画用データをキャッシュし、フィルタ変更時の再構築コストを減らす
- マーカー描画最適化の責務を `+page.svelte` から分離し、描画戦略を独立して切り替えられる構成にする

## Capabilities

### New Capabilities
- `ward-summary-rendering`: 低ズーム時の区単位サマリー表示とズーム段階ごとの描画戦略を定義する

### Modified Capabilities
- `map-markers`: マーカーデザインを維持したまま、描画実装を再利用可能な資産ベースへ変更する
- `popup-ui`: popup / ボトムシートの表示対象を常に単一施設に集約する

## Impact

- `src/routes/+page.svelte` — 地図表示、選択状態、popup 制御の再構成
- `src/lib/components/MapMarker.svelte` および新規描画ユーティリティ — マーカー資産の再利用戦略導入
- `src/lib/data.ts` と関連データ構造 — 施設データのキャッシュと描画向け整形の見直し
- `openspec/specs/map-markers/spec.md`, `openspec/specs/popup-ui/spec.md` — 既存要件の更新
- 新規 capability spec — 区単位サマリー表示の要件追加
