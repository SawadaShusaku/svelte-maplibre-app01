## ADDED Requirements

### Requirement: Public facility media response
The D1-backed public facility API SHALL return approved media fields when they are available for a facility.

#### Scenario: Facility media exists
- **WHEN** the browser requests facilities and a matching public facility has approved media metadata
- **THEN** the API response includes the media URL or provider reference, alt text, and attribution/source link needed by the UI
- **AND** the response does not include token-bearing URLs or provider response bodies

### Requirement: Public facility response excludes internal notes
The D1-backed public facility API SHALL exclude internal geocoding/source-quality notes and private review metadata from all public facility responses.

#### Scenario: Internal note exists in source data
- **WHEN** a source or normalized private row contains an internal geocoding note
- **THEN** `/api/facilities` and `/api/facilities/:id` do not include that note in `notes`, `description`, `source`, or any other public field
- **AND** the API serialization uses explicit public fields rather than spreading raw database or source rows
