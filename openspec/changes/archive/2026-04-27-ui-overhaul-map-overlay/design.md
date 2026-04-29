## Context

The current application uses a split view: a sidebar on the left for list/filtering and a map on the right. To improve usability and modernize the look, the user requested an overlay UI inspired by Google Maps. The map will take up the entire screen, with a search bar and filter controls floating on top. Additionally, the map markers and popups will be handled by `@arenarium/maps` for improved performance and visual clarity when dealing with complex or numerous markers.

## Goals / Non-Goals

**Goals:**
- Implement a full-screen map layout.
- Create a floating `AppHeader` containing a `SearchBar`, `WardSelector`, and a horizontally scrolling `CategoryBar`.
- Render a dynamic search results panel immediately below the search bar.
- Integrate `@arenarium/maps` with the existing `maplibregl` setup in Svelte.
- Support zooming/panning to a marker when a single search result is matched.

**Non-Goals:**
- Completely rewriting the data fetching logic (keep existing `$lib/data.ts` intact).
- Adding complex backend search logic (search will be handled client-side).
- Implementing new user accounts or saving favorites.

## Decisions

1. **Component Restructuring:**
   - Create `src/lib/components/AppHeader.svelte` to contain the floating top-left UI.
   - Extract `SearchBar.svelte`, `WardSelector.svelte`, and `CategoryBar.svelte` to keep the code modular.
   - The main `+page.svelte` will manage the overall state (selected categories, selected ward, search query, and the map instance) and pass them down as props or bindings.

2. **Integrating `@arenarium/maps` in Svelte:**
   - **Rationale:** `arenarium/maps` requires DOM elements (`HTMLElement`) for markers, tooltips, and popups.
   - **Approach:** We will use `svelte-maplibre-gl` for the base map, obtain the `map` instance via `bind:map={map}`, and instantiate `MapManager` from `@arenarium/maps` in a Svelte `$effect` when the map is ready.
   - **Marker Generation:** Instead of using declarative Svelte components (`<Marker>`) for each facility, we will programmatically generate HTML elements for the markers and pass them to `arenarium`'s `updateMarkers`.

3. **Search Logic & Results Panel:**
   - Implement a simple client-side fuzzy search on facility names, addresses, and categories.
   - The `SearchBar` component will display an absolute-positioned dropdown div with search results when active.
   - Clicking a result triggers the map to fly to the coordinates and opens the Arenarium popup.

4. **Category Bar:**
   - Use a `flex` container with `overflow-x-auto whitespace-nowrap` to allow horizontal scrolling on smaller screens or when there are many categories.
   - Hide scrollbars using CSS (`::-webkit-scrollbar { display: none; }`) for a cleaner look.

## Risks / Trade-offs

- **Risk:** Integration complexity between Svelte 5 reactivity and `@arenarium/maps` imperative API.
  - **Mitigation:** Wrap the Arenarium `updateMarkers` calls inside a single `$effect` that watches for changes in the `facilities` data and map state, ensuring synchronization.
- **Risk:** Search performance on the client side with many facilities.
  - **Mitigation:** The current dataset size is manageable client-side. We can implement debouncing in the search input if needed.
