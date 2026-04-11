<script lang="ts">
  import 'maplibre-gl/dist/maplibre-gl.css';
  import {
    MapLibre,
    NavigationControl,
    GeolocateControl,
    FullScreenControl,
    Marker,
    Popup,
  } from 'svelte-maplibre-gl';
  import CategoryFilter from '$lib/components/CategoryFilter.svelte';
  import { CATEGORY_COLOR, CATEGORY_LABEL } from '$lib/categories.js';
  import { getFacilities, type GeoFeature } from '$lib/data.js';
  import { WARD_REGISTRY, groupByPrefecture } from '$lib/registry.js';
  import type { CategoryId } from '$lib/types.js';

  const allCategories: CategoryId[] = [
    'battery', 'fluorescent', 'cooking-oil',
    'ink-cartridge', 'small-appliance', 'used-clothing',
  ];
  const allCityKeys = WARD_REGISTRY.map((w) => `${w.prefecture}/${w.city}`);
  const prefectureGroups = groupByPrefecture(WARD_REGISTRY);
  /** prefecture キー → 都道府県名ラベルの引き当てMap */
  const prefLabelMap = new Map(WARD_REGISTRY.map((w) => [w.prefecture, w.prefectureLabel]));

  let selectedCategories = $state<CategoryId[]>([...allCategories]);
  let selectedCityKeys = $state<string[]>([...allCityKeys]);
  let openPopupId = $state<string | null>(null);
  let sidebarOpen = $state(true);
  let facilities = $state<GeoFeature[]>([]);

  $effect(() => {
    getFacilities(selectedCityKeys, selectedCategories).then((f) => {
      facilities = f;
      // 別区に切り替えたとき開いていたポップアップを閉じる
      if (openPopupId && !f.find((x) => x.properties.id === openPopupId)) {
        openPopupId = null;
      }
    });
  });

  function toggleCity(key: string) {
    // 既にその区だけ選択中 → 全区を戻す
    if (selectedCityKeys.length === 1 && selectedCityKeys[0] === key) {
      selectedCityKeys = [...allCityKeys];
    } else {
      // それ以外を非表示にしてその区だけ表示
      selectedCityKeys = [key];
    }
    openPopupId = null;
  }

  function selectFacility(id: string) {
    openPopupId = openPopupId === id ? null : id;
  }

  function pinGradientId(id: string) {
    return `pin-grad-${id.replace(/[^a-z0-9]/gi, '-')}`;
  }
</script>

<div class="flex h-screen w-full overflow-hidden">
  <!-- サイドバー -->
  {#if sidebarOpen}
    <aside class="w-72 flex-shrink-0 flex flex-col bg-white shadow-lg z-10 overflow-hidden">

      <!-- タイトル -->
      <div class="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
        <div>
          <h1 class="font-bold text-sm text-gray-800">東京リサイクルマップ</h1>
          <p class="text-xs text-gray-400 mt-0.5">{facilities.length} 件表示中</p>
        </div>
        <button
          onclick={() => (sidebarOpen = false)}
          class="text-gray-400 hover:text-gray-700 transition-colors text-sm"
          aria-label="閉じる"
        >✕</button>
      </div>

      <!-- 区フィルタ -->
      <div class="px-4 py-3 border-b">
        {#each [...prefectureGroups.entries()] as [pref, wards]}
          <p class="text-xs font-semibold text-gray-400 mb-1.5">{wards[0].prefectureLabel}</p>
          <div class="flex flex-wrap gap-1.5">
            {#each wards as ward}
              {@const key = `${ward.prefecture}/${ward.city}`}
              {@const active = selectedCityKeys.includes(key)}
              <button
                onclick={() => toggleCity(key)}
                class="px-2.5 py-1 rounded-full text-xs font-medium border transition-all"
                class:bg-gray-800={active}
                class:text-white={active}
                class:border-gray-800={active}
                class:text-gray-500={!active}
                class:border-gray-300={!active}
              >{ward.cityLabel}</button>
            {/each}
          </div>
        {/each}
      </div>

      <!-- 品目フィルタ -->
      <div class="px-4 py-3 border-b">
        <p class="text-xs font-semibold text-gray-400 mb-1.5">品目</p>
        <CategoryFilter
          selected={selectedCategories}
          onchange={(v) => { selectedCategories = v; openPopupId = null; }}
        />
      </div>

      <!-- 施設一覧 -->
      <div class="flex-1 overflow-y-auto">
        {#each facilities as feature (feature.properties.id)}
          {@const { id, name, address, categories, hours, cityLabel } = feature.properties}
          {@const active = openPopupId === id}
          <button
            onclick={() => selectFacility(id)}
            class="w-full text-left px-4 py-3 border-b hover:bg-gray-50 transition-colors"
            class:bg-blue-50={active}
          >
            <div class="flex items-center gap-1 mb-1">
              <span class="text-xs text-gray-400">{cityLabel}</span>
              <span class="mx-1 text-gray-200">|</span>
              {#each categories as cat}
                <span
                  class="inline-block w-2 h-2 rounded-full"
                  style:background-color={CATEGORY_COLOR[cat]}
                  title={CATEGORY_LABEL[cat]}
                ></span>
              {/each}
            </div>
            <p class="text-sm font-medium leading-tight" class:text-blue-700={active}>{name}</p>
            <p class="text-xs text-gray-500 mt-0.5">{address}</p>
            {#if hours}
              <p class="text-xs text-gray-400 mt-0.5">{hours}</p>
            {/if}
          </button>
        {/each}
      </div>
    </aside>
  {/if}

  <!-- 地図エリア -->
  <div class="relative flex-1" style="height: 100vh;">
    {#if !sidebarOpen}
      <button
        onclick={() => (sidebarOpen = true)}
        class="absolute top-3 left-3 z-10 bg-white shadow-md rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
      >施設一覧</button>
    {/if}

    <MapLibre
      class="h-full w-full"
      style="https://tiles.openfreemap.org/styles/liberty"
      center={[139.745, 35.710]}
      zoom={12}
    >
      <NavigationControl position="top-right" />
      <GeolocateControl position="top-right" />
      <FullScreenControl position="top-right" />

      {#each facilities as feature (feature.properties.id)}
        {@const { id, name, address, categories, hours, notes, prefecture } = feature.properties}
        {@const gradId = pinGradientId(id)}
        {@const [lng, lat] = feature.geometry.coordinates}
        {@const stops = categories.map((cat, i) => ({
          color: CATEGORY_COLOR[cat],
          pct: Math.round((i / Math.max(categories.length - 1, 1)) * 100),
        }))}

        <Marker lnglat={[lng, lat]}>
          {#snippet content()}
            <button
              onclick={() => selectFacility(id)}
              onkeydown={(e) => e.key === 'Enter' && selectFacility(id)}
              title={name}
              style="background:none;border:none;padding:0;cursor:pointer;"
              class="hover:scale-110 active:scale-95 transition-transform origin-bottom block"
            >
              <svg width="28" height="38" viewBox="0 0 28 38" xmlns="http://www.w3.org/2000/svg"
                style="filter:drop-shadow(0 3px 5px rgba(0,0,0,0.4))">
                <defs>
                  <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
                    {#if stops.length === 1}
                      <stop offset="0%" stop-color={stops[0].color} stop-opacity="0.7"/>
                      <stop offset="100%" stop-color={stops[0].color}/>
                    {:else}
                      {#each stops as stop}
                        <stop offset="{stop.pct}%" stop-color={stop.color}/>
                      {/each}
                    {/if}
                  </linearGradient>
                  <radialGradient id="gloss-{gradId}" cx="38%" cy="28%" r="55%">
                    <stop offset="0%" stop-color="white" stop-opacity="0.5"/>
                    <stop offset="100%" stop-color="white" stop-opacity="0"/>
                  </radialGradient>
                </defs>
                <path
                  d="M14 1 C6.3 1 0 7.3 0 15 C0 24 14 37 14 37 C14 37 28 24 28 15 C28 7.3 21.7 1 14 1 Z"
                  fill="url(#{gradId})" stroke="white" stroke-width="1.5"
                />
                <path
                  d="M14 1 C6.3 1 0 7.3 0 15 C0 24 14 37 14 37 C14 37 28 24 28 15 C28 7.3 21.7 1 14 1 Z"
                  fill="url(#gloss-{gradId})"
                />
                <circle cx="14" cy="15" r="5" fill="white" opacity="0.85"/>
              </svg>
            </button>
          {/snippet}
        </Marker>

        {#if openPopupId === id}
          <Popup lnglat={[lng, lat]} onclose={() => (openPopupId = null)} closeButton={false} closeOnClick={false} maxWidth="none">
            <div class="relative w-72">
              <div class="h-2 rounded-t-[15px] overflow-hidden flex">
                {#each categories as cat}
                  <div class="flex-1" style:background-color={CATEGORY_COLOR[cat]}></div>
                {/each}
              </div>
              <div class="px-5 pt-4 pb-5">
                <div class="flex items-start justify-between gap-2 mb-2">
                  <p class="font-bold text-base leading-snug text-gray-800">{name}</p>
                  <button
                    onclick={() => (openPopupId = null)}
                    class="flex-shrink-0 w-6 h-6 rounded-full bg-black/8 hover:bg-black/15 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors text-xs leading-none"
                  >✕</button>
                </div>
                <p class="text-xs text-gray-400 mb-1">{prefLabelMap.get(prefecture) ?? prefecture}</p>
                <p class="text-sm text-gray-600 mb-3">{address}</p>
                <div class="flex flex-wrap gap-1.5 mb-3">
                  {#each categories as cat}
                    <span
                      class="px-2.5 py-0.5 rounded-full text-white text-xs font-medium shadow-sm"
                      style:background-color={CATEGORY_COLOR[cat]}
                    >{CATEGORY_LABEL[cat]}</span>
                  {/each}
                </div>
                {#if hours}<p class="text-xs text-gray-500 mt-0.5">{hours}</p>{/if}
                {#if notes}<p class="text-xs text-gray-400 mt-0.5">{notes}</p>{/if}
              </div>
            </div>
          </Popup>
        {/if}
      {/each}
    </MapLibre>
  </div>
</div>
