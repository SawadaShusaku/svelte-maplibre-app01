## Why

The current UI design uses a traditional layout with a separate sidebar and map area, which can feel cluttered and less immersive, especially on mobile devices. A Google Maps-style overlay UI, where the map occupies the full screen and controls float above it, will provide a more modern, spacious, and intuitive user experience.

## What Changes

- Map area will be expanded to full screen (100vh/vw), removing the dedicated sidebar layout.
- A new floating search bar will be added to the top-left corner.
- The search bar will support free-text search for facilities and categories, and will display search results directly underneath it.
- A ward selection dropdown will be placed next to the search bar.
- Category filters will be displayed as horizontally scrollable buttons to the right of the ward selector, replacing the current list format.
- The sidebar will be repurposed as a Settings/About menu accessible via a hamburger icon in the search bar.
- The map popups and marker rendering will be enhanced using the `@arenarium/maps` library for better performance and a premium feel.

## Capabilities

### New Capabilities
- `map-overlay-ui`: The overall layout engine that places UI elements on top of a full-screen map.
- `search-results-panel`: A panel that dynamically lists search results directly under the search bar.
- `horizontal-category-filter`: A scrollable list of category toggle buttons.

### Modified Capabilities
- `facility-search`: Will be updated to handle free-text search (name, category, location) and trigger automatic map zooming/panning when a single result is found.
- `map-markers`: Will be updated to use `@arenarium/maps` for rendering custom HTML markers and popups.
- `sidebar-navigation`: The sidebar will no longer show facility lists or filters; it will be repurposed for general app navigation and settings.

## Impact

- `src/routes/+page.svelte`: Major restructure to remove the side-by-side layout and implement absolute positioning for controls.
- `src/lib/components/`: New components will be created (SearchBar, CategoryBar, WardSelector).
- Package dependencies: `@arenarium/maps` will need to be installed and integrated with `maplibregl`.
