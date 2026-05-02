<script lang="ts">
  import { browser } from '$app/environment';
  import { env } from '$env/dynamic/public';
  import 'maplibre-gl/dist/maplibre-gl.css';
  import {
    MapLibre,
    NavigationControl,
    GeolocateControl,
    FullScreenControl,
    AttributionControl,
    GeoJSONSource,
    LineLayer,
    Marker,
    Popup
  } from 'svelte-maplibre-gl';
  import maplibregl from 'maplibre-gl';
  import { ChevronRight, Footprints, Bike, Car, ExternalLink } from 'lucide-svelte';
  import { fly } from 'svelte/transition';

  import AppHeader from '$lib/components/AppHeader.svelte';
  import SettingsSidebar from '$lib/components/SettingsSidebar.svelte';
  import MapMarker from '$lib/components/MapMarker.svelte';
  import { CATEGORY_COLOR, CATEGORY_LABEL, getCategoryDetails } from '$lib/db/categories.js';
  import { getMarkerStyle, getSolidColor } from '$lib/marker-style.js';
  import { getFacilities, type GeoFeature } from '$lib/data.js';
  import { getCategorySourceUrl, WARD_REGISTRY } from '$lib/registry.js';
  import type { CategoryId, MarkerStyle } from '$lib/types.js';
  import type { LineString } from 'geojson';

  const DEFAULT_OSRM_BASE_URL = 'https://router.project-osrm.org';
  const DEFAULT_MAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';
  const osrmBaseUrl = env.PUBLIC_OSRM_BASE_URL?.trim() || DEFAULT_OSRM_BASE_URL;
  const mapStyleUrl = env.PUBLIC_MAP_STYLE_URL?.trim() || DEFAULT_MAP_STYLE_URL;

  // 初期データ
  const allCategories: CategoryId[] = [
    'rechargeable-battery', 'button-battery', 'dry-battery',
    'small-appliance', 'fluorescent', 'ink-cartridge',
    'cooking-oil', 'used-clothing'
  ];
  const allCityKeys = WARD_REGISTRY.map((w) => `${w.prefecture}/${w.city}`);


  // 状態管理
  let selectedCategories = $state<CategoryId[]>([...allCategories]);
  let selectedCityKeys = $state<string[]>([...allCityKeys]);
  let sidebarOpen = $state(false);
  let facilities = $state<GeoFeature[]>([]);
  let openPopupId = $state<string | null>(null);
  let markerStyle = $state<MarkerStyle>(getMarkerStyle());
  let solidColor = $state<string>(getSolidColor());
  
  // 検索管理
  let searchQuery = $state("");
  let searchResults = $state<GeoFeature[]>([]);

  // ルーティング・地図管理
  let routeGeoJSON = $state<LineString | null>(null);
  let routeInfo = $state<{ distance: number, duration: number } | null>(null);
  let isFetchingRoute = $state(false);
  let travelMode = $state<'foot' | 'bike' | 'car'>('foot');
  let map = $state<maplibregl.Map | undefined>(undefined);
  let geolocateControl = $state<maplibregl.GeolocateControl | undefined>(undefined);
  let routeError = $state<string | null>(null);
  let popupTab = $state<'basic' | 'details'>('basic');
  let isTitleCollapsed = $state(browser ? window.innerWidth <= 640 : false);
  let isMobile = $state(browser ? window.innerWidth <= 640 : false);

  // ボトムシートスワイプ検出
  let touchStartY = $state(0);
  let touchStartTime = $state(0);

  function handleTouchStart(e: TouchEvent) {
    touchStartY = e.touches[0].clientY;
    touchStartTime = Date.now();
  }

  function handleTouchEnd(e: TouchEvent) {
    const deltaY = e.changedTouches[0].clientY - touchStartY;
    const duration = Date.now() - touchStartTime;
    if (deltaY > 30 && duration < 500) {
      openPopupId = null;
    }
  }

  function syncMobileAttributionState() {
    if (!browser || !map) return;
    const attribution = map.getContainer().querySelector('.maplibregl-ctrl-attrib');
    if (!(attribution instanceof HTMLElement)) return;

    if (window.innerWidth <= 640) {
      attribution.classList.remove('maplibregl-compact-show');
    }
  }

  function getGeolocationErrorMessage(err: GeolocationPositionError): string {
    switch (err.code) {
      case err.PERMISSION_DENIED:
        return '位置情報へのアクセスが拒否されました。ブラウザの設定で位置情報を許可してください。';
      case err.POSITION_UNAVAILABLE:
        return '現在位置を取得できませんでした。GPS信号が弱い場所の可能性があります。';
      case err.TIMEOUT:
        return '位置情報の取得がタイムアウトしました。時間をおいて再度お試しください。';
      default:
        return `位置情報の取得に失敗しました: ${err.message}`;
    }
  }

  function handleGeolocateError(err: GeolocationPositionError) {
    console.error('GeolocateControl error:', err);
    alert(getGeolocationErrorMessage(err));
  }

  // データフェッチ
  $effect(() => {
    if (!browser) return;
    
    // Spread to convert proxy to regular array
    getFacilities([...selectedCityKeys], [...selectedCategories]).then((f) => {
      facilities = f;
      // 表示対象外になったポップアップを閉じる
      if (openPopupId && !f.find((x) => x.properties.id === openPopupId)) {
        openPopupId = null;
      }
    }).catch(err => {
      console.error('Failed to load facilities:', err);
    });
  });

  // 検索ロジック
  $effect(() => {
    if (!searchQuery.trim()) {
      searchResults = [];
      return;
    }
    const q = searchQuery.toLowerCase().trim().split(/\s+/);
    searchResults = facilities.filter(f => {
      const { name, address, categories } = f.properties;
      const textToSearch = [
        name, 
        address, 
        ...categories.map(c => CATEGORY_LABEL[c])
      ].join(" ").toLowerCase();
      
      return q.every(keyword => textToSearch.includes(keyword));
    }).slice(0, 50);
  });

  // 検索結果が1件だけになったときのオートズーム
  $effect(() => {
    if (searchResults.length === 1 && map) {
      const facility = searchResults[0];
      const [lng, lat] = facility.geometry.coordinates;
      if (isMobile) {
        const offset = window.innerHeight * 0.25;
        map.easeTo({ center: [lng, lat], zoom: 16, offset: [0, -offset], duration: 300 });
      } else {
        map.flyTo({ center: [lng, lat], zoom: 16 });
      }
      openPopupId = facility.properties.id;
      popupTab = 'basic';
    }
  });

  $effect(() => {
    if (!browser || !map) return;

    syncMobileAttributionState();
    const frameId = window.requestAnimationFrame(() => {
      syncMobileAttributionState();
    });

    const handleResize = () => {
      isMobile = window.innerWidth <= 640;
      syncMobileAttributionState();
    };

    isMobile = window.innerWidth <= 640;
    window.addEventListener('resize', handleResize);
    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
    };
  });

  // 検索結果の選択ハンドラ
  function handleSelectFacility(facility: GeoFeature) {
    const [lng, lat] = facility.geometry.coordinates;
    if (map) {
      if (isMobile) {
        const offset = window.innerHeight * 0.25;
        map.easeTo({ center: [lng, lat], zoom: 16, offset: [0, -offset], duration: 300 });
      } else {
        map.flyTo({ center: [lng, lat], zoom: 16 });
      }
    }
    searchQuery = ""; // 検索をクリア
    openPopupId = facility.properties.id;
    popupTab = 'basic';
  }

  function selectFacility(id: string) {
    const wasOpen = openPopupId === id;
    openPopupId = openPopupId === id ? null : id;
    popupTab = 'basic';

    if (!wasOpen && isMobile && map) {
      const facility = facilities.find(f => f.properties.id === id);
      if (facility) {
        const [lng, lat] = facility.geometry.coordinates;
        const offset = window.innerHeight * 0.25;
        map.easeTo({ center: [lng, lat], offset: [0, -offset], duration: 300 });
      }
    }
  }

  async function getRoute(facility: GeoFeature) {
    isFetchingRoute = true;
    routeGeoJSON = null;
    routeInfo = null;
    routeError = null;

    try {
      if (!osrmBaseUrl) {
        throw new Error('Routing service is not configured');
      }

      const userCoords = await new Promise<GeolocationCoordinates>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve(pos.coords),
          (err) => reject(err),
          { enableHighAccuracy: true, timeout: 10000 }
        );
      });

      const [lng1, lat1] = [userCoords.longitude, userCoords.latitude];
      const [lng2, lat2] = facility.geometry.coordinates;

      const baseUrl = osrmBaseUrl.replace(/\/$/, '');
      const url = `${baseUrl}/route/v1/${travelMode}/${lng1},${lat1};${lng2},${lat2}?overview=full&geometries=geojson`;

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Failed to fetch route: ${res.statusText}`);
      }
      const data = await res.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        routeGeoJSON = route.geometry;
        routeInfo = {
          distance: route.distance,
          duration: route.duration,
        };

        if (map && routeGeoJSON) {
          const bounds = routeGeoJSON.coordinates.reduce(
            (b, coord) => b.extend(coord as [number, number]),
            new maplibregl.LngLatBounds(routeGeoJSON.coordinates[0] as [number, number], routeGeoJSON.coordinates[0] as [number, number])
          );
          map.fitBounds(bounds, { padding: 80 });
          openPopupId = null; // 経路表示時はポップアップを閉じる
        }
      } else {
        throw new Error('No route found');
      }
    } catch (err) {
      console.error('Error getting route:', err);
      if (err instanceof GeolocationPositionError) {
        routeError = getGeolocationErrorMessage(err);
      } else {
        routeError = '経路の取得に失敗しました。ネットワーク接続を確認するか、時間をおいて再度お試しください。';
      }
      if (routeError) alert(routeError);
    } finally {
      isFetchingRoute = false;
    }
  }

</script>

{#snippet popupCard(f: GeoFeature)}
  {@const { city, name, address, categories, hours, notes } = f.properties}
  <div class="flex w-full h-2">
    {#each categories as cat}
      <div class="flex-1" style:background-color={CATEGORY_COLOR[cat]}></div>
    {/each}
  </div>
  <div class="p-5">
    <div class="mb-2 flex items-start justify-between gap-3">
      <h3 class="pr-2 text-xl font-bold leading-snug text-gray-900">{name}</h3>
      <button
        onclick={() => (openPopupId = null)}
        class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-black/5 text-xl text-gray-500 transition-colors hover:bg-black/10 hover:text-gray-800"
        aria-label="閉じる"
      >✕</button>
    </div>
    
    <div class="flex flex-wrap gap-2">
      {#each categories as cat}
        <span
          class="rounded-full px-2.5 py-1 text-sm font-bold text-white shadow-sm"
          style:background-color={CATEGORY_COLOR[cat]}
        >{CATEGORY_LABEL[cat]}</span>
      {/each}
    </div>
  </div>

  <!-- タブ -->
  <div class="border-b border-gray-100 px-5">
    <div class="flex gap-5">
      <button
        onclick={() => popupTab = 'basic'}
        class="pb-3 text-base font-bold transition-colors {popupTab === 'basic' ? 'text-gray-900 border-b-2 border-emerald-600' : 'text-gray-400 hover:text-gray-600'}"
      >基本情報</button>
      <button
        onclick={() => popupTab = 'details'}
        class="pb-3 text-base font-bold transition-colors {popupTab === 'details' ? 'text-gray-900 border-b-2 border-emerald-600' : 'text-gray-400 hover:text-gray-600'}"
      >カテゴリ詳細</button>
    </div>
  </div>

  <!-- タブコンテンツ -->
  <div class="min-h-[4.5rem] px-5 py-4">
    {#if popupTab === 'basic'}
      <p class="text-base leading-relaxed text-gray-700">{address}</p>
      {#if hours}
        <p class="mt-2 text-base text-gray-500">営業時間: {hours}</p>
      {/if}
      {#if notes}
        <p class="mt-2 text-base text-amber-600">{notes}</p>
      {/if}
    {:else}
      {#each categories as cat}
        {@const details = getCategoryDetails(cat)}
        {#if Object.keys(details).length > 0}
          <div class="mb-4 last:mb-0">
            <p class="mb-1.5 text-base font-bold" style:color={CATEGORY_COLOR[cat]}>{CATEGORY_LABEL[cat]}</p>
            {#each Object.entries(details) as [field, content]}
              <p class="text-base leading-relaxed text-gray-700">{content}</p>
            {/each}
            {#if getCategorySourceUrl(city, cat)}
              <a
                href={getCategorySourceUrl(city, cat)}
                target="_blank"
                rel="noopener noreferrer"
                class="mt-2 inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                title="参考URLを開く"
              >
                <ExternalLink size={16} />
                <span>参考URL</span>
              </a>
            {/if}
          </div>
        {/if}
      {/each}
    {/if}
  </div>

  <div class="flex flex-col gap-3 border-t border-gray-100 bg-gray-50/50 px-5 pb-5 pt-4 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between">
    <div class="flex items-center justify-center gap-0 rounded-xl bg-gray-100 p-1.5 min-[420px]:justify-start">
      <button
        onclick={() => travelMode = 'foot'}
        class="relative flex h-12 w-16 items-center justify-center rounded-lg transition-colors {travelMode === 'foot' ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'}"
        aria-label="徒歩"
      >
        <Footprints size={26} />
        {#if travelMode === 'foot'}
          <span class="absolute bottom-0 left-1/2 h-0.5 w-11 -translate-x-1/2 rounded-full bg-emerald-600"></span>
        {/if}
      </button>
      <button
        onclick={() => travelMode = 'bike'}
        class="relative flex h-12 w-16 items-center justify-center rounded-lg transition-colors {travelMode === 'bike' ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'}"
        aria-label="自転車"
      >
        <Bike size={26} />
        {#if travelMode === 'bike'}
          <span class="absolute bottom-0 left-1/2 h-0.5 w-11 -translate-x-1/2 rounded-full bg-emerald-600"></span>
        {/if}
      </button>
      <button
        onclick={() => travelMode = 'car'}
        class="relative flex h-12 w-16 items-center justify-center rounded-lg transition-colors {travelMode === 'car' ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'}"
        aria-label="車"
      >
        <Car size={26} />
        {#if travelMode === 'car'}
          <span class="absolute bottom-0 left-1/2 h-0.5 w-11 -translate-x-1/2 rounded-full bg-emerald-600"></span>
        {/if}
      </button>
    </div>
    <button
      onclick={() => getRoute(f)}
      disabled={isFetchingRoute}
      class="inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-8 py-3 text-base font-bold text-white shadow-md transition-colors hover:bg-blue-700 disabled:opacity-50 min-[420px]:w-auto min-[420px]:min-w-[11rem]"
    >
      {isFetchingRoute ? '検索中...' : '経路を検索'}
    </button>
  </div>
{/snippet}

<!-- UIヘッダー（オーバーレイ） -->
<AppHeader 
  bind:searchQuery 
  {searchResults} 
  bind:selectedKeys={selectedCityKeys} 
  allKeys={allCityKeys} 
  bind:selectedCategories 
  {allCategories} 
  onSelectFacility={handleSelectFacility}
  onMenuClick={() => (sidebarOpen = true)}
/>

<!-- 設定サイドバー -->
<SettingsSidebar bind:open={sidebarOpen} bind:markerStyle bind:solidColor />

<!-- 地図エリア（フルスクリーン） -->
<div class="relative w-full h-screen bg-gray-100 overflow-hidden">
  {#if isTitleCollapsed}
    <button
      class="map-title-tab map-title-anchor absolute z-20"
      onclick={() => (isTitleCollapsed = false)}
      aria-label="タイトルを表示"
    >
      <ChevronRight size={16} strokeWidth={2.4} />
    </button>
  {:else}
    <button
      class="map-title map-title-anchor absolute z-20 text-left"
      onclick={() => (isTitleCollapsed = true)}
      aria-label="タイトルを閉じる"
    >
      <p class="map-title-kicker">TOSHIMA WARD</p>
      <p class="map-title-text">豊島区リサイクルマップ<span class="map-title-note">（仮）</span></p>
    </button>
  {/if}
  
  {#if routeInfo}
    <div class="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 bg-white/95 backdrop-blur-md shadow-2xl rounded-2xl px-6 py-4 flex items-center gap-6 border border-white/50">
      <div>
        <p class="text-xs font-bold text-gray-500 mb-1">ルート情報</p>
        <div class="flex items-end gap-4">
          <p class="text-sm font-medium text-gray-800">
            距離: <span class="font-black text-lg text-blue-600">{(routeInfo.distance / 1000).toFixed(1)}</span> <span class="text-gray-500">km</span>
          </p>
          <p class="text-sm font-medium text-gray-800">
            所要時間: <span class="font-black text-lg text-blue-600">{Math.round(routeInfo.duration / 60)}</span> <span class="text-gray-500">分</span>
          </p>
        </div>
      </div>
      <button
        onclick={() => { routeGeoJSON = null; routeInfo = null; }}
        class="flex-shrink-0 w-10 h-10 rounded-full bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-500 transition-colors shadow-sm"
        aria-label="経路を消去"
      >
        ✕
      </button>
    </div>
  {/if}

  <MapLibre
    bind:map={map}
    class="h-full w-full"
    style={mapStyleUrl}
    center={[139.7159, 35.7324]}
    zoom={13.4}
    attributionControl={false}
  >
    <!-- MapLibre UI Controls -->
    <AttributionControl position="bottom-right" />
    <NavigationControl position="bottom-right" />
    <GeolocateControl
      bind:control={geolocateControl}
      position="bottom-right"
      trackUserLocation={true}
      showAccuracyCircle={true}
      showUserLocation={true}
      positionOptions={{ enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }}
      fitBoundsOptions={isMobile ? { padding: { top: 100, bottom: 100, left: 20, right: 20 }, maxZoom: 14 } : { padding: 80, maxZoom: 14 }}
      onerror={handleGeolocateError}
      autoTrigger={true}
    />
    <FullScreenControl position="bottom-right" />

    {#if routeGeoJSON}
      <GeoJSONSource id="route" data={routeGeoJSON}>
        <LineLayer
          id="route-line-bg"
          paint={{
            'line-color': '#ffffff',
            'line-width': 10,
            'line-opacity': 0.8,
          }}
          layout={{
            'line-join': 'round',
            'line-cap': 'round',
          }}
        />
        <LineLayer
          id="route-line"
          paint={{
            'line-color': '#2563eb',
            'line-width': 6,
            'line-opacity': 0.9,
          }}
          layout={{
            'line-join': 'round',
            'line-cap': 'round',
          }}
        />
      </GeoJSONSource>
    {/if}

    {#each facilities as feature (feature.properties.id)}
      {@const { id, name, address, categories, hours, notes } = feature.properties}
      {@const [lng, lat] = feature.geometry.coordinates}

      <Marker lnglat={[lng, lat]}>
        {#snippet content()}
          <button
            onclick={() => selectFacility(id)}
            onkeydown={(e) => e.key === 'Enter' && selectFacility(id)}
            title={name}
            style="background:none;border:none;padding:0;cursor:pointer;"
            class="hover:scale-110 active:scale-95 transition-transform origin-bottom block"
          >
            <MapMarker categories={categories as CategoryId[]} style={markerStyle} {id} {solidColor} />
          </button>
        {/snippet}
      </Marker>

      {#if openPopupId === id && !isMobile}
        <Popup lnglat={[lng, lat]} onclose={() => { openPopupId = null; popupTab = 'basic'; }} closeButton={false} closeOnClick={false} maxWidth="none" offset={[0, -24]}>
          <div class="relative w-[28rem] max-w-[calc(100vw-2rem)] bg-white/95 text-left backdrop-blur-md rounded-2xl shadow-2xl border border-white/50 overflow-hidden">
            {@render popupCard(feature)}
          </div>
        </Popup>
      {/if}
    {/each}
  </MapLibre>

  {#if isMobile && openPopupId}
    {@const openFacility = facilities.find(f => f.properties.id === openPopupId)}
    {#if openFacility}
      <div
        class="fixed bottom-2 left-2 right-2 z-50 flex max-h-[72vh] flex-col overflow-hidden rounded-3xl bg-white/95 shadow-[0_-8px_32px_rgba(0,0,0,0.15)] backdrop-blur-md"
        transition:fly={{ y: 300, duration: 300, opacity: 1 }}
        style="padding-bottom: max(env(safe-area-inset-bottom), 16px)"
      >
        <div
          class="flex-shrink-0 pt-3 pb-2 flex justify-center touch-pan-y"
          role="button"
          tabindex="-1"
          aria-label="スワイプで閉じる"
          ontouchstart={handleTouchStart}
          ontouchend={handleTouchEnd}
        >
          <div class="w-12 h-1.5 rounded-full bg-gray-300"></div>
        </div>
        <div class="flex-1 overflow-y-auto">
          {@render popupCard(openFacility)}
        </div>
      </div>
    {/if}
  {/if}
</div>

<style>
  .map-title-anchor {
    left: 0.25rem;
    bottom: 0.5rem;
  }

  .map-title {
    border: 0;
    padding: 0.65rem 0.85rem 0.7rem 0.75rem;
    border-left: 2px solid rgba(31, 41, 55, 0.45);
    background: rgba(255, 255, 255, 0.34);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
    cursor: pointer;
  }

  .map-title-tab {
    border: 0;
    width: 1.7rem;
    height: 2.8rem;
    padding: 0;
    background: rgba(255, 255, 255, 0.32);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    color: rgba(55, 65, 81, 0.88);
    cursor: pointer;
  }

  .map-title-kicker {
    margin: 0 0 0.18rem;
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.18em;
    color: rgba(75, 85, 99, 0.9);
  }

  .map-title-text {
    margin: 0;
    font-family: "Iowan Old Style", "Palatino Linotype", "Noto Serif JP", "Hiragino Mincho ProN", serif;
    font-size: 1rem;
    font-weight: 600;
    line-height: 1.15;
    letter-spacing: 0.02em;
    color: rgba(17, 24, 39, 0.92);
  }

  .map-title-note {
    margin-left: 0.2rem;
    font-size: 0.78rem;
    font-weight: 500;
    color: rgba(75, 85, 99, 0.8);
  }

  @media (max-width: 640px) {
    .map-title-anchor {
      left: 0.25rem;
      bottom: 1.6rem;
    }
  }

  /* svelte-maplibre-gl のポップアップスタイルをリセット */
  :global(.maplibregl-popup-content) {
    padding: 0 !important;
    background: transparent !important;
    box-shadow: none !important;
    border-radius: 1rem !important;
  }
  :global(.maplibregl-popup-tip) {
    border-top-color: rgba(255, 255, 255, 0.95) !important;
  }
</style>
