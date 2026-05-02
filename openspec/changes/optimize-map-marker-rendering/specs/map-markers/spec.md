## MODIFIED Requirements

### Requirement: Custom HTML markers via Arenarium
The map markers SHALL preserve the current custom marker design for individual facilities even if the underlying rendering implementation is optimized.

#### Scenario: Rendering markers
- **WHEN** the map loads facility data at a zoom level that shows individual facilities
- **THEN** each facility is shown with the same visual marker design currently used by the application
- **AND** marker rendering is backed by reusable assets or cached rendering data rather than per-facility unique DOM construction

### Requirement: Interactive popups
Clicking a facility marker SHALL open the facility detail UI for exactly one selected facility.

#### Scenario: User clicks a marker
- **WHEN** the user clicks a facility marker
- **THEN** the application selects that facility as the only active facility detail target
- **AND** the popup or bottom sheet opens for that facility with its name, address, categories, and route options

