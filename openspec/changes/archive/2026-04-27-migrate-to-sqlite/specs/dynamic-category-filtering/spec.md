## ADDED Requirements

### Requirement: UI shows only categories available in selected ward
The application SHALL dynamically filter the category bar to show only categories available in the currently selected ward(s).

#### Scenario: Single ward selection
- **GIVEN** user selects "豊島区" which supports [dry-battery, fluorescent]
- **WHEN** the category bar renders
- **THEN** it SHALL display only "乾電池" and "蛍光灯" buttons
- **AND** it SHALL NOT display "充電式電池" or "廃食用油"

#### Scenario: Multiple ward selection
- **GIVEN** user selects both "豊島区" [dry-battery, fluorescent] and "千代田区" [dry-battery, cooking-oil]
- **WHEN** the category bar renders
- **THEN** it SHALL display the union: "乾電池", "蛍光灯", "廃食用油"
- **AND** it SHALL NOT display categories not in any selected ward

### Requirement: Category bar shows scroll indicators when overflow
The category bar SHALL display scroll indicators when categories overflow the container width.

#### Scenario: Many categories selected
- **GIVEN** 8 categories are available in selected wards
- **WHEN** the screen width can only display 4 category buttons
- **THEN** left/right scroll arrows SHALL appear
- **AND** clicking arrows SHALL smoothly scroll the category list

### Requirement: Empty state when no categories available
The application SHALL display an informative message when no categories are available for the current selection.

#### Scenario: No categories in selection
- **GIVEN** user selects a ward with no configured categories
- **WHEN** the category bar attempts to render
- **THEN** it SHALL display "この区では回収カテゴリが設定されていません"
- **AND** it SHALL provide a link to the ward's official page

### Requirement: Category selection persists across ward changes
The application SHALL maintain category selections that remain valid when ward selection changes.

#### Scenario: Valid category remains selected
- **GIVEN** user selected "dry-battery" and "fluorescent" in Toshima ward
- **WHEN** user adds Chiyoda ward (which also supports "dry-battery")
- **THEN** "dry-battery" SHALL remain selected
- **AND** "fluorescent" SHALL be deselected (not available in Chiyoda)
- **AND** a notification SHALL explain the deselection

### Requirement: Icons display category colors
Each category button SHALL display its associated icon in the category's designated color.

#### Scenario: Category button rendering
- **GIVEN** "dry-battery" has color "#2563eb" and icon "Battery"
- **WHEN** rendering the category button
- **THEN** the Battery icon SHALL display in blue (#2563eb)
- **AND** the button text SHALL use a high-contrast color for readability
