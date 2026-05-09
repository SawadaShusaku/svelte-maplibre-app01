## ADDED Requirements

### Requirement: Popup facility media
The popup and mobile bottom sheet SHALL display approved facility media when media is available for the selected facility.

#### Scenario: Popup opens with media
- **WHEN** the user opens a facility popup for a facility with approved media
- **THEN** the popup or detail panel displays the media without hiding the facility name, address, categories, or route controls
- **AND** attribution or a provider link is available when required

#### Scenario: Popup opens without media
- **WHEN** the user opens a facility popup for a facility without approved media
- **THEN** the popup displays the normal facility information layout without a broken media placeholder
