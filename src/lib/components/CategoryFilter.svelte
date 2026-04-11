<script lang="ts">
  import { CATEGORIES } from '$lib/categories.js';
  import type { CategoryId } from '$lib/types.js';

  interface Props {
    selected: CategoryId[];
    onchange: (selected: CategoryId[]) => void;
  }

  let { selected, onchange }: Props = $props();

  function toggle(id: CategoryId) {
    const next = selected.includes(id)
      ? selected.filter((c) => c !== id)
      : [...selected, id];
    onchange(next);
  }
</script>

<div class="flex flex-wrap gap-2 p-3 bg-white/90 backdrop-blur rounded-xl shadow-lg">
  {#each CATEGORIES as cat}
    {@const active = selected.includes(cat.id)}
    <button
      onclick={() => toggle(cat.id)}
      class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-all"
      style:border-color={cat.color}
      style:background-color={active ? cat.color : 'transparent'}
      style:color={active ? 'white' : cat.color}
    >
      <span class="w-2 h-2 rounded-full" style:background-color={active ? 'white' : cat.color}></span>
      {cat.label}
    </button>
  {/each}
</div>
