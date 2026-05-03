## ADDED Requirements

### Requirement: Popup transitions are animated
The popup SHALL animate between closed and open states so facility details appear smoothly without obscuring the selected marker or shifting unrelated map controls. On mobile viewports, the bottom sheet SHALL slide from the bottom edge; on desktop viewports, the marker-attached popup SHALL use a subtle enter and exit transition.

#### Scenario: Desktop popup opens
- **WHEN** the user opens a facility popup on a viewport with width >= 640px
- **THEN** the popup appears with a brief transition
- **AND** the transition preserves the popup position above the selected marker

#### Scenario: Mobile bottom sheet opens
- **WHEN** the user opens a facility popup on a viewport with width < 640px
- **THEN** the bottom sheet slides up from the bottom of the viewport
- **AND** the map remains usable after the transition completes

#### Scenario: Popup closes
- **WHEN** the user closes a desktop popup or mobile bottom sheet
- **THEN** the popup content exits with a brief transition
- **AND** the selected facility state is cleared after the close interaction

### Requirement: Popup animations respect reduced motion preferences
Popup and bottom sheet animations SHALL honor the user's reduced motion preference by removing or minimizing motion while preserving the same open and close behavior.

#### Scenario: Reduced motion is enabled
- **WHEN** the user has enabled reduced motion at the system level
- **AND** the user opens or closes a popup
- **THEN** the popup state changes without a large slide, scale, or movement animation
- **AND** all popup content remains available
