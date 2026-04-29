## Why

現在のマップポップアップはデスクトップとモバイルで同じ表示形式（マーカー上部のカード）を使用している。スマートフォン画面では画面幅が狭く、ポップアップがマーカーを隠したりコンテンツが見切れたりするため、モバイルに適したボトムシート形式の表示が必要である。

## What Changes

- スマートフォン画面（viewport width < 640px）では、マップポップアップをボトムシートとして表示する
- デスクトップ画面では既存のポップアップ表示を維持する
- ボトムシートは画面下部からスライドインし、ドラッグ/スワイプで閉じられる
- ボトムシート内のコンテンツ構造は既存ポップアップと同一（タブ、基本情報、カテゴリ詳細、経路検索）
- ボトムシート表示時はマップのパン（移動）がポップアップ追従ではなく、マーカー位置を中心に保持する

## Capabilities

### New Capabilities
<!-- Capabilities being introduced. Replace <name> with kebab-case identifier (e.g., user-auth, data-export, api-rate-limiting). Each creates specs/<name>/spec.md -->
- None

### Modified Capabilities
<!-- Existing capabilities whose REQUIREMENTS are changing (not just implementation).
     Only list here if spec-level behavior changes. Each needs a delta spec file.
     Use existing spec names from openspec/specs/. Leave empty if no requirement changes. -->
- `popup-ui`: スマートフォン画面でのボトムシート表示要件を追加。ポップアップの表示形式がviewport幅に応じて切り替わる。

## Impact

- `src/routes/+page.svelte`: ポップアップレンダリングロジックにレスポンシブ分岐を追加
- `src/lib/components/`: 必要に応じて新規ボトムシートコンポーネントを作成
- `openspec/specs/popup-ui/spec.md`: ボトムシート関連の要件を追加（delta spec）
