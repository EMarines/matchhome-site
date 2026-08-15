<script>
	import PropertyCard from '$lib/components/PropertyCard.svelte';
	export let data;
	const { properties, tenant } = data;
</script>

<div class="container section">
	<h1 class="section-title">Propiedades ({properties.length})</h1>

	{#if properties.length === 0}
		<p>No hay propiedades disponibles por el momento.</p>
	{:else}
		<div class="grid">
			{#each properties as property (property.public_id || property.easybroker_id || property.id || property.title)}
				<PropertyCard {property} />
			{/each}
		</div>
	{/if}
</div>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 2rem;
	}
</style>
