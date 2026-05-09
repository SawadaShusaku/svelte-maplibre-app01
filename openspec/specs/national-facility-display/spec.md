# national-facility-display Specification

## Purpose
TBD - created by archiving change support-national-facility-display. Update Purpose after archive.
## Requirements
### Requirement: National area catalog
The app SHALL load selectable area metadata from the D1-backed public API instead of relying on a hard-coded Tokyo-only registry.

#### Scenario: Load areas from D1
- **WHEN** the app starts
- **THEN** it requests public area metadata from the API
- **AND** the selectable area list includes every prefecture/municipality represented in D1
- **AND** areas not present in `WARD_REGISTRY` remain selectable and displayable

#### Scenario: Group areas by prefecture
- **WHEN** the API returns areas from multiple prefectures
- **THEN** the UI groups municipality or ward choices under their prefecture
- **AND** users can narrow the displayed facilities by selecting one or more areas

### Requirement: National display scope
The app SHALL distinguish nationwide display from explicit area filtering.

#### Scenario: Initial national scope
- **WHEN** the user opens the map with no saved area filter
- **THEN** the app displays national D1 facilities according to the current zoom-level display mode
- **AND** the UI indicates that the scope is nationwide rather than showing every area as individually selected

#### Scenario: Explicit empty selection
- **WHEN** the user switches to area filtering and clears all selected areas
- **THEN** no facilities are displayed
- **AND** the app does not treat the empty selected list as nationwide scope

### Requirement: Zoom-level administrative aggregation
The map SHALL change display mode by zoom level from individual facilities to municipality or ward summaries and then prefecture summaries.

#### Scenario: High zoom individual facilities
- **WHEN** the map is zoomed into a local area
- **THEN** individual facility markers are displayed
- **AND** selecting a marker opens the existing facility detail behavior

#### Scenario: Mid zoom municipality summaries
- **WHEN** the map is at an intermediate regional zoom
- **THEN** facilities are summarized by municipality or ward
- **AND** Tokyo facilities summarize to ward-level groups before individual markers are shown

#### Scenario: Low zoom prefecture summaries
- **WHEN** the map is zoomed out to a national or multi-prefecture view
- **THEN** facilities are summarized by prefecture
- **AND** Tokyo ward summaries are further summarized into a Tokyo prefecture group

#### Scenario: Aggregates respect filters
- **WHEN** category filters or area filters are active
- **THEN** prefecture and municipality summary counts reflect only the currently matching facilities

### Requirement: National source metadata fallback
The app SHALL not require local registry source metadata for a facility to be displayed.

#### Scenario: Area missing local registry metadata
- **WHEN** a D1 facility belongs to an area that does not exist in `WARD_REGISTRY`
- **THEN** the facility remains visible on the map and list
- **AND** source URL controls are omitted or disabled only for the missing metadata

