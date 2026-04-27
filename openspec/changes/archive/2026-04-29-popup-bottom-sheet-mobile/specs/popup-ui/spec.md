## ADDED Requirements

### Requirement: Responsive popup display mode
The popup SHALL display as a bottom sheet on viewports narrower than 640px, and as a standard marker-attached popup on viewports 640px and wider.

#### Scenario: User clicks marker on smartphone
- **WHEN** user clicks a map marker on a viewport with width < 640px
- **THEN** a bottom sheet slides up from the bottom of the screen
- **AND** the map pans to center the marker above the bottom sheet

#### Scenario: User clicks marker on desktop
- **WHEN** user clicks a map marker on a viewport with width >= 640px
- **THEN** a popup appears above the marker as before
- **AND** the map does NOT pan automatically

### Requirement: Bottom sheet swipe to close
The bottom sheet SHALL close when the user swipes downward on the sheet header area, or taps the close button.

#### Scenario: User swipes down on bottom sheet
- **WHEN** user touches the bottom sheet header and swipes downward more than 30 pixels within 500ms
- **THEN** the bottom sheet slides down and closes
- **AND** `openPopupId` is set to null

#### Scenario: User taps close button on bottom sheet
- **WHEN** user taps the close button inside the bottom sheet
- **THEN** the bottom sheet closes immediately

### Requirement: Bottom sheet content parity
The bottom sheet SHALL contain the same content structure as the desktop popup: facility name, category color bar, category chips, basic/details tabs, address/hours/notes, category details, travel mode selector, and routing button.

#### Scenario: Bottom sheet renders for any facility
- **WHEN** the bottom sheet is displayed for any facility
- **THEN** all content elements match the desktop popup layout and information
- **AND** tab switching between "基本情報" and "カテゴリ詳細" works identically

## MODIFIED Requirements

### Requirement: Popup appears above marker
The popup SHALL be vertically offset so that it does not overlap the marker icon. On mobile viewports, this is achieved by panning the map so the marker remains visible above the bottom sheet.

#### Scenario: User clicks a marker on desktop
- **WHEN** user clicks a map marker on a viewport with width >= 640px
- **THEN** the popup opens with its bottom tip above the marker, not covering it

#### Scenario: User clicks a marker on mobile
- **WHEN** user clicks a map marker on a viewport with width < 640px
- **THEN** the map pans so the marker is centered above the bottom sheet
- **AND** the marker is not covered by the bottom sheet
