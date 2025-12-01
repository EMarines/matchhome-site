<script>
	import UpdateInventoryButton from './UpdateInventoryButton.svelte';
</script>

<footer class="footer">
	<div class="container footer-container">
		<div class="footer-column">
			<h3 class="footer-logo">MatchHome</h3>
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
				<li>📍 Av. Principal 123, Ciudad</li>
				<li>📞 +52 55 1234 5678</li>
				<li>✉️ contacto@matchhome.com</li>
			</ul>
		</div>
	</div>
	<div class="footer-bottom">
		<p>&copy; 2024 MatchHome. Todos los derechos reservados.</p>
		<div style="margin-top: 10px;">
			<UpdateInventoryButton />
		</div>
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
	.footer-logo {
		font-size: var(--font-size-2xl);
		color: var(--color-white);
		margin-bottom: var(--spacing-md);
	}
	.footer-desc {
		color: #ccc;
		line-height: 1.6;
	}
	.footer-title {
		font-size: var(--font-size-lg);
		margin-bottom: var(--spacing-md);
		color: var(--color-secondary);
	}
	.footer-links li,
	.footer-contact li {
		margin-bottom: var(--spacing-sm);
	}
	.footer-links a {
		color: #ccc;
		transition: color 0.2s;
	}
	.footer-links a:hover {
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
			gap: var(--spacing-lg);
		}
	}
</style>
