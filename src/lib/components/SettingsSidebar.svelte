<script lang="ts">
  import brandLogo from '$lib/assets/logo.svg';
  import { SITE_NAME_EN, SITE_NAME_JA } from '$lib/site.js';
  import type { LogoFont, MarkerStyle } from '$lib/types.js';
  import {
    getMarkerStyle,
    setMarkerStyle,
    getSolidColor,
    setSolidColor,
  } from '$lib/marker-style.js';
  import {
    getLogoFont,
    setLogoFont,
    getLogoFontLabel,
  } from '$lib/font-style.js';

  let {
    open = $bindable(false),
    markerStyle = $bindable(getMarkerStyle()),
    solidColor = $bindable(getSolidColor()),
    logoFont = $bindable(getLogoFont()),
  } = $props<{
    open: boolean;
    markerStyle: MarkerStyle;
    solidColor: string;
    logoFont: LogoFont;
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

  const fontOptions: { value: LogoFont; label: string }[] = [
    { value: 'dela-gothic', label: getLogoFontLabel('dela-gothic') },
    { value: 'zen-kaku-gothic', label: getLogoFontLabel('zen-kaku-gothic') },
    { value: 'm-plus-rounded', label: getLogoFontLabel('m-plus-rounded') },
    { value: 'klee-one', label: getLogoFontLabel('klee-one') },
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

  function handleFontChange(font: LogoFont) {
    logoFont = font;
    setLogoFont(font);
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
    <button 
      onclick={() => (open = false)}
      class="absolute right-0 top-5 z-10 flex h-12 w-7 translate-x-full items-center justify-center rounded-r-xl border border-l-0 border-slate-200 bg-white/95 text-[#00766f] shadow-lg shadow-slate-900/10 backdrop-blur transition-colors hover:bg-slate-50 hover:text-slate-950"
      aria-label="サイドバーをしまう"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="m15 18-6-6 6-6" />
      </svg>
    </button>

    <div class="border-b border-slate-200 bg-white px-5 py-3">
      <div class="flex items-center justify-between gap-3">
        <div class="flex min-w-0 items-center gap-2.5">
          <img src={brandLogo} alt="" class="h-11 w-11 flex-shrink-0" />
          <div class="min-w-0">
            <p class="brand-display text-[0.8rem] leading-none tracking-[0.18em] text-[#00766f]">{SITE_NAME_EN.toUpperCase()}</p>
            <p class="brand-display brand-title-jp mt-0.5 text-[1.68rem] leading-none tracking-[-0.065em] text-slate-950">{SITE_NAME_JA}</p>
          </div>
          <h2 class="sr-only">表示設定と案内</h2>
        </div>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto px-4 py-3 space-y-5">
      <section class="space-y-2.5">
        <div class="px-2">
          <h3 class="text-sm font-black text-gray-800">表示設定</h3>
        </div>

        <div class="rounded-2xl border border-gray-100 bg-gray-50/80 px-4 py-3.5 shadow-sm">
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

        <div class="rounded-2xl border border-gray-100 bg-gray-50/80 px-4 py-3.5 shadow-sm mt-4">
          <div class="flex items-start justify-between gap-3">
            <h4 class="text-sm font-black text-gray-800">ロゴフォント</h4>
          </div>

          <div class="mt-4 space-y-2.5">
            {#each fontOptions as opt}
              <label class="flex items-center gap-3 rounded-xl bg-white px-3 py-3 shadow-sm ring-1 ring-gray-100 cursor-pointer transition-colors hover:bg-gray-50">
                <input
                  type="radio"
                  name="logo-font"
                  value={opt.value}
                  checked={logoFont === opt.value}
                  onchange={() => handleFontChange(opt.value)}
                  class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span class="text-sm font-medium text-gray-700">{opt.label}</span>
              </label>
            {/each}
          </div>
        </div>
      </section>

      <section class="space-y-2.5">
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

      <div class="mt-6 pt-5 border-t border-gray-100 px-4">
        <p class="text-xs text-gray-400 font-medium">© 2026 {SITE_NAME_EN}</p>
      </div>
    </div>
  </aside>
{/if}
