## MODIFIED Requirements

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
