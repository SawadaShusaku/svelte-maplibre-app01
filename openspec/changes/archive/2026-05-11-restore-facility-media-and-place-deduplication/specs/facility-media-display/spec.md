## ADDED Requirements

### Requirement: Approved facility media
The app SHALL display facility media only from approved public media references.

#### Scenario: Facility has approved image
- **WHEN** a facility record includes an approved image or street-level media reference
- **THEN** the facility detail surface displays the media with appropriate alt text or fallback label
- **AND** the media display includes source attribution or a source link when required by the provider

#### Scenario: Facility has no approved image
- **WHEN** a facility record has no approved media reference
- **THEN** the popup and detail surfaces remain usable without a broken image, empty frame, or loading spinner

### Requirement: Media request failure fallback
The app SHALL gracefully recover when optional facility media cannot be loaded.

#### Scenario: Media fetch fails
- **WHEN** the app fails to fetch optional nearby media or an image request fails
- **THEN** the popup/detail content still renders facility name, address, categories, route controls, and public source information
- **AND** the failure does not prevent the marker popup from opening

### Requirement: Public media field minimization
Public facility media fields SHALL contain only display-safe URLs, attribution, provider identifiers, and alt text required by the user-facing app.

#### Scenario: Serialize media fields
- **WHEN** the API serializes a facility with media
- **THEN** the response includes only approved public media fields
- **AND** it does not include private scraping metadata, provider response bodies, token-bearing URLs, or internal review notes
