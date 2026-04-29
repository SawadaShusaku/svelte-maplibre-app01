## ADDED Requirements

### Requirement: Official source cross-check
The system SHALL maintain a process for verifying facility data against official municipal sources.

#### Scenario: Data audit workflow
- **WHEN** an auditor compares the current GeoJSON with official city URLs
- **THEN** discrepancies are identified and documented

### Requirement: Category name alignment
Facility data SHALL use the current type system's category IDs (`dry-battery`, `rechargeable-battery`, `button-battery`, etc.) instead of legacy names.

#### Scenario: Legacy category migration
- **WHEN** a facility previously had category `battery`
- **THEN** it is updated to use the specific battery type(s) accepted at that location

## MODIFIED Requirements

### Requirement: Multi-category marker display
Markers for facilities with multiple categories SHALL display all category colors using a pie-segment (donut ring) design instead of a diagonal gradient.

#### Scenario: Facility with 1 category
- **WHEN** a facility has exactly 1 category
- **THEN** the marker renders as a solid color pin using that category's color

#### Scenario: Facility with 2 categories
- **WHEN** a facility has exactly 2 categories
- **THEN** the marker is split vertically or diagonally into 2 equal halves, each filled with one category color

#### Scenario: Facility with 3 or more categories
- **WHEN** a facility has 3 or more categories
- **THEN** the marker displays a donut ring around the white center circle, divided into proportional pie segments using each category's color

### Requirement: Marker component encapsulation
The marker rendering logic SHALL be extracted from the page component into a dedicated Svelte component.

#### Scenario: Marker component usage
- **WHEN** the map renders facility markers
- **THEN** each marker is rendered using a reusable `MapMarker` component that accepts `categories` and `style` props
