<script>
	import { page } from '$app/stores';
	let isMenuOpen = false;

	function toggleMenu() {
		isMenuOpen = !isMenuOpen;
	}

	function closeMenu() {
		isMenuOpen = false;
	}

	$: if (typeof document !== 'undefined') {
		document.body.style.overflow = isMenuOpen ? 'hidden' : '';
	}
</script>

<header class="header">
	<div class="container header-container">
		<div class="logo">
			<a href="/" class="logo-link">
				{#if $page.data.tenant?.theme?.logo}
					<img src={$page.data.tenant.theme.logo} alt={$page.data.tenant.name} class="logo-img" />
				{:else}
					<h1>{$page.data.tenant?.name || 'MatchHome'}</h1>
				{/if}
				<span class="logo-slogan">Tu patrimonio en buenas manos</span>
			</a>
		</div>

		<button
			class="hamburger-btn"
			on:click={toggleMenu}
			aria-label="Toggle menu"
			aria-expanded={isMenuOpen}
		>
			<span class={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
			<span class={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
			<span class={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
		</button>

		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div class={`menu-backdrop ${isMenuOpen ? 'open' : ''}`} on:click={closeMenu}></div>

		<nav class={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
			<div class="mobile-nav-header">
				<span class="mobile-nav-title">Menú</span>
				<button class="close-btn" on:click={closeMenu} aria-label="Cerrar menú">✕</button>
			</div>
			<ul class="nav-list">
				<li><a href="/" class="nav-link" on:click={closeMenu}>Inicio</a></li>
				<li><a href="/propiedades" class="nav-link" on:click={closeMenu}>Propiedades</a></li>
				<li><a href="/nosotros" class="nav-link" on:click={closeMenu}>Nosotros</a></li>
				<li><a href="/contacto" class="nav-link" on:click={closeMenu}>Contacto</a></li>
			</ul>
		</nav>
	</div>
</header>

<style>
	.header {
		background-color: rgba(255, 255, 255, 0.98);
		box-shadow: 0 2px 15px rgba(0, 0, 0, 0.08);
		height: var(--header-height);
		display: flex;
		align-items: center;
		position: sticky;
		top: 0;
		z-index: 1000;
		transition: all 0.3s ease;
	}
	.header-container {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
	}
	.logo-link {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		text-decoration: none;
	}
	.logo h1 {
		color: var(--color-primary);
		font-size: 1.6rem;
		font-weight: 800;
		letter-spacing: -0.5px;
		margin: 0;
	}
	.logo-img {
		height: 38px;
		width: auto;
		max-width: 180px;
		object-fit: contain;
	}
	.logo-slogan {
		font-family: 'Segoe Print', 'Segoe Script', 'Comic Sans MS', cursive, sans-serif;
		font-size: 0.7rem;
		font-weight: 600;
		color: var(--color-primary);
		margin-top: 1px;
		line-height: 1.1;
		white-space: nowrap;
	}
	.nav-list {
		display: flex;
		gap: 2rem;
		align-items: center;
	}
	.nav-link {
		font-weight: 500;
		color: var(--color-text-main);
		transition: color 0.2s;
		font-size: 0.95rem;
		position: relative;
	}
	.nav-link:after {
		content: '';
		position: absolute;
		width: 0;
		height: 2px;
		bottom: -4px;
		left: 0;
		background-color: var(--color-secondary);
		transition: width 0.3s;
	}
	.nav-link:hover {
		color: var(--color-primary);
	}
	.nav-link:hover:after {
		width: 100%;
	}
	
	.mobile-nav-header {
		display: none;
	}

	/* Backdrop */
	.menu-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 1001;
		opacity: 0;
		visibility: hidden;
		pointer-events: none;
		transition: opacity 0.3s ease, visibility 0.3s ease;
	}
	.menu-backdrop.open {
		opacity: 1;
		visibility: visible;
		pointer-events: auto;
	}

	.hamburger-btn {
		display: none;
		flex-direction: column;
		justify-content: space-between;
		width: 28px;
		height: 20px;
		background: transparent;
		border: none;
		cursor: pointer;
		padding: 0;
		z-index: 1003;
		position: relative;
	}
	.hamburger-line {
		width: 100%;
		height: 3px;
		background-color: var(--color-primary);
		border-radius: 3px;
		transition: all 0.3s ease-in-out;
		transform-origin: center;
	}
	.hamburger-line.open:nth-child(1) {
		transform: translateY(8.5px) rotate(45deg);
	}
	.hamburger-line.open:nth-child(2) {
		opacity: 0;
	}
	.hamburger-line.open:nth-child(3) {
		transform: translateY(-8.5px) rotate(-45deg);
	}

	@media (max-width: 768px) {
		.hamburger-btn {
			display: flex;
		}
		.nav {
			position: fixed;
			top: 0;
			right: 0;
			width: 80%;
			max-width: 320px;
			height: 100vh;
			background-color: var(--color-white);
			box-shadow: -5px 0 25px rgba(0, 0, 0, 0.15);
			padding: 1.5rem;
			transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.3s;
			display: flex;
			flex-direction: column;
			gap: 1.5rem;
			transform: translateX(100%);
			visibility: hidden;
			pointer-events: none;
			z-index: 1002;
		}
		.nav.nav-open {
			transform: translateX(0);
			visibility: visible;
			pointer-events: auto;
		}
		.mobile-nav-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding-bottom: 1rem;
			border-bottom: 1px solid var(--color-border);
		}
		.mobile-nav-title {
			font-weight: 700;
			font-size: 1.1rem;
			color: var(--color-primary);
		}
		.close-btn {
			background: none;
			border: none;
			font-size: 1.25rem;
			color: var(--color-text-light);
			cursor: pointer;
			padding: 4px;
		}
		.nav-list {
			flex-direction: column;
			align-items: flex-start;
			width: 100%;
			gap: 0.5rem;
		}
		.nav-link {
			font-size: 1.05rem;
			display: block;
			width: 100%;
			padding: 0.75rem 0;
			border-bottom: 1px solid #f0f0f0;
		}
		.nav-link:after {
			display: none;
		}
	}
</style>
