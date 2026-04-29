## ADDED Requirements

### Requirement: Popup appears above marker
The popup SHALL be vertically offset so that it does not overlap the marker icon.

#### Scenario: User clicks a marker
- **WHEN** user clicks a map marker
- **THEN** the popup opens with its bottom tip above the marker, not covering it

### Requirement: Popup content structure
The popup SHALL display facility name, address, category chips, optional hours/notes, and routing controls. It SHALL NOT display a prefecture label.

#### Scenario: Popup opens for a facility
- **WHEN** the popup renders for any facility
- **THEN** it shows the facility name, address, category chips, and optional hours/notes
- **AND** it does NOT show a prefecture label such as "東京都"

### Requirement: Travel mode segment control
The popup SHALL provide a travel mode selector using three icon buttons (foot, bike, car) instead of a `<select>` dropdown.

#### Scenario: User chooses travel mode
- **WHEN** the popup is open
- **THEN** three icon buttons representing walking, cycling, and driving are visible
- **AND** clicking an icon selects that travel mode
- **AND** the selected icon is visually distinct from unselected icons

### Requirement: Routing call-to-action
The popup SHALL contain a "経路を検索" button that spans enough width to be easily clickable.

#### Scenario: User requests a route
- **WHEN** the popup is open
- **THEN** a clearly visible "経路を検索" button is present
- **AND** clicking it initiates route calculation with the selected travel mode

### Requirement: Close button size
The popup SHALL provide a close button with a minimum tap target of 32 x 32 pixels.

#### Scenario: User closes popup
- **WHEN** the popup is open
- **THEN** the close button is at least 32 x 32 px
- **AND** clicking it closes the popup

### Requirement: Reduced padding for content space
The popup SHALL use compact padding to maximize usable content area within its fixed width.

#### Scenario: Popup renders on desktop
- **WHEN** the popup is displayed on a desktop viewport
- **THEN** horizontal and vertical padding is minimized while maintaining readability
- **AND** content does not touch the card edges
