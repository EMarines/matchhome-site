<script>
	import PropertyCard from '$lib/components/PropertyCard.svelte';
	import { page } from '$app/stores';

	export let data;
	$: ({ anchorProperty, similarProperties, clientName } = data);

	// Helper for Anchor Property Display
	$: anchorImage =
		anchorProperty.title_image_full ||
		anchorProperty.title_image_thumb ||
		(anchorProperty.property_images && anchorProperty.property_images[0]?.url);
	$: anchorPrice =
		anchorProperty.operations && anchorProperty.operations.length > 0
			? anchorProperty.operations[0].formatted_amount ||
				`${anchorProperty.operations[0].amount} ${anchorProperty.operations[0].currency}`
			: 'Consultar Precio';

	$: locationPath = $page.url.pathname + $page.url.search;
</script>

<svelte:head>
	<title>Propuesta para {clientName} - MatchHome</title>
</svelte:head>

<div class="proposal-page">
	<!-- Header / Greeting -->
	<header class="proposal-header">
		<div class="container">
			<div class="greeting-content">
				<h1>Hola, <span class="highlight">{clientName}</span></h1>
				<p class="subtitle">Preparamos esta selección exclusiva basada en tu interés.</p>
			</div>
		</div>
	</header>

	<div class="container">
		<!-- Section 1: Anchor Property -->
		<section class="anchor-section">
			<div class="section-header">
				<h2>Tu Interés Principal</h2>
				<div class="divider"></div>
			</div>

			<div class="anchor-card">
				<div class="anchor-image-container">
					<img src={anchorImage} alt={anchorProperty.title} class="anchor-image" />
					<div class="anchor-price-tag">{anchorPrice}</div>
				</div>
				<div class="anchor-details">
					<h3>{anchorProperty.title}</h3>
					<p class="anchor-location">
						📍 {typeof anchorProperty.location === 'object'
							? anchorProperty.location.name
							: anchorProperty.location}
					</p>

					<div class="anchor-features">
						<span>🛏 {anchorProperty.bedrooms} Recámaras</span>
						<span>🚿 {anchorProperty.bathrooms} Baños</span>
						<span>📐 {anchorProperty.construction_size || anchorProperty.lot_size} m²</span>
					</div>

					<p class="anchor-description">
						{anchorProperty.description
							? anchorProperty.description.substring(0, 200) + '...'
							: 'Sin descripción.'}
					</p>

					<div class="anchor-actions">
						<a
							href={`/property/${anchorProperty.public_id}?backUrl=${encodeURIComponent(locationPath)}&fromProposal=true`}
							class="btn btn-secondary full-width"
						>
							Ver Detalles
						</a>
					</div>
				</div>
			</div>
		</section>

		<!-- Section 2: Similar Properties -->
		{#if similarProperties.length > 0}
			<section class="similar-section">
				<div class="section-header">
					<h2>Otras Oportunidades para Ti</h2>
					<p>Propiedades similares que podrían interesarte</p>
					<div class="divider"></div>
				</div>

				<div class="properties-grid">
					{#each similarProperties as property (property.public_id)}
						<PropertyCard {property} />
						<!-- Note: PropertyCard needs to handle backUrl/fromProposal if we want to pass it through. 
                 Currently PropertyCard links to /property/[id] directly. 
                 To support backUrl, we might need to update PropertyCard or just accept standard navigation.
                 For now, standard navigation. -->
					{/each}
				</div>
			</section>
		{/if}
	</div>
</div>

<style>
	.proposal-page {
		background-color: #f8f9fa;
		min-height: 100vh;
		padding-bottom: 4rem;
	}

	.proposal-header {
		background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
		color: white;
		padding: 4rem 0 6rem;
		margin-bottom: -3rem;
		text-align: center;
	}

	.greeting-content h1 {
		font-size: 2.5rem;
		margin-bottom: 0.5rem;
		font-weight: 300;
	}

	.greeting-content .highlight {
		font-weight: 700;
		color: #fff;
	}

	.subtitle {
		font-size: 1.2rem;
		opacity: 0.9;
	}

	.anchor-section {
		margin-bottom: 4rem;
	}

	.anchor-card {
		background: white;
		border-radius: 16px;
		overflow: hidden;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
		display: grid;
		grid-template-columns: 1.2fr 1fr;
		gap: 0;
	}

	@media (max-width: 768px) {
		.anchor-card {
			grid-template-columns: 1fr;
		}
	}

	.anchor-image-container {
		position: relative;
		height: 100%;
		min-height: 300px;
	}

	.anchor-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.anchor-price-tag {
		position: absolute;
		top: 20px;
		left: 20px;
		background: rgba(0, 0, 0, 0.8);
		color: white;
		padding: 8px 16px;
		border-radius: 8px;
		font-weight: 700;
		font-size: 1.2rem;
		backdrop-filter: blur(4px);
	}

	.anchor-details {
		padding: 2.5rem;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	.anchor-details h3 {
		font-size: 1.8rem;
		color: var(--color-primary);
		margin-bottom: 0.5rem;
	}

	.anchor-location {
		color: #666;
		margin-bottom: 1.5rem;
		font-size: 1.1rem;
	}

	.anchor-features {
		display: flex;
		gap: 1.5rem;
		margin-bottom: 1.5rem;
		color: #555;
		font-weight: 500;
	}

	.anchor-description {
		color: #777;
		line-height: 1.6;
		margin-bottom: 2rem;
	}

	.section-header {
		text-align: center;
		margin-bottom: 3rem;
	}

	.section-header h2 {
		font-size: 2rem;
		color: var(--color-text-main);
		margin-bottom: 0.5rem;
	}

	.divider {
		width: 60px;
		height: 4px;
		background: var(--color-secondary);
		margin: 1rem auto;
		border-radius: 2px;
	}

	.properties-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 2rem;
	}

	.full-width {
		width: 100%;
		text-align: center;
		display: block;
	}
</style>
