<script lang="ts">
  import { Battery, BatteryCharging, Lightbulb, Droplet, Printer, Smartphone, Shirt, Package, Box, Recycle, ChevronLeft, ChevronRight } from 'lucide-svelte';
  import { CATEGORY_COLOR, CATEGORY_LABEL } from '$lib/db/categories.js';
  import type { CategoryId } from '$lib/types.js';

  let {
    selected = $bindable([]),
    categories = [],
  } = $props<{
    selected: CategoryId[];
    categories: CategoryId[];
  }>();

  let scrollContainer = $state<HTMLDivElement | null>(null);
  let canScrollLeft = $state(false);
  let canScrollRight = $state(false);

  function checkScroll() {
    if (scrollContainer) {
      canScrollLeft = scrollContainer.scrollLeft > 0;
      canScrollRight = scrollContainer.scrollLeft < scrollContainer.scrollWidth - scrollContainer.clientWidth - 1;
    }
  }

  // カテゴリが変更されたときやコンテナがマウントされたときにスクロールチェックを実行
  $effect(() => {
    // categoriesの長さに依存させて、カテゴリが更新されたときにチェックが実行されるようにする
    const _ = categories.length;
    // DOMが更新されるのを待ってからチェック
    setTimeout(checkScroll, 0);
  });

  function scroll(direction: 'left' | 'right') {
    if (scrollContainer) {
      const scrollAmount = 200;
      scrollContainer.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  }

  function toggle(cat: CategoryId) {
    const isAllSelected = categories.every((c: CategoryId) => selected.includes(c));
    
    if (isAllSelected) {
      // All selected → click one to filter to only that category
      selected = [cat];
    } else if (selected.includes(cat)) {
      // Only this one selected → click to show all again
      selected = [...categories];
    } else {
      // Select only this category (switch from another single-select)
      selected = [cat];
    }
  }

  const CATEGORY_ICON: Record<CategoryId, typeof Battery> = {
    'rechargeable-battery': Battery,
    'e-bike-rechargeable-battery': BatteryCharging,
    'button-battery': Battery,
    'dry-battery': Battery,
    'small-appliance': Smartphone,
    'fluorescent': Lightbulb,
    'ink-cartridge': Printer,
    'cooking-oil': Droplet,
    'used-clothing': Shirt,
    'paper-pack': Package,
    'styrofoam': Box,
    'heated-tobacco-device': Recycle,
  };
</script>

<div class="relative flex items-center">
  <!-- 左スクロールボタン -->
  {#if canScrollLeft}
    <button
      onclick={() => scroll('left')}
      class="absolute left-0 z-10 w-9 h-9 rounded-full bg-white shadow-lg border-2 border-gray-200 flex items-center justify-center text-blue-600 hover:bg-blue-50 hover:border-gray-300 transition-all"
      aria-label="左にスクロール"
    >
      <ChevronLeft size={20} strokeWidth={2.5} />
    </button>
  {/if}

  <!-- カテゴリリスト -->
  <div
    bind:this={scrollContainer}
    onscroll={checkScroll}
    class="flex-1 overflow-x-auto whitespace-nowrap hide-scrollbar flex gap-2 pb-2 -mb-2 items-center px-1"
  >
    {#if categories.length === 0}
      <!-- 空状態 -->
      <div class="text-sm text-gray-500 px-4 py-2">
        この区では回収カテゴリが設定されていません
      </div>
    {:else}
      {#each categories as cat (cat)}
        {@const typedCat = cat as CategoryId}
        {@const isAllSelected = categories.every((c: CategoryId) => selected.includes(c))}
        {@const isActive = isAllSelected || selected.includes(typedCat)}
        {@const catColor = CATEGORY_COLOR[typedCat]}
        {@const IconComponent = CATEGORY_ICON[typedCat]}
        <button
          onclick={() => toggle(typedCat)}
          class="flex-shrink-0 flex items-center px-3 py-1 rounded-full font-bold text-base transition-all tracking-wide border-0"
          class:shadow-md={isActive}
          class:backdrop-blur-sm={isActive}
          style:background-color={isActive ? 'rgba(255, 255, 255, 0.58)' : 'rgba(255, 255, 255, 0.08)'}
          style:color={isActive ? '#1f2937' : '#6b7280'}
          style:opacity={isActive ? '1' : '0.7'}
        >
          <span
            class="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
            style:background-color={isActive ? catColor : 'rgba(156, 163, 175, 0.3)'}
            style:color={isActive ? '#ffffff' : '#9ca3af'}
          >
            <IconComponent size={18} strokeWidth={2.5} />
          </span>
          <span class="ml-1.5">{CATEGORY_LABEL[typedCat]}</span>
        </button>
      {/each}
    {/if}
  </div>

  <!-- 右スクロールボタン -->
  {#if canScrollRight}
    <button
      onclick={() => scroll('right')}
      class="absolute right-0 z-10 w-9 h-9 rounded-full bg-white shadow-lg border-2 border-gray-200 flex items-center justify-center text-blue-600 hover:bg-blue-50 hover:border-gray-300 transition-all"
      aria-label="右にスクロール"
    >
      <ChevronRight size={20} strokeWidth={2.5} />
    </button>
  {/if}
</div>

<style>
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
</style>
