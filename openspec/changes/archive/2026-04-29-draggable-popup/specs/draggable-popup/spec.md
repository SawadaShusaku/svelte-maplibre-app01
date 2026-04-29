## ADDED Requirements

### Requirement: Popup is draggable
The system SHALL allow the user to move the popup by dragging it with a mouse or touch gesture.

#### Scenario: Drag popup with mouse
- **WHEN** a user presses the left mouse button down on the popup
- **AND** moves the mouse while holding the button down
- **THEN** the popup SHALL move on the screen, following the cursor.
- **AND** **WHEN** the user releases the mouse button
- **THEN** the popup SHALL remain at the new position.

#### Scenario: Drag popup with touch
- **WHEN** a user touches the screen on the popup
- **AND** moves their finger across the screen
- **THEN** the popup SHALL move on the screen, following the finger.
- **AND** **WHEN** the user lifts their finger
- **THEN** the popup SHALL remain at the new position.

### Requirement: Draggable cursor indicator
The system SHALL indicate that the popup is draggable.

#### Scenario: Cursor changes on hover
- **WHEN** a user hovers their mouse cursor over the popup
- **THEN** the cursor SHALL change to a "grab" or "move" cursor.
