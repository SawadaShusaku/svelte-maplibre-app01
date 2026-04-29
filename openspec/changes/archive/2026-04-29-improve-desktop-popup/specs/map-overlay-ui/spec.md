## ADDED Requirements

### Requirement: Popup container transparency and padding reset
The map overlay CSS SHALL preserve transparent background and zero padding on MapLibre popup containers so that custom popup content styling is fully effective.

#### Scenario: Popup renders with custom card
- **WHEN** a MapLibre popup opens
- **THEN** the `.maplibregl-popup-content` element has no default padding or opaque background
- **AND** the custom card styling inside the popup is visible without interference from default MapLibre styles
