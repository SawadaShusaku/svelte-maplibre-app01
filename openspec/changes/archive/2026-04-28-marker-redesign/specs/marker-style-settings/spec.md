## ADDED Requirements

### Requirement: Marker style selection
The system SHALL allow users to select a marker display style from the settings sidebar.

#### Scenario: User opens marker style settings
- **WHEN** the user opens the settings sidebar
- **THEN** a "Marker Style" section is visible with style options

#### Scenario: User selects a marker style
- **WHEN** the user selects a marker style option
- **THEN** all markers on the map immediately update to the selected style

### Requirement: Marker style persistence
The system SHALL persist the user's marker style preference in localStorage.

#### Scenario: Page reload with saved preference
- **WHEN** the user reloads the page
- **THEN** the previously selected marker style is restored automatically

### Requirement: Available marker styles
The system SHALL provide at least the following marker styles:
- **Adaptive** (default): Uses pie-segment for 3+ categories, half-split for 2, solid for 1
- **Solid**: Always uses the primary category color as a solid fill
- **Gradient**: Uses the legacy diagonal gradient (for backward compatibility)

#### Scenario: Default marker style
- **WHEN** the map loads with no saved preference
- **THEN** markers render using the "Adaptive" style
