## ADDED Requirements

### Requirement: Sidebar transitions are animated
The sidebar SHALL animate open, close, and settings drill-down transitions so navigation changes are visually continuous without moving map controls outside the sidebar surface.

#### Scenario: User opens the sidebar
- **WHEN** the user activates the hamburger menu
- **THEN** the sidebar enters with a brief slide transition from the screen edge
- **AND** the underlying map remains in place

#### Scenario: User closes the sidebar
- **WHEN** the user closes the sidebar
- **THEN** the sidebar exits with a brief transition toward the screen edge
- **AND** the application returns focus to the map experience

#### Scenario: User navigates between sidebar sections
- **WHEN** the user enters or leaves a sidebar settings detail view
- **THEN** the sidebar content changes with a brief transition
- **AND** the back control remains available during the detail view

### Requirement: Sidebar animations respect reduced motion preferences
Sidebar animations SHALL honor the user's reduced motion preference by removing or minimizing movement while preserving the same navigation behavior.

#### Scenario: Reduced motion is enabled
- **WHEN** the user has enabled reduced motion at the system level
- **AND** the user opens, closes, or navigates within the sidebar
- **THEN** the sidebar state changes without a large slide or movement animation
- **AND** all sidebar controls remain reachable
