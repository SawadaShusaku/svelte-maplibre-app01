## MODIFIED Requirements

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

## ADDED Requirements

### Requirement: Sidebar supports drill-down navigation for settings
The sidebar SHALL support a two-level navigation pattern for display settings. The top level SHALL show a list of setting categories. Tapping a category SHALL navigate to a second level showing that category's individual controls. A back control SHALL be available to return to the top level.

#### Scenario: User navigates into a settings section
- **WHEN** the user taps a display settings section title
- **THEN** the sidebar transitions to show only that section's controls
- **AND** a back button is visible to return to the category list

#### Scenario: User navigates back from settings detail
- **WHEN** the user taps the back button in a settings detail view
- **THEN** the sidebar transitions back to the settings category list
