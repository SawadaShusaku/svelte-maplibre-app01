<script lang="ts">
  import type { AreaScope, PublicArea } from '$lib/data.js';
  
  let {
    selectedKeys = $bindable([]),
    allKeys = [],
    areaScope = $bindable('all'),
    areas = [],
  } = $props<{
    selectedKeys: string[];
    allKeys: string[];
    areaScope: AreaScope;
    areas: PublicArea[];
  }>();

  const prefectureGroups = $derived.by(() => {
    const groups = new Map<string, PublicArea[]>();
    for (const area of areas) {
      const list = groups.get(area.prefecture) ?? [];
      list.push(area);
      groups.set(area.prefecture, list);
    }
    return [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0], 'ja'));
  });
  let open = $state(false);

  function toggleCity(key: string) {
    areaScope = 'selected';
    if (selectedKeys.length === 1 && selectedKeys[0] === key) {
      selectedKeys = [];
    } else {
      selectedKeys = [key];
    }
    open = false;
  }

  function showNationwide() {
    areaScope = 'all';
    selectedKeys = [];
    open = false;
  }

  let label = $derived(
    areaScope === 'all'
      ? "全国"
      : selectedKeys.length === 0
      ? "選択なし"
      : selectedKeys.length === 1
      ? areas.find((area: PublicArea) => `${area.prefecture}/${area.id}` === selectedKeys[0])?.city_label || "選択中"
      : "複数選択"
  );
</script>

<div class="relative flex-shrink-0">
  <button
    onclick={() => (open = !open)}
    class="flex items-center gap-2 bg-white/90 backdrop-blur-md rounded-lg shadow-md px-4 py-3 text-sm font-bold text-gray-800 hover:bg-white transition-colors"
  >
    {label}
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-500 {open ? 'rotate-180' : ''} transition-transform">
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  </button>

  {#if open}
    <div class="absolute top-full right-0 mt-2 w-64 bg-white/95 backdrop-blur-md rounded-lg shadow-xl border border-white/50 p-3 z-50">
      <div class="max-h-80 overflow-y-auto">
        <button
          onclick={showNationwide}
          class="w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors {areaScope === 'all' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}"
        >
          全国
        </button>
        <div class="h-px bg-gray-200 my-2"></div>
        {#each prefectureGroups as [prefecture, prefectureAreas]}
          <div class="text-xs font-bold text-gray-400 px-3 mt-2 mb-1">{prefecture}</div>
          {#each prefectureAreas as area}
            {@const key = `${area.prefecture}/${area.id}`}
            {@const active = areaScope === 'selected' && selectedKeys.length === 1 && selectedKeys[0] === key}
            <button
              onclick={() => toggleCity(key)}
              class="w-full text-left px-3 py-2 rounded-md text-sm transition-colors {active ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-700 hover:bg-gray-100'}"
            >
              {area.city_label}
            </button>
          {/each}
        {/each}
      </div>
    </div>
  {/if}
</div>
