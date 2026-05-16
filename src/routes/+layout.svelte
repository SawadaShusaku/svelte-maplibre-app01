<script lang="ts">
	import { env } from '$env/dynamic/public';
	import { onMount } from 'svelte';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { applyFontChoices } from '$lib/font-style.js';
	import { SITE_NAME_JA, SITE_URL } from '$lib/site.js';

	const gtagId = env.PUBLIC_GTAG_ID?.trim() ?? '';
	let { children } = $props();

	onMount(() => {
		applyFontChoices();
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />

	<!-- OGP -->
	<meta property="og:title" content="{SITE_NAME_JA}" />
	<meta property="og:description" content="日本全国のリサイクル拠点を探すマップ。東京23区の回収施設・充電器設置場所を地図で確認できます。" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={SITE_URL} />
	<meta property="og:image" content={`${SITE_URL}/ogp-default.png`} />
	<meta name="twitter:card" content="summary_large_image" />

	{#if gtagId}
		<script async src={`https://www.googletagmanager.com/gtag/js?id=${gtagId}`}></script>
		{@html `<script>
			window.dataLayer = window.dataLayer || [];
			function gtag(){dataLayer.push(arguments);}
			gtag('js', new Date());
			gtag('config', ${JSON.stringify(gtagId)});
		</script>`}
	{/if}
</svelte:head>
{@render children()}
