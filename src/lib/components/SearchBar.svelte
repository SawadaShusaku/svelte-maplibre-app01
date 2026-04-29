<script lang="ts">
  import { Search, X } from 'lucide-svelte';
  
  let {
    value = $bindable(""),
    results = [],
    onselect,
  } = $props<{
    value: string;
    results: any[];
    onselect: (result: any) => void;
  }>();

  let focused = $state(false);
  let inputValue = $state(value);
  let isComposing = $state(false);

  // 親からのvalueの変更を反映
  $effect(() => {
    if (value !== inputValue && !focused) {
      inputValue = value;
    }
  });

  function handleKeyDown(e: KeyboardEvent) {
    // 変換中は無視
    if (isComposing) return;
    
    // Enterキーで検索確定
    if (e.key === 'Enter') {
      e.preventDefault();
      value = inputValue;
    }
  }

  function handleClear() {
    inputValue = "";
    value = "";
  }
</script>

<div class="relative w-full flex-shrink-0">
  <div class="flex items-center bg-white rounded-lg shadow-md px-3 py-2.5 gap-2 border border-transparent focus-within:border-blue-500 transition-colors">
    <Search size={18} class="text-gray-400 flex-shrink-0" />
    <input
      type="text"
      bind:value={inputValue}
      onfocus={() => (focused = true)}
      onblur={() => setTimeout(() => (focused = false), 200)}
      onkeydown={handleKeyDown}
      oncompositionstart={() => (isComposing = true)}
      oncompositionend={() => (isComposing = false)}
      placeholder="新宿 乾電池"
      class="flex-1 bg-transparent border-none outline-none text-gray-800 placeholder-gray-400 font-medium text-sm min-w-0"
    />
    {#if inputValue}
      <button 
        onclick={handleClear} 
        class="flex-shrink-0 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="クリア"
      >
        <X size={16} />
      </button>
    {/if}
  </div>

  {#if focused && value && results.length > 0}
    <div class="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-md rounded-lg shadow-xl border border-white/50 max-h-96 overflow-y-auto z-50">
      {#each results as result}
        <button
          class="w-full text-left px-4 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
          onclick={() => onselect(result)}
        >
          <div class="text-sm font-bold text-gray-800">{result.properties.name}</div>
          <div class="text-xs text-gray-500 mt-0.5">{result.properties.address}</div>
        </button>
      {/each}
    </div>
  {/if}
  
  {#if focused && value && results.length === 0}
    <div class="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-md rounded-lg shadow-xl border border-white/50 p-4 text-center z-50">
      <div class="text-sm text-gray-500">一致する施設がありません</div>
    </div>
  {/if}
</div>
