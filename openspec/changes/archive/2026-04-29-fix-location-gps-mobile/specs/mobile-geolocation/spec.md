## ADDED Requirements

### Requirement: Mobile geolocation activation
The system SHALL activate geolocation on mobile devices when the user taps the location button.

#### Scenario: User taps location button on iOS Safari
- **WHEN** the user taps the geolocation button on an iPhone running iOS Safari
- **THEN** the map centers on the user's current location with a accuracy circle

#### Scenario: User taps location button on Android Chrome
- **WHEN** the user taps the geolocation button on an Android device running Chrome
- **THEN** the map centers on the user's current location with a accuracy circle

### Requirement: Geolocation high accuracy on mobile
The system SHALL configure the geolocation control with high-accuracy options suitable for mobile browsers.

#### Scenario: Geolocation options are applied
- **WHEN** the map initializes the GeolocateControl
- **THEN** it sets `enableHighAccuracy` to `true`, `timeout` to `10000` milliseconds, and `maximumAge` to `0`

### Requirement: Geolocation error feedback
The system SHALL display a user-visible notification when geolocation fails or is denied.

#### Scenario: Permission denied
- **WHEN** the user denies location permission
- **THEN** a toast or alert message appears stating that location access is required and instructing the user to enable it in browser settings

#### Scenario: Position unavailable
- **WHEN** the device cannot determine its position (e.g., GPS signal lost)
- **THEN** a toast or alert message appears stating that the current location could not be determined

#### Scenario: Timeout
- **WHEN** geolocation request exceeds the configured timeout
- **THEN** a toast or alert message appears stating that the location request timed out

### Requirement: Route search geolocation consistency
The system SHALL use consistent geolocation options for route searches.

#### Scenario: User requests route from current location
- **WHEN** the user taps "経路を検索" and the system requests the current position
- **THEN** it uses `enableHighAccuracy: true` and `timeout: 10000` identical to the map geolocation control

### Requirement: Silent failure elimination
The system SHALL NOT fail silently when geolocation encounters an error.

#### Scenario: Any geolocation error occurs
- **WHEN** any geolocation API returns an error
- **THEN** the error is logged to the console AND a user-facing message is displayed
