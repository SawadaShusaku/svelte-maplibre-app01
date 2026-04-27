<script lang="ts">
  import { WARD_REGISTRY, groupByPrefecture } from '$lib/registry.js';
  
  let {
    selectedKeys = $bindable([]),
    allKeys = [],
  } = $props<{
    selectedKeys: string[];
    allKeys: string[];
  }>();

  const prefectureGroups = groupByPrefecture(WARD_REGISTRY);
  let open = $state(false);

  function toggleCity(key: string) {
    if (selectedKeys.length === 1 && selectedKeys[0] === key) {
      selectedKeys = [...allKeys];
    } else {
      selectedKeys = [key];
    }
    open = false;
  }

  let label = $derived(
    selectedKeys.length === allKeys.length
      ? "すべての区"
      : selectedKeys.length === 1
      ? WARD_REGISTRY.find(w => `${w.prefecture}/${w.city}` === selectedKeys[0])?.cityLabel || "選択中"
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
    <div class="absolute top-full left-0 mt-2 w-64 bg-white/95 backdrop-blur-md rounded-lg shadow-xl border border-white/50 p-3 z-50">
      <div class="max-h-80 overflow-y-auto">
        <button
          onclick={() => { selectedKeys = [...allKeys]; open = false; }}
          class="w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors {selectedKeys.length === allKeys.length ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}"
        >
          すべての区
        </button>
        <div class="h-px bg-gray-200 my-2"></div>
        {#each [...prefectureGroups.entries()] as [pref, wards]}
          <div class="text-xs font-bold text-gray-400 px-3 mt-2 mb-1">{wards[0].prefectureLabel}</div>
          {#each wards as ward}
            {@const key = `${ward.prefecture}/${ward.city}`}
            {@const active = selectedKeys.length === 1 && selectedKeys[0] === key}
            <button
              onclick={() => toggleCity(key)}
              class="w-full text-left px-3 py-2 rounded-md text-sm transition-colors {active ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-700 hover:bg-gray-100'}"
            >
              {ward.cityLabel}
            </button>
          {/each}
        {/each}
      </div>
    </div>
  {/if}
</div>
