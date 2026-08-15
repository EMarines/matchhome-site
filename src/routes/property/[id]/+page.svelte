<script>
	import { page } from '$app/stores';

	export let data;
	$: property = data.property;

	// Image Gallery Logic
	$: galleryImages =
		property.images && property.images.length > 0
			? property.images.map((img) => (typeof img === 'string' ? img : img.url || img))
			: property.property_images && property.property_images.length > 0
			? property.property_images.map((img) => img.url)
			: [
					property.imagenPrincipal ||
						property.imagenMiniatura ||
						property.title_image_full ||
						property.title_image_thumb ||
						'/placeholder.jpg'
			  ];

	let currentImageIndex = 0;

	// Reset index when property changes
	$: if (property) currentImageIndex = 0;

	$: image = galleryImages[currentImageIndex] || '/placeholder.jpg';

	function nextImage() {
		if (galleryImages.length > 1) {
			currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
		}
	}

	function prevImage() {
		if (galleryImages.length > 1) {
			currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
		}
	}

	function selectImage(index) {
		currentImageIndex = index;
	}
	$: title = property.titulo || property.title || 'Propiedad sin título';
	$: description = property.descripcion || property.description || 'Sin descripción disponible.';
	$: locationStr =
		property.colonia ||
		property.ubicacion ||
		(typeof property.location === 'object'
			? property.location.name
			: property.location || 'Ubicación no disponible');

	$: price =
		property.precioFormateado ||
		(property.precio
			? `$${Number(property.precio).toLocaleString('es-MX')} ${property.moneda || 'MXN'}`
			: null) ||
		(property.operations && property.operations.length > 0
			? property.operations[0].formatted_amount ||
				property.operations[0].formated_amount ||
				`${property.operations[0].amount} ${property.operations[0].currency}`
			: 'Precio a consultar');

	function getOperationType(type) {
		const types = {
			sale: 'Venta',
			rental: 'Renta',
			temporary_rental: 'Renta Temporal'
		};
		return types[type] || type || 'Venta/Renta';
	}

	$: type =
		property.tipoOperacion ||
		(property.operations && property.operations.length > 0
			? getOperationType(property.operations[0].type)
			: 'Venta/Renta');

	$: beds = property.recamaras || property.bedrooms || 0;
	$: baths = property.banos || property.bathrooms || 0;
	$: area =
		property.construccion || property.terreno || property.construction_size || property.lot_size || 0;
	$: features = property.amenidades || property.features || [];

	// Navigation state fallback
	$: backUrl = $page.url.searchParams.get('backUrl') || '/';
	$: fromProposal = $page.url.searchParams.get('fromProposal') === 'true';
</script>

<svelte:head>
	<title>{title} - MatchHome</title>
</svelte:head>

<div class="property-details-page">
	<div class="container">
		<a href={backUrl} class="back-link"
			>← {fromProposal ? 'Volver a mis opciones' : 'Volver a Propiedades'}</a
		>

		<div class="details-header">
			<h1 class="details-title">{title}</h1>
			<p class="details-location">{locationStr}</p>
		</div>

		<div class="details-grid">
			<div class="details-main">
				<div class="image-gallery">
					<div class="main-image-container">
						<img src={image} alt={title} class="main-image" />
						{#if galleryImages.length > 1}
							<button class="nav-btn prev-btn" on:click={prevImage}>&#10094;</button>
							<button class="nav-btn next-btn" on:click={nextImage}>&#10095;</button>
							<div class="image-indicator">
								{currentImageIndex + 1} / {galleryImages.length}
							</div>
						{/if}
					</div>
					{#if galleryImages && galleryImages.length > 1}
						<div class="gallery-grid">
							{#each galleryImages.slice(0, 6) as imgUrl, i}
								<button
									type="button"
									class="gallery-thumb-btn {i === currentImageIndex ? 'active' : ''}"
									on:click={() => selectImage(i)}
								>
									<img src={imgUrl} alt={title} class="gallery-image" />
								</button>
							{/each}
						</div>
					{/if}
				</div>

				<div class="details-info-bar">
					<div class="info-item">
						<span class="label">Precio</span>
						<span class="value price">{price}</span>
					</div>
					<div class="info-item">
						<span class="label">Operación</span>
						<span class="value">{type}</span>
					</div>
					<div class="info-item">
						<span class="label">Recámaras</span>
						<span class="value">{beds}</span>
					</div>
					<div class="info-item">
						<span class="label">Baños</span>
						<span class="value">{baths}</span>
					</div>
					{#if area > 0}
						<div class="info-item">
							<span class="label">Área</span>
							<span class="value">{area} m²</span>
						</div>
					{/if}
				</div>

				<div class="details-section">
					<h2>Descripción</h2>
					<div class="description-text">
						{@html description.replace(/\n/g, '<br>')}
					</div>
				</div>

				{#if features.length > 0}
					<div class="details-section">
						<h2>Características</h2>
						<ul class="features-list">
							{#each features as feature}
								<li class="feature-tag">{feature.name || feature}</li>
							{/each}
						</ul>
					</div>
				{/if}
			</div>

			<aside class="details-sidebar">
				<div class="contact-card">
					<h3>¿Te interesa esta propiedad?</h3>
					<p>Contáctanos para agendar una visita.</p>
					<form class="contact-form" on:submit|preventDefault>
						<input type="text" placeholder="Nombre" class="form-input" />
						<input type="email" placeholder="Correo electrónico" class="form-input" />
						<input type="tel" placeholder="Teléfono" class="form-input" />
						<textarea placeholder="Mensaje" class="form-input" rows="4"></textarea>
						<button class="btn btn-primary full-width">Enviar Mensaje</button>
					</form>
				</div>
			</aside>
		</div>
	</div>
</div>

<style>
	.property-details-page {
		padding: var(--spacing-xl) 0;
		background-color: var(--color-background-alt);
		min-height: 80vh;
	}
	.back-link {
		display: inline-block;
		margin-bottom: var(--spacing-md);
		color: var(--color-primary);
		font-weight: 500;
		text-decoration: none;
	}
	.back-link:hover {
		text-decoration: underline;
	}
	.details-header {
		margin-bottom: var(--spacing-lg);
	}
	.details-title {
		font-size: 2rem;
		color: var(--color-primary);
		margin-bottom: var(--spacing-xs);
	}
	.details-location {
		color: var(--color-text-light);
		font-size: 1.1rem;
	}
	.details-grid {
		display: grid;
		grid-template-columns: 2fr 1fr;
		gap: var(--spacing-2xl);
	}
	.gallery-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
		gap: var(--spacing-md);
		margin-top: var(--spacing-md);
	}
	.gallery-thumb-btn {
		background: none;
		border: 2px solid transparent;
		padding: 0;
		margin: 0;
		cursor: pointer;
		border-radius: 6px;
		overflow: hidden;
		transition: border-color 0.2s, opacity 0.2s;
		display: block;
		width: 100%;
	}
	.gallery-thumb-btn:hover {
		opacity: 0.85;
	}
	.gallery-thumb-btn.active {
		border-color: var(--color-primary);
	}
	.gallery-image {
		width: 100%;
		height: 90px;
		object-fit: cover;
		display: block;
	}
	.details-info-bar {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
		gap: var(--spacing-md);
		background: var(--color-white);
		padding: var(--spacing-lg);
		border-radius: 8px;
		margin: var(--spacing-lg) 0;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
	}
	.info-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
	}
	.info-item .label {
		font-size: 0.85rem;
		color: var(--color-text-light);
		text-transform: uppercase;
		letter-spacing: 1px;
	}
	.info-item .value {
		font-size: 1.1rem;
		font-weight: 600;
		color: var(--color-text-main);
	}
	.info-item .value.price {
		color: var(--color-secondary);
		font-size: 1.2rem;
	}
	.details-section {
		background: var(--color-white);
		padding: var(--spacing-lg);
		border-radius: 8px;
		margin-bottom: var(--spacing-lg);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
	}
	.details-section h2 {
		color: var(--color-primary);
		margin-bottom: var(--spacing-md);
		font-size: 1.5rem;
		border-bottom: 2px solid var(--color-background-alt);
		padding-bottom: var(--spacing-xs);
	}
	.description-text {
		line-height: 1.8;
		color: var(--color-text-main);
	}
	.features-list {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-sm);
		list-style: none;
		padding: 0;
	}
	.feature-tag {
		background: var(--color-background-alt);
		padding: 0.5rem 1rem;
		border-radius: 20px;
		font-size: 0.9rem;
		color: var(--color-text-main);
	}
	.contact-card {
		background: var(--color-white);
		padding: var(--spacing-xl);
		border-radius: 8px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		position: sticky;
		top: 100px;
	}
	.contact-card h3 {
		color: var(--color-primary);
		margin-bottom: var(--spacing-xs);
	}
	.contact-card p {
		color: var(--color-text-light);
		margin-bottom: var(--spacing-lg);
	}
	.form-input {
		width: 100%;
		padding: 0.8rem;
		margin-bottom: var(--spacing-md);
		border: 1px solid var(--color-border);
		border-radius: 4px;
		font-family: inherit;
		font-size: 16px;
	}
	.full-width {
		width: 100%;
	}

	/* Carousel Styles */
	.main-image-container {
		position: relative;
		width: 100%;
		height: 420px;
	}

	.main-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: 8px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.nav-btn {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		background: rgba(0, 0, 0, 0.5);
		color: white;
		border: none;
		padding: 10px 15px;
		cursor: pointer;
		font-size: 1.5rem;
		border-radius: 50%;
		transition: background 0.3s;
		z-index: 10;
		user-select: none;
	}

	.nav-btn:hover {
		background: rgba(0, 0, 0, 0.8);
	}

	.prev-btn {
		left: 10px;
	}

	.next-btn {
		right: 10px;
	}

	.image-indicator {
		position: absolute;
		bottom: 20px;
		right: 20px;
		background: rgba(0, 0, 0, 0.6);
		color: white;
		padding: 4px 10px;
		border-radius: 12px;
		font-size: 0.9rem;
		z-index: 10;
	}

	@media (max-width: 768px) {
		.details-grid {
			grid-template-columns: 1fr;
			gap: var(--spacing-lg);
		}
		.main-image-container {
			height: 260px;
		}
		.gallery-grid {
			grid-template-columns: repeat(auto-fill, minmax(75px, 1fr));
			gap: 0.5rem;
		}
		.gallery-image {
			height: 65px;
		}
		.details-info-bar {
			grid-template-columns: repeat(2, 1fr);
			gap: 1rem;
			padding: 1rem;
		}
		.details-title {
			font-size: 1.5rem;
		}
		.contact-card {
			position: static;
			padding: 1.25rem;
		}
	}
</style>
