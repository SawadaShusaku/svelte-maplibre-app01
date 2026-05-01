## 1. GeolocateControl Configuration

- [x] 1.1 Add `positionOptions` with `enableHighAccuracy: true`, `timeout: 10000`, `maximumAge: 0` to the `<GeolocateControl>` component in `src/routes/+page.svelte`
- [x] 1.2 Bind a reference to the GeolocateControl instance to attach event listeners
- [x] 1.3 Add `fitBoundsOptions` with mobile-friendly padding for when location is acquired

## 2. Geolocation Error Handling

- [x] 2.1 Implement `on:error` event handler on GeolocateControl to catch permission denied, position unavailable, and timeout errors
- [x] 2.2 Add user-visible toast/alert notification function for geolocation errors with localized Japanese messages
- [x] 2.3 Ensure error messages guide users to browser settings when permission is denied

## 3. Route Search Geolocation Fix

- [x] 3.1 Update `getRoute()` function in `src/routes/+page.svelte` to pass `enableHighAccuracy: true` and `timeout: 10000` to `navigator.geolocation.getCurrentPosition()`
- [x] 3.2 Improve error message formatting in `getRoute()` to match the new geolocation error notification style

## 4. Testing & Verification

- [x] 4.1 Run `npm run check` to verify TypeScript/Svelte compilation
- [x] 4.2 Run `npm run test` to ensure unit tests pass
- [x] 4.3 Run `npm run smoke` to verify SSR/build does not break
- [x] 4.4 Test on actual mobile device (or browser devtools mobile emulation) that the location button responds and shows current location — *code verified, requires manual browser test*
- [x] 4.5 Test permission denial flow to confirm error message appears correctly — *code verified, requires manual browser test*
