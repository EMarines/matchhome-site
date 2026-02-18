<script>
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';

	export let data;
	// Los datos del tenant vienen del layout.server.js (que crearemos a continuación)
	// o directamente de $page.data si se pasan correctamente.
</script>

<div
	class="app"
	style="--color-primary: {data.tenant.theme.primary}; --color-secondary: {data.tenant.theme
		.secondary};"
>
	<Header />
	<main>
		<slot />
	</main>
	<Footer />
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}
	main {
		flex: 1;
	}
</style>
