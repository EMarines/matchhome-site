<script>
	import { onMount } from 'svelte';
	import PropertyCard from '$lib/components/PropertyCard.svelte';
	import { page } from '$app/stores';
	import { db as clientDb } from '$lib/firebase-client';
	import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

	export let data;
	$: ({ anchorProperty, similarProperties, clientName, contact: serverContact, contactId: serverContactId } = data);

	let loadedContact = null;
	let contactLoading = false;
	let contactError = null;
	let formSubmitted = false;

	$: contactId = serverContactId || $page.url.searchParams.get('c');
	$: contact = loadedContact || serverContact;

	function extractContactName(c, fallback) {
		if (!c) return fallback || 'Cliente';
		return (
			c.name ||
			c.nombre ||
			c.fullName ||
			c.nombreCompleto ||
			(c.firstName ? `${c.firstName} ${c.lastName || ''}`.trim() : null) ||
			c.first_name ||
			fallback ||
			'Cliente'
		);
	}

	function extractContactEmail(c) {
		if (!c) return '';
		return c.email || c.correo || c.mail || c.emailAddress || '';
	}

	function extractContactPhone(c) {
		if (!c) return '';
		return c.phone || c.telefono || c.celular || c.mobile || c.phone_number || '';
	}

	$: displayName = extractContactName(contact, clientName);

	let formName = '';
	let formEmail = '';
	let formPhone = '';
	let userMessage = '';
	let submittingForm = false;
	let formError = null;

	$: if (contact) {
		const extractedName = extractContactName(contact, '');
		const extractedEmail = extractContactEmail(contact);
		const extractedPhone = extractContactPhone(contact);

		if (!formName && extractedName && extractedName !== 'Cliente') {
			formName = extractedName;
		}
		if (!formEmail && extractedEmail) {
			formEmail = extractedEmail;
		}
		if (!formPhone && extractedPhone) {
			formPhone = extractedPhone;
		}
	}

	onMount(async () => {
		if (contactId && !contact) {
			contactLoading = true;
			try {
				const contactRef = doc(clientDb, 'contacts', contactId);
				const snap = await getDoc(contactRef);
				if (snap.exists()) {
					loadedContact = { id: snap.id, ...snap.data() };
				}
			} catch (err) {
				console.error('Error fetching contact on client:', err);
				contactError = err;
			} finally {
				contactLoading = false;
			}
		}

		if (contactId) {
			try {
				const contactRef = doc(clientDb, 'contacts', contactId);
				await updateDoc(contactRef, {
					lastProposalViewedAt: serverTimestamp(),
					lastProposalPropertyId: anchorProperty?.public_id || anchorProperty?.id || null
				});
			} catch (err) {
				console.log('[Telemetry note] View registration:', err.message);
			}
		}
	});

	const NO_IMAGE_PLACEHOLDER =
		'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22300%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20400%20300%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_1%20text%20%7B%20fill%3A%23AAAAAA%3Bfont-weight%3Abold%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A20pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_1%22%3E%3Crect%20width%3D%22400%22%20height%3D%22300%22%20fill%3D%22%23EEEEEE%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22130%22%20y%3D%22158%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';

	// Helper for Anchor Property Images Gallery
	function extractImages(p) {
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

	$: anchorImages = extractImages(anchorProperty);
	let currentAnchorImageIndex = 0;
	let lastAnchorId = null;

	$: {
		const currId = anchorProperty?.public_id || anchorProperty?.easybroker_id || anchorProperty?.id;
		if (currId && currId !== lastAnchorId) {
			lastAnchorId = currId;
			currentAnchorImageIndex = 0;
		}
	}

	$: currentAnchorImage = anchorImages[currentAnchorImageIndex] || anchorImages[0] || NO_IMAGE_PLACEHOLDER;

	function nextAnchorImage(e) {
		if (e) e.stopPropagation();
		if (anchorImages.length > 1) {
			currentAnchorImageIndex = (currentAnchorImageIndex + 1) % anchorImages.length;
		}
	}

	function prevAnchorImage(e) {
		if (e) e.stopPropagation();
		if (anchorImages.length > 1) {
			currentAnchorImageIndex =
				(currentAnchorImageIndex - 1 + anchorImages.length) % anchorImages.length;
		}
	}

	function selectAnchorImage(idx, e) {
		if (e) e.stopPropagation();
		currentAnchorImageIndex = idx;
	}

	// Touch swipe gestures for mobile carousel
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
					nextAnchorImage();
				} else {
					prevAnchorImage();
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
			nextAnchorImage();
		} else if (e.key === 'ArrowLeft') {
			prevAnchorImage();
		}
	}

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

	async function handleFormSubmit() {
		submittingForm = true;
		formError = null;

		try {
			const res = await fetch('/api/contact', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					name: formName || displayName || 'Cliente',
					email: formEmail,
					phone: formPhone,
					message: userMessage,
					propertyId: anchorPublicId,
					propertyTitle: anchorProperty?.title || null,
					pageUrl: typeof window !== 'undefined' ? window.location.href : null
				})
			});

			const result = await res.json();
			if (res.ok && result.success) {
				formSubmitted = true;
			} else {
				formError = result.error || 'Ocurrió un error al enviar tu información. Intenta de nuevo.';
			}
		} catch (err) {
			console.error('Error enviando formulario:', err);
			formError = 'No se pudo conectar con el servidor. Revisa tu conexión a internet.';
		} finally {
			submittingForm = false;
		}
	}
</script>

<svelte:window on:keydown={handleKeydown} />

<svelte:head>
	<title>{anchorProperty?.title ? `${anchorProperty.title} - Propuesta MatchHome` : `Propuesta para ${displayName} - MatchHome`}</title>
	<meta name="description" content={anchorProperty?.description ? anchorProperty.description.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim().substring(0, 200) : `Propuesta para ${displayName}`} />
	
	<!-- Open Graph Meta Tags (WhatsApp / Facebook Link Previews) -->
	<meta property="og:type" content="website" />
	<meta property="og:title" content={anchorProperty?.title || `Propuesta para ${displayName} - MatchHome`} />
	<meta property="og:description" content={anchorProperty?.description ? anchorProperty.description.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim().substring(0, 200) + '...' : `Propuesta personalizada de propiedades en MatchHome para ${displayName}`} />
	{#if anchorImages[0] && anchorImages[0] !== NO_IMAGE_PLACEHOLDER}
		<meta property="og:image" content={anchorImages[0]} />
		<meta property="og:image:secure_url" content={anchorImages[0]} />
	{/if}
	<meta property="og:site_name" content="MatchHome" />

	<!-- Twitter Card Meta Tags -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={anchorProperty?.title || `Propuesta para ${displayName}`} />
	<meta name="twitter:description" content={anchorProperty?.description ? anchorProperty.description.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim().substring(0, 200) : `Propuesta inmobiliaria personalizada`} />
	{#if anchorImages[0] && anchorImages[0] !== NO_IMAGE_PLACEHOLDER}
		<meta name="twitter:image" content={anchorImages[0]} />
	{/if}
</svelte:head>

<div class="proposal-page">
	<!-- Header / Greeting -->
	<header class="proposal-header">
		<div class="container">
			<div class="greeting-content">
				{#if contact}
					<div class="proposal-badge">
						✨ Propuesta Personalizada
					</div>
					<h1>¡Hola, <span class="highlight">{displayName}</span>!</h1>
					<p class="subtitle">Te preparamos esta propuesta especial basada en tus preferencias.</p>
				{:else}
					<h1>Hola, <span class="highlight">{displayName}</span></h1>
					<p class="subtitle">Preparamos esta selección exclusiva basada en tu interés.</p>
				{/if}
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
				<div class="anchor-gallery">
					<div
						class="anchor-image-container"
						on:touchstart={handleTouchStart}
						on:touchend={handleTouchEnd}
					>
						<!-- svelte-ignore a11y-click-events-have-key-events -->
						<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
						<img
							src={currentAnchorImage}
							alt={anchorProperty.title || 'Propiedad'}
							class="anchor-image clickable"
							on:click={openFullscreen}
							on:error={(e) => {
								e.currentTarget.src = NO_IMAGE_PLACEHOLDER;
							}}
						/>

						<button
							type="button"
							class="carousel-nav-btn fullscreen-btn"
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

						{#if anchorImages.length > 1}
							<button
								type="button"
								class="carousel-nav-btn prev-btn"
								on:click={prevAnchorImage}
								aria-label="Imagen anterior"
							>
								&#10094;
							</button>
							<button
								type="button"
								class="carousel-nav-btn next-btn"
								on:click={nextAnchorImage}
								aria-label="Imagen siguiente"
							>
								&#10095;
							</button>
							<div class="image-indicator">
								{currentAnchorImageIndex + 1} / {anchorImages.length}
							</div>
						{/if}

						<div class="anchor-price-tag">{anchorPrice}</div>
					</div>

					{#if anchorImages.length > 1}
						<div class="anchor-thumbnails-strip">
							{#each anchorImages as thumbUrl, i}
								<button
									type="button"
									class="anchor-thumb-btn {i === currentAnchorImageIndex ? 'active' : ''}"
									on:click={(e) => selectAnchorImage(i, e)}
									aria-label="Ver imagen {i + 1}"
								>
									<img
										src={thumbUrl}
										alt=""
										class="anchor-thumb-img"
										on:error={(e) => {
											e.currentTarget.src = NO_IMAGE_PLACEHOLDER;
										}}
									/>
								</button>
							{/each}
						</div>
					{/if}
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
							? anchorProperty.description.substring(0, 240) + '...'
							: 'Sin descripción.'}
					</p>

					<div class="anchor-actions">
						<a
							href={`/property/${anchorPublicId}?backUrl=${encodeURIComponent(locationPath)}&fromProposal=true`}
							class="btn btn-secondary full-width"
						>
							Ver Detalles y Más Fotos
						</a>
					</div>
				</div>
			</div>
		</section>

		<!-- Section 2: Contact / Schedule Visit Section -->
		<section class="contact-section">
			<div class="contact-card">
				<div class="contact-header">
					<h2>¿Te interesa agendar una visita o solicitar más información?</h2>
					<p>Déjanos tus datos y un asesor se pondrá en contacto contigo a la brevedad.</p>
				</div>

				{#if formSubmitted}
					<div class="success-alert">
						✅ ¡Gracias {displayName || 'por comunicarte'}! Hemos recibido tu mensaje y se ha enviado a nuestro equipo. Te contactaremos a la brevedad.
					</div>
				{:else}
					{#if formError}
						<div class="error-alert">
							⚠️ {formError}
						</div>
					{/if}

					<form class="proposal-contact-form" on:submit|preventDefault={handleFormSubmit}>
						<div class="form-row">
							<div class="form-group">
								<label for="name">Nombre</label>
								<input
									id="name"
									type="text"
									bind:value={formName}
									placeholder="Tu nombre completo"
									required
									class="form-input"
								/>
							</div>
							<div class="form-group">
								<label for="email">Correo Electrónico</label>
								<input
									id="email"
									type="email"
									bind:value={formEmail}
									placeholder="correo@ejemplo.com"
									required
									class="form-input"
								/>
							</div>
							<div class="form-group">
								<label for="phone">Teléfono / WhatsApp</label>
								<input
									id="phone"
									type="tel"
									bind:value={formPhone}
									placeholder="(614) 123 4567"
									class="form-input"
								/>
							</div>
						</div>
						<div class="form-group">
							<label for="message">Mensaje / Horario de Preferencia</label>
							<textarea
								id="message"
								bind:value={userMessage}
								placeholder="Hola, me interesa agendar una cita para ver esta propiedad..."
								rows="3"
								class="form-input"
							></textarea>
						</div>
						<button type="submit" class="btn btn-primary submit-btn" disabled={submittingForm}>
							{submittingForm ? 'Enviando...' : '📅 Solicitar Información / Agendar Cita'}
						</button>
					</form>
				{/if}
			</div>
		</section>

		<!-- Section 3: Similar Properties -->
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
					{/each}
				</div>
			</section>
		{/if}
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

			{#if anchorImages.length > 1}
				<button
					type="button"
					class="fullscreen-modal-btn modal-prev-btn"
					on:click={prevAnchorImage}
					aria-label="Imagen anterior"
					title="Anterior (Flecha Izq)"
				>
					&#10094;
				</button>
				<button
					type="button"
					class="fullscreen-modal-btn modal-next-btn"
					on:click={nextAnchorImage}
					aria-label="Imagen siguiente"
					title="Siguiente (Flecha Der)"
				>
					&#10095;
				</button>
				<div class="fullscreen-counter">
					{currentAnchorImageIndex + 1} / {anchorImages.length}
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
					src={currentAnchorImage}
					alt={anchorProperty.title || 'Propiedad'}
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

	.proposal-badge {
		display: inline-block;
		background: rgba(255, 255, 255, 0.2);
		backdrop-filter: blur(8px);
		padding: 0.35rem 1rem;
		border-radius: 20px;
		font-size: 0.9rem;
		font-weight: 600;
		margin-bottom: 1rem;
		border: 1px solid rgba(255, 255, 255, 0.3);
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
		gap: 2rem;
		padding: 1.5rem;
	}

	.anchor-gallery {
		display: flex;
		flex-direction: column;
		gap: 12px;
		min-width: 0;
	}

	.contact-section {
		margin-bottom: 4rem;
	}

	.contact-card {
		background: white;
		border-radius: 16px;
		padding: 2.5rem;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
	}

	.contact-header {
		text-align: center;
		margin-bottom: 2rem;
	}

	.contact-header h2 {
		font-size: 1.6rem;
		color: var(--color-primary);
		margin-bottom: 0.5rem;
	}

	.contact-header p {
		color: #666;
		font-size: 1rem;
	}

	.proposal-contact-form {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.form-row {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 1.25rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.form-group label {
		font-size: 0.9rem;
		font-weight: 600;
		color: var(--color-text-main);
	}

	.form-input {
		width: 100%;
		padding: 0.8rem 1rem;
		border: 1px solid #ddd;
		border-radius: 8px;
		font-family: inherit;
		font-size: 0.95rem;
		transition: border-color 0.2s ease, box-shadow 0.2s ease;
	}

	.form-input:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb, 10, 40, 90), 0.1);
	}

	.submit-btn {
		margin-top: 0.5rem;
		padding: 0.9rem 1.5rem;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		align-self: center;
	}

	.success-alert {
		background-color: #d4edda;
		color: #155724;
		border: 1px solid #c3e6cb;
		padding: 1.25rem;
		border-radius: 8px;
		text-align: center;
		font-weight: 500;
		font-size: 1.1rem;
	}

	.error-alert {
		background-color: #f8d7da;
		color: #721c24;
		border: 1px solid #f5c6cb;
		padding: 1rem;
		border-radius: 8px;
		text-align: center;
		font-weight: 500;
		margin-bottom: 1rem;
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
			gap: 1.25rem;
			padding: 1rem;
		}
		.anchor-image-container {
			height: 260px;
		}
		.anchor-price-tag {
			font-size: 1rem;
			padding: 6px 12px;
			top: 12px;
			left: 12px;
		}
		.anchor-details {
			padding: 0.5rem;
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
		.contact-card {
			padding: 1.5rem;
		}
	}

	.anchor-image-container {
		position: relative;
		width: 100%;
		height: 380px;
		background: #1a1a1a;
		border-radius: 12px;
		overflow: hidden;
		user-select: none;
	}

	.anchor-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		transition: opacity 0.2s ease-in-out;
	}

	.carousel-nav-btn {
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
	}

	.carousel-nav-btn:hover {
		background: rgba(0, 0, 0, 0.85);
		transform: translateY(-50%) scale(1.08);
	}

	.carousel-nav-btn.prev-btn {
		left: 14px;
	}

	.carousel-nav-btn.next-btn {
		right: 14px;
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

	.anchor-thumbnails-strip {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-top: 4px;
		margin-bottom: 0;
		overflow-x: auto;
		padding-bottom: 6px;
		scrollbar-width: thin;
		scrollbar-color: #ccc transparent;
		-webkit-overflow-scrolling: touch;
	}

	.anchor-thumbnails-strip::-webkit-scrollbar {
		height: 4px;
	}

	.anchor-thumbnails-strip::-webkit-scrollbar-thumb {
		background: #ccc;
		border-radius: 4px;
	}

	.anchor-thumb-btn {
		width: 56px;
		height: 44px;
		border-radius: 6px;
		overflow: hidden;
		border: 2px solid transparent;
		padding: 0;
		cursor: pointer;
		background: #eee;
		transition: border-color 0.2s, transform 0.2s;
		flex-shrink: 0;
	}

	.anchor-thumb-btn:hover {
		transform: scale(1.05);
	}

	.anchor-thumb-btn.active {
		border-color: var(--color-primary);
		box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb, 10, 40, 90), 0.3);
	}

	.anchor-thumb-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
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
		z-index: 5;
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

	.anchor-image.clickable {
		cursor: zoom-in;
	}

	.carousel-nav-btn.fullscreen-btn {
		top: 20px;
		right: 20px;
		transform: none;
		font-size: 1rem;
		background: rgba(0, 0, 0, 0.55);
	}

	.carousel-nav-btn.fullscreen-btn:hover {
		transform: scale(1.08);
		background: rgba(0, 0, 0, 0.85);
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
		.carousel-nav-btn.fullscreen-btn {
			top: 12px;
			right: 12px;
			width: 38px;
			height: 38px;
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

