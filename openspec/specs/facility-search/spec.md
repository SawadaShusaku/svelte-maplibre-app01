# Facility Search

## Purpose
Define free-text search behavior for facility filtering and result-focused map movement.
## Requirements
### Requirement: Free-text search
The search bar SHALL filter facilities based on a free-text match against facility name, address, and category within the current national or selected-area scope.

#### Scenario: User searches for a keyword
- **WHEN** the user types "新宿 乾電池"
- **THEN** only facilities containing both keywords in their searchable fields are shown

#### Scenario: National scope search
- **WHEN** the app is in national scope and the user searches for a keyword
- **THEN** the search is evaluated against D1 facilities across all public areas
- **AND** the result is not limited to Tokyo registry areas

#### Scenario: Selected area search
- **WHEN** the user has selected specific areas and searches for a keyword
- **THEN** the search is evaluated only within those selected areas

### Requirement: Search normalized places and collection entries
Search SHALL match both place-level display fields and category/source-specific collection entry fields.

#### Scenario: Search by representative place text
- **WHEN** a user searches by a place's canonical name or display address
- **THEN** the search returns the matching place with its active categories

#### Scenario: Search by data-source listing text
- **WHEN** a user searches by a data-source listing name, listing address, public note, or location hint stored on an active collection entry
- **THEN** the search returns the associated place
- **AND** the detail response can show the matching collection entry context

#### Scenario: Inactive entries excluded
- **WHEN** text exists only on inactive places or inactive collection entries
- **THEN** public search does not return those inactive records by default

### Requirement: Auto-zoom on single result
The map SHALL automatically pan and zoom to the marker when a search yields exactly one result.

#### Scenario: Single search result
- **WHEN** the search filters the facilities down to exactly 1 item
- **THEN** the map pans and zooms to that facility's coordinates

