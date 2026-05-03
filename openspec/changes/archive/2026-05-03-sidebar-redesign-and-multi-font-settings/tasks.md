## 1. Types and Font System Foundation

- [x] 1.1 Add `FontTarget` type (`'logo' | 'popup' | 'ui'`) to `src/lib/types.ts`
- [x] 1.2 Extend `LogoFont` type or create `FontChoice` record type for per-target selections
- [x] 1.3 Rewrite `src/lib/font-style.ts` to support multiple CSS variables (`--font-logo`, `--font-popup`, `--font-ui`)
- [x] 1.4 Add `getFontChoice(target)`, `setFontChoice(target, font)`, and `applyFontChoices()` functions
- [x] 1.5 Add migration logic: read legacy `recycling-map:logo-font` key and map to new `logo` target on first load

## 2. CSS and Font Loading

- [x] 2.1 Update `src/routes/layout.css` Google Fonts `@import` to include all needed weights for Zen Kaku Gothic New (700), M PLUS Rounded 1c (700), Klee One (600)
- [x] 2.2 Add CSS custom properties to `:root`: `--font-logo`, `--font-popup`, `--font-ui` with default values
- [x] 2.3 Update `.brand-display` to use `var(--font-logo)`
- [x] 2.4 Add `.font-popup` and `.font-ui` utility classes referencing respective CSS variables
- [x] 2.5 Update popup styles in `layout.css` to use `var(--font-popup)` for heading/body text
- [x] 2.6 Update `src/routes/+layout.svelte` `onMount` to call `applyFontChoices()` instead of single logo font

## 3. Sidebar Section Navigation Structure

- [x] 3.1 Add `currentSection` state to `SettingsSidebar.svelte` (`'home' | 'marker' | 'fonts' | 'info'`)
- [x] 3.2 Create section list view (home view) with tappable rows for "マーカーデザイン" and "フォント設定"
- [x] 3.3 Extract marker design controls into a dedicated detail view component or conditional block
- [x] 3.4 Add back button to detail views that resets `currentSection` to `'home'`
- [x] 3.5 Keep informational menu items visible only on home view, below settings sections
- [x] 3.6 Add transition animation for section changes (optional, Tailwind transition classes)

## 4. Multi-Element Font Settings UI

- [x] 4.1 Create font settings detail view in `SettingsSidebar.svelte`
- [x] 4.2 Add three font selectors: "ロゴフォント", "ポップアップフォント", "UIフォント"
- [x] 4.3 Each selector uses radio buttons with same four font options (Dela Gothic One, Zen Kaku Gothic New, M PLUS Rounded 1c, Klee One)
- [x] 4.4 Each option label renders in its own typeface as a live preview
- [x] 4.5 Changing a selector immediately calls `setFontChoice()` and updates CSS variable
- [x] 4.6 Persist all three choices to localStorage under a single key (`recycling-map:font-choices`) or separate keys

## 5. Integration and Cleanup

- [x] 5.1 Update `SettingsSidebar.svelte` `$props` to accept `logoFont`, `popupFont`, `uiFont` bindables (or remove individual font props if using global CSS variable approach)
- [x] 5.2 Update `src/routes/+page.svelte` to pass font state to sidebar (or remove if using CSS variable approach)
- [x] 5.3 Remove inline font settings from marker design section (move to dedicated font section)
- [x] 5.4 Run `npm run check` and fix any TypeScript errors
- [x] 5.5 Run `npm run smoke` to verify SSR/browser compatibility
- [x] 5.6 Run `npm run test` to ensure existing tests pass
