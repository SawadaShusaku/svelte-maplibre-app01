<script lang="ts">
	import { env } from '$env/dynamic/public';
	import { onMount } from 'svelte';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { getLogoFont, applyLogoFont } from '$lib/font-style.js';

	const gtagId = env.PUBLIC_GTAG_ID?.trim() ?? '';
	let { children } = $props();

	onMount(() => {
		applyLogoFont(getLogoFont());
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	{#if gtagId}
		<script async src={`https://www.googletagmanager.com/gtag/js?id=${gtagId}`}></script>
		<script>
			{`
				window.dataLayer = window.dataLayer || [];
				function gtag(){dataLayer.push(arguments);}
				gtag('js', new Date());
				gtag('config', '${gtagId}');
			`}
		</script>
	{/if}
</svelte:head>
{@render children()}
