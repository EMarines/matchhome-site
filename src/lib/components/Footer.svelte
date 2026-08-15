<script>
	import { page } from '$app/stores';
</script>

<footer class="footer">
	<div class="container footer-container">
		<div class="footer-column">
			<a href="/" class="footer-logo-link">
				{#if $page.data.tenant?.theme?.logo}
					<img
						src={$page.data.tenant.theme.logo}
						alt={$page.data.tenant.name}
						class="footer-logo-img"
					/>
				{:else}
					<h3 class="footer-logo">{$page.data.tenant?.name || 'MatchHome'}</h3>
				{/if}
			</a>
			<p class="footer-desc">
				Tu aliado confiable para encontrar la propiedad de tus sueños. Experiencia, seguridad y
				confianza.
			</p>
		</div>
		<div class="footer-column">
			<h4 class="footer-title">Enlaces Rápidos</h4>
			<ul class="footer-links">
				<li><a href="/">Inicio</a></li>
				<li><a href="/propiedades">Propiedades</a></li>
				<li><a href="/nosotros">Nosotros</a></li>
				<li><a href="/contacto">Contacto</a></li>
			</ul>
		</div>
		<div class="footer-column">
			<h4 class="footer-title">Contacto</h4>
			<ul class="footer-contact">
				<li>📍 Av. Francisco Villa # 5700, Col. Panamericana</li>
				<li>📞 <a href="tel:6145404003">614 540 4003</a></li>
				<li>✉️ <a href="mailto:contacto@matchhome.com">contacto@matchhome.com</a></li>
			</ul>
		</div>
	</div>
	<div class="footer-bottom">
		<p>&copy; {new Date().getFullYear()} {$page.data.tenant?.name || 'MatchHome'}. Todos los derechos reservados.</p>
	</div>
</footer>

<style>
	.footer {
		background-color: var(--color-text-main);
		color: var(--color-white);
		padding-top: var(--spacing-2xl);
	}
	.footer-container {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: var(--spacing-xl);
		padding-bottom: var(--spacing-2xl);
	}
	.footer-logo-link {
		display: inline-block;
		margin-bottom: var(--spacing-md);
	}
	.footer-logo {
		font-size: var(--font-size-2xl);
		color: var(--color-white);
		font-weight: 800;
	}
	.footer-logo-img {
		height: 45px;
		width: auto;
		max-width: 200px;
		object-fit: contain;
	}
	.footer-desc {
		color: #ccc;
		line-height: 1.6;
		font-size: 0.95rem;
	}
	.footer-title {
		font-size: var(--font-size-lg);
		margin-bottom: var(--spacing-md);
		color: var(--color-secondary);
	}
	.footer-links li,
	.footer-contact li {
		margin-bottom: var(--spacing-sm);
		color: #ccc;
		font-size: 0.95rem;
		line-height: 1.5;
	}
	.footer-links a,
	.footer-contact a {
		color: #ccc;
		transition: color 0.2s;
	}
	.footer-links a:hover,
	.footer-contact a:hover {
		color: var(--color-secondary);
	}
	.footer-bottom {
		background-color: #000;
		padding: var(--spacing-md);
		text-align: center;
		color: #888;
		font-size: var(--font-size-sm);
	}

	@media (max-width: 768px) {
		.footer-container {
			grid-template-columns: 1fr;
			text-align: center;
			gap: var(--spacing-xl);
		}
		.footer-logo-img {
			margin: 0 auto;
		}
	}
</style>
