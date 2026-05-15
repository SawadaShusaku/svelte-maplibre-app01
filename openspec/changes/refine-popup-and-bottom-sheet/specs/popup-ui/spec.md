## MODIFIED Requirements

### Requirement: Bottom sheet swipe to close
The bottom sheet SHALL close when the user swipes downward on any non-interactive area of the sheet. The close button is removed.

#### Scenario: User swipes down on bottom sheet
- **WHEN** user touches a non-interactive area of the bottom sheet and swipes downward more than 30 pixels within 500ms
- **THEN** the bottom sheet slides down and closes
- **AND** `openPopupId` is set to null

### Requirement: Popup facility media
The popup and mobile bottom sheet SHALL display approved facility media when media is available for the selected facility. The media container height SHALL be visually compact.

#### Scenario: Popup opens with media
- **WHEN** the user opens a facility popup for a facility with approved media
- **THEN** the popup or detail panel displays the media in a reduced height container without hiding the facility name, address, categories, or route controls
- **AND** attribution or a provider link is available when required

#### Scenario: Popup opens without media
- **WHEN** the user opens a facility popup for a facility without approved media
- **THEN** the popup displays the normal facility information layout without a broken media placeholder

## REMOVED Requirements

### Requirement: Close button size
**Reason**: The close button is being removed from the popup and bottom sheet to clean up the UI.
**Migration**: Remove the close button element entirely. Users will rely on swipe-to-close or clicking outside the popup.
