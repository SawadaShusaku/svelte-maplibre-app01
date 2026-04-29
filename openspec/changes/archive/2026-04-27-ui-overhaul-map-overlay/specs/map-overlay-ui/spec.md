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
