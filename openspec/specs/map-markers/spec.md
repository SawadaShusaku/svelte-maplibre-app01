# Map Markers

## Purpose
Define marker rendering and marker popup behavior on the map.
## Requirements
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

### Requirement: One marker per public place
The map SHALL render one marker for each public facility place record after deduplication, even when that place accepts multiple recycling categories.

#### Scenario: Facility accepts multiple categories
- **WHEN** one public facility record is associated with multiple selected categories
- **THEN** the map renders one marker at that facility location
- **AND** the marker or popup indicates the multiple accepted categories without creating category-specific duplicate markers

#### Scenario: Nearby different facilities
- **WHEN** two public facility records are near each other but represent different places
- **THEN** the map renders them as separate selectable facilities according to the current marker and zoom behavior

### Requirement: Place-based marker rendering
The map SHALL render one marker per active place and use active collection entries to determine categories, badges, and filter matching.

#### Scenario: Place has multiple categories
- **WHEN** an active place has multiple active collection entries with different categories
- **THEN** the map renders one marker for the place
- **AND** the marker/detail UI can show all active categories for that place

#### Scenario: Place has three or more categories
- **WHEN** an active place has three or more active categories
- **THEN** marker rendering, filtering, and detail display continue to treat the place as one marker
- **AND** the UI does not assume category data came from a left/right pair

#### Scenario: Category filter matches entry
- **WHEN** users filter by a category
- **THEN** a place is included if it has at least one active collection entry for that category
- **AND** inactive entries do not make a marker appear

