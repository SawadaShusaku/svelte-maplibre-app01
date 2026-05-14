## MODIFIED Requirements

### Requirement: Bottom sheet content parity
The bottom sheet SHALL contain the same content structure as the desktop detail panel: facility name, approved media when available, category chips, address, practical destination details, hours or conditions, source links, travel mode selector, and routing button. The shared detail structure SHALL NOT require users to switch tabs to find entrance, floor, counter, reception, parking lot, or installation-location information.

#### Scenario: Bottom sheet renders for any facility
- **WHEN** the bottom sheet is displayed for any facility
- **THEN** all content elements match the desktop detail layout and information
- **AND** destination-critical collection-entry details are visible in the main detail flow without requiring a tab switch

### Requirement: Popup content structure
The popup SHALL display facility name, address, category chips, practical destination details, optional hours and conditions, and routing controls. It SHALL NOT display a prefecture label. It SHALL NOT promote generic source classifications, facility-type artifacts, or low-value notes into the primary basic information area when they do not help the user find or use the collection point.

#### Scenario: Popup opens for a facility
- **WHEN** the popup renders for any facility
- **THEN** it shows the facility name, address, category chips, and optional hours or user-facing conditions
- **AND** it shows available entrance, floor, counter, reception, parking lot, or installation-location details
- **AND** it does NOT show a prefecture label such as "東京都"
- **AND** it does NOT show generic low-value notes such as a source classification in the primary basic information area

## ADDED Requirements

### Requirement: Category-specific destination hints
The popup and bottom sheet SHALL show category-specific destination hints when accepted categories use different entrances, floors, counters, reception points, parking lots, gates, or installation locations within the same place.

#### Scenario: Merged place has different category destinations
- **WHEN** a selected place has multiple active collection entries with different `location_hint` values
- **THEN** the detail surface displays those hints grouped with the relevant category or entry
- **AND** it keeps one marker and one selected place rather than implying separate map destinations

#### Scenario: Merged place has one shared destination
- **WHEN** multiple active collection entries share the same `location_hint`
- **THEN** the detail surface may display that hint once as shared destination information
- **AND** it avoids repeating identical text for every category

### Requirement: Source metadata is secondary
Data-source names, source listing names, and source listing addresses SHALL be available as supporting details when useful, but SHALL be visually secondary to address, destination hints, hours, conditions, and routing.

#### Scenario: Entry has source metadata
- **WHEN** a collection entry includes source metadata
- **THEN** the detail surface provides access to the source or listing information
- **AND** the primary detail flow remains focused on where and how the user can bring items
