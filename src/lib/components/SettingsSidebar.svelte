<script lang="ts">
  import { SITE_NAME_EN } from '$lib/site.js';
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

  type InfoMenuItem = {
    label: string;
    description?: string;
    href?: string;
    external?: boolean;
  };

  const styleOptions: { value: MarkerStyle; label: string }[] = [
    { value: 'adaptive', label: '同心円（デフォルト）' },
    { value: 'solid', label: '単色' },
    { value: 'gradient', label: 'グラデーション' },
  ];

  const infoMenuItems: InfoMenuItem[] = [
    {
      label: '使い方',
      href: '/usage',
    },
    {
      label: 'データについて',
    },
    {
      label: '更新情報',
    },
    {
      label: 'プライバシーポリシー',
    },
  ];

  function handleStyleChange(style: MarkerStyle) {
    markerStyle = style;
    setMarkerStyle(style);
  }

  function handleSolidColorChange(color: string) {
    solidColor = color;
    setSolidColor(color);
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
    class="fixed top-0 left-0 bottom-0 w-[min(22rem,calc(100vw-1rem))] bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 transform translate-x-0"
  >
    <div class="p-6 border-b border-gray-100 flex items-center justify-between">
      <h2 class="text-xl font-black text-gray-800">表示設定と案内</h2>
      <button 
        onclick={() => (open = false)}
        class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors"
      >
        ✕
      </button>
    </div>

    <div class="flex-1 overflow-y-auto p-4 space-y-6">
      <section class="space-y-3">
        <div class="px-2">
          <h3 class="text-sm font-black text-gray-800">表示設定</h3>
        </div>

        <div class="rounded-2xl border border-gray-100 bg-gray-50/80 px-4 py-4 shadow-sm">
          <div class="flex items-start justify-between gap-3">
            <h4 class="text-sm font-black text-gray-800">マーカーデザイン</h4>
          </div>

          <div class="mt-4 space-y-2.5">
            {#each styleOptions as opt}
              <label class="flex items-center gap-3 rounded-xl bg-white px-3 py-3 shadow-sm ring-1 ring-gray-100 cursor-pointer transition-colors hover:bg-gray-50">
                <input
                  type="radio"
                  name="marker-style"
                  value={opt.value}
                  checked={markerStyle === opt.value}
                  onchange={() => handleStyleChange(opt.value)}
                  class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span class="text-sm font-medium text-gray-700">{opt.label}</span>
              </label>
            {/each}
          </div>

          {#if markerStyle === 'solid'}
            <div class="mt-4 flex items-center justify-between gap-3 rounded-xl border border-dashed border-gray-200 bg-white px-3 py-3">
              <label for="solid-color" class="text-sm font-medium text-gray-600">単色マーカーの色</label>
              <div class="flex items-center gap-2">
                <input
                  id="solid-color"
                  type="color"
                  value={solidColor}
                  oninput={(e) => handleSolidColorChange(e.currentTarget.value)}
                  class="h-9 w-9 rounded cursor-pointer border border-gray-200 bg-transparent"
                />
                <span class="text-xs text-gray-400 font-mono">{solidColor}</span>
              </div>
            </div>
          {/if}
        </div>
      </section>

      <section class="space-y-3">
        <div class="px-2">
          <h3 class="text-sm font-black text-gray-800">情報・ヘルプ</h3>
        </div>

        <div class="space-y-2">
          {#each infoMenuItems as item}
            {@const available = Boolean(item.href)}
            {#if available}
              <a
                href={item.href}
                target={item.external ? '_blank' : undefined}
                rel={item.external ? 'noopener noreferrer' : undefined}
                class="group flex w-full items-start justify-between gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-3 text-left shadow-sm transition-colors hover:bg-gray-50"
              >
                <div class="min-w-0">
                  <span class="text-sm font-bold text-gray-800">{item.label}</span>
                  {#if item.description}
                    <p class="mt-1 text-xs leading-5 text-gray-500">{item.description}</p>
                  {/if}
                </div>
                <span class="mt-1 text-gray-300 transition-colors group-hover:text-gray-500">›</span>
              </a>
            {:else}
              <div
                class="flex w-full items-start justify-between gap-3 rounded-2xl border border-gray-100 bg-gray-50/70 px-4 py-3 text-left shadow-sm"
                aria-hidden="true"
              >
                <div class="min-w-0">
                  <span class="text-sm font-bold text-gray-500">{item.label}</span>
                  {#if item.description}
                    <p class="mt-1 text-xs leading-5 text-gray-400">{item.description}</p>
                  {/if}
                </div>
                <span class="mt-1 text-gray-200">›</span>
              </div>
            {/if}
          {/each}
        </div>
      </section>

      <div class="mt-8 pt-6 border-t border-gray-100 px-4">
        <p class="text-xs text-gray-400 font-medium">© 2026 {SITE_NAME_EN}</p>
      </div>
    </div>
  </aside>
{/if}
