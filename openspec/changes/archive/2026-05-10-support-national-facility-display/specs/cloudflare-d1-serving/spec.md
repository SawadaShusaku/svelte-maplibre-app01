## ADDED Requirements

### Requirement: National facility queries
The D1-backed facility API SHALL support national queries without requiring callers to send every area ID.

#### Scenario: Omitted area filter
- **WHEN** the browser requests `/api/facilities` without a `wards` parameter
- **THEN** the API returns public facilities across all D1 areas subject to category and result constraints
- **AND** the API does not treat the omitted parameter as an empty result set

#### Scenario: Selected area filter
- **WHEN** the browser requests `/api/facilities` with selected area IDs
- **THEN** the API returns only facilities whose area IDs match the selected IDs

### Requirement: National area metadata API
The D1-backed API SHALL expose public area metadata needed for national filtering and aggregation.

#### Scenario: Area metadata response
- **WHEN** the browser requests area metadata
- **THEN** the API returns each public area ID, prefecture, display label, and optional public URL
- **AND** the response does not include private pipeline provenance or raw upstream fields

### Requirement: Administrative summary data
The D1-backed serving layer SHALL provide enough public data for prefecture and municipality summary display.

#### Scenario: Summary counts
- **WHEN** the app needs low-zoom or mid-zoom summary counts
- **THEN** the serving layer can produce counts grouped by prefecture and by municipality or ward
- **AND** those counts respect active category and area filters

#### Scenario: Summary coordinates
- **WHEN** the map renders administrative summaries
- **THEN** each summary has a deterministic display coordinate derived from public facility locations or public area metadata
