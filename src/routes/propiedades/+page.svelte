<script>
	import PropertyCard from '$lib/components/PropertyCard.svelte';
	import Filters from '$lib/components/Filters.svelte';
	import { filterProperties } from '$lib/utils/filterProperties';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onDestroy } from 'svelte';

	export let data;

	let showFilters = false;
	let debounceTimer;

	// Estado inicial desde URL
	let search = $page.url.searchParams.get('q') || '';
	let currentPage = parseInt($page.url.searchParams.get('page')) || 1;
	let limit = 24;

	let filters = {
		bedrooms: $page.url.searchParams.get('bedrooms') || '0',
		bathrooms: $page.url.searchParams.get('bathrooms') || '0',
		parking: $page.url.searchParams.get('parking') || '0',
		minPrice: $page.url.searchParams.get('min_price') || '',
		maxPrice: $page.url.searchParams.get('max_price') || '',
		propertyType: $page.url.searchParams.get('property_type') || '',
		operationType: $page.url.searchParams.get('operation_type') || '',
		tags: $page.url.searchParams.get('tags') ? $page.url.searchParams.get('tags').split(',').filter(Boolean) : []
	};

	// Usar propiedades del servidor (Firestore / fallback)
	$: sourceProperties = data.properties || [];

	// Conteo de filtros activos
	$: activeFilterCount = [
		filters.operationType,
		filters.propertyType,
		parseInt(filters.bedrooms) > 0 ? filters.bedrooms : null,
		parseInt(filters.bathrooms) > 0 ? filters.bathrooms : null,
		parseInt(filters.parking) > 0 ? filters.parking : null,
		filters.minPrice,
		filters.maxPrice,
		...(filters.tags || [])
	].filter(Boolean).length;

	// Reactividad del filtrado
	$: result = filterProperties(sourceProperties, search, filters, currentPage, limit);
	$: properties = result.items;
	$: pagination = result.pagination;

	// Actualizar URL sincronizada
	function updateUrl() {
		const params = new URLSearchParams();
		if (search) params.set('q', search);
		if (currentPage > 1) params.set('page', currentPage.toString());
		if (parseInt(filters.bedrooms) > 0) params.set('bedrooms', filters.bedrooms);
		if (parseInt(filters.bathrooms) > 0) params.set('bathrooms', filters.bathrooms);
		if (parseInt(filters.parking) > 0) params.set('parking', filters.parking);
		if (filters.minPrice) params.set('min_price', filters.minPrice);
		if (filters.maxPrice) params.set('max_price', filters.maxPrice);
		if (filters.propertyType) params.set('property_type', filters.propertyType);
		if (filters.operationType) params.set('operation_type', filters.operationType);
		if (filters.tags && filters.tags.length > 0) params.set('tags', filters.tags.join(','));

		const queryString = params.toString();
		goto(`/propiedades${queryString ? '?' + queryString : ''}`, {
			replaceState: true,
			keepFocus: true,
			noScroll: true
		});
	}

	function handleSearchInput(e) {
		const val = e.target.value;
		search = val;
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			currentPage = 1;
			updateUrl();
		}, 300);
	}

	function handleFilterChange(name, value) {
		filters = { ...filters, [name]: value };
		currentPage = 1;
		updateUrl();
	}

	function removeTag(tagToRemove) {
		filters = {
			...filters,
			tags: (filters.tags || []).filter((t) => t !== tagToRemove)
		};
		currentPage = 1;
		updateUrl();
	}

	function removeSingleFilter(key) {
		if (key === 'price') {
			filters = { ...filters, minPrice: '', maxPrice: '' };
		} else if (key === 'search') {
			search = '';
		} else {
			filters = { ...filters, [key]: '' };
		}
		currentPage = 1;
		updateUrl();
	}

	function clearFilters() {
		search = '';
		filters = {
			bedrooms: '0',
			bathrooms: '0',
			parking: '0',
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
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	}

	function prevPage() {
		if (currentPage > 1) {
			currentPage--;
			updateUrl();
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	}

	onDestroy(() => {
		clearTimeout(debounceTimer);
	});
</script>

<svelte:head>
	<title>Catálogo de Propiedades - MatchHome Chihuahua</title>
	<meta
		name="description"
		content="Explora el catálogo completo de casas, departamentos, terrenos y locales en venta y renta en Chihuahua."
	/>
</svelte:head>

<div class="container section">
	<div class="catalog-page-header">
		<div class="header-titles">
			<h1 class="page-title">Catálogo Completo de Propiedades</h1>
			<p class="page-subtitle">
				Encuentra inmuebles en Chihuahua ({pagination.total} resultado{pagination.total === 1 ? '' : 's'})
			</p>
		</div>

		<!-- Barra Superior: Solo Búsqueda de Texto y Botón de Filtros -->
		<div class="top-action-bar">
			<div class="search-box">
				<span class="search-icon">🔍</span>
				<input
					type="text"
					placeholder="Buscar por colonia, clave, título..."
					value={search}
					on:input={handleSearchInput}
					class="search-input"
				/>
				{#if search}
					<button type="button" class="clear-icon" on:click={() => removeSingleFilter('search')}>✕</button>
				{/if}
			</div>

			<!-- Botón de Filtrar Propiedades con Badge -->
			<button
				type="button"
				class="filter-trigger-btn {showFilters ? 'active' : ''} {activeFilterCount > 0 ? 'has-active' : ''}"
				on:click={() => (showFilters = !showFilters)}
				aria-expanded={showFilters}
			>
				<span class="btn-icon">⚡</span>
				<span class="btn-text">Filtrar Propiedades</span>
				{#if activeFilterCount > 0}
					<span class="badge-count">{activeFilterCount}</span>
				{/if}
				<span class="chevron">{showFilters ? '▲' : '▼'}</span>
			</button>
		</div>
	</div>

	<!-- Barra de Filtros Activos (Píldoras rápidas para remover) -->
	{#if activeFilterCount > 0 || search}
		<div class="active-pills-bar">
			<span class="pills-label">Filtros aplicados:</span>
			{#if search}
				<button class="pill" on:click={() => removeSingleFilter('search')}>
					Búsqueda: "{search}" <span class="pill-remove">✕</span>
				</button>
			{/if}
			{#if filters.operationType}
				<button class="pill" on:click={() => removeSingleFilter('operationType')}>
					{filters.operationType === 'sale' ? 'Venta' : 'Renta'} <span class="pill-remove">✕</span>
				</button>
			{/if}
			{#if filters.propertyType}
				<button class="pill" on:click={() => removeSingleFilter('propertyType')}>
					{filters.propertyType} <span class="pill-remove">✕</span>
				</button>
			{/if}
			{#if parseInt(filters.bedrooms) > 0}
				<button class="pill" on:click={() => removeSingleFilter('bedrooms')}>
					{filters.bedrooms}+ Recámaras <span class="pill-remove">✕</span>
				</button>
			{/if}
			{#if parseInt(filters.bathrooms) > 0}
				<button class="pill" on:click={() => removeSingleFilter('bathrooms')}>
					{filters.bathrooms}+ Baños <span class="pill-remove">✕</span>
				</button>
			{/if}
			{#if parseInt(filters.parking) > 0}
				<button class="pill" on:click={() => removeSingleFilter('parking')}>
					{filters.parking}+ Autos <span class="pill-remove">✕</span>
				</button>
			{/if}
			{#if filters.minPrice || filters.maxPrice}
				<button class="pill" on:click={() => removeSingleFilter('price')}>
					${filters.minPrice || 0} - ${filters.maxPrice || 'Max'} <span class="pill-remove">✕</span>
				</button>
			{/if}
			{#if filters.tags && filters.tags.length > 0}
				{#each filters.tags as tag}
					<button class="pill" on:click={() => removeTag(tag)}>
						{tag} <span class="pill-remove">✕</span>
					</button>
				{/each}
			{/if}
			<button class="clear-all-link" on:click={clearFilters}>Limpiar todo</button>
		</div>
	{/if}

	<!-- Panel Desplegable de Filtros -->
	{#if showFilters}
		<Filters
			{filters}
			{search}
			totalMatches={pagination.total}
			onSearchChange={(val) => {
				search = val;
				currentPage = 1;
				updateUrl();
			}}
			onFilterChange={handleFilterChange}
			onClear={clearFilters}
			onClose={() => (showFilters = false)}
		/>
	{/if}

	<!-- Grid de Propiedades o Estado Vacío -->
	{#if properties.length === 0}
		<div class="empty-state">
			<div class="empty-icon">🏠🔍</div>
			<h3>No se encontraron propiedades</h3>
			<p>No hay inmuebles que coincidan con los filtros seleccionados. Intenta ampliar tu búsqueda o limpiar los filtros.</p>
			<button class="btn btn-primary mt-md" on:click={clearFilters}>Restablecer Todos los Filtros</button>
		</div>
	{:else}
		<div class="grid">
			{#each properties as property (property.public_id || property.easybroker_id || property.id || property.title)}
				<PropertyCard {property} />
			{/each}
		</div>

		<!-- Controles de Paginación -->
		{#if pagination.total_pages > 1}
			<div class="pagination-controls">
				<button on:click={prevPage} disabled={currentPage === 1} class="btn btn-secondary nav-page-btn">
					← Anterior
				</button>
				<span class="page-info">
					Página <strong>{currentPage}</strong> de <strong>{pagination.total_pages}</strong>
				</span>
				<button on:click={nextPage} disabled={!pagination.next_page} class="btn btn-primary nav-page-btn">
					Siguiente →
				</button>
			</div>
		{/if}
	{/if}
</div>

<style>
	.mt-md {
		margin-top: 1rem;
	}

	.catalog-page-header {
		margin-bottom: 2rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		gap: 1.25rem;
	}

	.header-titles {
		text-align: center;
	}

	.page-title {
		font-size: 2.25rem;
		font-weight: 800;
		color: #1a202c;
		margin-bottom: 0.25rem;
	}

	.page-subtitle {
		color: #718096;
		font-size: 1.05rem;
		margin: 0;
	}

	.top-action-bar {
		display: flex;
		gap: 0.75rem;
		align-items: center;
		justify-content: center;
		flex-wrap: wrap;
		background: #ffffff;
		padding: 0.85rem 1.25rem;
		border-radius: 12px;
		border: 1px solid #e2e8f0;
		box-shadow: 0 4px 14px rgba(0, 40, 90, 0.05);
		width: 100%;
		max-width: 700px;
		margin: 0 auto;
	}

	.search-box {
		flex: 1;
		min-width: 240px;
		display: flex;
		align-items: center;
		background: #f8fafc;
		border: 1px solid #cbd5e0;
		border-radius: 8px;
		padding: 0 0.75rem;
		transition: border-color 0.2s;
	}

	.search-box:focus-within {
		border-color: #0056b3;
		background: #ffffff;
	}

	.search-icon {
		font-size: 1rem;
		color: #718096;
		margin-right: 0.5rem;
	}

	.search-input {
		flex: 1;
		border: none;
		background: transparent;
		padding: 0.65rem 0.25rem;
		font-size: 0.92rem;
		outline: none;
		color: #2d3748;
	}

	.clear-icon {
		background: transparent;
		border: none;
		color: #a0aec0;
		font-size: 0.85rem;
		cursor: pointer;
		padding: 4px;
	}

	.filter-trigger-btn {
		background: #ffffff;
		border: 2px solid #0056b3;
		color: #0056b3;
		padding: 0.6rem 1.4rem;
		border-radius: 30px;
		font-size: 0.95rem;
		font-weight: 700;
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
		box-shadow: 0 2px 8px rgba(0, 86, 179, 0.12);
		transition: all 0.2s ease;
		white-space: nowrap;
	}

	.filter-trigger-btn:hover {
		background: #f0f7ff;
	}

	.filter-trigger-btn.active {
		background: #0056b3;
		color: #ffffff;
	}

	.badge-count {
		background: #c5a059;
		color: #ffffff;
		font-size: 0.75rem;
		font-weight: 800;
		padding: 2px 7px;
		border-radius: 12px;
		line-height: 1;
	}

	.chevron {
		font-size: 0.75rem;
		opacity: 0.8;
	}

	.active-pills-bar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
		padding: 0.75rem 1rem;
		background: #f8fafc;
		border-radius: 10px;
		border: 1px solid #e2e8f0;
	}

	.pills-label {
		font-size: 0.85rem;
		font-weight: 600;
		color: #718096;
	}

	.pill {
		background: #ffffff;
		border: 1px solid #cbd5e0;
		color: #2d3748;
		padding: 4px 10px;
		border-radius: 16px;
		font-size: 0.8rem;
		font-weight: 600;
		display: inline-flex;
		align-items: center;
		gap: 6px;
		cursor: pointer;
		transition: all 0.2s;
	}

	.pill:hover {
		background: #fee2e2;
		border-color: #fca5a5;
		color: #dc2626;
	}

	.clear-all-link {
		background: transparent;
		border: none;
		color: #e53e3e;
		font-size: 0.85rem;
		font-weight: 600;
		cursor: pointer;
		text-decoration: underline;
		margin-left: 0.25rem;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr));
		gap: 2rem;
	}

	.empty-state {
		text-align: center;
		padding: 4rem 1.5rem;
		background: #ffffff;
		border-radius: 12px;
		border: 1px dashed #cbd5e0;
		margin: 2rem 0;
	}

	.empty-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
	}

	.empty-state h3 {
		font-size: 1.4rem;
		color: #2d3748;
		margin-bottom: 0.5rem;
	}

	.empty-state p {
		color: #718096;
		max-width: 500px;
		margin: 0 auto;
	}

	.pagination-controls {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 1.5rem;
		margin-top: 3rem;
	}

	.nav-page-btn {
		padding: 0.65rem 1.4rem;
		font-size: 0.95rem;
		font-weight: 700;
	}

	.page-info {
		font-weight: 600;
		color: #718096;
		font-size: 0.95rem;
	}

	.btn {
		padding: 0.55rem 1.1rem;
		border-radius: 6px;
		font-size: 0.9rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-primary {
		background: #0056b3;
		border: 1px solid #0056b3;
		color: #ffffff;
	}

	.btn-secondary {
		background: #f1f5f9;
		border: 1px solid #cbd5e1;
		color: #334155;
	}

	@media (max-width: 768px) {
		.top-action-bar {
			flex-direction: column;
			align-items: stretch;
		}
		.search-box {
			min-width: 100%;
		}
		.filter-trigger-btn {
			width: 100%;
			justify-content: center;
		}
		.grid {
			grid-template-columns: minmax(0, 1fr);
			gap: 1.25rem;
		}
	}
</style>
