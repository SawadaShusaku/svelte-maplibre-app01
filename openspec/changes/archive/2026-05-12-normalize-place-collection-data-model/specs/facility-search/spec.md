## ADDED Requirements

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
