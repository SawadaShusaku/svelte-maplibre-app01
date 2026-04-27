## 1. Setup & Dependencies

-[x] 1.1 Install `@arenarium/maps` package and update package.json.

## 2. Component Refactoring & New Components

-[x] 2.1 Create `src/lib/components/SearchBar.svelte` to handle text input and display the dropdown panel.
-[x] 2.2 Create `src/lib/components/WardSelector.svelte` for the ward dropdown.
-[x] 2.3 Create `src/lib/components/CategoryBar.svelte` with a horizontally scrolling container for category buttons.
-[x] 2.4 Create `src/lib/components/AppHeader.svelte` to contain the SearchBar, WardSelector, and CategoryBar, styling it to float over the map.
-[x] 2.5 Refactor `src/routes/+page.svelte` to remove the sidebar layout and use `AppHeader`. Make the map full-screen.
-[x] 2.6 Refactor the existing sidebar into `src/lib/components/SettingsSidebar.svelte` and implement the hamburger toggle in `AppHeader`.

## 3. Arenarium Maps Integration

-[x] 3.1 Instantiate `MapManager` from `@arenarium/maps` in `+page.svelte` after the `maplibregl` map is loaded.
-[x] 3.2 Implement logic to generate `HTMLElement` markers and popups for each facility instead of using `svelte-maplibre-gl` declarative components.
-[x] 3.3 Create a reactive `$effect` in `+page.svelte` to call `arenarium.updateMarkers()` whenever the `facilities` array changes.

## 4. Search & Interaction Logic

-[x] 4.1 Implement client-side free-text search logic that filters `facilities` based on the query from `SearchBar`.
-[x] 4.2 Pass search results back to `SearchBar` to populate the results panel dropdown.
-[x] 4.3 Implement auto-zoom and pan functionality: when exactly 1 facility is matched, or when a user clicks a search result, fly to the marker and trigger the popup.

## 5. Cleanup & Styling

-[x] 5.1 Update `layout.css` or component styles to ensure glassmorphism and overlay aesthetics meet the premium UI requirements.
-[x] 5.2 Remove obsolete components or code from the previous sidebar list view.
