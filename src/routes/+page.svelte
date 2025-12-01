<script>
	import Hero from '$lib/components/Hero.svelte';
	import PropertyCard from '$lib/components/PropertyCard.svelte';
	import Filters from '$lib/components/Filters.svelte';
	import inventoryData from '$lib/data/inventory.json';
	import { filterProperties } from '$lib/utils/filterProperties';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	let showFilters = false;

	// Estado inicial desde URL
	let search = $page.url.searchParams.get('q') || '';
	let filters = {
		bedrooms: $page.url.searchParams.get('bedrooms') || 0,
		bathrooms: $page.url.searchParams.get('bathrooms') || 0,
		parking: $page.url.searchParams.get('parking') || 0,
		minPrice: $page.url.searchParams.get('min_price') || '',
		maxPrice: $page.url.searchParams.get('max_price') || '',
		propertyType: $page.url.searchParams.get('property_type') || '',
		operationType: $page.url.searchParams.get('operation_type') || '',
		tags: $page.url.searchParams.get('tags') ? $page.url.searchParams.get('tags').split(',') : []
	};
	let currentPage = parseInt($page.url.searchParams.get('page')) || 1;

	// Reactividad
	$: result = filterProperties(inventoryData, search, filters, currentPage);
	$: properties = result.items;
	$: pagination = result.pagination;

	// Actualizar URL
	function updateUrl() {
		const params = new URLSearchParams();
		if (search) params.set('q', search);
		if (currentPage > 1) params.set('page', currentPage);
		if (filters.bedrooms > 0) params.set('bedrooms', filters.bedrooms);
		if (filters.bathrooms > 0) params.set('bathrooms', filters.bathrooms);
		if (filters.parking > 0) params.set('parking', filters.parking);
		if (filters.minPrice) params.set('min_price', filters.minPrice);
		if (filters.maxPrice) params.set('max_price', filters.maxPrice);
		if (filters.propertyType) params.set('property_type', filters.propertyType);
		if (filters.operationType) params.set('operation_type', filters.operationType);
		if (filters.tags.length > 0) params.set('tags', filters.tags.join(','));

		goto(`/?${params.toString()}`, { replaceState: true, keepFocus: true, noScroll: true });
	}

	function handleSearch(term) {
		search = term;
		currentPage = 1;
		updateUrl();
	}

	function handleFilterChange(name, value) {
		filters = { ...filters, [name]: value };
		currentPage = 1;
		updateUrl();
	}

	function clearFilters() {
		search = '';
		filters = {
			bedrooms: 0,
			bathrooms: 0,
			parking: 0,
			minPrice: '',
			maxPrice: '',
			propertyType: '',
			operationType: '',
			tags: []
		};
		currentPage = 1;
		updateUrl();
	}

	function nextPage() {
		if (pagination.next_page) {
			currentPage++;
			updateUrl();
			window.scrollTo(0, 0);
		}
	}

	function prevPage() {
		if (currentPage > 1) {
			currentPage--;
			updateUrl();
			window.scrollTo(0, 0);
		}
	}
</script>

<svelte:head>
	<title>MatchHome - Encuentra tu hogar ideal</title>
	<meta
		name="description"
		content="Las mejores propiedades en exclusiva para ti. Venta y renta de casas, departamentos y terrenos."
	/>
</svelte:head>

<Hero onSearch={handleSearch} searchValue={search} />

<section class="section container">
	<h2 class="section-title">Propiedades Destacadas</h2>

	<div
		class="filters-header"
		style="margin-bottom: var(--spacing-lg); display: flex; justify-content: space-between; align-items: center;"
	>
		<button class="btn btn-secondary" on:click={() => (showFilters = !showFilters)}>
			{showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
		</button>
	</div>

	{#if showFilters}
		<Filters
			{filters}
			onFilterChange={handleFilterChange}
			onClear={clearFilters}
			onClose={() => (showFilters = false)}
		/>
	{/if}

	<div class="properties-grid">
		{#each properties as property (property.public_id || Math.random())}
			<PropertyCard {property} />
		{/each}
	</div>

	<div class="pagination-controls">
		<button on:click={prevPage} disabled={currentPage === 1} class="btn btn-secondary">
			Anterior
		</button>
		<span class="page-info">Página {currentPage}</span>
		<button on:click={nextPage} disabled={!pagination.next_page} class="btn btn-primary">
			Siguiente
		</button>
	</div>
</section>

<section class="section" style="background-color: var(--color-background-alt);">
	<div class="container">
		<h2 class="section-title">¿Por qué elegirnos?</h2>
		<div class="features-grid">
			<div class="feature-item">
				<h3>Experiencia</h3>
				<p>Más de 10 años conectando personas con su hogar ideal.</p>
			</div>
			<div class="feature-item">
				<h3>Confianza</h3>
				<p>Procesos transparentes y seguros en cada transacción.</p>
			</div>
			<div class="feature-item">
				<h3>Soporte</h3>
				<p>Acompañamiento personalizado en todo el proceso.</p>
			</div>
		</div>
	</div>
</section>

<style>
	.properties-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: var(--spacing-xl);
	}
	.features-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: var(--spacing-xl);
		text-align: center;
	}
	.feature-item h3 {
		color: var(--color-secondary);
		margin-bottom: var(--spacing-sm);
		font-size: var(--font-size-xl);
	}
	.pagination-controls {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: var(--spacing-lg);
		margin-top: var(--spacing-2xl);
	}
	.page-info {
		font-weight: 600;
		color: var(--color-text-light);
	}
	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
