<script>
	import PropertyCard from '$lib/components/PropertyCard.svelte';
	import { page } from '$app/stores';

	export let data;
	$: ({ anchorProperty, similarProperties, clientName } = data);

	const NO_IMAGE_PLACEHOLDER =
		'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22300%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20400%20300%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_1%20text%20%7B%20fill%3A%23AAAAAA%3Bfont-weight%3Abold%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A20pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_1%22%3E%3Crect%20width%3D%22400%22%20height%3D%22300%22%20fill%3D%22%23EEEEEE%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22130%22%20y%3D%22158%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';

	// Helper for Anchor Property Display
	$: anchorImage =
		anchorProperty.imagenPrincipal ||
		anchorProperty.imagenMiniatura ||
		anchorProperty.title_image_full ||
		anchorProperty.title_image_thumb ||
		(anchorProperty.images && anchorProperty.images.length > 0
			? typeof anchorProperty.images[0] === 'string'
				? anchorProperty.images[0]
				: anchorProperty.images[0]?.url
			: null) ||
		(anchorProperty.property_images &&
			anchorProperty.property_images.length > 0 &&
			anchorProperty.property_images[0]?.url) ||
		NO_IMAGE_PLACEHOLDER;

	$: anchorPrice =
		anchorProperty.precioFormateado ||
		(anchorProperty.precio
			? `$${Number(anchorProperty.precio).toLocaleString('es-MX')} ${anchorProperty.moneda || 'MXN'}`
			: null) ||
		(anchorProperty.price
			? `$${Number(anchorProperty.price).toLocaleString('es-MX')} MXN`
			: null) ||
		(anchorProperty.operations && anchorProperty.operations.length > 0
			? anchorProperty.operations[0].formatted_amount ||
				`${anchorProperty.operations[0].amount} ${anchorProperty.operations[0].currency}`
			: 'Consultar Precio');

	$: anchorPublicId =
		anchorProperty.public_id || anchorProperty.easybroker_id || anchorProperty.id;

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
							href={`/property/${anchorPublicId}?backUrl=${encodeURIComponent(locationPath)}&fromProposal=true`}
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
						<PropertyCard {property} backUrl={locationPath} fromProposal={true} />
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
		.proposal-header {
			padding: 2.5rem 1rem 4.5rem;
		}
		.greeting-content h1 {
			font-size: 1.8rem;
		}
		.anchor-card {
			grid-template-columns: 1fr;
		}
		.anchor-image-container {
			min-height: 240px;
		}
		.anchor-price-tag {
			font-size: 1rem;
			padding: 6px 12px;
			top: 12px;
			left: 12px;
		}
		.anchor-details {
			padding: 1.25rem;
		}
		.anchor-details h3 {
			font-size: 1.35rem;
		}
		.anchor-features {
			flex-wrap: wrap;
			gap: 0.75rem;
			font-size: 0.9rem;
		}
		.properties-grid {
			grid-template-columns: minmax(0, 1fr);
			gap: 1.25rem;
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
		max-width: calc(100% - 40px);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
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
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr));
		gap: 2rem;
	}

	.full-width {
		width: 100%;
		text-align: center;
		display: block;
	}
</style>
