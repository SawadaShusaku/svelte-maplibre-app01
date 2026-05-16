## ADDED Requirements

### Requirement: Administrative summaries are separate from place markers
The map SHALL treat administrative polygon summaries as aggregate navigation layers rather than individual place markers.

#### Scenario: Summary polygon does not open facility detail
- **WHEN** the user clicks a prefecture or municipality summary polygon
- **THEN** the map performs summary drill-down behavior
- **AND** the app does not open a facility detail panel for the aggregate polygon

#### Scenario: Individual markers keep existing behavior
- **WHEN** the map is zoomed into the individual marker range
- **THEN** one marker is rendered per active place
- **AND** clicking a marker opens the existing facility detail behavior
