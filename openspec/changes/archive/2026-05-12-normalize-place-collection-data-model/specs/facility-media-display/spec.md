## ADDED Requirements

### Requirement: Media associated with normalized places or entries
Approved public media SHALL be associated with the level it describes: a place when it represents the whole location, or a collection entry when it represents category-specific reception details.

#### Scenario: Place-level media exists
- **WHEN** approved media describes the overall place
- **THEN** the public API can return that media for the place detail view
- **AND** the media includes required alt text and attribution/source fields

#### Scenario: Entry-level media exists
- **WHEN** approved media describes a category-specific counter, box, or location hint
- **THEN** the media is associated with the relevant collection entry
- **AND** the UI can present it without implying it applies to unrelated categories at the same place

#### Scenario: Media URL is unsafe
- **WHEN** a media URL contains access tokens, API keys, signatures, or provider response internals
- **THEN** seed validation fails or removes that media from public serving output
