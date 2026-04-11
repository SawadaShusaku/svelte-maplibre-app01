<script lang="ts">
  import { 
    MapLibre, 
    NavigationControl, 
    GeolocateControl, 
    FullScreenControl,
    Marker,
  } from 'svelte-maplibre-gl';
  import 'maplibre-gl/dist/maplibre-gl.css';
</script>

<div style="height: 800px">
  <MapLibre 
      class="h-full w-full"
      style="https://tiles.openfreemap.org/styles/liberty"
      center={[139.767, 35.681]} 
      zoom={12}
      >
    <NavigationControl position="top-right" />
    <GeolocateControl position="top-right" />
    <FullScreenControl position="top-right" />
    <Marker lnglat={[139.69168194810612, 35.68956214184306]} />
  </MapLibre>
</div>
