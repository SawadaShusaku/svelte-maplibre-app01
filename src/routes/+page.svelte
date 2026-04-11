<script lang="ts">
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
  import { getFacilities } from '$lib/data.js';
  import type { CategoryId } from '$lib/types.js';

  const allCategories: CategoryId[] = ['battery', 'fluorescent', 'cooking-oil', 'ink-cartridge', 'small-appliance'];

  let selectedCategories = $state<CategoryId[]>([...allCategories]);
  let openPopupId = $state<string | null>(null);
  let sidebarOpen = $state(true);

  const facilities = $derived(getFacilities(selectedCategories));

  function selectFacility(id: string) {
    openPopupId = openPopupId === id ? null : id;
  }
</script>

<div class="flex h-screen w-full overflow-hidden">
  <!-- サイドバー -->
  {#if sidebarOpen}
    <aside class="w-72 flex-shrink-0 flex flex-col bg-white shadow-lg z-10 overflow-hidden">
      <!-- ヘッダー -->
      <div class="flex items-center justify-between px-4 py-3 border-b">
        <h1 class="font-bold text-base">豊島区リサイクルマップ</h1>
        <button
          onclick={() => (sidebarOpen = false)}
          class="text-gray-400 hover:text-gray-700 transition-colors"
          aria-label="サイドバーを閉じる"
        >✕</button>
      </div>

      <!-- フィルタ -->
      <div class="px-3 py-3 border-b">
        <p class="text-xs text-gray-500 mb-2">品目で絞り込む</p>
        <CategoryFilter
          selected={selectedCategories}
          onchange={(v) => { selectedCategories = v; openPopupId = null; }}
        />
      </div>

      <!-- 施設一覧 -->
      <div class="flex-1 overflow-y-auto">
        <p class="text-xs text-gray-400 px-4 py-2">{facilities.length} 件</p>
        {#each facilities as feature (feature.properties.id)}
          {@const { id, name, address, categories, hours } = feature.properties}
          {@const active = openPopupId === id}
          <button
            onclick={() => selectFacility(id)}
            class="w-full text-left px-4 py-3 border-b hover:bg-gray-50 transition-colors"
            class:bg-blue-50={active}
          >
            <!-- カテゴリドット -->
            <div class="flex gap-1 mb-1">
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
              <p class="text-xs text-gray-400 mt-0.5">⏰ {hours}</p>
            {/if}
          </button>
        {/each}
      </div>
    </aside>
  {/if}

  <!-- 地図エリア -->
  <div class="relative flex-1">
    <!-- サイドバーが閉じているときの開くボタン -->
    {#if !sidebarOpen}
      <button
        onclick={() => (sidebarOpen = true)}
        class="absolute top-3 left-3 z-10 bg-white shadow-md rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
        aria-label="サイドバーを開く"
      >☰ 施設一覧</button>
    {/if}

    <MapLibre
      class="h-full w-full"
      style="https://tiles.openfreemap.org/styles/liberty"
      center={[139.717, 35.728]}
      zoom={13}
    >
      <NavigationControl position="top-right" />
      <GeolocateControl position="top-right" />
      <FullScreenControl position="top-right" />

      {#each facilities as feature (feature.properties.id)}
        {@const { id, name, address, categories, hours, notes } = feature.properties}
        {@const color = CATEGORY_COLOR[categories[0]]}
        {@const [lng, lat] = feature.geometry.coordinates}

        <Marker lnglat={[lng, lat]}>
          {#snippet content()}
            <button
              onclick={() => selectFacility(id)}
              onkeydown={(e) => e.key === 'Enter' && selectFacility(id)}
              title={name}
              class="cursor-pointer hover:scale-110 active:scale-95 transition-transform origin-bottom block"
              style="background:none;border:none;padding:0;"
            >
              <svg width="28" height="38" viewBox="0 0 28 38" xmlns="http://www.w3.org/2000/svg" style="filter:drop-shadow(0 3px 4px rgba(0,0,0,0.35))">
                <defs>
                  <radialGradient id="grad-{id}" cx="38%" cy="32%" r="60%">
                    <stop offset="0%" stop-color="white" stop-opacity="0.45"/>
                    <stop offset="100%" stop-color={color} stop-opacity="1"/>
                  </radialGradient>
                </defs>
                <!-- ピン本体 -->
                <path
                  d="M14 1 C6.3 1 0 7.3 0 15 C0 24 14 37 14 37 C14 37 28 24 28 15 C28 7.3 21.7 1 14 1 Z"
                  fill="url(#grad-{id})"
                  stroke="white"
                  stroke-width="1.5"
                />
                <!-- 中央の白丸 -->
                <circle cx="14" cy="15" r="5" fill="white" opacity="0.9"/>
              </svg>
            </button>
          {/snippet}
        </Marker>

        {#if openPopupId === id}
          <Popup lnglat={[lng, lat]} onclose={() => (openPopupId = null)} closeButton={true}>
            <div class="p-2 min-w-48 max-w-64 text-sm">
              <p class="font-bold text-base mb-1">{name}</p>
              <p class="text-gray-600 mb-1">{address}</p>
              <div class="flex flex-wrap gap-1 mb-1">
                {#each categories as cat}
                  <span
                    class="px-1.5 py-0.5 rounded text-white text-xs"
                    style:background-color={CATEGORY_COLOR[cat]}
                  >{CATEGORY_LABEL[cat]}</span>
                {/each}
              </div>
              {#if hours}<p class="text-gray-500 text-xs">⏰ {hours}</p>{/if}
              {#if notes}<p class="text-gray-500 text-xs">📝 {notes}</p>{/if}
            </div>
          </Popup>
        {/if}
      {/each}
    </MapLibre>
  </div>
</div>
