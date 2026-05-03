## ADDED Requirements

### Requirement: Users can customize fonts per UI element
The application SHALL allow users to select different fonts for distinct text elements: the logo title, popup content (headings and body text), and general UI text. Each element SHALL have its own independent font selector.

#### Scenario: User selects logo font
- **WHEN** the user navigates to the font settings section in the sidebar
- **THEN** a font selector for "ロゴフォント" is displayed
- **AND** changing the selection immediately updates the logo title font in the sidebar header

#### Scenario: User selects popup font
- **WHEN** the user navigates to the font settings section in the sidebar
- **THEN** a font selector for "ポップアップフォント" is displayed
- **AND** changing the selection immediately updates the font used in map popup headings and body text

#### Scenario: User selects UI font
- **WHEN** the user navigates to the font settings section in the sidebar
- **THEN** a font selector for "UIフォント" is displayed
- **AND** changing the selection immediately updates the font used in general interface text (buttons, labels, etc.)

### Requirement: Font choices persist across sessions
The application SHALL persist all font selections to localStorage. On page load, the application SHALL restore the saved font choices and apply them before any text renders.

#### Scenario: Font choices survive page reload
- **WHEN** the user selects non-default fonts for any element
- **AND** the user reloads the page
- **THEN** the previously selected fonts are restored and applied automatically

#### Scenario: Default fonts on first visit
- **WHEN** a user visits the application for the first time (no saved preferences)
- **THEN** the logo font defaults to "Dela Gothic One"
- **AND** the popup font defaults to the existing serif stack ("Iowan Old Style", "Palatino Linotype", "Noto Serif JP"...)
- **AND** the UI font defaults to the system sans-serif stack

### Requirement: Font options are curated and consistent
Each font selector SHALL present the same curated list of Google Fonts: Dela Gothic One, Zen Kaku Gothic New, M PLUS Rounded 1c, and Klee One. All font families and weights SHALL be preloaded via a single CSS `@import` to avoid visible loading delays.

#### Scenario: All selectors share the same font options
- **WHEN** the user views any font selector
- **THEN** the available options are identical across all three selectors
- **AND** each option displays the font name in its own typeface as a preview
