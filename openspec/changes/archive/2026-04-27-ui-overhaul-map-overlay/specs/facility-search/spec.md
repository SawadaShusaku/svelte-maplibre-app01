## ADDED Requirements

### Requirement: Free-text search
The search bar SHALL filter facilities based on a free-text match against facility name, address, and category.

#### Scenario: User searches for a keyword
- **WHEN** the user types "新宿 乾電池"
- **THEN** only facilities containing both keywords in their searchable fields are shown

### Requirement: Auto-zoom on single result
The map SHALL automatically pan and zoom to the marker when a search yields exactly one result.

#### Scenario: Single search result
- **WHEN** the search filters the facilities down to exactly 1 item
- **THEN** the map pans and zooms to that facility's coordinates
