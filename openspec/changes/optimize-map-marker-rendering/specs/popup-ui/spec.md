## MODIFIED Requirements

### Requirement: Responsive popup display mode
The popup SHALL display as a bottom sheet on viewports narrower than 640px, and as a standard marker-attached popup on viewports 640px and wider. The application SHALL manage this detail UI from a single selected-facility state.

#### Scenario: User clicks marker on smartphone
- **WHEN** the user clicks a map marker on a viewport with width < 640px
- **THEN** a single bottom sheet slides up from the bottom of the screen for the selected facility
- **AND** no second facility detail container is active at the same time

#### Scenario: User clicks marker on desktop
- **WHEN** the user clicks a map marker on a viewport with width >= 640px
- **THEN** a single popup appears above the selected marker as before
- **AND** no second facility popup is active at the same time

### Requirement: Bottom sheet content parity
The bottom sheet SHALL contain the same content structure as the desktop popup: facility name, category color bar, category chips, basic/details tabs, address/hours/notes, category details, travel mode selector, and routing button.

#### Scenario: Bottom sheet renders for any facility
- **WHEN** the bottom sheet is displayed for a selected facility
- **THEN** all content elements match the desktop popup layout and information
- **AND** the selected facility content is sourced from the same single-facility detail state used by the desktop popup
