<script lang="ts">
  import type { CategoryId, MarkerStyle } from '$lib/types.js';
  import {
    getEffectiveMode,
    getMarkerColors,
    buildPieSegments,
    buildGradientStops,
  } from '$lib/marker-utils.js';

  let {
    categories,
    style,
    id,
    solidColor,
  }: {
    categories: CategoryId[];
    style: MarkerStyle;
    id: string;
    solidColor?: string;
  } = $props();

  const pinPath =
    'M16 1 C7.2 1 0 8.2 0 17 C0 27 16 41 16 41 C16 41 32 27 32 17 C32 8.2 24.8 1 16 1 Z';

  const safeId = $derived(id.replace(/[^a-z0-9]/gi, '-'));
  const gradId = $derived(`pin-grad-${safeId}`);
  const highlightId = $derived(`pin-highlight-${safeId}`);

  const colors = $derived(getMarkerColors(categories));
  const effectiveMode = $derived(getEffectiveMode(style, categories.length));
  const primaryColor = $derived(
    style === 'solid' && solidColor
      ? solidColor
      : colors[0] ?? '#9ca3af'
  );
  const ringSegments = $derived(
    effectiveMode === 'ring'
      ? buildPieSegments(colors, 16, 17, 25)
      : []
  );
  const gradientStops = $derived(
    effectiveMode === 'gradient' ? buildGradientStops(colors) : []
  );
</script>

<svg
  width="27"
  height="35"
  viewBox="0 0 32 42"
  xmlns="http://www.w3.org/2000/svg"
  style="filter: drop-shadow(0 2px 3px rgba(0,0,0,0.15))"
>
  <defs>
    {#if effectiveMode === 'gradient'}
      <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
        {#each gradientStops as stop}
          <stop offset="{stop.pct}%" stop-color={stop.color} stop-opacity="0.95" />
        {/each}
      </linearGradient>
    {/if}
    <linearGradient id={highlightId} x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="white" stop-opacity="0.8" />
      <stop offset="35%" stop-color="white" stop-opacity="0.1" />
      <stop offset="100%" stop-color="white" stop-opacity="0" />
    </linearGradient>
    <clipPath id="pin-clip-{safeId}">
      <path d={pinPath} />
    </clipPath>
    {#if effectiveMode === 'split'}
      <clipPath id="left-half-{safeId}">
        <rect x="0" y="0" width="16" height="42" />
      </clipPath>
      <clipPath id="right-half-{safeId}">
        <rect x="16" y="0" width="16" height="42" />
      </clipPath>
    {/if}
  </defs>

  <!-- ピン本体 -->
  {#if effectiveMode === 'solid'}
    <path
      d={pinPath}
      fill={primaryColor}
      stroke="rgba(180,180,180,0.5)"
      stroke-width="2.0"
    />
  {:else if effectiveMode === 'split'}
    <path
      d={pinPath}
      fill={colors[0]}
      stroke="rgba(180,180,180,0.5)"
      stroke-width="2.0"
      clip-path="url(#left-half-{safeId})"
    />
    <path
      d={pinPath}
      fill={colors[1]}
      stroke="rgba(180,180,180,0.5)"
      stroke-width="2.0"
      clip-path="url(#right-half-{safeId})"
    />
    <path
      d={pinPath}
      fill="none"
      stroke="rgba(180,180,180,0.5)"
      stroke-width="2.0"
    />
  {:else if effectiveMode === 'ring'}
    <g clip-path="url(#pin-clip-{safeId})">
      {#each ringSegments as seg}
        <path d={seg.path} fill={seg.color} />
      {/each}
    </g>
    <path
      d={pinPath}
      fill="none"
      stroke="rgba(180,180,180,0.5)"
      stroke-width="2.0"
    />
  {:else if effectiveMode === 'gradient'}
    <path
      d={pinPath}
      fill="url(#{gradId})"
      stroke="rgba(180,180,180,0.5)"
      stroke-width="2.0"
    />
  {/if}

  <!-- 表面の光沢（ハイライト） -->
  <path d={pinPath} fill="url(#{highlightId})" />

  <!-- 視認性を上げるための大きな白丸（コア） -->
  <circle
    cx="16"
    cy="17"
    r="6"
    fill="white"
    style="filter: drop-shadow(0 1px 2px rgba(0,0,0,0.15))"
  />
</svg>
