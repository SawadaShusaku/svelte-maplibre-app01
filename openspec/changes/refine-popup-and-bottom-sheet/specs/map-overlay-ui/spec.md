## ADDED Requirements

### Requirement: Expanded bottom sheet hit area
The mobile bottom sheet SHALL capture upward and downward swipe gestures across its entire surface area, except where explicitly prevented by interactive child elements (like buttons or internal scrollable areas), similar to standard mobile map applications.

#### Scenario: Swipe on body of bottom sheet
- **WHEN** the user swipes up or down on the main body of the bottom sheet
- **THEN** the sheet responds to the swipe gesture (expanding or collapsing)

#### Scenario: Swipe on interactive button
- **WHEN** the user attempts to interact with or swipe starting from a button inside the bottom sheet
- **THEN** the swipe gesture is ignored and the button receives the event
