## ADDED Requirements

### Requirement: Full-screen map layout
The map SHALL occupy the entire viewport (100vw, 100vh) without being constrained by a side panel.

#### Scenario: User views the application
- **WHEN** the application loads
- **THEN** the map covers the entire browser window

### Requirement: Floating App Header
The application header SHALL float over the top-left corner of the map, containing the search bar and filter controls.

#### Scenario: Header visibility
- **WHEN** the map is displayed
- **THEN** the header is visible floating above the map layer without obscuring the entire map

### Requirement: Popup container transparency and padding reset
The map overlay CSS SHALL preserve transparent background and zero padding on MapLibre popup containers so that custom popup content styling is fully effective.

#### Scenario: Popup renders with custom card
- **WHEN** a MapLibre popup opens
- **THEN** the `.maplibregl-popup-content` element has no default padding or opaque background
- **AND** the custom card styling inside the popup is visible without interference from default MapLibre styles
