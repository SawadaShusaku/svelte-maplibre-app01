## ADDED Requirements

### Requirement: Horizontally scrollable category filters
The category filters SHALL be presented as a horizontal row of buttons that can be scrolled horizontally if they overflow the container width.

#### Scenario: User toggles a category
- **WHEN** the user clicks a category button
- **THEN** the category is toggled and the map markers immediately reflect the new filter state

#### Scenario: Container overflow
- **WHEN** the browser width is small or there are many categories
- **THEN** the category buttons can be swiped/scrolled left and right without wrapping to a new line
