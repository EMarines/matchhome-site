<script>
	import { page } from '$app/stores';

	export let data;
	$: property = data.property;

	const NO_IMAGE_PLACEHOLDER =
		'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22300%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20400%20300%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_1%20text%20%7B%20fill%3A%23AAAAAA%3Bfont-weight%3Abold%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A20pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_1%22%3E%3Crect%20width%3D%22400%22%20height%3D%22300%22%20fill%3D%22%23EEEEEE%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22130%22%20y%3D%22158%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';

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
						NO_IMAGE_PLACEHOLDER
			  ];

	let currentImageIndex = 0;

	// Reset index when property changes
	$: if (property) currentImageIndex = 0;

	$: image = galleryImages[currentImageIndex] || NO_IMAGE_PLACEHOLDER;

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
	function extractDescription(p) {
		if (!p) return 'Sin descripción disponible.';
		const raw =
			p.description ||
			p.descripcion ||
			p.public_description ||
			p.descripcion_publica ||
			p.detalles ||
			p.details ||
			p.observaciones ||
			p.property_description ||
			p.private_description ||
			p.desc;

		if (!raw) return 'Sin descripción disponible.';
		if (typeof raw === 'string') {
			const trimmed = raw.trim();
			return trimmed.length > 0 ? trimmed : 'Sin descripción disponible.';
		}
		if (typeof raw === 'object') {
			const str = raw.text || raw.content || raw.value || raw.html || '';
			return str.trim().length > 0 ? str.trim() : 'Sin descripción disponible.';
		}
		return String(raw);
	}

	$: title = property.titulo || property.title || 'Propiedad sin título';
	$: description = extractDescription(property);
	$: locationStr =
		property.colonia ||
		property.ubicacion ||
		(typeof property.location === 'object'
			? property.location?.name
			: property.location || 'Ubicación no disponible');

	function formatPrice(val, curr) {
		if (val === undefined || val === null || val === '') return null;
		const num = Number(val);
		if (isNaN(num) || num <= 0) return typeof val === 'string' && val.trim().length > 0 ? val : null;
		return `$${num.toLocaleString('es-MX')} ${curr || 'MXN'}`;
	}

	$: price =
		property.precioFormateado ||
		formatPrice(property.price, property.moneda || property.currency) ||
		formatPrice(property.precio, property.moneda || property.currency) ||
		formatPrice(property.budget, property.moneda || property.currency) ||
		(property.operations && property.operations.length > 0
			? property.operations[0].formatted_amount ||
				property.operations[0].formated_amount ||
				`${Number(property.operations[0].amount).toLocaleString('es-MX')} ${property.operations[0].currency || 'MXN'}`
			: 'Precio a consultar');

	function getOperationType(type) {
		if (!type) return null;
		const t = String(type).toLowerCase().trim();
		const types = {
			sale: 'Venta',
			venta: 'Venta',
			rent: 'Renta',
			rental: 'Renta',
			renta: 'Renta',
			temporary_rental: 'Renta Temporal',
			'renta temporal': 'Renta Temporal'
		};
		return types[t] || type;
	}

	$: type =
		getOperationType(property.selecTO) ||
		getOperationType(property.tipoOperacion) ||
		getOperationType(property.operation_type) ||
		(property.operations && property.operations.length > 0
			? getOperationType(property.operations[0].type)
			: 'Venta/Renta');

	$: beds = property.recamaras ?? property.bedrooms ?? 0;
	$: baths = property.banos ?? property.bathrooms ?? 0;
	$: area =
		property.construccion || property.construction_size || property.terreno || property.lot_size || 0;
	$: features = property.amenidades || property.features || [];

	// Navigation state fallback
	$: backUrl = $page.url.searchParams.get('backUrl') || '/';
	$: fromProposal = $page.url.searchParams.get('fromProposal') === 'true';

	// Clean text for meta description and schema.org JSON-LD
	$: cleanDescription = description.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim();
	$: jsonLd = JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'RealEstateListing',
		name: title,
		description: cleanDescription,
		image: galleryImages[0] || undefined,
		offers: {
			'@type': 'Offer',
			price: property.precio || (property.operations && property.operations[0]?.amount) || undefined,
			priceCurrency: property.moneda || (property.operations && property.operations[0]?.currency) || 'MXN'
		}
	});
</script>

<svelte:head>
	<title>{title} - MatchHome</title>
	<meta name="description" content={cleanDescription.substring(0, 160)} />

	<!-- Open Graph Meta Tags (WhatsApp / Social link previews) -->
	<meta property="og:type" content="website" />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={cleanDescription.substring(0, 200)} />
	{#if galleryImages[0] && galleryImages[0] !== NO_IMAGE_PLACEHOLDER}
		<meta property="og:image" content={galleryImages[0]} />
		<meta property="og:image:secure_url" content={galleryImages[0]} />
	{/if}
	<meta property="og:site_name" content="MatchHome" />

	<!-- Twitter Card Meta Tags -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={cleanDescription.substring(0, 200)} />
	{#if galleryImages[0] && galleryImages[0] !== NO_IMAGE_PLACEHOLDER}
		<meta name="twitter:image" content={galleryImages[0]} />
	{/if}

	{@html `<script type="application/ld+json">${jsonLd}</script>`}
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
