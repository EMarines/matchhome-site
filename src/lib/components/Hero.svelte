<script>
	import { page } from '$app/stores';
	import { onDestroy } from 'svelte';

	export let searchValue = '';
	export let onSearch;

	let inputValue = searchValue;
	let debounceTimer;

	$: inputValue = searchValue;

	function handleChange(e) {
		inputValue = e.target.value;
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			if (onSearch) onSearch(inputValue);
		}, 300);
	}

	function handleKeyDown(e) {
		if (e.key === 'Enter') {
			clearTimeout(debounceTimer);
			if (onSearch) onSearch(inputValue);
		}
	}

	function handleButtonClick() {
		clearTimeout(debounceTimer);
		if (onSearch) onSearch(inputValue);
	}

	function clearSearch() {
		inputValue = '';
		clearTimeout(debounceTimer);
		if (onSearch) onSearch('');
	}

	onDestroy(() => {
		clearTimeout(debounceTimer);
	});
</script>

<section class="hero">
	<div class="hero-overlay"></div>
	<div class="container hero-content">
		<div class="hero-slogan-tag">
			<span>{$page.data.tenant?.slogan || 'Tu Patrimonio En Buenas Manos'}</span>
		</div>
		<h2 class="hero-title">Encuentra tu hogar ideal</h2>
		<p class="hero-subtitle">Las mejores propiedades en exclusiva para ti en Chihuahua</p>

		<div class="search-bar">
			<div class="search-input-wrapper">
				<span class="search-icon">🔍</span>
				<input
					type="text"
					placeholder="Buscar por colonia, zona, clave o tipo de propiedad..."
					class="search-input"
					value={inputValue}
					on:input={handleChange}
					on:keydown={handleKeyDown}
				/>
				{#if inputValue}
					<button type="button" class="clear-search-btn" on:click={clearSearch} aria-label="Borrar búsqueda">✕</button>
				{/if}
			</div>
			<button type="button" class="btn btn-secondary search-btn" on:click={handleButtonClick}>Buscar</button>
		</div>
	</div>
</section>

<style>
	.hero {
		background-image: url('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80');
		background-size: cover;
		background-position: center;
		height: 520px;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		color: var(--color-white);
	}
	.hero-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(10, 25, 47, 0.48);
	}
	.hero-content {
		position: relative;
		z-index: 1;
		text-align: center;
		width: 100%;
		max-width: 840px;
		padding: 0 var(--spacing-md);
	}
	.hero-slogan-tag {
		display: inline-block;
		margin-bottom: 0.85rem;
	}
	.hero-slogan-tag span {
		font-family: 'Segoe Print', 'Segoe Script', 'Comic Sans MS', cursive, sans-serif;
		background: rgba(0, 0, 0, 0.45);
		color: var(--color-secondary, #d9a036);
		padding: 8px 24px;
		border-radius: 30px;
		font-size: 1.35rem;
		font-weight: 700;
		border: 1px solid rgba(217, 160, 54, 0.45);
		backdrop-filter: blur(5px);
		letter-spacing: 0.5px;
		text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
		display: inline-block;
	}
	.hero-title {
		font-size: 3.2rem;
		font-weight: 800;
		margin-bottom: var(--spacing-sm);
		text-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
		letter-spacing: -0.5px;
	}
	.hero-subtitle {
		font-size: var(--font-size-xl);
		margin-bottom: 1.75rem;
		opacity: 0.95;
		text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
	}
	.search-bar {
		background: #ffffff;
		padding: 0.45rem;
		border-radius: 12px;
		display: flex;
		gap: 0.5rem;
		box-shadow: 0 12px 32px rgba(0, 0, 0, 0.25);
		align-items: center;
	}
	.search-input-wrapper {
		display: flex;
		align-items: center;
		flex: 1;
		padding-left: 0.75rem;
		position: relative;
	}
	.search-icon {
		font-size: 1.1rem;
		color: #718096;
		margin-right: 0.5rem;
	}
	.search-input {
		flex: 1;
		border: none;
		padding: 0.75rem 0.5rem;
		font-size: 1rem;
		color: #2d3748;
		outline: none;
		background: transparent;
	}
	.clear-search-btn {
		background: transparent;
		border: none;
		color: #a0aec0;
		font-size: 0.9rem;
		padding: 4px 8px;
		cursor: pointer;
		border-radius: 50%;
		margin-right: 0.5rem;
		transition: color 0.2s;
	}
	.clear-search-btn:hover {
		color: #4a5568;
	}
	.search-btn {
		padding: 0.85rem 2rem;
		font-weight: 700;
		border-radius: 8px;
		font-size: 1rem;
		box-shadow: 0 4px 12px rgba(197, 160, 89, 0.35);
		transition: all 0.2s;
	}
	.search-btn:hover {
		transform: translateY(-1px);
	}

	@media (max-width: 768px) {
		.hero {
			height: auto;
			min-height: 420px;
			padding: 3.5rem 0;
		}
		.hero-slogan-tag span {
			font-size: 1.1rem;
			padding: 6px 18px;
		}
		.hero-title {
			font-size: 2.1rem;
			line-height: 1.25;
		}
		.hero-subtitle {
			font-size: 1rem;
			margin-bottom: var(--spacing-xl);
		}
		.search-bar {
			flex-direction: column;
			padding: 0.75rem;
			gap: 0.75rem;
		}
		.search-input-wrapper {
			width: 100%;
			border: 1px solid #e2e8f0;
			border-radius: 8px;
			padding-left: 0.5rem;
		}
		.search-input {
			font-size: 16px; /* Previene auto-zoom en iOS Safari */
			padding: 0.75rem 0.5rem;
		}
		.search-btn {
			width: 100%;
			padding: 0.85rem;
		}
	}

	@media (max-width: 480px) {
		.hero-slogan-tag span {
			font-size: 1rem;
			padding: 5px 14px;
		}
		.hero-title {
			font-size: 1.75rem;
		}
	}
</style>
