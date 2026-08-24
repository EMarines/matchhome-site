<script>
	import { page } from '$app/stores';

	export let data;
	$: property = data.property;

	const NO_IMAGE_PLACEHOLDER =
		'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22300%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20400%20300%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_1%20text%20%7B%20fill%3A%23AAAAAA%3Bfont-weight%3Abold%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A20pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_1%22%3E%3Crect%20width%3D%22400%22%20height%3D%22300%22%20fill%3D%22%23EEEEEE%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22130%22%20y%3D%22158%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';

	function extractGalleryImages(p) {
		if (!p) return [NO_IMAGE_PLACEHOLDER];
		let list = [];
		if (Array.isArray(p.images) && p.images.length > 0) {
			list = p.images;
		} else if (Array.isArray(p.property_images) && p.property_images.length > 0) {
			list = p.property_images;
		} else if (Array.isArray(p.photos) && p.photos.length > 0) {
			list = p.photos;
		} else if (Array.isArray(p.fotos) && p.fotos.length > 0) {
			list = p.fotos;
		} else if (Array.isArray(p.imagenes) && p.imagenes.length > 0) {
			list = p.imagenes;
		}

		const parsed = list
			.map((img) => (typeof img === 'string' ? img : img?.url || img?.src || img?.link || null))
			.filter(Boolean);

		if (parsed.length > 0) {
			return Array.from(new Set(parsed));
		}

		const single =
			p.imagenPrincipal ||
			p.imagenMiniatura ||
			p.title_image_full ||
			p.title_image_thumb ||
			p.image ||
			p.cover_image;

		return single ? [single] : [NO_IMAGE_PLACEHOLDER];
	}

	$: galleryImages = extractGalleryImages(property);

	let currentImageIndex = 0;
	let lastPropId = null;

	// Reset index only when property actually changes
	$: {
		const currId = property?.public_id || property?.easybroker_id || property?.id;
		if (currId && currId !== lastPropId) {
			lastPropId = currId;
			currentImageIndex = 0;
		}
	}

	$: image = galleryImages[currentImageIndex] || galleryImages[0] || NO_IMAGE_PLACEHOLDER;

	function nextImage(e) {
		if (e) e.stopPropagation();
		if (galleryImages.length > 1) {
			currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
		}
	}

	function prevImage(e) {
		if (e) e.stopPropagation();
		if (galleryImages.length > 1) {
			currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
		}
	}

	function selectImage(index, e) {
		if (e) e.stopPropagation();
		currentImageIndex = index;
	}

	// Touch swipe handlers
	let touchStartX = 0;
	let touchEndX = 0;

	function handleTouchStart(e) {
		if (e.changedTouches && e.changedTouches.length > 0) {
			touchStartX = e.changedTouches[0].screenX;
		}
	}

	function handleTouchEnd(e) {
		if (e.changedTouches && e.changedTouches.length > 0) {
			touchEndX = e.changedTouches[0].screenX;
			const diff = touchEndX - touchStartX;
			if (Math.abs(diff) > 40) {
				if (diff < 0) {
					nextImage();
				} else {
					prevImage();
				}
			}
		}
	}

	// Fullscreen lightbox state and handlers
	let isFullscreen = false;

	function openFullscreen(e) {
		if (e) e.stopPropagation();
		isFullscreen = true;
		if (typeof document !== 'undefined') {
			document.body.style.overflow = 'hidden';
		}
	}

	function closeFullscreen(e) {
		if (e) e.stopPropagation();
		isFullscreen = false;
		if (typeof document !== 'undefined') {
			document.body.style.overflow = '';
		}
	}

	function handleKeydown(e) {
		if (!isFullscreen) return;
		if (e.key === 'Escape') {
			closeFullscreen();
		} else if (e.key === 'ArrowRight') {
			nextImage();
		} else if (e.key === 'ArrowLeft') {
			prevImage();
		}
	}

	// Contact Form state & submission
	let contactName = '';
	let contactEmail = '';
	let contactPhone = '';
	let contactMessage = '';
	let submittingForm = false;
	let formSubmitted = false;
	let formError = null;

	async function handleContactSubmit() {
		submittingForm = true;
		formError = null;

		try {
			const res = await fetch('/api/contact', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					name: contactName || 'Cliente',
					email: contactEmail,
					phone: contactPhone,
					message: contactMessage,
					propertyId: property?.public_id || property?.easybroker_id || property?.id,
					propertyTitle: title,
					pageUrl: typeof window !== 'undefined' ? window.location.href : null
				})
			});

			const result = await res.json();
			if (res.ok && result.success) {
				formSubmitted = true;
			} else {
				formError = result.error || 'Ocurrió un error al enviar tu mensaje.';
			}
		} catch (err) {
			console.error('Error enviando contacto:', err);
			formError = 'No se pudo conectar con el servidor.';
		} finally {
			submittingForm = false;
		}
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

<svelte:window on:keydown={handleKeydown} />

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
					<div
						class="main-image-container"
						on:touchstart={handleTouchStart}
						on:touchend={handleTouchEnd}
					>
						<!-- svelte-ignore a11y-click-events-have-key-events -->
						<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
						<img
							src={image}
							alt={title}
							class="main-image clickable"
							on:click={openFullscreen}
							on:error={(e) => {
								e.currentTarget.src = NO_IMAGE_PLACEHOLDER;
							}}
						/>

						<button
							type="button"
							class="nav-btn fullscreen-btn"
							on:click={openFullscreen}
							aria-label="Ver imagen en pantalla completa"
							title="Pantalla completa"
						>
							<svg
								viewBox="0 0 24 24"
								width="20"
								height="20"
								fill="none"
								stroke="currentColor"
								stroke-width="2.2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<path
									d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"
								/>
							</svg>
						</button>

						{#if galleryImages.length > 1}
							<button
								type="button"
								class="nav-btn prev-btn"
								on:click={prevImage}
								aria-label="Imagen anterior"
							>
								&#10094;
							</button>
							<button
								type="button"
								class="nav-btn next-btn"
								on:click={nextImage}
								aria-label="Imagen siguiente"
							>
								&#10095;
							</button>
							<div class="image-indicator">
								{currentImageIndex + 1} / {galleryImages.length}
							</div>
						{/if}
					</div>
					{#if galleryImages && galleryImages.length > 1}
						<div class="gallery-grid">
							{#each galleryImages as imgUrl, i}
								<button
									type="button"
									class="gallery-thumb-btn {i === currentImageIndex ? 'active' : ''}"
									on:click={(e) => selectImage(i, e)}
									aria-label="Ver imagen {i + 1}"
								>
									<img
										src={imgUrl}
										alt=""
										class="gallery-image"
										on:error={(e) => {
											e.currentTarget.src = NO_IMAGE_PLACEHOLDER;
										}}
									/>
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
					{#if formSubmitted}
						<div class="success-alert">
							✅ ¡Gracias! Hemos recibido tu mensaje y se ha enviado a nuestro equipo. Te contactaremos pronto.
						</div>
					{:else}
						{#if formError}
							<div class="error-alert">
								⚠️ {formError}
							</div>
						{/if}
						<form class="contact-form" on:submit|preventDefault={handleContactSubmit}>
							<input type="text" placeholder="Nombre" bind:value={contactName} required class="form-input" />
							<input type="email" placeholder="Correo electrónico" bind:value={contactEmail} required class="form-input" />
							<input type="tel" placeholder="Teléfono / WhatsApp" bind:value={contactPhone} class="form-input" />
							<textarea placeholder="Mensaje" bind:value={contactMessage} class="form-input" rows="4"></textarea>
							<button type="submit" class="btn btn-primary full-width" disabled={submittingForm}>
								{submittingForm ? 'Enviando...' : 'Enviar Mensaje'}
							</button>
						</form>
					{/if}
				</div>
			</aside>
		</div>
	</div>

	{#if isFullscreen}
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
		<div
			class="fullscreen-modal"
			on:click={closeFullscreen}
			role="dialog"
			aria-modal="true"
			aria-label="Vista de pantalla completa"
		>
			<button
				type="button"
				class="fullscreen-modal-btn close-btn"
				on:click={closeFullscreen}
				aria-label="Cerrar pantalla completa"
				title="Cerrar (Esc)"
			>
				✕
			</button>

			{#if galleryImages.length > 1}
				<button
					type="button"
					class="fullscreen-modal-btn modal-prev-btn"
					on:click={prevImage}
					aria-label="Imagen anterior"
					title="Anterior (Flecha Izq)"
				>
					&#10094;
				</button>
				<button
					type="button"
					class="fullscreen-modal-btn modal-next-btn"
					on:click={nextImage}
					aria-label="Imagen siguiente"
					title="Siguiente (Flecha Der)"
				>
					&#10095;
				</button>
				<div class="fullscreen-counter">
					{currentImageIndex + 1} / {galleryImages.length}
				</div>
			{/if}

			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<!-- svelte-ignore a11y-no-static-element-interactions -->
			<div
				class="fullscreen-image-wrapper"
				on:click|stopPropagation
				on:touchstart={handleTouchStart}
				on:touchend={handleTouchEnd}
			>
				<img
					src={image}
					alt={title}
					class="fullscreen-img"
					on:error={(e) => {
						e.currentTarget.src = NO_IMAGE_PLACEHOLDER;
					}}
				/>
			</div>
		</div>
	{/if}
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

	.success-alert {
		background-color: #d4edda;
		color: #155724;
		border: 1px solid #c3e6cb;
		padding: 1rem;
		border-radius: 6px;
		text-align: center;
		font-weight: 500;
		font-size: 0.95rem;
	}

	.error-alert {
		background-color: #f8d7da;
		color: #721c24;
		border: 1px solid #f5c6cb;
		padding: 0.8rem;
		border-radius: 6px;
		text-align: center;
		font-weight: 500;
		font-size: 0.9rem;
		margin-bottom: 0.8rem;
	}

	/* Carousel Styles */
	.main-image-container {
		position: relative;
		width: 100%;
		height: 420px;
		background: #111;
		border-radius: 8px;
		overflow: hidden;
	}

	.main-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: 8px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		display: block;
	}

	.main-image.clickable {
		cursor: zoom-in;
	}

	.nav-btn {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		background: rgba(0, 0, 0, 0.55);
		color: white;
		border: 1px solid rgba(255, 255, 255, 0.25);
		width: 44px;
		height: 44px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		font-size: 1.4rem;
		border-radius: 50%;
		transition: background 0.2s ease, transform 0.2s ease;
		z-index: 10;
		backdrop-filter: blur(4px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
		user-select: none;
		padding: 0;
	}

	.nav-btn:hover {
		background: rgba(0, 0, 0, 0.85);
		transform: translateY(-50%) scale(1.08);
	}

	.prev-btn {
		left: 14px;
	}

	.next-btn {
		right: 14px;
	}

	.fullscreen-btn {
		top: 14px;
		right: 14px;
		transform: none;
		font-size: 1rem;
		background: rgba(0, 0, 0, 0.55);
	}

	.fullscreen-btn:hover {
		transform: scale(1.08);
		background: rgba(0, 0, 0, 0.85);
	}

	.image-indicator {
		position: absolute;
		bottom: 16px;
		right: 16px;
		background: rgba(0, 0, 0, 0.7);
		color: white;
		padding: 4px 12px;
		border-radius: 20px;
		font-size: 0.85rem;
		font-weight: 600;
		z-index: 10;
		backdrop-filter: blur(6px);
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	/* Fullscreen Lightbox Modal */
	.fullscreen-modal {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.94);
		backdrop-filter: blur(10px);
		z-index: 99999;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 20px;
		animation: fadeIn 0.2s ease-out;
		user-select: none;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.fullscreen-modal-btn {
		position: absolute;
		width: 48px;
		height: 48px;
		border-radius: 50%;
		background: rgba(0, 0, 0, 0.65);
		color: white;
		border: 1px solid rgba(255, 255, 255, 0.25);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		font-size: 1.5rem;
		backdrop-filter: blur(6px);
		transition: background 0.2s ease, transform 0.2s ease;
		z-index: 100001;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
		user-select: none;
		padding: 0;
	}

	.fullscreen-modal-btn:hover {
		background: rgba(0, 0, 0, 0.9);
		transform: scale(1.1);
	}

	.close-btn {
		top: 20px;
		right: 20px;
		font-size: 1.25rem;
	}

	.modal-prev-btn {
		top: 50%;
		left: 20px;
		transform: translateY(-50%);
	}

	.modal-prev-btn:hover {
		transform: translateY(-50%) scale(1.1);
	}

	.modal-next-btn {
		top: 50%;
		right: 20px;
		transform: translateY(-50%);
	}

	.modal-next-btn:hover {
		transform: translateY(-50%) scale(1.1);
	}

	.fullscreen-counter {
		position: absolute;
		bottom: 24px;
		left: 50%;
		transform: translateX(-50%);
		background: rgba(0, 0, 0, 0.7);
		color: white;
		padding: 6px 16px;
		border-radius: 20px;
		font-size: 0.95rem;
		font-weight: 600;
		border: 1px solid rgba(255, 255, 255, 0.2);
		backdrop-filter: blur(6px);
		z-index: 100001;
	}

	.fullscreen-image-wrapper {
		max-width: 92vw;
		max-height: 88vh;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.fullscreen-img {
		max-width: 100%;
		max-height: 88vh;
		object-fit: contain;
		border-radius: 8px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
		user-select: none;
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
		.fullscreen-modal-btn {
			width: 40px;
			height: 40px;
			font-size: 1.2rem;
		}
		.modal-prev-btn {
			left: 10px;
		}
		.modal-next-btn {
			right: 10px;
		}
		.close-btn {
			top: 14px;
			right: 14px;
		}
		.fullscreen-counter {
			bottom: 16px;
			font-size: 0.85rem;
		}
	}
</style>
