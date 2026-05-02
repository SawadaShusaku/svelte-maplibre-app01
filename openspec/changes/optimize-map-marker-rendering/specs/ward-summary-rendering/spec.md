## ADDED Requirements

### Requirement: Low-zoom ward summary rendering
The system SHALL replace individual facility markers with ward-level summary markers when the viewport is zoomed out enough that showing every facility marker would harm readability or interaction performance.

#### Scenario: User zooms out across many wards
- **WHEN** the visible zoom level is below the threshold defined for individual facility rendering
- **THEN** the map displays one summary marker per visible ward instead of rendering every facility marker individually
- **AND** each summary marker represents a ward rather than a generic point-count cluster

### Requirement: Ward summary labeling
Low-zoom summary markers SHALL communicate ward identity primarily by ward name.

#### Scenario: User inspects low-zoom overview
- **WHEN** ward summary markers are visible
- **THEN** each summary marker shows the ward label such as `豊島区` or `板橋区`
- **AND** the display does not rely on point-count numbers as the primary grouping label

### Requirement: Ward summary interaction preserves navigation flow
The system SHALL let users enter a ward from the low-zoom overview without losing the current filtering context.

#### Scenario: User selects a ward summary marker
- **WHEN** the user taps or clicks a ward summary marker
- **THEN** the map zooms or fits to that ward's facility area
- **AND** the currently selected wards and recycling categories remain applied
- **AND** the map transitions toward individual facility inspection for that ward
