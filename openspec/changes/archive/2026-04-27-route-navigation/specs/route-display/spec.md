## ADDED Requirements

### Requirement: Display route controls in facility popup
The system SHALL display controls within the facility popup to allow users to get directions.

#### Scenario: Popup shows route controls
- **WHEN** a user clicks on a facility marker
- **THEN** the popup SHALL display a "Get Directions" button and a travel mode selector (walk, bike, car).

### Requirement: Fetch and display route on map
The system SHALL fetch a route from the user's current location to the selected facility and display it on the map.

#### Scenario: Successful route acquisition and display
- **WHEN** the user clicks the "Get Directions" button
- **THEN** the system SHALL request the user's geolocation.
- **AND** the system SHALL fetch the route from the OSRM public API for the selected travel mode.
- **AND** the system SHALL display the returned route as a line on the map.
- **AND** the map viewport SHALL adjust to fit the bounds of the route.

### Requirement: Display floating route information card
The system SHALL display a floating card with details of the active route.

#### Scenario: Route card appears after fetching route
- **WHEN** a route is successfully displayed on the map
- **THEN** a floating card SHALL appear at the bottom of the map.
- **AND** the card SHALL display the route's distance and estimated duration.
- **AND** the card SHALL contain a "Clear Route" button.

### Requirement: Clear route from map
The system SHALL allow the user to remove the displayed route from the map.

#### Scenario: User clears the route
- **WHEN** the user clicks the "Clear Route" button on the floating card
- **THEN** the route line SHALL be removed from the map.
- **AND** the floating route information card SHALL disappear.

### Requirement: Handle route fetching errors
The system SHALL inform the user if it fails to retrieve a route.

#### Scenario: Geolocation permission denied
- **WHEN** the user denies the geolocation permission request
- **THEN** the system SHALL display a message indicating that location permission is required.

#### Scenario: OSRM API request fails
- **WHEN** the OSRM API request fails for any reason
- **THEN** the system SHALL display a message indicating that the route could not be retrieved.
