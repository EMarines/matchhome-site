<script>
	export let data;
	const { properties, tenant } = data;
</script>

<div class="container section">
	<h1 class="section-title">Propiedades de {tenant.name}</h1>

	{#if properties.length === 0}
		<p>No hay propiedades disponibles por el momento.</p>
		<!-- Temporal: Botón para sincronizar manualmente si estamos en dev -->
		<button
			on:click={async () => {
				const res = await fetch('/api/sync', { method: 'POST' });
				const data = await res.json();
				alert(JSON.stringify(data));
				location.reload();
			}}
			class="btn btn-secondary"
			style="margin-top: 1rem;"
		>
			Sincronizar Propiedades (Dev)
		</button>
	{:else}
		<div class="grid">
			{#each properties as property}
				<div class="card">
					<div class="card-image">
						{#if property.title_image_full}
							<img src={property.title_image_full} alt={property.title} />
						{:else}
							<div class="placeholder">Sin Imagen</div>
						{/if}
					</div>
					<div class="card-content">
						<h3>{property.title}</h3>
						<p class="price">
							{property.operations?.[0]?.amount}
							{property.operations?.[0]?.currency}
						</p>
						<a href="/property/{property.public_id}" class="btn btn-primary">Ver Detalles</a>
					</div>
				</div>
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

	.card {
		border: 1px solid var(--color-border);
		border-radius: 8px;
		overflow: hidden;
		transition: transform 0.2s;
		background: var(--color-white);
	}

	.card:hover {
		transform: translateY(-5px);
		box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
	}

	.card-image {
		height: 200px;
		background-color: #eee;
	}

	.card-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.card-content {
		padding: 1.5rem;
	}

	h3 {
		margin-bottom: 0.5rem;
		font-size: 1.25rem;
	}

	.price {
		color: var(--color-secondary);
		font-weight: bold;
		font-size: 1.1rem;
		margin-bottom: 1rem;
	}
</style>
