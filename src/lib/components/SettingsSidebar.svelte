<script lang="ts">
  import type { MarkerStyle } from '$lib/types.js';
  import {
    getMarkerStyle,
    setMarkerStyle,
    getSolidColor,
    setSolidColor,
  } from '$lib/marker-style.js';

  let {
    open = $bindable(false),
    markerStyle = $bindable(getMarkerStyle()),
    solidColor = $bindable(getSolidColor()),
  } = $props<{
    open: boolean;
    markerStyle: MarkerStyle;
    solidColor: string;
  }>();

  let expanded = $state(false);

  const styleOptions: { value: MarkerStyle; label: string }[] = [
    { value: 'adaptive', label: '同心円（デフォルト）' },
    { value: 'solid', label: '単色' },
    { value: 'gradient', label: 'グラデーション' },
  ];

  function handleStyleChange(style: MarkerStyle) {
    markerStyle = style;
    setMarkerStyle(style);
  }

  function handleSolidColorChange(color: string) {
    solidColor = color;
    setSolidColor(color);
  }

  function handlePlaceholderClick() {
    open = false;
  }
</script>

{#if open}
  <!-- バックグラウンドのオーバーレイ -->
  <div 
    class="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity"
    onclick={() => (open = false)}
    role="button"
    tabindex="0"
    onkeydown={(e) => e.key === 'Escape' && (open = false)}
    aria-label="閉じる"
  ></div>

  <!-- サイドバー本体 -->
  <aside 
    class="fixed top-0 left-0 bottom-0 w-80 bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 transform translate-x-0"
  >
    <div class="p-6 border-b border-gray-100 flex items-center justify-between">
      <h2 class="text-xl font-black text-gray-800">設定・メニュー</h2>
      <button 
        onclick={() => (open = false)}
        class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors"
      >
        ✕
      </button>
    </div>

    <div class="flex-1 overflow-y-auto p-4 space-y-2">
      <!-- マーカーデザイン設定 -->
      <div class="px-4 py-3">
        <button
          type="button"
          onclick={() => (expanded = !expanded)}
          class="flex items-center justify-between w-full text-left group"
          aria-expanded={expanded}
        >
          <h3 class="text-sm font-black text-gray-800 group-hover:text-gray-900 transition-colors">マーカーデザイン</h3>
          <span class="text-gray-400 transition-transform duration-200" class:rotate-90={expanded}>▶</span>
        </button>

        {#if expanded}
          <div class="mt-3 space-y-3">
            <div class="space-y-2">
              {#each styleOptions as opt}
                <label class="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="marker-style"
                    value={opt.value}
                    checked={markerStyle === opt.value}
                    onchange={() => handleStyleChange(opt.value)}
                    class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span class="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">{opt.label}</span>
                </label>
              {/each}
            </div>

            {#if markerStyle === 'solid'}
              <div class="flex items-center gap-3 pt-2 border-t border-gray-100">
                <label for="solid-color" class="text-sm text-gray-600">色を選択:</label>
                <div class="flex items-center gap-2">
                  <input
                    id="solid-color"
                    type="color"
                    value={solidColor}
                    oninput={(e) => handleSolidColorChange(e.currentTarget.value)}
                    class="w-8 h-8 rounded cursor-pointer border border-gray-200"
                  />
                  <span class="text-xs text-gray-400 font-mono">{solidColor}</span>
                </div>
              </div>
            {/if}
          </div>
        {/if}
      </div>

      <div class="border-t border-gray-100 my-2"></div>

      <!-- メニュー項目例 -->
      <button
        type="button"
        onclick={handlePlaceholderClick}
        class="block w-full px-4 py-3 rounded-lg text-left text-gray-700 font-bold hover:bg-gray-50 transition-colors"
      >
        アプリについて
      </button>
      <button
        type="button"
        onclick={handlePlaceholderClick}
        class="block w-full px-4 py-3 rounded-lg text-left text-gray-700 font-bold hover:bg-gray-50 transition-colors"
      >
        データ提供元 (オープンデータ)
      </button>
      <button
        type="button"
        onclick={handlePlaceholderClick}
        class="block w-full px-4 py-3 rounded-lg text-left text-gray-700 font-bold hover:bg-gray-50 transition-colors"
      >
        プライバシーポリシー
      </button>

      <div class="mt-8 pt-6 border-t border-gray-100 px-4">
        <p class="text-xs text-gray-400 font-medium">© 2026 Recycle Map Tokyo</p>
      </div>
    </div>
  </aside>
{/if}
