## 1. Sidebar information architecture

- [x] 1.1 Audit `SettingsSidebar.svelte` and identify which current elements belong to `表示設定` versus `情報・ヘルプ`
- [x] 1.2 Restructure the sidebar layout into explicit `表示設定` and `情報・ヘルプ` sections without moving header search or filter controls into the sidebar
- [x] 1.3 Remove any sidebar treatment that implies a future `掲載区一覧` menu entry

## 2. Display settings presentation

- [x] 2.1 Refine the marker design controls so the primary display setting is visible without requiring the user to discover a buried placeholder menu
- [x] 2.2 Preserve existing marker style persistence behavior while updating the settings presentation

## 3. Informational navigation items

- [x] 3.1 Replace the current placeholder buttons with data-driven informational menu rows
- [x] 3.2 Implement the priority order `使い方` → `データについて` → `更新情報` → `プライバシーポリシー`
- [x] 3.3 Add a distinct visual state for items that do not yet have a destination page so they are not mistaken for generic action buttons
- [x] 3.4 Prepare the menu item structure so future SvelteKit routes or external links can be attached without rewriting the sidebar layout

## 4. Verification

- [x] 4.1 Verify the sidebar remains usable on desktop and mobile widths after the section split
- [x] 4.2 Run `npm run check` to confirm the sidebar refactor introduces no Svelte or TypeScript errors
