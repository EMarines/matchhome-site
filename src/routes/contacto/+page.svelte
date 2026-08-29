<script>
	import { page } from '$app/stores';

	let name = '';
	let email = '';
	let phone = '';
	let subject = 'Comprar una propiedad';
	let message = '';
	let isSubmitting = false;
	let isSubmitted = false;
	let errorMessage = '';

	async function handleSubmit() {
		isSubmitting = true;
		errorMessage = '';

		try {
			const res = await fetch('/api/contact', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					name: name.trim(),
					email: email.trim(),
					phone: phone.trim(),
					message: `[Asunto: ${subject}]\n\n${message.trim()}`,
					propertyTitle: `Contacto General: ${subject}`,
					pageUrl: typeof window !== 'undefined' ? window.location.href : null
				})
			});

			const data = await res.json();

			if (res.ok && data.success) {
				isSubmitted = true;
				name = '';
				email = '';
				phone = '';
				message = '';
				subject = 'Comprar una propiedad';
			} else {
				errorMessage = data.error || 'Ocurrió un problema al enviar tu mensaje. Por favor intenta de nuevo.';
			}
		} catch (err) {
			console.error('Error al enviar formulario de contacto:', err);
			errorMessage = 'Error de conexión. Puedes escribirnos directamente por WhatsApp o llamarnos.';
		} finally {
			isSubmitting = false;
		}
	}

	function resetForm() {
		isSubmitted = false;
		errorMessage = '';
	}

	$: tenant = $page.data.tenant || {};
	$: phoneDisplay = tenant.phone || '614 540 4003';
	$: phoneClean = (tenant.phoneRaw || '526145404003').replace(/\D/g, '');
	$: emailDisplay = tenant.email || 'matchhomebr@gmail.com';
	$: addressDisplay = tenant.address || 'Av. Francisco Villa # 5700, Col. Panamericana, Chihuahua, Chih.';
	$: slogan = tenant.slogan || 'Tu Futuro En Buenas Manos';
	$: companyName = tenant.name || 'MatchHome';
	$: logoUrl = tenant.theme?.logo || '/logo.png';
</script>

<svelte:head>
	<title>Contacto | {companyName} - {slogan}</title>
	<meta
		name="description"
		content="Ponte en contacto con MatchHome Bienes Raíces en Chihuahua. Asesoría experta para comprar, vender o rentar tu propiedad. {slogan}."
	/>
</svelte:head>

<div class="contact-page">
	<!-- Hero Banner -->
	<section class="contact-hero">
		<div class="container hero-content">
			<div class="hero-brand">
				{#if logoUrl}
					<img src={logoUrl} alt={companyName} class="hero-logo" />
				{/if}
				<span class="hero-slogan-badge">✨ {slogan}</span>
			</div>
			<h1 class="hero-title">Estamos Listos para Asesorarte</h1>
			<p class="hero-subtitle">
				¿Tienes dudas sobre una propiedad o deseas poner en venta o renta tu inmueble? Déjanos un mensaje y uno de nuestros asesores certificados te responderá a la brevedad.
			</p>
		</div>
	</section>

	<div class="container main-content-section">
		<div class="contact-layout">
			<!-- Columna Izquierda: Información de Contacto -->
			<div class="contact-info-column">
				<div class="info-card highlight-card">
					<div class="brand-tag">
						<span class="dot"></span> Atención Personalizada
					</div>
					<h3>{companyName} Bienes Raíces</h3>
					<p class="slogan-quote">"{slogan}"</p>
					<p class="desc">
						Visítanos en nuestra oficina o comunícate directamente por teléfono, correo o WhatsApp. Cuidamos cada detalle de tu patrimonio.
					</p>

					<a
						href="https://wa.me/{phoneClean}?text=Hola%20MatchHome%2C%20quisiera%20recibir%20asesor%C3%ADa%20inmobiliaria."
						target="_blank"
						rel="noopener noreferrer"
						class="whatsapp-btn"
					>
						<svg class="whatsapp-icon" viewBox="0 0 24 24" fill="currentColor">
							<path
								d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"
							/>
						</svg>
						<span>Escríbenos por WhatsApp</span>
					</a>
				</div>

				<div class="info-items-grid">
					<!-- Dirección -->
					<div class="info-box">
						<div class="icon-circle">📍</div>
						<div class="box-text">
							<h4>Ubicación</h4>
							<p>{addressDisplay}</p>
							<a
								href="https://maps.google.com/?q=Av.+Francisco+Villa+5700,+Panamericana,+31210+Chihuahua,+Chih."
								target="_blank"
								rel="noopener noreferrer"
								class="map-link"
							>
								Ver en Google Maps →
							</a>
						</div>
					</div>

					<!-- Teléfono -->
					<div class="info-box">
						<div class="icon-circle">📞</div>
						<div class="box-text">
							<h4>Teléfono</h4>
							<p>Llámanos directamente:</p>
							<a href="tel:{phoneClean}" class="phone-link">{phoneDisplay}</a>
						</div>
					</div>

					<!-- Correo -->
					<div class="info-box">
						<div class="icon-circle">✉️</div>
						<div class="box-text">
							<h4>Correo Electrónico</h4>
							<p>Envíanos un correo a:</p>
							<a href="mailto:{emailDisplay}" class="email-link">{emailDisplay}</a>
						</div>
					</div>

					<!-- Horario -->
					<div class="info-box">
						<div class="icon-circle">🕒</div>
						<div class="box-text">
							<h4>Horario de Atención</h4>
							<p><strong>Lunes a Viernes:</strong> 9:00 AM - 7:00 PM</p>
							<p><strong>Sábados:</strong> 9:00 AM - 2:00 PM</p>
							<p class="note">Domingos previa cita</p>
						</div>
					</div>
				</div>

				<!-- Mapa Integrado -->
				<div class="map-container">
					<div class="map-header">
						<span>📍 Encuéntranos en Chihuahua</span>
						<a
							href="https://maps.google.com/?q=Av.+Francisco+Villa+5700,+Panamericana,+31210+Chihuahua,+Chih."
							target="_blank"
							rel="noopener noreferrer"
							class="directions-btn"
						>
							Cómo Llegar
						</a>
					</div>
					<iframe
						title="Ubicación MatchHome"
						src="https://maps.google.com/maps?q=Av.+Francisco+Villa+5700,+Panamericana,+31210+Chihuahua,+Chih.&t=&z=15&ie=UTF8&iwloc=&output=embed"
						width="100%"
						height="220"
						style="border:0; border-radius: 0 0 10px 10px;"
						allowfullscreen=""
						loading="lazy"
						referrerpolicy="no-referrer-when-downgrade"
					></iframe>
				</div>
			</div>

			<!-- Columna Derecha: Formulario de Contacto -->
			<div class="contact-form-column">
				<div class="form-card">
					<div class="form-header">
						<h2>Envíanos un Mensaje</h2>
						<p>Completa el formulario y te contactaremos en menos de 24 horas.</p>
					</div>

					{#if isSubmitted}
						<div class="success-state">
							<div class="success-icon">✅</div>
							<h3>¡Mensaje Enviado con Éxito!</h3>
							<p>
								Muchas gracias por ponerte en contacto con <strong>{companyName}</strong>. Hemos recibido tu solicitud y nuestro equipo te atenderá a la brevedad.
							</p>
							<div class="success-slogan">
								<span>{slogan}</span>
							</div>
							<button class="btn btn-primary" on:click={resetForm}>
								Enviar otro mensaje
							</button>
						</div>
					{:else}
						{#if errorMessage}
							<div class="error-banner">
								<span class="error-icon">⚠️</span>
								<p>{errorMessage}</p>
							</div>
						{/if}

						<form on:submit|preventDefault={handleSubmit} class="contact-form">
							<div class="form-group">
								<label for="name">Nombre Completo <span class="required">*</span></label>
								<input
									id="name"
									type="text"
									bind:value={name}
									placeholder="Ej. Juan Pérez"
									required
									class="input-field"
								/>
							</div>

							<div class="form-row">
								<div class="form-group">
									<label for="email">Correo Electrónico <span class="required">*</span></label>
									<input
										id="email"
										type="email"
										bind:value={email}
										placeholder="ejemplo@correo.com"
										required
										class="input-field"
									/>
								</div>

								<div class="form-group">
									<label for="phone">Teléfono / WhatsApp <span class="required">*</span></label>
									<input
										id="phone"
										type="tel"
										bind:value={phone}
										placeholder="Ej. 614 123 4567"
										required
										class="input-field"
									/>
								</div>
							</div>

							<div class="form-group">
								<label for="subject">¿En qué podemos ayudarte?</label>
								<select id="subject" bind:value={subject} class="input-field select-field">
									<option value="Comprar una propiedad">Quiero comprar una propiedad</option>
									<option value="Rentar una propiedad">Busco rentar una propiedad</option>
									<option value="Vender mi propiedad">Quiero vender o promover mi inmueble</option>
									<option value="Poner en renta mi propiedad">Quiero poner en renta mi inmueble</option>
									<option value="Asesoría Hipotecaria / Legal">Asesoría crediticia, hipotecaria o legal</option>
									<option value="Consulta general">Otra consulta general</option>
								</select>
							</div>

							<div class="form-group">
								<label for="message">Mensaje o Detalles <span class="required">*</span></label>
								<textarea
									id="message"
									bind:value={message}
									rows="5"
									placeholder="Cuéntanos sobre tu presupuesto, zona de preferencia, características deseadas o cualquier duda que tengas..."
									required
									class="input-field textarea-field"
								></textarea>
							</div>

							<div class="privacy-note">
								🔒 Tus datos están protegidos. No compartimos tu información con terceros.
							</div>

							<button
								type="submit"
								class="btn btn-primary submit-btn"
								disabled={isSubmitting}
							>
								{#if isSubmitting}
									<span class="spinner"></span> Enviando mensaje...
								{:else}
									<span>Enviar Mensaje Ahora →</span>
								{/if}
							</button>
						</form>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.contact-page {
		background-color: var(--color-background-alt, #f8f9fa);
		min-height: 85vh;
		padding-bottom: var(--spacing-2xl);
	}

	/* Hero Section */
	.contact-hero {
		background: linear-gradient(135deg, #003366 0%, var(--color-primary, #0056b3) 100%);
		color: white;
		padding: 3.5rem 0 3rem 0;
		text-align: center;
		position: relative;
		overflow: hidden;
	}

	.contact-hero::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 20px;
		background: var(--color-background-alt, #f8f9fa);
		clip-path: ellipse(55% 100% at 50% 100%);
	}

	.hero-content {
		position: relative;
		z-index: 2;
		max-width: 800px;
		margin: 0 auto;
	}

	.hero-brand {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 1.25rem;
	}

	.hero-logo {
		height: 48px;
		width: auto;
		filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.2));
		background: rgba(255, 255, 255, 0.95);
		padding: 6px 14px;
		border-radius: 8px;
	}

	.hero-slogan-badge {
		font-family: 'Segoe Print', 'Segoe Script', 'Comic Sans MS', cursive, sans-serif;
		font-size: 0.95rem;
		font-weight: 700;
		color: var(--color-secondary, #d9a036);
		background: rgba(0, 0, 0, 0.35);
		padding: 4px 16px;
		border-radius: 20px;
		letter-spacing: 0.5px;
		border: 1px solid rgba(217, 160, 54, 0.4);
	}

	.hero-title {
		font-size: 2.5rem;
		font-weight: 800;
		margin-bottom: 0.75rem;
		letter-spacing: -0.5px;
		line-height: 1.2;
	}

	.hero-subtitle {
		font-size: 1.1rem;
		color: rgba(255, 255, 255, 0.9);
		line-height: 1.6;
		max-width: 650px;
		margin: 0 auto;
	}

	/* Main Layout */
	.main-content-section {
		margin-top: 2rem;
	}

	.contact-layout {
		display: grid;
		grid-template-columns: 1fr 1.3fr;
		gap: 2.5rem;
		align-items: start;
	}

	/* Info Column */
	.contact-info-column {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.highlight-card {
		background: white;
		border-radius: 12px;
		padding: 1.75rem;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
		border-top: 4px solid var(--color-primary);
	}

	.brand-tag {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: 0.8rem;
		font-weight: 700;
		text-transform: uppercase;
		color: var(--color-primary);
		letter-spacing: 1px;
		margin-bottom: 0.5rem;
	}

	.brand-tag .dot {
		width: 8px;
		height: 8px;
		background: #28a745;
		border-radius: 50%;
		display: inline-block;
	}

	.highlight-card h3 {
		font-size: 1.4rem;
		color: var(--color-text-main);
		margin-bottom: 0.25rem;
	}

	.slogan-quote {
		font-family: 'Segoe Print', 'Segoe Script', cursive, sans-serif;
		color: var(--color-secondary, #c5a059);
		font-weight: bold;
		font-size: 1rem;
		margin-bottom: 0.75rem;
	}

	.highlight-card .desc {
		color: var(--color-text-light);
		font-size: 0.95rem;
		line-height: 1.5;
		margin-bottom: 1.25rem;
	}

	.whatsapp-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
		background-color: #25d366;
		color: white;
		padding: 0.85rem 1.25rem;
		border-radius: 8px;
		font-weight: 700;
		text-decoration: none;
		transition: background-color 0.2s, transform 0.2s, box-shadow 0.2s;
		box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);
	}

	.whatsapp-btn:hover {
		background-color: #1ebd5a;
		transform: translateY(-2px);
		box-shadow: 0 6px 16px rgba(37, 211, 102, 0.4);
	}

	.whatsapp-icon {
		width: 22px;
		height: 22px;
	}

	.info-items-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.info-box {
		background: white;
		padding: 1.25rem;
		border-radius: 10px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		border: 1px solid rgba(0, 0, 0, 0.04);
		transition: transform 0.2s, box-shadow 0.2s;
	}

	.info-box:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 16px rgba(0, 0, 0, 0.07);
	}

	.icon-circle {
		font-size: 1.5rem;
		line-height: 1;
	}

	.box-text h4 {
		font-size: 0.95rem;
		font-weight: 700;
		color: var(--color-primary);
		margin-bottom: 0.35rem;
	}

	.box-text p {
		font-size: 0.85rem;
		color: var(--color-text-light);
		line-height: 1.4;
		margin-bottom: 0.25rem;
	}

	.box-text .note {
		font-size: 0.8rem;
		font-style: italic;
		color: #888;
	}

	.phone-link,
	.email-link,
	.map-link {
		font-weight: 700;
		font-size: 0.9rem;
		color: var(--color-primary);
		display: inline-block;
		margin-top: 0.25rem;
		text-decoration: none;
	}

	.phone-link:hover,
	.email-link:hover,
	.map-link:hover {
		text-decoration: underline;
		color: var(--color-secondary);
	}

	/* Map Container */
	.map-container {
		background: white;
		border-radius: 10px;
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
		overflow: hidden;
		border: 1px solid var(--color-border);
	}

	.map-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem 1rem;
		background: #f1f5f9;
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--color-text-main);
	}

	.directions-btn {
		background: var(--color-primary);
		color: white;
		padding: 4px 10px;
		border-radius: 4px;
		font-size: 0.75rem;
		text-decoration: none;
		font-weight: 600;
	}

	.directions-btn:hover {
		background: var(--color-primary-dark);
	}

	/* Form Column */
	.form-card {
		background: white;
		padding: 2.5rem;
		border-radius: 12px;
		box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
		border: 1px solid rgba(0, 0, 0, 0.04);
	}

	.form-header {
		margin-bottom: 2rem;
		border-bottom: 2px solid #f1f5f9;
		padding-bottom: 1rem;
	}

	.form-header h2 {
		font-size: 1.75rem;
		color: var(--color-primary);
		margin-bottom: 0.35rem;
	}

	.form-header p {
		color: var(--color-text-light);
		font-size: 0.95rem;
	}

	.contact-form {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.form-group label {
		font-size: 0.9rem;
		font-weight: 600;
		color: var(--color-text-main);
	}

	.required {
		color: #e53e3e;
	}

	.input-field {
		width: 100%;
		padding: 0.8rem 1rem;
		border: 1.5px solid #dcdfe6;
		border-radius: 8px;
		font-family: inherit;
		font-size: 0.95rem;
		color: var(--color-text-main);
		background-color: #fafbfc;
		transition: border-color 0.2s, box-shadow 0.2s, background-color 0.2s;
	}

	.input-field:focus {
		outline: none;
		border-color: var(--color-primary);
		background-color: #ffffff;
		box-shadow: 0 0 0 3px rgba(0, 86, 179, 0.12);
	}

	.select-field {
		cursor: pointer;
	}

	.textarea-field {
		resize: vertical;
		min-height: 120px;
	}

	.privacy-note {
		font-size: 0.8rem;
		color: #718096;
		margin-top: -0.25rem;
	}

	.submit-btn {
		padding: 1rem 1.5rem;
		font-size: 1.05rem;
		font-weight: 700;
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		margin-top: 0.5rem;
	}

	.submit-btn:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.spinner {
		display: inline-block;
		width: 16px;
		height: 16px;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-radius: 50%;
		border-top-color: white;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	/* State alerts */
	.error-banner {
		background-color: #fef2f2;
		border: 1px solid #fecaca;
		color: #991b1b;
		padding: 1rem;
		border-radius: 8px;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 1.5rem;
		font-size: 0.9rem;
	}

	.success-state {
		text-align: center;
		padding: 2.5rem 1.5rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}

	.success-icon {
		font-size: 3rem;
		line-height: 1;
	}

	.success-state h3 {
		font-size: 1.6rem;
		color: var(--color-primary);
	}

	.success-state p {
		color: var(--color-text-light);
		max-width: 480px;
		line-height: 1.6;
	}

	.success-slogan {
		font-family: 'Segoe Print', 'Segoe Script', cursive, sans-serif;
		color: var(--color-secondary, #c5a059);
		font-size: 1.1rem;
		font-weight: bold;
		padding: 0.5rem 1rem;
		border-radius: 20px;
		background: #fff8e7;
		margin-bottom: 1rem;
	}

	/* Responsive */
	@media (max-width: 900px) {
		.contact-layout {
			grid-template-columns: 1fr;
			gap: 2rem;
		}

		.form-card {
			padding: 1.75rem;
		}

		.hero-title {
			font-size: 2rem;
		}
	}

	@media (max-width: 600px) {
		.info-items-grid {
			grid-template-columns: 1fr;
		}

		.form-row {
			grid-template-columns: 1fr;
		}

		.contact-hero {
			padding: 2.5rem 1rem 2rem 1rem;
		}

		.hero-title {
			font-size: 1.6rem;
		}

		.hero-subtitle {
			font-size: 0.95rem;
		}

		.form-card {
			padding: 1.25rem;
		}
	}
</style>
