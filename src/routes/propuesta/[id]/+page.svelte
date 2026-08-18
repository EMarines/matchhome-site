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
	$: formName = extractContactName(contact, '');
	$: formEmail = extractContactEmail(contact);
	$: formPhone = extractContactPhone(contact);
	let userMessage = '';

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

	function handleFormSubmit() {
		formSubmitted = true;
	}
</script>

<svelte:head>
	<title>{anchorProperty?.title ? `${anchorProperty.title} - Propuesta MatchHome` : `Propuesta para ${displayName} - MatchHome`}</title>
	<meta name="description" content={anchorProperty?.description ? anchorProperty.description.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim().substring(0, 200) : `Propuesta para ${displayName}`} />
	
	<!-- Open Graph Meta Tags (WhatsApp / Facebook Link Previews) -->
	<meta property="og:type" content="website" />
	<meta property="og:title" content={anchorProperty?.title || `Propuesta para ${displayName} - MatchHome`} />
	<meta property="og:description" content={anchorProperty?.description ? anchorProperty.description.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim().substring(0, 200) + '...' : `Propuesta personalizada de propiedades en MatchHome para ${displayName}`} />
	{#if anchorImage && anchorImage !== NO_IMAGE_PLACEHOLDER}
		<meta property="og:image" content={anchorImage} />
		<meta property="og:image:secure_url" content={anchorImage} />
	{/if}
	<meta property="og:site_name" content="MatchHome" />

	<!-- Twitter Card Meta Tags -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={anchorProperty?.title || `Propuesta para ${displayName}`} />
	<meta name="twitter:description" content={anchorProperty?.description ? anchorProperty.description.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim().substring(0, 200) : `Propuesta inmobiliaria personalizada`} />
	{#if anchorImage && anchorImage !== NO_IMAGE_PLACEHOLDER}
		<meta name="twitter:image" content={anchorImage} />
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

		<!-- Section 2: Contact / Schedule Visit Section -->
		<section class="contact-section">
			<div class="contact-card">
				<div class="contact-header">
					<h2>¿Te interesa agendar una visita o solicitar más información?</h2>
					<p>Déjanos tus datos y un asesor se pondrá en contacto contigo a la brevedad.</p>
				</div>

				{#if formSubmitted}
					<div class="success-alert">
						✅ ¡Gracias {displayName || 'por comunicarte'}! Hemos recibido tu mensaje. Te contactaremos pronto.
					</div>
				{:else}
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
									placeholder="(55) 1234 5678"
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
						<button type="submit" class="btn btn-primary submit-btn">
							📅 Solicitar Información / Agendar Cita
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
		gap: 0;
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
		.contact-card {
			padding: 1.5rem;
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

