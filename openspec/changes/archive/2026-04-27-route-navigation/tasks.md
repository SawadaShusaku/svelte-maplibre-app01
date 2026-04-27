## 1. State Management Setup

- [x] 1.1 In `+page.svelte`, add `$state` variables for `routeGeoJSON`, `routeInfo`, and `isFetchingRoute`.

## 2. Popup UI and Controls

- [x] 2.1 In `+page.svelte`, modify the popup content to add a travel mode selector (select with walk, bike, car options).
- [x] 2.2 Add a "Get Directions" button to the popup.
- [x] 2.3 Bind the button's click event to a new `getRoute` function. Disable the button when `isFetchingRoute` is true.

## 3. Routing Logic Implementation

- [x] 3.1 Create the `getRoute` async function in `+page.svelte`.
- [x] 3.2 Inside `getRoute`, implement `navigator.geolocation.getCurrentPosition()` to get the user's coordinates.
- [x] 3.3 Construct the OSRM API URL using the user's coordinates, facility coordinates, and selected travel mode.
- [x] 3.4 Use `fetch` to call the OSRM API and handle the response.
- [x] 3.5 On a successful response, update the `routeGeoJSON` and `routeInfo` state variables.

## 4. Map Route Display

- [x] 4.1 Add a `GeoJSONSource` component to the map, binding its `data` prop to the `routeGeoJSON` state.
- [x] 4.2 Add a `LineLayer` component that uses the `GeoJSONSource` to draw the route line.
- [x] 4.3 Use an `{#if routeGeoJSON}` block to ensure the source and layer are only rendered when a route exists.
- [x] 4.4 Use `bind:map` on the `MapLibre` component to get the map instance.
- [x] 4.5 After fetching a route, call `map.fitBounds()` to zoom the map to the route's extent.

## 5. Floating Information Card

- [x] 5.1 Create a new component or HTML block for the floating card, conditionally rendered with `{#if routeInfo}`.
- [x] 5.2 Display the `routeInfo.distance` and `routeInfo.duration` in the card.
- [x] 5.3 Add a "Clear Route" button to the card.
- [x] 5.4 On click, have the "Clear Route" button set `routeGeoJSON` and `routeInfo` to `null`.

## 6. Error Handling

- [x] 6.1 Wrap the logic in `getRoute` with `try...catch` blocks.
- [x] 6.2 Handle `GeolocationPositionError` from `getCurrentPosition` and display a user-friendly message.
- [x] 6.3 Handle potential errors from the `fetch` call to the OSRM API and display an error message.
- [x] 6.4 Ensure `isFetchingRoute` is set to `false` in all error scenarios.
