## ADDED Requirements

### Requirement: Settings are organized into navigable sections
The sidebar SHALL present display settings as a list of section titles. Each section SHALL represent a grouping of related settings (e.g., marker design, font settings). Tapping a section title SHALL navigate into a detail view showing that section's controls.

#### Scenario: User views settings section list
- **WHEN** the user opens the sidebar and is on the settings home view
- **THEN** the sidebar displays a list of section titles including at minimum "マーカーデザイン" and "フォント設定"
- **AND** each section title appears as a tappable row with a disclosure indicator (›)

#### Scenario: User taps a settings section
- **WHEN** the user taps a section title row
- **THEN** the sidebar navigates to a detail view showing only that section's settings controls
- **AND** the detail view displays a back button to return to the section list

#### Scenario: User returns to section list
- **WHEN** the user activates the back button from a detail view
- **THEN** the sidebar returns to the settings home view showing the section list

### Requirement: Informational navigation remains accessible from home view
The settings home view SHALL continue to display informational navigation items below the settings sections, maintaining the separation between configuration actions and reading-oriented navigation.

#### Scenario: Informational items visible on home view
- **WHEN** the user is on the settings home view
- **THEN** informational items (使い方, データについて, etc.) appear below the settings sections
- **AND** they use the same visual style as before this change
