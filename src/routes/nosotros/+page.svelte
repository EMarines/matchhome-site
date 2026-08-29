<script>
	import { page } from '$app/stores';

	$: tenant = $page.data.tenant || {};
	$: companyName = tenant.name || 'MatchHome';
	$: fullName = tenant.fullName || 'MatchHome Bienes Raíces';
	$: slogan = tenant.slogan || 'Tu Futuro En Buenas Manos';
	$: phoneDisplay = tenant.phone || '614 540 4003';
	$: phoneClean = (tenant.phoneRaw || '526145404003').replace(/\D/g, '');
	$: emailDisplay = tenant.email || 'matchhomebr@gmail.com';
	$: addressDisplay = tenant.address || 'Av. Francisco Villa # 5700, Col. Panamericana, Chihuahua, Chih.';
	$: scheduleDisplay = tenant.schedule || 'Lunes a Viernes: 9:00 AM - 7:00 PM | Sábados: 9:00 AM - 2:00 PM';
	$: logoUrl = tenant.theme?.logo || '/logo.png';
</script>

<svelte:head>
	<title>Nosotros | {companyName} - {slogan}</title>
	<meta
		name="description"
		content="Conoce a MatchHome Bienes Raíces en Chihuahua. Nuestra misión, visión, valores y equipo comprometido con proteger tu patrimonio. {slogan}."
	/>
</svelte:head>

<div class="nosotros-page">
	<!-- Hero Section -->
	<section class="about-hero">
		<div class="container hero-content">
			<div class="hero-badge">
				{#if logoUrl}
					<img src={logoUrl} alt={companyName} class="hero-logo-img" />
				{/if}
				<span class="hero-slogan">✨ {slogan}</span>
			</div>
			<h1 class="hero-title">Conectamos Tus Sueños con el Hogar Ideal</h1>
			<p class="hero-subtitle">
				En <strong>{fullName}</strong> brindamos seguridad, transparencia y respaldo integral en cada paso de tus transacciones inmobiliarias en Chihuahua.
			</p>
			<div class="hero-actions">
				<a href="/propiedades" class="btn btn-primary hero-btn">Explorar Propiedades</a>
				<a href="/contacto" class="btn btn-outline hero-btn">Contactar un Asesor</a>
			</div>
		</div>
	</section>

	<!-- Quiénes Somos / Historia & Compromiso -->
	<section class="section container">
		<div class="story-grid">
			<div class="story-text">
				<div class="section-tag">¿Quiénes Somos?</div>
				<h2 class="section-heading">Tu Aliado Inmobiliario de Confianza en Chihuahua</h2>
				<div class="slogan-callout">
					<span class="quote-mark">“</span>
					<p class="slogan-text">{slogan}</p>
				</div>
				<p class="paragraph">
					<strong>{companyName}</strong> nace con la convicción de transformar la experiencia inmobiliaria tradicional en un proceso ágil, transparente y verdaderamente humano. Sabemos que comprar, vender o rentar un inmueble es una de las decisiones financieras y personales más importantes en la vida de cualquier familia o inversionista.
				</p>
				<p class="paragraph">
					Por ello, nuestro equipo multidisciplinario de asesores inmobiliarios, especialistas legales y gestores hipotecarios trabaja incansablemente para garantizar que cada operación cuente con la máxima certeza jurídica y el mejor rendimiento comercial.
				</p>
				<div class="key-points">
					<div class="point-item">
						<span class="check-icon">✓</span>
						<span>Asesoría personalizada de inicio a fin</span>
					</div>
					<div class="point-item">
						<span class="check-icon">✓</span>
						<span>Certeza jurídica y revisión legal exhaustiva</span>
					</div>
					<div class="point-item">
						<span class="check-icon">✓</span>
						<span>Tecnología y mercadotecnia digital de alto impacto</span>
					</div>
				</div>
			</div>

			<div class="story-visual">
				<div class="visual-card main-card">
					<div class="card-glow"></div>
					<div class="card-content">
						<div class="card-logo-center">
							<img src={logoUrl} alt={companyName} class="card-logo" />
							<p class="card-slogan">{slogan}</p>
						</div>
						<div class="stats-mini-grid">
							<div class="mini-stat">
								<span class="stat-number">100%</span>
								<span class="stat-label">Compromiso Ético</span>
							</div>
							<div class="mini-stat">
								<span class="stat-number">+10</span>
								<span class="stat-label">Años de Experiencia</span>
							</div>
							<div class="mini-stat">
								<span class="stat-number">360°</span>
								<span class="stat-label">Asesoría Integral</span>
							</div>
							<div class="mini-stat">
								<span class="stat-number">A+</span>
								<span class="stat-label">Satisfacción Cliente</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Misión, Visión y Valores -->
	<section class="section bg-alt">
		<div class="container">
			<div class="text-center header-block">
				<span class="section-tag">Nuestros Fundamentos</span>
				<h2 class="section-heading">Misión, Visión y Valores</h2>
				<p class="section-subtext">
					Los principios que guían cada asesoría, cada negociación y cada apretón de manos.
				</p>
			</div>

			<div class="mvv-grid">
				<!-- Misión -->
				<div class="mvv-card">
					<div class="mvv-icon-box blue">
						<span>🎯</span>
					</div>
					<h3>Nuestra Misión</h3>
					<p>
						Brindar soluciones inmobiliarias integrales, éticas y personalizadas que protejan el patrimonio de nuestros clientes, superando sus expectativas a través de un servicio cálido, seguro e innovador.
					</p>
				</div>

				<!-- Visión -->
				<div class="mvv-card">
					<div class="mvv-icon-box gold">
						<span>👁️</span>
					</div>
					<h3>Nuestra Visión</h3>
					<p>
						Ser la agencia de bienes raíces líder y de mayor confianza en Chihuahua, reconocida por revolucionar el sector con herramientas tecnológicas de punta, excelencia operativa y la más alta satisfacción de nuestros clientes.
					</p>
				</div>

				<!-- Valores -->
				<div class="mvv-card">
					<div class="mvv-icon-box green">
						<span>💎</span>
					</div>
					<h3>Nuestros Valores</h3>
					<ul class="values-list">
						<li><strong>Confianza:</strong> Relaciones transparentes y honestas.</li>
						<li><strong>Compromiso:</strong> Tu patrimonio es nuestra máxima prioridad.</li>
						<li><strong>Innovación:</strong> Portales modernos y difusión de vanguardia.</li>
						<li><strong>Profesionalismo:</strong> Certeza legal en cada contrato.</li>
					</ul>
				</div>
			</div>
		</div>
	</section>

	<!-- Servicios que Ofrecemos -->
	<section class="section container">
		<div class="text-center header-block">
			<span class="section-tag">Lo Que Hacemos Por Ti</span>
			<h2 class="section-heading">Servicios Inmobiliarios Integrales</h2>
			<p class="section-subtext">
				Todo lo que necesitas para tu compra, venta o arrendamiento en un solo lugar.
			</p>
		</div>

		<div class="services-grid">
			<div class="service-item">
				<div class="service-icon">🏡</div>
				<h4>Compra y Venta de Inmuebles</h4>
				<p>
					Promoción estratégica de residencias, departamentos, terrenos y locales comerciales con las mejores condiciones del mercado.
				</p>
			</div>

			<div class="service-item">
				<div class="service-icon">🔑</div>
				<h4>Rentas y Administración</h4>
				<p>
					Filtros rigurosos de prospectos, pólizas jurídicas de arrendamiento y gestión tranquila para propietarios e inquilinos.
				</p>
			</div>

			<div class="service-item">
				<div class="service-icon">📑</div>
				<h4>Asesoría Hipotecaria y Legal</h4>
				<p>
					Tramitación sin costo de créditos bancarios, Infonavit y Fovissste. Acompañamiento notarial hasta la firma de escrituras.
				</p>
			</div>

			<div class="service-item">
				<div class="service-icon">📊</div>
				<h4>Valuación y Análisis Comercial</h4>
				<p>
					Opiniones de valor sustentadas en el mercado real de Chihuahua para fijar el precio óptimo y maximizar tu inversión.
				</p>
			</div>
		</div>
	</section>

	<!-- Bloque de Contacto Directo y Ubicación -->
	<section class="section bg-contact">
		<div class="container">
			<div class="contact-nosotros-card">
				<div class="contact-nosotros-info">
					<span class="section-tag-light">Estamos Cerca de Ti</span>
					<h2>¿Listo para dar el siguiente paso?</h2>
					<p class="contact-slogan-highlight">"{slogan}"</p>
					<p class="contact-desc">
						Visítanos en nuestras oficinas corporativas en la zona de mayor crecimiento de Chihuahua o escríbenos para recibir atención inmediata.
					</p>

					<div class="contact-pills">
						<div class="pill-item">
							<span class="pill-icon">📍</span>
							<div>
								<strong>Dirección:</strong>
								<span>{addressDisplay}</span>
							</div>
						</div>
						<div class="pill-item">
							<span class="pill-icon">📞</span>
							<div>
								<strong>Teléfono:</strong>
								<a href="tel:{phoneClean}">{phoneDisplay}</a>
							</div>
						</div>
						<div class="pill-item">
							<span class="pill-icon">✉️</span>
							<div>
								<strong>Correo:</strong>
								<a href="mailto:{emailDisplay}">{emailDisplay}</a>
							</div>
						</div>
						<div class="pill-item">
							<span class="pill-icon">🕒</span>
							<div>
								<strong>Horario:</strong>
								<span>{scheduleDisplay}</span>
							</div>
						</div>
					</div>

					<div class="cta-actions">
						<a href="/contacto" class="btn btn-secondary cta-btn">Ir al Formulario de Contacto →</a>
						<a
							href="https://wa.me/{phoneClean}?text=Hola%20MatchHome%2C%20quisiera%20recibir%20informaci%C3%B3n%20sobre%20sus%20servicios."
							target="_blank"
							rel="noopener noreferrer"
							class="whatsapp-cta-btn"
						>
							💬 Contactar por WhatsApp
						</a>
					</div>
				</div>

				<div class="contact-nosotros-map">
					<iframe
						title="Ubicación Oficina MatchHome"
						src="https://maps.google.com/maps?q=Av.+Francisco+Villa+5700,+Panamericana,+31210+Chihuahua,+Chih.&t=&z=15&ie=UTF8&iwloc=&output=embed"
						width="100%"
						height="340"
						style="border:0; border-radius: 12px;"
						allowfullscreen=""
						loading="lazy"
						referrerpolicy="no-referrer-when-downgrade"
					></iframe>
				</div>
			</div>
		</div>
	</section>
</div>

<style>
	.nosotros-page {
		background-color: var(--color-background);
		color: var(--color-text-main);
	}

	/* Hero */
	.about-hero {
		background: linear-gradient(135deg, #002244 0%, #004488 50%, var(--color-primary, #0056b3) 100%);
		color: white;
		padding: 4.5rem 0 4rem 0;
		text-align: center;
		position: relative;
	}

	.about-hero::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 24px;
		background: var(--color-background, #ffffff);
		clip-path: ellipse(50% 100% at 50% 100%);
	}

	.hero-content {
		max-width: 850px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.hero-badge {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.6rem;
		margin-bottom: 1.5rem;
	}

	.hero-logo-img {
		height: 52px;
		width: auto;
		background: rgba(255, 255, 255, 0.95);
		padding: 8px 16px;
		border-radius: 10px;
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
	}

	.hero-slogan {
		font-family: 'Segoe Print', 'Segoe Script', cursive, sans-serif;
		font-size: 1.05rem;
		font-weight: 700;
		color: var(--color-secondary, #d9a036);
		background: rgba(0, 0, 0, 0.4);
		padding: 4px 18px;
		border-radius: 20px;
		border: 1px solid rgba(217, 160, 54, 0.5);
		letter-spacing: 0.5px;
	}

	.hero-title {
		font-size: 2.75rem;
		font-weight: 800;
		letter-spacing: -0.5px;
		line-height: 1.2;
		margin-bottom: 1rem;
	}

	.hero-subtitle {
		font-size: 1.15rem;
		line-height: 1.6;
		color: rgba(255, 255, 255, 0.92);
		margin-bottom: 2rem;
		max-width: 700px;
	}

	.hero-actions {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
		justify-content: center;
	}

	.hero-btn {
		padding: 0.85rem 1.75rem;
		font-size: 1rem;
		font-weight: 700;
		border-radius: 8px;
		text-decoration: none;
	}

	.btn-outline {
		background: transparent;
		color: white;
		border: 2px solid white;
		transition: all 0.2s;
	}

	.btn-outline:hover {
		background: white;
		color: var(--color-primary);
	}

	/* General tags & headings */
	.section-tag {
		display: inline-block;
		font-size: 0.85rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 1.5px;
		color: var(--color-primary);
		background: rgba(0, 86, 179, 0.08);
		padding: 4px 12px;
		border-radius: 20px;
		margin-bottom: 0.75rem;
	}

	.section-tag-light {
		display: inline-block;
		font-size: 0.85rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 1.5px;
		color: var(--color-secondary, #d9a036);
		background: rgba(255, 255, 255, 0.1);
		padding: 4px 12px;
		border-radius: 20px;
		margin-bottom: 0.75rem;
	}

	.section-heading {
		font-size: 2.2rem;
		font-weight: 800;
		color: var(--color-text-main);
		margin-bottom: 1rem;
		line-height: 1.25;
	}

	.section-subtext {
		font-size: 1.1rem;
		color: var(--color-text-light);
		max-width: 600px;
		margin: 0 auto;
		line-height: 1.5;
	}

	.header-block {
		margin-bottom: 2.5rem;
	}

	.text-center {
		text-align: center;
	}

	.bg-alt {
		background-color: var(--color-background-alt, #f8f9fa);
	}

	/* Story Grid */
	.story-grid {
		display: grid;
		grid-template-columns: 1.2fr 1fr;
		gap: 3rem;
		align-items: center;
	}

	.slogan-callout {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background: #fff8eb;
		border-left: 4px solid var(--color-secondary, #d9a036);
		padding: 0.75rem 1.25rem;
		border-radius: 0 8px 8px 0;
		margin-bottom: 1.25rem;
	}

	.quote-mark {
		font-size: 2rem;
		line-height: 1;
		color: var(--color-secondary, #d9a036);
		font-family: Georgia, serif;
	}

	.slogan-text {
		font-family: 'Segoe Print', 'Segoe Script', cursive, sans-serif;
		font-size: 1.15rem;
		font-weight: 700;
		color: #8c6211;
		margin: 0;
	}

	.paragraph {
		font-size: 1.05rem;
		line-height: 1.7;
		color: #4a5568;
		margin-bottom: 1rem;
	}

	.key-points {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		margin-top: 1.25rem;
	}

	.point-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		font-weight: 600;
		color: var(--color-text-main);
	}

	.check-icon {
		background: #e6f4ea;
		color: #137333;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-weight: bold;
		font-size: 0.85rem;
	}

	/* Story Visual Card */
	.visual-card {
		background: linear-gradient(145deg, #003366, #001f3f);
		color: white;
		border-radius: 16px;
		padding: 2.5rem 2rem;
		box-shadow: 0 15px 35px rgba(0, 51, 102, 0.25);
		position: relative;
		overflow: hidden;
	}

	.card-glow {
		position: absolute;
		top: -50%;
		right: -50%;
		width: 200%;
		height: 200%;
		background: radial-gradient(circle, rgba(197, 160, 89, 0.15) 0%, transparent 60%);
		pointer-events: none;
	}

	.card-logo-center {
		text-align: center;
		margin-bottom: 2rem;
	}

	.card-logo {
		height: 48px;
		width: auto;
		background: white;
		padding: 6px 14px;
		border-radius: 8px;
		margin: 0 auto 0.75rem auto;
	}

	.card-slogan {
		font-family: 'Segoe Print', 'Segoe Script', cursive, sans-serif;
		color: var(--color-secondary, #d9a036);
		font-size: 0.95rem;
		font-weight: 600;
	}

	.stats-mini-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.25rem;
	}

	.mini-stat {
		background: rgba(255, 255, 255, 0.08);
		border: 1px solid rgba(255, 255, 255, 0.12);
		padding: 1rem;
		border-radius: 10px;
		text-align: center;
		backdrop-filter: blur(5px);
	}

	.stat-number {
		display: block;
		font-size: 1.75rem;
		font-weight: 800;
		color: var(--color-secondary, #d9a036);
		margin-bottom: 0.25rem;
	}

	.stat-label {
		font-size: 0.8rem;
		color: rgba(255, 255, 255, 0.85);
		font-weight: 500;
	}

	/* MVV Grid */
	.mvv-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 2rem;
	}

	.mvv-card {
		background: white;
		padding: 2.25rem;
		border-radius: 12px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
		border-top: 4px solid var(--color-primary);
		transition: transform 0.2s, box-shadow 0.2s;
	}

	.mvv-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 8px 30px rgba(0, 0, 0, 0.09);
	}

	.mvv-icon-box {
		width: 54px;
		height: 54px;
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.75rem;
		margin-bottom: 1.25rem;
	}

	.mvv-icon-box.blue {
		background: #e8f0fe;
	}

	.mvv-icon-box.gold {
		background: #fef7e0;
	}

	.mvv-icon-box.green {
		background: #e6f4ea;
	}

	.mvv-card h3 {
		font-size: 1.4rem;
		color: var(--color-primary);
		margin-bottom: 0.75rem;
	}

	.mvv-card p {
		color: var(--color-text-light);
		line-height: 1.6;
		font-size: 0.95rem;
	}

	.values-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		color: var(--color-text-light);
		font-size: 0.9rem;
		line-height: 1.4;
	}

	.values-list strong {
		color: var(--color-text-main);
	}

	/* Services Grid */
	.services-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
		gap: 1.5rem;
	}

	.service-item {
		background: white;
		padding: 2rem 1.5rem;
		border-radius: 12px;
		border: 1px solid var(--color-border);
		transition: all 0.2s ease;
	}

	.service-item:hover {
		border-color: var(--color-primary);
		box-shadow: 0 6px 20px rgba(0, 86, 179, 0.08);
		transform: translateY(-2px);
	}

	.service-icon {
		font-size: 2.2rem;
		margin-bottom: 1rem;
	}

	.service-item h4 {
		font-size: 1.15rem;
		color: var(--color-primary);
		margin-bottom: 0.5rem;
	}

	.service-item p {
		font-size: 0.9rem;
		color: var(--color-text-light);
		line-height: 1.5;
	}

	/* Contact & Map Card */
	.bg-contact {
		background: #001f3f;
		color: white;
		padding: 4rem 0;
	}

	.contact-nosotros-card {
		display: grid;
		grid-template-columns: 1.2fr 1fr;
		gap: 3rem;
		align-items: center;
	}

	.contact-nosotros-info h2 {
		font-size: 2.2rem;
		font-weight: 800;
		margin-bottom: 0.5rem;
		color: white;
	}

	.contact-slogan-highlight {
		font-family: 'Segoe Print', 'Segoe Script', cursive, sans-serif;
		color: var(--color-secondary, #d9a036);
		font-size: 1.2rem;
		font-weight: 700;
		margin-bottom: 1rem;
	}

	.contact-desc {
		color: #cbd5e0;
		font-size: 1rem;
		line-height: 1.6;
		margin-bottom: 1.75rem;
	}

	.contact-pills {
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
		margin-bottom: 2rem;
	}

	.pill-item {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		font-size: 0.95rem;
		color: #e2e8f0;
	}

	.pill-icon {
		font-size: 1.2rem;
		line-height: 1;
		margin-top: 2px;
	}

	.pill-item strong {
		color: var(--color-secondary, #d9a036);
		margin-right: 0.35rem;
	}

	.pill-item a {
		color: white;
		text-decoration: underline;
	}

	.cta-actions {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.cta-btn {
		padding: 0.85rem 1.5rem;
		font-size: 0.95rem;
		font-weight: 700;
		border-radius: 8px;
		text-decoration: none;
	}

	.whatsapp-cta-btn {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		background-color: #25d366;
		color: white;
		padding: 0.85rem 1.5rem;
		border-radius: 8px;
		font-weight: 700;
		text-decoration: none;
		transition: background-color 0.2s;
	}

	.whatsapp-cta-btn:hover {
		background-color: #1ebd5a;
	}

	.contact-nosotros-map {
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
		border-radius: 12px;
		overflow: hidden;
	}

	/* Responsive */
	@media (max-width: 900px) {
		.story-grid,
		.contact-nosotros-card {
			grid-template-columns: 1fr;
			gap: 2.5rem;
		}

		.hero-title {
			font-size: 2.1rem;
		}

		.section-heading {
			font-size: 1.8rem;
		}
	}

	@media (max-width: 600px) {
		.about-hero {
			padding: 3rem 1rem 2.5rem 1rem;
		}

		.hero-title {
			font-size: 1.7rem;
		}

		.hero-subtitle {
			font-size: 1rem;
		}

		.mvv-card {
			padding: 1.5rem;
		}

		.stats-mini-grid {
			grid-template-columns: 1fr;
		}

		.contact-nosotros-info h2 {
			font-size: 1.6rem;
		}
	}
</style>
