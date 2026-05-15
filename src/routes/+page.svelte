<svelte:head>
  <title>{buildPageTitle()}</title>
  <meta
    name="description"
    content={`${SITE_NAME_JA}。全国のリサイクル回収施設を地図で探せるアプリ。市区町村の選択、カテゴリ絞り込み、施設情報の確認ができます。`}
  />
</svelte:head>

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
    Image,
    GeoJSONSource,
    CircleLayer,
    LineLayer,
    SymbolLayer
  } from 'svelte-maplibre-gl';
  import maplibregl from 'maplibre-gl';
  import type { ExpressionSpecification } from '@maplibre/maplibre-gl-style-spec';
  import { ChevronLeft, ChevronRight, Footprints, Bike, Car, ExternalLink } from 'lucide-svelte';
  import { fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';

  import AppHeader from '$lib/components/AppHeader.svelte';
  import SettingsSidebar from '$lib/components/SettingsSidebar.svelte';
  import MapMarker from '$lib/components/MapMarker.svelte';
  import { CATEGORY_COLOR, CATEGORY_LABEL, getCategoryDetails } from '$lib/db/categories.js';
  import { getMarkerStyle, getSolidColor } from '$lib/marker-style.js';

  import { getAreas, getFacilities, type AreaScope, type GeoFeature, type PublicArea } from '$lib/data.js';
  import { buildPageTitle, SITE_NAME_JA, SITE_NAME_KICKER } from '$lib/site.js';
  import {
    buildFacilityIndex,
    buildMarkerFeatureCollection,
    buildMarkerImageDescriptors,
    buildWardSummaryFeatureCollection,
    fitToWardSummary,
    INDIVIDUAL_MARKER_MIN_ZOOM,
    MARKER_ICON_SIZE,
    PREFECTURE_SUMMARY_MAX_ZOOM,
    WARD_SUMMARY_MAX_ZOOM,
    panToFacility,
    resolveSelectedFacility
  } from '$lib/map/facility-rendering.js';
  import { getMarkerImage } from '$lib/map/marker-images.js';
  import { getCategorySourceUrl } from '$lib/registry.js';
  import { fetchNearbyThumbs, type MapillaryThumb } from '$lib/mapillary.js';
  import type { CategoryId, MarkerStyle } from '$lib/types.js';
  import type { LineString } from 'geojson';

  const DEFAULT_OSRM_BASE_URL = 'https://router.project-osrm.org';
  const DEFAULT_MAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';
  const osrmBaseUrl = env.PUBLIC_OSRM_BASE_URL?.trim() || DEFAULT_OSRM_BASE_URL;
  const mapStyleUrl = env.PUBLIC_MAP_STYLE_URL?.trim() || DEFAULT_MAP_STYLE_URL;

  // 初期データ
  const allCategories: CategoryId[] = [
    'rechargeable-battery', 'e-bike-rechargeable-battery', 'button-battery', 'dry-battery',
    'small-appliance', 'fluorescent', 'ink-cartridge',
    'cooking-oil', 'heated-tobacco-device', 'used-clothing', 'paper-pack', 'styrofoam'
  ];
  // 状態管理
  let selectedCategories = $state<CategoryId[]>([...allCategories]);
  let areas = $state<PublicArea[]>([]);
  let selectedCityKeys = $state<string[]>([]);
  let areaScope = $state<AreaScope>('all');
  let sidebarOpen = $state(false);
  let facilities = $state<GeoFeature[]>([]);
  let selectedFacilityId = $state<string | null>(null);
  let markerStyle = $state<MarkerStyle>(getMarkerStyle());
  let solidColor = $state<string>(getSolidColor());
  let markerImages = $state<Array<{ id: string; image: ImageData }>>([]);
  
  // 検索管理
  let searchQuery = $state("");
  let searchResults = $state<GeoFeature[]>([]);

  // ルーティング・地図管理
  let routeGeoJSON = $state<LineString | null>(null);
  let routeInfo = $state<{ distance: number, duration: number } | null>(null);
  let isFetchingRoute = $state(false);
  let travelMode = $state<'foot' | 'bike' | 'car'>('foot');
  let map = $state<maplibregl.Map | undefined>(undefined);
  let heroMap = $state<maplibregl.Map | undefined>(undefined);
  let geolocateControl = $state<maplibregl.GeolocateControl | undefined>(undefined);
  let canUseGeolocation = $state(false);
  let routeError = $state<string | null>(null);
  let popupTab = $state<'basic' | 'details'>('basic');
  let isTitleCollapsed = $state(browser ? window.innerWidth <= 640 : false);
  let isMobile = $state(browser ? window.innerWidth <= 640 : false);
  let facilitiesRequestVersion = 0;
  let markerImagesRequestVersion = 0;
  let currentZoom = $state(5.2);
  const allCityKeys = $derived(areas.map((area) => `${area.prefecture}/${area.id}`));

  const facilityIndex = $derived(buildFacilityIndex(facilities));
  const selectedFacility = $derived(resolveSelectedFacility(facilityIndex, selectedFacilityId));
  const markerSourceData = $derived(buildMarkerFeatureCollection(facilities, markerStyle, solidColor));
  const markerImageIds = $derived(new Set(markerImages.map((markerImage) => markerImage.id)));
  const markerIconsReady = $derived(
    markerSourceData.features.every((feature) => markerImageIds.has(feature.properties.iconKey))
  );
  const summaryLevel = $derived(currentZoom < PREFECTURE_SUMMARY_MAX_ZOOM ? 'prefecture' : 'municipality');
  const wardSummarySourceData = $derived(buildWardSummaryFeatureCollection(facilities, summaryLevel));
  type ClusterZoomValues = {
    wideArea: number;
    wardArea: number;
    transition: number;
  };

  const CLUSTER_WIDE_AREA_ZOOM = 8;
  const CLUSTER_WARD_AREA_ZOOM = 10;
  const CLUSTER_ZOOM_INTERPOLATION_BASE = 2;
  const CLUSTER_RADIUS_PX: ClusterZoomValues = {
    wideArea: 18,
    wardArea: 33,
    transition: 45
  };
  const CLUSTER_HALO_RADIUS_PX: ClusterZoomValues = {
    wideArea: 22,
    wardArea: 40,
    transition: 54
  };
  const CLUSTER_TEXT_SIZE_PX: ClusterZoomValues = {
    wideArea: 10.5,
    wardArea: 14.5,
    transition: 17
  };
  const CLUSTER_COLOR = '#0f766e';
  const CLUSTER_HALO_COLOR = '#14b8a6';
  const CLUSTER_LABEL_HALO_COLOR = '#064e3b';
  const CLUSTER_CIRCLE_OPACITY = 0.94;
  const CLUSTER_HALO_OPACITY = 0.18;
  const CLUSTER_CIRCLE_STROKE_COLOR = '#ffffff';
  const CLUSTER_CIRCLE_STROKE_WIDTH = 4;
  const CLUSTER_HALO_STROKE_WIDTH = 1;
  const CLUSTER_COUNT_FONT_SCALE = 0.88;
  const CLUSTER_LABEL_LINE_HEIGHT = 1.28;
  const CLUSTER_LABEL_HALO_WIDTH = 1.3;
  const CLUSTER_LABEL_HALO_BLUR = 0.4;
  const CLUSTER_LABEL_FONT = ['Noto Sans Bold'];
  type OsrmRouteResponse = {
    routes?: Array<{
      geometry: LineString;
      distance: number;
      duration: number;
    }>;
  };

  function interpolateClusterValueByZoom(values: ClusterZoomValues): ExpressionSpecification {
    return [
      'interpolate',
      ['exponential', CLUSTER_ZOOM_INTERPOLATION_BASE],
      ['zoom'],
      CLUSTER_WIDE_AREA_ZOOM,
      values.wideArea,
      CLUSTER_WARD_AREA_ZOOM,
      values.wardArea,
      WARD_SUMMARY_MAX_ZOOM,
      values.transition
    ];
  }

  const CLUSTER_RADIUS_BY_ZOOM = interpolateClusterValueByZoom(CLUSTER_RADIUS_PX);
  const CLUSTER_HALO_RADIUS_BY_ZOOM = interpolateClusterValueByZoom(CLUSTER_HALO_RADIUS_PX);
  const CLUSTER_TEXT_SIZE_BY_ZOOM = interpolateClusterValueByZoom(CLUSTER_TEXT_SIZE_PX);

  function installStyleImageMissingFallback(currentMap: maplibregl.Map): () => void {
    const handleMissingImage = (event: maplibregl.MapStyleImageMissingEvent) => {
      const id = event.id;
      if (!id || id.startsWith('marker--')) return;

      try {
        if (!currentMap.hasImage(id)) {
          currentMap.addImage(id, new ImageData(1, 1), { pixelRatio: 1 });
        }
      } catch {
        // Missing base-style sprites are decorative; avoid noisy console warnings.
      }
    };

    currentMap.on('styleimagemissing', handleMissingImage);
    return () => currentMap.off('styleimagemissing', handleMissingImage);
  }

  // ボトムシート: ドラッグでリサイズ
  const SHEET_DEFAULT_VH = 60;
  const SHEET_MIN_VH = 22;
  const SHEET_MAX_VH = 92;
  const SHEET_CLOSE_THRESHOLD_VH = 18;

  let sheetHeightVh = $state(SHEET_DEFAULT_VH);
  let dragStartY = 0;
  let dragStartHeightVh = 0;
  let isDragging = $state(false);

  function handleSheetPointerDown(e: PointerEvent) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    dragStartY = e.clientY;
    dragStartHeightVh = sheetHeightVh;
    isDragging = true;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function handleSheetPointerMove(e: PointerEvent) {
    if (!isDragging) return;
    const dy = e.clientY - dragStartY;
    const vhPerPx = 100 / window.innerHeight;
    const next = dragStartHeightVh - dy * vhPerPx;
    sheetHeightVh = Math.max(SHEET_MIN_VH - 6, Math.min(SHEET_MAX_VH, next));
  }

  function handleSheetPointerUp(e: PointerEvent) {
    if (!isDragging) return;
    isDragging = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
    if (sheetHeightVh < SHEET_CLOSE_THRESHOLD_VH) {
      selectedFacilityId = null;
      sheetHeightVh = SHEET_DEFAULT_VH;
    } else {
      sheetHeightVh = Math.max(SHEET_MIN_VH, sheetHeightVh);
    }
  }

  $effect(() => {
    if (selectedFacilityId === null) {
      sheetHeightVh = SHEET_DEFAULT_VH;
    }
  });

  $effect(() => {
    if (!browser) return;

    getAreas().then((loadedAreas) => {
      areas = loadedAreas;
    }).catch((err) => {
      console.error('Failed to load areas:', err);
    });
  });

  // 詳細パネルのヒーローマップを選択施設に追従
  $effect(() => {
    if (!heroMap || !selectedFacility) return;
    heroMap.setCenter(selectedFacility.geometry.coordinates);
  });

  // 詳細パネルのヒーロー: Mapillary 画像があればカルーセル表示、なければミニマップ
  let heroThumbs = $state<MapillaryThumb[]>([]);
  let heroThumbLoading = $state(false);
  let heroIndex = $state(0);
  const heroThumb = $derived(heroThumbs[heroIndex] ?? null);

  $effect(() => {
    const facility = selectedFacility;
    if (!facility) {
      heroThumbs = [];
      heroIndex = 0;
      heroThumbLoading = false;
      return;
    }

    const [lng, lat] = facility.geometry.coordinates;
    const approvedImageUrl = facility.properties.imageUrl;
    if (approvedImageUrl) {
      heroThumbs = [{
        id: facility.properties.mapillaryImageId ?? `facility-media-${facility.properties.id}`,
        url: approvedImageUrl,
        capturedAt: null,
        alt: facility.properties.imageAlt ?? facility.properties.name,
        credit: facility.properties.imageCredit,
        sourceUrl: facility.properties.imageSourceUrl ?? null
      }];
      heroIndex = 0;
      heroThumbLoading = false;
      return;
    }

    heroThumbs = [];
    heroIndex = 0;
    heroThumbLoading = true;

    let cancelled = false;
    fetchNearbyThumbs(lng, lat)
      .then((thumbs) => {
        if (cancelled) return;
        heroThumbs = thumbs;
        heroIndex = 0;
        heroThumbLoading = false;
      })
      .catch((err) => {
        if (cancelled) return;
        console.warn('[mapillary] effect catch', err);
        heroThumbLoading = false;
      });

    return () => {
      cancelled = true;
    };
  });

  function heroPrev() {
    if (heroThumbs.length === 0) return;
    heroIndex = (heroIndex - 1 + heroThumbs.length) % heroThumbs.length;
  }
  function heroNext() {
    if (heroThumbs.length === 0) return;
    heroIndex = (heroIndex + 1) % heroThumbs.length;
  }

  // ヒーロー画像のスワイプ（左右で前/次の画像へ）
  const SWIPE_THRESHOLD_PX = 40;
  let heroSwipeStartX = 0;
  let heroSwipeStartY = 0;
  let heroSwipeActive = false;

  function handleHeroPointerDown(e: PointerEvent) {
    if (heroThumbs.length < 2) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    heroSwipeStartX = e.clientX;
    heroSwipeStartY = e.clientY;
    heroSwipeActive = true;
  }

  function handleHeroPointerUp(e: PointerEvent) {
    if (!heroSwipeActive) return;
    heroSwipeActive = false;
    const dx = e.clientX - heroSwipeStartX;
    const dy = e.clientY - heroSwipeStartY;
    if (Math.abs(dx) < SWIPE_THRESHOLD_PX) return;
    if (Math.abs(dy) > Math.abs(dx)) return; // vertical swipe → ignore (sheet drag)
    if (dx < 0) heroNext();
    else heroPrev();
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
    alert(getGeolocationErrorMessage(err));
  }

  // データフェッチ
  $effect(() => {
    if (!browser) return;
    let cancelled = false;
    canUseGeolocation = false;

    if (!('geolocation' in navigator)) return;
    if (!navigator.permissions) {
      canUseGeolocation = true;
      return;
    }

    navigator.permissions.query({ name: 'geolocation' }).then((permission) => {
      if (cancelled) return;
      canUseGeolocation = permission.state !== 'denied';
    }).catch(() => {
      if (cancelled) return;
      canUseGeolocation = true;
    });

    return () => {
      cancelled = true;
    };
  });

  $effect(() => {
    if (!browser) return;
    
    // Spread to convert proxy to regular array
    const requestVersion = ++facilitiesRequestVersion;
    getFacilities([...selectedCityKeys], [...selectedCategories], areaScope).then((f) => {
      if (requestVersion !== facilitiesRequestVersion) return;
      facilities = f;
      // 表示対象外になったポップアップを閉じる
      if (selectedFacilityId && !f.find((x) => x.properties.id === selectedFacilityId)) {
        selectedFacilityId = null;
      }
    }).catch(err => {
      if (requestVersion !== facilitiesRequestVersion) return;
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
        ...categories.map(c => CATEGORY_LABEL[c] ?? c)
      ].join(" ").toLowerCase();
      
      return q.every(keyword => textToSearch.includes(keyword));
    }).slice(0, 50);
  });

  // 検索結果が1件だけになったときのオートズーム
  $effect(() => {
    if (searchResults.length === 1 && map) {
      const facility = searchResults[0];
      panToFacility(map, facility, isMobile, { zoom: 16 });
      selectedFacilityId = facility.properties.id;
      popupTab = 'basic';
    }
  });

  $effect(() => {
    if (!browser) return;

    const descriptors = buildMarkerImageDescriptors(facilities, markerStyle, solidColor);
    const requestVersion = ++markerImagesRequestVersion;

    Promise.all(
      descriptors.map(async (descriptor) => ({
        id: descriptor.iconKey,
        image: await getMarkerImage(descriptor)
      }))
    ).then((images) => {
      if (requestVersion !== markerImagesRequestVersion) return;
      markerImages = images;
    }).catch((err) => {
      if (requestVersion !== markerImagesRequestVersion) return;
      console.error('Failed to prepare marker images:', err);
    });
  });

  $effect(() => {
    if (!browser || !map) return;

    const currentMap = map;
    currentZoom = currentMap.getZoom();
    const handleMove = () => {
      currentZoom = currentMap.getZoom();
    };
    currentMap.on('moveend', handleMove);
    currentMap.on('zoomend', handleMove);
    const uninstallMissingImageFallback = installStyleImageMissingFallback(currentMap);
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
      currentMap.off('moveend', handleMove);
      currentMap.off('zoomend', handleMove);
      uninstallMissingImageFallback();
      window.removeEventListener('resize', handleResize);
    };
  });

  $effect(() => {
    if (!browser || !heroMap) return;
    return installStyleImageMissingFallback(heroMap);
  });

  // 検索結果の選択ハンドラ
  function handleSelectFacility(facility: GeoFeature) {
    if (map) {
      panToFacility(map, facility, isMobile, { zoom: 16 });
    }
    searchQuery = ""; // 検索をクリア
    selectedFacilityId = facility.properties.id;
    popupTab = 'basic';
  }

  function selectFacility(id: string) {
    const wasOpen = selectedFacilityId === id;
    selectedFacilityId = selectedFacilityId === id ? null : id;
    popupTab = 'basic';

    if (!wasOpen && isMobile && map) {
      const facility = facilityIndex.get(id);
      if (facility) {
        panToFacility(map, facility, true);
      }
    }
  }

  function handleWardSummaryClick(event: maplibregl.MapLayerMouseEvent) {
    const summary = event.features?.[0]?.properties;
    if (!summary || !map) return;

    const minLng = Number(summary.minLng);
    const minLat = Number(summary.minLat);
    const maxLng = Number(summary.maxLng);
    const maxLat = Number(summary.maxLat);
    const city = typeof summary.city === 'string' ? summary.city : null;

    if ([minLng, minLat, maxLng, maxLat].some(Number.isNaN)) return;

    fitToWardSummary(
      map,
      {
        city: city ?? '',
        cityLabel: typeof summary.cityLabel === 'string' ? summary.cityLabel : '',
        summaryType: summary.summaryType === 'prefecture' ? 'prefecture' : 'municipality',
        facilityCount: Number(summary.facilityCount ?? 0),
        minLng,
        minLat,
        maxLng,
        maxLat
      },
      isMobile
    );
    selectedFacilityId = null;
  }

  function handleFacilityLayerClick(event: maplibregl.MapLayerMouseEvent) {
    const facilityId = event.features?.[0]?.properties?.facilityId;
    if (typeof facilityId === 'string') {
      selectFacility(facilityId);
    }
  }

  function handleLayerMouseEnter() {
    if (!map) return;
    map.getCanvas().style.cursor = 'pointer';
  }

  function handleLayerMouseLeave() {
    if (!map) return;
    map.getCanvas().style.cursor = '';
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
      const data = await res.json() as OsrmRouteResponse;

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
          selectedFacilityId = null; // 経路表示時はポップアップを閉じる
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

{#snippet heroBlock(f: GeoFeature)}
  <div class="detail-panel__hero">
    <div class="detail-panel__hero-map-wrap" class:detail-panel__hero-map-wrap--hidden={Boolean(heroThumb)}>
      <MapLibre
        bind:map={heroMap}
        class="detail-panel__hero-map"
        style={mapStyleUrl}
        center={f.geometry.coordinates}
        zoom={16.5}
        interactive={false}
        attributionControl={false}
      ></MapLibre>
      <div class="detail-panel__hero-pin" aria-hidden="true">
        <MapMarker
          categories={f.properties.categories as CategoryId[]}
          style={markerStyle}
          solidColor={solidColor}
          id={`hero-${f.properties.id}`}
        />
      </div>
    </div>
    {#if heroThumb}
      <div
        class="detail-panel__hero-photo-wrap"
        role="presentation"
        onpointerdown={handleHeroPointerDown}
        onpointerup={handleHeroPointerUp}
        onpointercancel={() => (heroSwipeActive = false)}
      >
        {#key heroThumb.id}
          <img
            class="detail-panel__hero-photo"
            src={heroThumb.url}
            alt={heroThumb.alt ?? f.properties.name}
            loading="eager"
            decoding="async"
            draggable="false"
            onerror={() => { heroThumbs = heroThumbs.filter((t) => t.id !== heroThumb!.id); }}
          />
        {/key}
      </div>
      {#if heroThumbs.length > 1}
        <button class="detail-panel__hero-nav detail-panel__hero-nav--prev" onclick={heroPrev} aria-label="前の画像">
          <ChevronLeft size={18} strokeWidth={2.6} />
        </button>
        <button class="detail-panel__hero-nav detail-panel__hero-nav--next" onclick={heroNext} aria-label="次の画像">
          <ChevronRight size={18} strokeWidth={2.6} />
        </button>
        <div class="detail-panel__hero-dots">
          {#each heroThumbs as t, i (t.id)}
            <button
              type="button"
              class="detail-panel__hero-dot"
              class:detail-panel__hero-dot--active={i === heroIndex}
              onclick={() => (heroIndex = i)}
              aria-label="画像 {i + 1}/{heroThumbs.length}"
              aria-current={i === heroIndex}
            ></button>
          {/each}
        </div>
        <span class="detail-panel__hero-counter">{heroIndex + 1}/{heroThumbs.length}</span>
      {/if}
      {#if heroThumb.capturedAt}
        <span class="detail-panel__hero-date" title="撮影日">
          {new Date(heroThumb.capturedAt).toLocaleDateString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric' })}
        </span>
      {/if}
      {#if heroThumb.sourceUrl}
        <a class="detail-panel__hero-credit" href={heroThumb.sourceUrl} target="_blank" rel="noopener noreferrer" title="画像の出典を開く">
          {heroThumb.credit ?? '画像出典'}
        </a>
      {:else if heroThumb.id}
        <a class="detail-panel__hero-credit" href="https://www.mapillary.com/app/?image_key={heroThumb.id}" target="_blank" rel="noopener noreferrer" title="Mapillary で開く">
          {heroThumb.credit ?? 'Mapillary'}
        </a>
      {/if}
    {:else if heroThumbLoading}
      <div class="detail-panel__hero-loading" aria-hidden="true"></div>
    {/if}
  </div>
{/snippet}

{#snippet popupCard(f: GeoFeature)}
  {@const { city, name, address, categories, hours, notes, collectionEntries = [] } = f.properties}
  <div class="popup-scroll flex flex-col">
    <div class="px-5 pt-5">
      <div class="mb-2 flex items-start justify-between gap-3">
        <h3 class="pr-2 text-xl font-bold leading-snug text-gray-900">{name}</h3>
        <button
          onclick={() => (selectedFacilityId = null)}
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
    <div class="border-b border-gray-100 px-5 mt-4">
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
    <div class="min-h-[4.5rem] flex-1 overflow-y-auto px-5 py-4">
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
          {@const categoryEntries = collectionEntries.filter((entry) => entry.category_id === cat)}
          {#if Object.keys(details).length > 0 || categoryEntries.length > 0}
            {@const sourceUrl = categoryEntries[0]?.source_url ?? getCategorySourceUrl(city, cat)}
            <div class="mb-4 last:mb-0">
              <div class="mb-1.5 flex items-center gap-2">
                <p class="text-base font-bold" style:color={CATEGORY_COLOR[cat]}>{CATEGORY_LABEL[cat]}</p>
                {#if sourceUrl}
                  <a
                    href={sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex h-6 w-6 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800"
                    aria-label="参考URLを開く"
                    title="参考URLを開く"
                  >
                    <ExternalLink size={14} />
                  </a>
                {/if}
              </div>
              {#each Object.entries(details) as [_, content]}
                <p class="text-base leading-relaxed text-gray-700">{content}</p>
              {/each}
              {#each categoryEntries as entry}
                <div class="mt-2 border-l-2 border-gray-200 pl-3 text-sm leading-relaxed text-gray-600">
                  {#if entry.source_display_name && entry.source_display_name !== name}
                    <p><span class="font-bold text-gray-700">掲載名:</span> {entry.source_display_name}</p>
                  {/if}
                  {#if entry.source_address && entry.source_address !== address}
                    <p><span class="font-bold text-gray-700">掲載住所:</span> {entry.source_address}</p>
                  {/if}
                  {#if entry.data_source_name}
                    <p><span class="font-bold text-gray-700">データソース:</span> {entry.data_source_name}</p>
                  {/if}
                  {#if entry.hours}
                    <p><span class="font-bold text-gray-700">受付:</span> {entry.hours}</p>
                  {/if}
                  {#if entry.location_hint}
                    <p><span class="font-bold text-gray-700">設置場所:</span> {entry.location_hint}</p>
                  {/if}
                  {#if entry.notes}
                    <p><span class="font-bold text-gray-700">補足:</span> {entry.notes}</p>
                  {/if}
                </div>
              {/each}
            </div>
          {/if}
        {/each}
      {/if}
    </div>

    <div class="flex items-center gap-3 border-t border-gray-100 bg-gray-50/50 px-4 pb-5 pt-4">
      <div class="flex flex-shrink-0 items-center gap-0 rounded-xl bg-gray-100 p-1">
        <button
          onclick={() => travelMode = 'foot'}
          class="relative flex h-11 w-12 items-center justify-center rounded-lg transition-colors {travelMode === 'foot' ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'}"
          aria-label="徒歩"
        >
          <Footprints size={22} />
          {#if travelMode === 'foot'}
            <span class="absolute bottom-0 left-1/2 h-0.5 w-7 -translate-x-1/2 rounded-full bg-emerald-600"></span>
          {/if}
        </button>
        <button
          onclick={() => travelMode = 'bike'}
          class="relative flex h-11 w-12 items-center justify-center rounded-lg transition-colors {travelMode === 'bike' ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'}"
          aria-label="自転車"
        >
          <Bike size={22} />
          {#if travelMode === 'bike'}
            <span class="absolute bottom-0 left-1/2 h-0.5 w-7 -translate-x-1/2 rounded-full bg-emerald-600"></span>
          {/if}
        </button>
        <button
          onclick={() => travelMode = 'car'}
          class="relative flex h-11 w-12 items-center justify-center rounded-lg transition-colors {travelMode === 'car' ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'}"
          aria-label="車"
        >
          <Car size={22} />
          {#if travelMode === 'car'}
            <span class="absolute bottom-0 left-1/2 h-0.5 w-7 -translate-x-1/2 rounded-full bg-emerald-600"></span>
          {/if}
        </button>
      </div>
      <button
        onclick={() => getRoute(f)}
        disabled={isFetchingRoute}
        class="inline-flex min-w-0 flex-1 items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-base font-bold text-white shadow-md transition-colors hover:bg-blue-700 disabled:opacity-50"
      >
        {isFetchingRoute ? '検索中...' : '経路を検索'}
      </button>
    </div>
  </div>
{/snippet}

<!-- UIヘッダー（オーバーレイ） -->
<AppHeader 
  bind:searchQuery 
  {searchResults} 
  bind:selectedKeys={selectedCityKeys} 
  allKeys={allCityKeys} 
  bind:areaScope
  {areas}
  bind:selectedCategories 
  {allCategories} 
  onSelectFacility={handleSelectFacility}
  onMenuClick={() => (sidebarOpen = true)}
/>

<!-- 設定サイドバー -->
<SettingsSidebar bind:open={sidebarOpen} bind:markerStyle bind:solidColor />

<!-- 地図エリア（フルスクリーン） -->
<div
  class="relative w-full h-screen bg-gray-100 overflow-hidden"
  class:map-shifted={selectedFacility && !isMobile}
>
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
      <p class="map-title-kicker">{SITE_NAME_KICKER}</p>
      <p class="map-title-text">{SITE_NAME_JA}</p>
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
    center={[137.5, 38.2]}
    zoom={5.2}
    attributionControl={false}
  >
    <!-- MapLibre UI Controls -->
    <AttributionControl position="bottom-right" />
    <NavigationControl position="bottom-right" />
    {#if canUseGeolocation}
      <GeolocateControl
        bind:control={geolocateControl}
        position="bottom-right"
        trackUserLocation={false}
        showAccuracyCircle={true}
        showUserLocation={true}
        positionOptions={{ enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }}
        fitBoundsOptions={isMobile ? { padding: { top: 100, bottom: 100, left: 20, right: 20 }, maxZoom: 14 } : { padding: 80, maxZoom: 14 }}
        onerror={handleGeolocateError}
        autoTrigger={true}
      />
    {/if}
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

      {#each markerImages as markerImage (markerImage.id)}
        <Image id={markerImage.id} image={markerImage.image} />
      {/each}

      <GeoJSONSource
        id="ward-summaries"
        data={wardSummarySourceData}
      >
        <CircleLayer
          id="ward-summary-halos"
          maxzoom={WARD_SUMMARY_MAX_ZOOM}
          paint={{
            'circle-color': CLUSTER_HALO_COLOR,
            'circle-radius': CLUSTER_HALO_RADIUS_BY_ZOOM,
            'circle-opacity': CLUSTER_HALO_OPACITY,
            'circle-stroke-color': CLUSTER_COLOR,
            'circle-stroke-width': CLUSTER_HALO_STROKE_WIDTH,
            'circle-stroke-opacity': CLUSTER_HALO_OPACITY
          }}
          onclick={handleWardSummaryClick}
          onmouseenter={handleLayerMouseEnter}
          onmouseleave={handleLayerMouseLeave}
        />
        <CircleLayer
          id="ward-summary-circles"
          maxzoom={WARD_SUMMARY_MAX_ZOOM}
          paint={{
            'circle-color': CLUSTER_COLOR,
            'circle-radius': CLUSTER_RADIUS_BY_ZOOM,
            'circle-opacity': CLUSTER_CIRCLE_OPACITY,
            'circle-stroke-color': CLUSTER_CIRCLE_STROKE_COLOR,
            'circle-stroke-width': CLUSTER_CIRCLE_STROKE_WIDTH
          }}
          onclick={handleWardSummaryClick}
          onmouseenter={handleLayerMouseEnter}
          onmouseleave={handleLayerMouseLeave}
        />
        <SymbolLayer
          id="ward-summary-labels"
          maxzoom={WARD_SUMMARY_MAX_ZOOM}
          layout={{
            'text-field': [
              'format',
              ['get', 'cityLabel'],
              { 'font-scale': 1 },
              '\n',
              {},
              ['concat', ['to-string', ['get', 'facilityCount']], '件'],
              { 'font-scale': CLUSTER_COUNT_FONT_SCALE }
            ],
            'text-size': CLUSTER_TEXT_SIZE_BY_ZOOM,
            'text-font': CLUSTER_LABEL_FONT,
            'text-line-height': CLUSTER_LABEL_LINE_HEIGHT,
            'text-allow-overlap': true,
            'text-ignore-placement': true
          }}
          paint={{
            'text-color': CLUSTER_CIRCLE_STROKE_COLOR,
            'text-halo-color': CLUSTER_LABEL_HALO_COLOR,
            'text-halo-width': CLUSTER_LABEL_HALO_WIDTH,
            'text-halo-blur': CLUSTER_LABEL_HALO_BLUR
          }}
          onclick={handleWardSummaryClick}
          onmouseenter={handleLayerMouseEnter}
          onmouseleave={handleLayerMouseLeave}
        />
      </GeoJSONSource>

      {#if markerIconsReady}
        <GeoJSONSource
          id="facilities"
          data={markerSourceData}
        >
          <SymbolLayer
            id="facility-markers"
            minzoom={INDIVIDUAL_MARKER_MIN_ZOOM}
            layout={{
              'icon-image': ['get', 'iconKey'],
              'icon-size': MARKER_ICON_SIZE,
              'icon-anchor': 'bottom',
              'icon-allow-overlap': true,
              'icon-ignore-placement': true
            }}
            onclick={handleFacilityLayerClick}
            onmouseenter={handleLayerMouseEnter}
            onmouseleave={handleLayerMouseLeave}
          />
        </GeoJSONSource>
      {/if}

	  </MapLibre>

	  {#if selectedFacility && !isMobile}
	    <aside
	      class="detail-panel"
	      aria-label="施設詳細"
	      transition:fly={{ x: 440, duration: 320, easing: cubicOut }}
	    >
	      <button
	        class="detail-panel__collapse"
	        onclick={() => (selectedFacilityId = null)}
	        aria-label="パネルを閉じる"
	      >
	        <ChevronRight size={18} strokeWidth={2.4} />
	      </button>
	      {@render heroBlock(selectedFacility)}
	      {@render popupCard(selectedFacility)}
	    </aside>
	  {/if}

	  {#if isMobile && selectedFacility}
        <div class="bottom-sheet-backdrop" onclick={() => (selectedFacilityId = null)} role="presentation"></div>
	      <div
	        class="bottom-sheet"
          class:bottom-sheet--dragging={isDragging}
	        transition:fly={{ y: 600, duration: 360, opacity: 1 }}
          style="height: {sheetHeightVh}vh"
        >
        <div
          class="bottom-sheet__handle"
          role="button"
          tabindex="-1"
          aria-label="ドラッグで高さ調整"
          onpointerdown={handleSheetPointerDown}
          onpointermove={handleSheetPointerMove}
          onpointerup={handleSheetPointerUp}
          onpointercancel={handleSheetPointerUp}
	        >
	          <div class="bottom-sheet__handle-bar"></div>
	        </div>
	        <div class="bottom-sheet__body">
	          {@render heroBlock(selectedFacility)}
	          {@render popupCard(selectedFacility)}
	        </div>
	      </div>
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
    display: inline-flex;
    flex-direction: column;
    align-items: flex-start;
    width: max-content;
    max-width: calc(100vw - 0.75rem);
    overflow: visible;
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
    line-height: 1.2;
    letter-spacing: 0.18em;
    white-space: nowrap;
    color: rgba(75, 85, 99, 0.9);
  }

  .map-title-text {
    margin: 0;
    font-family: "Iowan Old Style", "Palatino Linotype", "Noto Serif JP", "Hiragino Mincho ProN", serif;
    font-size: 1rem;
    font-weight: 600;
    line-height: 1.15;
    letter-spacing: 0.02em;
    white-space: nowrap;
    color: rgba(17, 24, 39, 0.92);
  }

  @media (max-width: 640px) {
    .map-title-anchor {
      left: 0.25rem;
      bottom: 1.6rem;
    }
  }

  /* svelte-maplibre-gl のポップアップ枠を透明化（refined-popupが自前で枠を持つ） */
  :global(.maplibregl-popup-content) {
    padding: 0 !important;
    background: transparent !important;
    box-shadow: none !important;
    border-radius: 0 !important;
    border: 0 !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
  }
  :global(.maplibregl-popup-tip) {
    border-top-color: #ffffff !important;
  }

  /* Shift right-side map controls when detail panel is open (panel = 400px wide) */
  :global(.maplibregl-ctrl-top-right),
  :global(.maplibregl-ctrl-bottom-right) {
    transition: transform 0.32s cubic-bezier(0.32, 0.72, 0.24, 1);
  }
  .map-shifted :global(.maplibregl-ctrl-top-right),
  .map-shifted :global(.maplibregl-ctrl-bottom-right) {
    transform: translateX(calc(-1 * min(400px, calc(100vw - 32px))));
  }

  /* === Desktop: facility detail side panel === */
  .detail-panel {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: min(400px, calc(100% - 32px));
    background: #ffffff;
    z-index: 30;
    display: flex;
    flex-direction: column;
    box-shadow: -16px 0 40px rgba(15, 23, 42, 0.12), -4px 0 8px rgba(15, 23, 42, 0.06);
    overflow: visible;
  }
  /* Edge-mounted collapse handle (Google Maps style) */
  .detail-panel__collapse {
    position: absolute;
    top: 50%;
    left: 0;
    transform: translate(-100%, -50%);
    width: 24px;
    height: 56px;
    border: 0;
    border-radius: 8px 0 0 8px;
    background: #ffffff;
    color: #4a525b;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: -4px 2px 12px rgba(15, 23, 42, 0.12), -1px 0 0 rgba(15, 23, 42, 0.04);
    transition: color 0.15s ease, background 0.15s ease;
    z-index: 1;
  }
  .detail-panel__collapse:hover { color: #0b1116; background: #f7f8fa; }
  /* Hide the snippet's inline ✕ inside the docked panel (use edge handle instead) */
  .detail-panel :global(.popup-scroll button[aria-label="閉じる"]) {
    display: none;
  }
  .detail-panel :global(.popup-scroll > .px-5.pt-5 > .mb-2) {
    padding-right: 0;
  }
  .popup-scroll {
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }
  /* Hero at top of detail panel: Mapillary photo if available, else mini-map */
  .detail-panel__hero {
    position: relative;
    height: 180px;
    flex-shrink: 0;
    background: #e9e6df;
    overflow: hidden;
    border-bottom: 1px solid rgba(15, 23, 42, 0.08);
  }
  .detail-panel__hero-map-wrap {
    position: absolute;
    inset: 0;
    transition: opacity 0.25s ease;
  }
  .detail-panel__hero-map-wrap--hidden {
    opacity: 0;
    pointer-events: none;
  }
  :global(.detail-panel__hero-map) {
    width: 100%;
    height: 100%;
  }
  .detail-panel__hero-pin {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -100%);
    z-index: 2;
    pointer-events: none;
  }
  .detail-panel__hero-pin :global(svg) {
    width: 36px;
    height: auto;
  }
  .detail-panel__hero-photo-wrap {
    position: absolute;
    inset: 0;
    z-index: 3;
    touch-action: pan-y;
    cursor: grab;
  }
  .detail-panel__hero-photo-wrap:active { cursor: grabbing; }
  .detail-panel__hero-photo {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    user-select: none;
    -webkit-user-drag: none;
    animation: hero-photo-in 0.3s ease;
  }
  @keyframes hero-photo-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .detail-panel__hero-nav {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 28px;
    height: 28px;
    border: 0;
    border-radius: 50%;
    background: rgba(15, 23, 42, 0.55);
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 5;
    backdrop-filter: blur(4px);
    transition: background 0.15s ease, transform 0.15s ease;
    opacity: 0;
  }
  .detail-panel__hero:hover .detail-panel__hero-nav { opacity: 1; }
  .detail-panel__hero-nav:hover { background: rgba(15, 23, 42, 0.75); }
  .detail-panel__hero-nav--prev { left: 5px; }
  .detail-panel__hero-nav--next { right: 5px; }
  .detail-panel__hero-dots {
    position: absolute;
    left: 50%;
    bottom: 5px;
    transform: translateX(-50%);
    display: flex;
    gap: 5px;
    z-index: 4;
    max-width: calc(100% - 16px);
    flex-wrap: wrap;
    justify-content: center;
    row-gap: 4px;
  }
  .detail-panel__hero-dot {
    width: 7px;
    height: 7px;
    padding: 0;
    border: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.55);
    box-shadow: 0 0 0 1px rgba(15, 23, 42, 0.25);
    cursor: pointer;
    transition: background 0.15s ease, transform 0.15s ease;
  }
  .detail-panel__hero-dot:hover {
    background: rgba(255, 255, 255, 0.85);
    transform: scale(1.2);
  }
  .detail-panel__hero-dot--active {
    background: #ffffff;
    transform: scale(1.3);
  }
  .detail-panel__hero-date {
    position: absolute;
    left: 5px;
    top: 5px;
    z-index: 4;
    padding: 1px 7px;
    border-radius: 999px;
    background: rgba(15, 23, 42, 0.55);
    backdrop-filter: blur(4px);
    color: #ffffff;
    font-size: 10.5px;
    font-weight: 600;
    letter-spacing: 0.04em;
    opacity: 0;
    transition: opacity 0.18s ease;
  }
  .detail-panel__hero-counter {
    position: absolute;
    left: 5px;
    bottom: 5px;
    z-index: 4;
    padding: 1px 7px;
    border-radius: 999px;
    background: rgba(15, 23, 42, 0.55);
    backdrop-filter: blur(4px);
    color: #ffffff;
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.04em;
    opacity: 0;
    transition: opacity 0.18s ease;
  }
  .detail-panel__hero:hover .detail-panel__hero-counter { opacity: 1; }
  .detail-panel__hero-credit {
    position: absolute;
    right: 5px;
    bottom: 5px;
    z-index: 4;
    padding: 1px 7px;
    border-radius: 999px;
    background: rgba(15, 23, 42, 0.55);
    backdrop-filter: blur(4px);
    color: #ffffff;
    font-size: 10.5px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-decoration: none;
    opacity: 0;
    transition: opacity 0.18s ease;
  }
  .detail-panel__hero:hover .detail-panel__hero-date,
  .detail-panel__hero:hover .detail-panel__hero-credit {
    opacity: 1;
  }
  .detail-panel__hero-credit:hover { text-decoration: underline; }
  .detail-panel__hero-loading {
    position: absolute;
    inset: auto 0 0 0;
    height: 2px;
    z-index: 4;
    background: linear-gradient(90deg, transparent, rgba(15, 23, 42, 0.32), transparent);
    background-size: 30% 100%;
    background-repeat: no-repeat;
    animation: hero-loading 1.1s linear infinite;
  }
  @keyframes hero-loading {
    from { background-position: -30% 0; }
    to { background-position: 130% 0; }
  }
  /* Hide attribution / controls inside the hero mini-map */
  .detail-panel__hero :global(.maplibregl-ctrl) { display: none !important; }
  .detail-panel__hero :global(.maplibregl-canvas) { cursor: default; }

  /* === Bottom sheet (mobile) === */
  .bottom-sheet-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.18);
    z-index: 49;
    animation: bottom-sheet-fade 0.2s ease;
  }
  @keyframes bottom-sheet-fade {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .bottom-sheet {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 50;
    background: #ffffff;
    border-radius: 23px 23px 0 0;
    box-shadow: 0 -12px 40px rgba(15, 23, 42, 0.18);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    transition: height 0.18s ease;
    max-width: 100vw;
  }
  .bottom-sheet--dragging {
    transition: none;
    user-select: none;
  }
  .bottom-sheet__handle {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 5;
    display: flex;
    justify-content: center;
    padding: 8px 0 0;
    touch-action: none;
    cursor: grab;
  }
  .bottom-sheet__handle:active { cursor: grabbing; }
  .bottom-sheet__handle-bar {
    width: 44px;
    height: 5px;
    background: rgba(255, 255, 255, 0.92);
    border-radius: 999px;
    box-shadow: 0 1px 4px rgba(15, 23, 42, 0.35);
    transition: background 0.15s ease;
  }
  .bottom-sheet__handle:hover .bottom-sheet__handle-bar { background: #ffffff; }
  .bottom-sheet__body {
    flex: 1;
    min-height: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .bottom-sheet :global(.detail-panel__hero) {
    flex-shrink: 0;
  }
  /* When refined-popup renders inside bottom-sheet, drop the popup's own card chrome */
  .bottom-sheet :global(.refined-popup) {
    width: 100%;
    max-width: 100%;
    max-height: none;
    box-shadow: none;
    border-radius: 0;
    background: transparent;
    animation: none;
    flex: 1;
  }
</style>
