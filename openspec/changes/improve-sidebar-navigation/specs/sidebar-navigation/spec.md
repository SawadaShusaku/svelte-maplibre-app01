## MODIFIED Requirements

### Requirement: Settings sidebar navigation
The sidebar SHALL be used for application display settings and informational navigation, accessible via a hamburger icon. It SHALL separate interactive display controls from informational menu entries so that users can distinguish configuration actions from reading-oriented navigation.

#### Scenario: User opens sidebar
- **WHEN** the user clicks the hamburger menu icon
- **THEN** the sidebar slides in showing distinct sections for display settings and informational navigation

#### Scenario: Sidebar excludes map filter controls
- **WHEN** the sidebar is open
- **THEN** it does NOT display the list of recycling facilities or category filters

#### Scenario: Sidebar excludes coverage summary menu
- **WHEN** the sidebar is open
- **THEN** it does NOT add a dedicated menu item for ward or city coverage listings

## ADDED Requirements

### Requirement: Informational menu items are prioritized and link-ready
The sidebar SHALL present informational menu items in a fixed priority order and SHALL render them as navigation-style rows that can later connect to dedicated routes without restructuring the sidebar layout.

#### Scenario: Informational items are shown in priority order
- **WHEN** the user views the informational navigation section
- **THEN** the items appear in this order: `使い方`, `データについて`, `更新情報`, `プライバシーポリシー`

#### Scenario: Informational item is available
- **WHEN** an informational menu item has a destination page
- **THEN** the sidebar renders it as a navigation row that indicates it can open another page

#### Scenario: Informational item is not yet available
- **WHEN** an informational menu item does not yet have a destination page
- **THEN** the sidebar indicates that the item is not yet available instead of presenting it as an indistinguishable plain action button
