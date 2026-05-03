<script lang="ts">
  import brandLogo from '$lib/assets/logo.svg';
  import { SITE_NAME_EN, SITE_NAME_JA } from '$lib/site.js';
  import type { FontTarget, LogoFont, MarkerStyle } from '$lib/types.js';
  import {
    getMarkerStyle,
    setMarkerStyle,
    getSolidColor,
    setSolidColor,
  } from '$lib/marker-style.js';
  import {
    getFontChoice,
    setFontChoice,
    getLogoFontLabel,
  } from '$lib/font-style.js';

  let {
    open = $bindable(false),
    markerStyle = $bindable(getMarkerStyle()),
    solidColor = $bindable(getSolidColor()),
  } = $props<{
    open: boolean;
    markerStyle: MarkerStyle;
    solidColor: string;
  }>();

  type Section = 'home' | 'marker' | 'fonts';

  let currentSection = $state<Section>('home');

  // Font state managed internally via CSS variables
  let logoFont = $state<LogoFont>(getFontChoice('logo'));
  let popupFont = $state<LogoFont>(getFontChoice('popup'));
  let uiFont = $state<LogoFont>(getFontChoice('ui'));

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

  const fontOptions: LogoFont[] = [
    'dela-gothic',
    'zen-kaku-gothic',
    'm-plus-rounded',
    'klee-one',
  ];

  const fontTargets: { key: FontTarget; label: string }[] = [
    { key: 'logo', label: 'ロゴフォント' },
    { key: 'popup', label: 'ポップアップフォント' },
    { key: 'ui', label: 'UIフォント' },
  ];

  const infoMenuItems: InfoMenuItem[] = [
    { label: '使い方', href: '/usage' },
    { label: 'データについて' },
    { label: '更新情報' },
    { label: 'プライバシーポリシー' },
  ];

  const settingSections = [
    { id: 'marker' as Section, label: 'マーカーデザイン', description: 'マーカーの色とデザイン' },
    { id: 'fonts' as Section, label: 'フォント設定', description: 'ロゴ・ポップアップ・UIのフォント' },
  ];

  function handleStyleChange(style: MarkerStyle) {
    markerStyle = style;
    setMarkerStyle(style);
  }

  function handleSolidColorChange(color: string) {
    solidColor = color;
    setSolidColor(color);
  }

  function handleFontChange(target: FontTarget, font: LogoFont) {
    if (target === 'logo') logoFont = font;
    if (target === 'popup') popupFont = font;
    if (target === 'ui') uiFont = font;
    setFontChoice(target, font);
  }

  function goHome() {
    currentSection = 'home';
  }

  function goSection(section: Section) {
    currentSection = section;
  }

  function getFontPreviewStyle(font: LogoFont): string {
    const map: Record<LogoFont, string> = {
      'dela-gothic': '"Dela Gothic One"',
      'zen-kaku-gothic': '"Zen Kaku Gothic New"',
      'm-plus-rounded': '"M PLUS Rounded 1c"',
      'klee-one': '"Klee One"',
    };
    return `font-family: ${map[font]}, sans-serif;`;
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

    <!-- ロゴヘッダー -->
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
      {#if currentSection === 'home'}
        <!-- ホームビュー: セクション一覧 -->
        <section class="space-y-2.5">
          <div class="px-2">
            <h3 class="text-sm font-black text-gray-800">表示設定</h3>
          </div>

          <div class="space-y-2">
            {#each settingSections as sec}
              <button
                onclick={() => goSection(sec.id)}
                class="group flex w-full items-start justify-between gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-3 text-left shadow-sm transition-colors hover:bg-gray-50"
              >
                <div class="min-w-0">
                  <span class="text-sm font-bold text-gray-800">{sec.label}</span>
                  <p class="mt-0.5 text-xs leading-5 text-gray-500">{sec.description}</p>
                </div>
                <span class="mt-1 text-gray-300 transition-colors group-hover:text-gray-500">›</span>
              </button>
            {/each}
          </div>
        </section>

        <!-- 情報・ヘルプ -->
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

      {:else if currentSection === 'marker'}
        <!-- マーカーデザイン詳細 -->
        <div class="space-y-2">
          <button
            onclick={goHome}
            class="inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            戻る
          </button>
          <h3 class="text-base font-black text-gray-900">マーカーデザイン</h3>
        </div>

        <div class="rounded-2xl border border-gray-100 bg-gray-50/80 px-4 py-3.5 shadow-sm">
          <div class="mt-2 space-y-2.5">
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

      {:else if currentSection === 'fonts'}
        <!-- フォント設定詳細 -->
        <div class="space-y-2">
          <button
            onclick={goHome}
            class="inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            戻る
          </button>
          <h3 class="text-base font-black text-gray-900">フォント設定</h3>
        </div>

        <div class="space-y-5">
          {#each fontTargets as ft}
            {@const currentValue = ft.key === 'logo' ? logoFont : ft.key === 'popup' ? popupFont : uiFont}
            <div class="rounded-2xl border border-gray-100 bg-gray-50/80 px-4 py-3.5 shadow-sm">
              <h4 class="text-sm font-black text-gray-800 mb-3">{ft.label}</h4>
              <div class="space-y-2.5">
                {#each fontOptions as opt}
                  <label
                    class="flex items-center gap-3 rounded-xl bg-white px-3 py-3 shadow-sm ring-1 ring-gray-100 cursor-pointer transition-colors hover:bg-gray-50"
                    style={getFontPreviewStyle(opt)}
                  >
                    <input
                      type="radio"
                      name="font-{ft.key}"
                      value={opt}
                      checked={currentValue === opt}
                      onchange={() => handleFontChange(ft.key, opt)}
                      class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 flex-shrink-0"
                    />
                    <span class="text-sm font-medium text-gray-700">{getLogoFontLabel(opt)}</span>
                  </label>
                {/each}
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </aside>
{/if}
