## ADDED Requirements

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
