<script lang="ts">
	import { env } from '$env/dynamic/public';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	const gtagId = env.PUBLIC_GTAG_ID?.trim() ?? '';
	const gtagInitScript = gtagId
		? `<script>
				window.dataLayer = window.dataLayer || [];
				function gtag(){dataLayer.push(arguments);}
				window.gtag = window.gtag || gtag;
				gtag('js', new Date());
				gtag('config', ${JSON.stringify(gtagId)});
			<\/script>`
		: '';
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	{#if gtagId}
		<script async src={`https://www.googletagmanager.com/gtag/js?id=${gtagId}`}></script>
		{@html gtagInitScript}
	{/if}
</svelte:head>
{@render children()}
