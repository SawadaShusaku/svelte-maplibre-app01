## ADDED Requirements

### Requirement: Custom HTML markers via Arenarium
The map markers and popups SHALL be rendered using the `@arenarium/maps` library.

#### Scenario: Rendering markers
- **WHEN** the map loads the facility data
- **THEN** it generates HTMLElement markers and passes them to the Arenarium MapManager

### Requirement: Interactive popups
Clicking a marker SHALL display an Arenarium popup with facility details.

#### Scenario: User clicks a marker
- **WHEN** the user clicks a facility marker
- **THEN** an Arenarium popup opens displaying the facility's name, address, categories, and route options
