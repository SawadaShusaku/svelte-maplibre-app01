## 1. Popup Layout & Positioning

- [x] 1.1 Add `offset={[0, -24]}` to the MapLibre `<Popup>` so it clears the marker
- [x] 1.2 Remove the prefecture label paragraph (`<p class="text-xs text-gray-400 mb-2">...</p>`) from popup content
- [x] 1.3 Reduce popup content padding from `p-5` to `p-4`
- [x] 1.4 Reduce action row padding from `px-5 pb-5 pt-3` to `px-4 pb-4 pt-3`

## 2. Controls & Interaction

- [x] 2.1 Replace "手段:" label and `<select>` with a row of three icon buttons (🚶‍♂️ / 🚲 / 🚗) bound to `travelMode`
- [x] 2.2 Style selected travel-mode icon distinctly (e.g., blue background + white text) and unselected icons with gray background
- [x] 2.3 Enlarge close button from `w-6 h-6` (24 px) to `w-8 h-8` (32 px) and increase icon size
- [x] 2.4 Widen "経路を検索" button to use more horizontal space (e.g., `flex-1` or larger min-width)

## 3. Verification

- [x] 3.1 Run `npm run check` to confirm no TypeScript/Svelte errors (clean for +page.svelte; pre-existing errors in other files)
- [x] 3.2 Run `npm run smoke` to verify SSR and runtime rendering works correctly
- [x] 3.3 Manually verify popup opens above marker, close button is 32 px, travel mode icons work, and button is wider
