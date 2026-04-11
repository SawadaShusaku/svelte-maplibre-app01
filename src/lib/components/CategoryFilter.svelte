<script lang="ts">
  import { CATEGORIES } from '$lib/categories.js';
  import type { CategoryId } from '$lib/types.js';

  interface Props {
    selected: CategoryId[];
    onchange: (selected: CategoryId[]) => void;
  }

  let { selected, onchange }: Props = $props();

  function toggle(id: CategoryId) {
    // 既にその品目だけ選択中 → 全品目を戻す
    if (selected.length === 1 && selected[0] === id) {
      onchange(CATEGORIES.map((c) => c.id));
    } else {
      // それ以外を非表示にしてその品目だけ表示
      onchange([id]);
    }
  }

  function toggleAll() {
    const allSelected = CATEGORIES.every((c) => selected.includes(c.id));
    onchange(allSelected ? [] : CATEGORIES.map((c) => c.id));
  }

  const allSelected = $derived(CATEGORIES.every((c) => selected.includes(c.id)));
</script>

<div class="flex flex-col gap-1">
  {#each CATEGORIES as cat}
    {@const active = selected.includes(cat.id)}
    <button
      onclick={() => toggle(cat.id)}
      class="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm font-medium transition-all text-left"
      style:background-color={active ? `${cat.color}18` : 'transparent'}
      style:color={active ? cat.color : '#9ca3af'}
    >
      <span
        class="w-3 h-3 rounded-full flex-shrink-0 transition-all"
        style:background-color={active ? cat.color : '#e5e7eb'}
        style:box-shadow={active ? `0 0 0 3px ${cat.color}30` : 'none'}
      ></span>
      {cat.label}
      {#if !active}
        <span class="ml-auto text-xs text-gray-300">非表示</span>
      {/if}
    </button>
  {/each}

  <button
    onclick={toggleAll}
    class="mt-1 text-xs text-gray-400 hover:text-gray-600 transition-colors text-center py-1"
  >
    {allSelected ? 'すべて解除' : 'すべて選択'}
  </button>
</div>
