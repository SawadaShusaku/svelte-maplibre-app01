# Sidebar Navigation

## Purpose

Define sidebar behavior for display settings and informational navigation.
## Requirements
### Requirement: Settings sidebar navigation
The sidebar SHALL be used for application display settings and informational navigation, accessible via a hamburger icon. It SHALL separate interactive display controls from informational menu entries so that users can distinguish configuration actions from reading-oriented navigation. Display settings SHALL be grouped into sections (e.g., marker design, font settings), with each section accessible via a tappable row that navigates to a detail view containing that section's controls.

#### Scenario: User opens sidebar
- **WHEN** the user clicks the hamburger menu icon
- **THEN** the sidebar slides in showing distinct sections for display settings and informational navigation

#### Scenario: Sidebar excludes map filter controls
- **WHEN** the sidebar is open
- **THEN** it does NOT display the list of recycling facilities or category filters

#### Scenario: Sidebar excludes coverage summary menu
- **WHEN** the sidebar is open
- **THEN** it does NOT add a dedicated menu item for ward or city coverage listings

#### Scenario: Display settings are grouped into sections
- **WHEN** the user views the display settings area
- **THEN** settings are organized into section titles (e.g., "マーカーデザイン", "フォント設定")
- **AND** tapping a section navigates to a detail view with that section's controls

### Requirement: Informational menu items are prioritized and link-ready
The sidebar SHALL present informational menu items in a fixed priority order and SHALL render them as navigation-style rows that can later connect to dedicated routes without restructuring the sidebar layout. The `使い方` item SHALL be connected to an in-app destination page, while informational items without destination pages SHALL remain visually distinguishable as unavailable entries.

#### Scenario: Informational items are shown in priority order
- **WHEN** the user views the informational navigation section
- **THEN** the items appear in this order: `使い方`, `データについて`, `更新情報`, `プライバシーポリシー`

#### Scenario: Usage item is available
- **WHEN** the user views the `使い方` item in the sidebar
- **THEN** the sidebar renders it as a navigation row that indicates it can open another page

#### Scenario: User opens the usage guide from the sidebar
- **WHEN** the user activates the `使い方` item
- **THEN** the application navigates to the usage guide page

#### Scenario: Informational item is not yet available
- **WHEN** an informational menu item does not yet have a destination page
- **THEN** the sidebar indicates that the item is not yet available instead of presenting it as an indistinguishable plain action button

### Requirement: Sidebar supports drill-down navigation for settings
The sidebar SHALL support a two-level navigation pattern for display settings. The top level SHALL show a list of setting categories. Tapping a category SHALL navigate to a second level showing that category's individual controls. A back control SHALL be available to return to the top level.

#### Scenario: User navigates into a settings section
- **WHEN** the user taps a display settings section title
- **THEN** the sidebar transitions to show only that section's controls
- **AND** a back button is visible to return to the category list

#### Scenario: User navigates back from settings detail
- **WHEN** the user taps the back button in a settings detail view
- **THEN** the sidebar transitions back to the settings category list

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

