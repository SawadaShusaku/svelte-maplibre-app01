## ADDED Requirements

### Requirement: One marker per public place
The map SHALL render one marker for each public facility place record after deduplication, even when that place accepts multiple recycling categories.

#### Scenario: Facility accepts multiple categories
- **WHEN** one public facility record is associated with multiple selected categories
- **THEN** the map renders one marker at that facility location
- **AND** the marker or popup indicates the multiple accepted categories without creating category-specific duplicate markers

#### Scenario: Nearby different facilities
- **WHEN** two public facility records are near each other but represent different places
- **THEN** the map renders them as separate selectable facilities according to the current marker and zoom behavior
