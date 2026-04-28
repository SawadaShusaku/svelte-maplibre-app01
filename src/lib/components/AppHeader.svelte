<script lang="ts">
  import { browser } from '$app/environment';
  import SearchBar from './SearchBar.svelte';
  import WardSelector from './WardSelector.svelte';
  import CategoryBar from './CategoryBar.svelte';
  import { getAvailableCategories } from '$lib/data.js';
  import { CATEGORY_LABEL } from '$lib/db/categories.js';
  import type { CategoryId } from '$lib/types.js';

  let {
    searchQuery = $bindable(""),
    searchResults = [],
    selectedKeys = $bindable([]),
    allKeys = [],
    selectedCategories = $bindable([]),
    allCategories = [],
    onSelectFacility,
    onMenuClick,
  } = $props<{
    searchQuery: string;
    searchResults: any[];
    selectedKeys: string[];
    allKeys: string[];
    selectedCategories: CategoryId[];
    allCategories: CategoryId[];
    onSelectFacility: (facility: any) => void;
    onMenuClick: () => void;
  }>();

  // 利用可能なカテゴリを動的に取得
  let availableCategories = $state<CategoryId[]>([]);
  
  $effect(() => {
    if (!browser) return;
    
    const wardIds = selectedKeys.map((key: string) => key.split('/')[1]);
    
    getAvailableCategories(wardIds).then(categories => {
      availableCategories = categories as CategoryId[];
      
      // 選択中のカテゴリで利用可能でないものを解除
      selectedCategories = selectedCategories.filter((cat: CategoryId) => 
        availableCategories.includes(cat)
      );
    });
  });
</script>

<div class="absolute top-0 left-0 w-full z-10 pointer-events-none p-3 sm:p-4">
  <!-- デスクトップ: 1段レイアウト -->
  <div class="hidden lg:flex items-center gap-3 w-full pointer-events-auto">
    <!-- ハンバーガーメニュー -->
    <button 
      onclick={onMenuClick}
      class="flex-shrink-0 w-11 h-11 sm:w-12 sm:h-12 bg-white/90 backdrop-blur-md rounded-lg shadow-md flex items-center justify-center text-gray-800 hover:bg-white transition-colors"
      aria-label="メニュー"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
      </svg>
    </button>

    <!-- 検索ボックス: 固定幅 -->
    <div class="flex-shrink-0 w-64 xl:w-80">
      <SearchBar bind:value={searchQuery} results={searchResults} onselect={onSelectFacility} />
    </div>

    <!-- 区選択プルダウン -->
    <WardSelector bind:selectedKeys allKeys={allKeys} />

    <!-- カテゴリ選択バー: 残りのスペースを埋める -->
    <div class="flex-1 min-w-0 overflow-hidden">
      <CategoryBar bind:selected={selectedCategories} categories={availableCategories} />
    </div>
  </div>

  <!-- タブレット: 2段レイアウト -->
  <div class="hidden md:flex lg:hidden flex-col gap-2 pointer-events-auto">
    <!-- 上段: ハンバーガー、検索、区選択 -->
    <div class="flex items-center gap-2">
      <button 
        onclick={onMenuClick}
        class="flex-shrink-0 w-11 h-11 bg-white/90 backdrop-blur-md rounded-lg shadow-md flex items-center justify-center text-gray-800 hover:bg-white transition-colors"
        aria-label="メニュー"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      <div class="flex-shrink-0 w-56">
        <SearchBar bind:value={searchQuery} results={searchResults} onselect={onSelectFacility} />
      </div>

      <WardSelector bind:selectedKeys allKeys={allKeys} />
    </div>

    <!-- 下段: カテゴリ -->
    <div class="w-full">
      <CategoryBar bind:selected={selectedCategories} categories={availableCategories} />
    </div>
  </div>

  <!-- スマホ: 2段レイアウト -->
  <div class="flex md:hidden flex-col gap-2 pointer-events-auto">
    <!-- 上段: ハンバーガー、検索、区選択 -->
    <div class="flex items-center gap-2">
      <button 
        onclick={onMenuClick}
        class="flex-shrink-0 w-10 h-10 bg-white/90 backdrop-blur-md rounded-lg shadow-md flex items-center justify-center text-gray-800 hover:bg-white transition-colors"
        aria-label="メニュー"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      <div class="flex-1 min-w-0">
        <SearchBar bind:value={searchQuery} results={searchResults} onselect={onSelectFacility} />
      </div>

      <div class="flex-shrink-0 ml-auto">
        <WardSelector bind:selectedKeys allKeys={allKeys} />
      </div>
    </div>

    <!-- 下段: カテゴリ -->
    <div class="w-full">
      <CategoryBar bind:selected={selectedCategories} categories={availableCategories} />
    </div>
  </div>
</div>
