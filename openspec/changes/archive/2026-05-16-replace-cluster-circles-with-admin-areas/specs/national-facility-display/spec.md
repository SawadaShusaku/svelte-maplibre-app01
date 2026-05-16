## MODIFIED Requirements

### Requirement: Zoom-level administrative aggregation
The map SHALL change display mode by zoom level from individual facilities to municipality or ward administrative polygon summaries and then prefecture administrative polygon summaries.

#### Scenario: High zoom individual facilities
- **WHEN** the map is zoomed into a local area
- **THEN** individual facility markers are displayed
- **AND** selecting a marker opens the existing facility detail behavior

#### Scenario: Mid zoom municipality summaries
- **WHEN** the map is at an intermediate regional zoom
- **THEN** facilities are summarized by municipality or ward
- **AND** those summaries are rendered as administrative area polygons with count labels
- **AND** Tokyo facilities summarize to ward-level groups before individual markers are shown

#### Scenario: Low zoom prefecture summaries
- **WHEN** the map is zoomed out to a national or multi-prefecture view
- **THEN** facilities are summarized by prefecture
- **AND** those summaries are rendered as prefecture polygons with count labels
- **AND** Tokyo ward summaries are further summarized into a Tokyo prefecture group

#### Scenario: Aggregates respect filters
- **WHEN** category filters or area filters are active
- **THEN** prefecture and municipality summary counts reflect only the currently matching facilities
- **AND** the rendered administrative polygons reflect the same filtered counts
