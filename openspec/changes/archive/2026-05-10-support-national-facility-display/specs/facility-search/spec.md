## MODIFIED Requirements

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
