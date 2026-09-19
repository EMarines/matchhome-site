<script>
	import Hero from '$lib/components/Hero.svelte';
	import PropertyCard from '$lib/components/PropertyCard.svelte';
	import Filters from '$lib/components/Filters.svelte';
	import { filterProperties } from '$lib/utils/filterProperties';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	export let data;

	let showFilters = false;

	// Estado inicial desde URL
	let search = $page.url.searchParams.get('q') || '';
	let filters = {
		bedrooms: $page.url.searchParams.get('bedrooms') || '0',
		bathrooms: $page.url.searchParams.get('bathrooms') || '0',
		parking: $page.url.searchParams.get('parking') || '0',
		minPrice: $page.url.searchParams.get('min_price') || '',
		maxPrice: $page.url.searchParams.get('max_price') || '',
		propertyType: $page.url.searchParams.get('property_type') || '',
		operationType: $page.url.searchParams.get('operation_type') || '',
		tags: $page.url.searchParams.get('tags') ? $page.url.searchParams.get('tags').split(',') : []
	};
	let currentPage = parseInt($page.url.searchParams.get('page')) || 1;
	let limit = parseInt($page.url.searchParams.get('limit')) || 24;

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
		if (limit !== 24) params.set('limit', limit.toString());
		if (parseInt(filters.bedrooms) > 0) params.set('bedrooms', filters.bedrooms);
		if (parseInt(filters.bathrooms) > 0) params.set('bathrooms', filters.bathrooms);
		if (parseInt(filters.parking) > 0) params.set('parking', filters.parking);
		if (filters.minPrice) params.set('min_price', filters.minPrice);
		if (filters.maxPrice) params.set('max_price', filters.maxPrice);
		if (filters.propertyType) params.set('property_type', filters.propertyType);
		if (filters.operationType) params.set('operation_type', filters.operationType);
		if (filters.tags && filters.tags.length > 0) params.set('tags', filters.tags.join(','));

		const queryString = params.toString();
		goto(`/${queryString ? '?' + queryString : ''}`, { replaceState: true, keepFocus: true, noScroll: true });
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

	function handleLimitChange(e) {
		limit = parseInt(e.target.value) || 24;
		currentPage = 1;
		updateUrl();
	}

	function nextPage() {
		if (pagination.next_page) {
			currentPage++;
			updateUrl();
			const catalogEl = document.getElementById('catalogo-section');
			if (catalogEl) catalogEl.scrollIntoView({ behavior: 'smooth' });
		}
	}

	function prevPage() {
		if (currentPage > 1) {
			currentPage--;
			updateUrl();
			const catalogEl = document.getElementById('catalogo-section');
			if (catalogEl) catalogEl.scrollIntoView({ behavior: 'smooth' });
		}
	}
</script>

<svelte:head>
	<title>MatchHome - Encuentra tu hogar ideal en Chihuahua</title>
	<meta
		name="description"
		content="Las mejores propiedades en exclusiva para ti en Chihuahua. Venta y renta de casas, departamentos, terrenos y locales comerciales."
	/>
</svelte:head>

<Hero
	onSearch={handleSearch}
	searchValue={search}
	operationType={filters.operationType}
	onSelectOperation={(op) => {
		filters = { ...filters, operationType: op };
		currentPage = 1;
		updateUrl();
		const el = document.getElementById('catalogo-section');
		if (el) el.scrollIntoView({ behavior: 'smooth' });
	}}
	onSelectZone={(zone) => {
		search = zone;
		currentPage = 1;
		updateUrl();
		const el = document.getElementById('catalogo-section');
		if (el) el.scrollIntoView({ behavior: 'smooth' });
	}}
/>

<section class="section container" id="catalogo-section">
	<div class="catalog-header-area">
		<div class="title-meta">
			<h2 class="section-title mb-0">Catálogo de Propiedades</h2>
			<p class="catalog-subtitle">
				Explora nuestro inventario disponible ({pagination.total} inmueble{pagination.total === 1 ? '' : 's'})
			</p>
		</div>

		<div class="header-controls">
			<!-- Botón Prominente y Claro para Filtrar Propiedades -->
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

			<div class="limit-selector">
				<label for="pageLimit">Mostrar:</label>
				<select id="pageLimit" bind:value={limit} on:change={handleLimitChange}>
					<option value={12}>12</option>
					<option value={24}>24</option>
					<option value={48}>48</option>
					<option value={96}>96</option>
				</select>
			</div>
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
			{limit}
			totalMatches={pagination.total}
			onSearchChange={handleSearch}
			onLimitChange={(newLimit) => {
				limit = newLimit;
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
		<div class="properties-grid">
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
</section>

<section class="section" style="background-color: var(--color-background-alt);">
	<div class="container">
		<h2 class="section-title">¿Por qué elegir MatchHome?</h2>
		<div class="features-grid">
			<div class="feature-item">
				<div class="feature-icon">🛡️</div>
				<h3>Experiencia y Respaldo</h3>
				<p>Más de 20 años de solidez en el mercado y asesoría experta en cada paso.</p>
			</div>
			<div class="feature-item">
				<div class="feature-icon">🤝</div>
				<h3>Trato Directo y Transparente</h3>
				<p>Procesos claros, seguros y sin intermediarios innecesarios.</p>
			</div>
			<div class="feature-item">
				<div class="feature-icon">⚡</div>
				<h3>Atención Inmediata</h3>
				<p>Respuesta rápida vía WhatsApp con propuestas a la medida de tu presupuesto.</p>
			</div>
		</div>
	</div>
</section>

<style>
	.mb-0 {
		margin-bottom: 0.25rem !important;
	}

	.mt-md {
		margin-top: 1rem;
	}

	.catalog-header-area {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		margin-bottom: 2rem;
		gap: 1.25rem;
	}

	.title-meta {
		text-align: center;
	}

	.catalog-subtitle {
		color: #718096;
		font-size: 1rem;
		margin: 0;
	}

	.header-controls {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1.25rem;
		flex-wrap: wrap;
	}

	/* Botón Prominente de Filtrado */
	.filter-trigger-btn {
		background: #ffffff;
		border: 2px solid var(--color-primary, #0056b3);
		color: var(--color-primary, #0056b3);
		padding: 0.65rem 1.4rem;
		border-radius: 30px;
		font-size: 0.95rem;
		font-weight: 700;
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
		box-shadow: 0 4px 14px rgba(0, 86, 179, 0.12);
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.filter-trigger-btn:hover {
		background: #f0f7ff;
		transform: translateY(-1px);
		box-shadow: 0 6px 18px rgba(0, 86, 179, 0.2);
	}

	.filter-trigger-btn.active {
		background: var(--color-primary, #0056b3);
		color: #ffffff;
		box-shadow: 0 6px 20px rgba(0, 86, 179, 0.35);
	}

	.filter-trigger-btn.has-active:not(.active) {
		border-color: var(--color-secondary, #c5a059);
		color: #8c6827;
		background: #fffdf7;
	}

	.btn-icon {
		font-size: 1.1rem;
	}

	.badge-count {
		background: var(--color-secondary, #c5a059);
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
		transition: transform 0.2s;
	}

	.limit-selector {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.85rem;
		color: #718096;
		font-weight: 600;
	}

	.limit-selector select {
		padding: 0.4rem 0.6rem;
		border: 1px solid #cbd5e0;
		border-radius: 6px;
		background: #ffffff;
		font-size: 0.85rem;
		font-weight: 600;
		color: #1a202c;
		outline: none;
		cursor: pointer;
		min-width: 65px;
	}

	/* Barra de Píldoras de Filtros Activos */
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

	.pill-remove {
		font-size: 0.7rem;
		opacity: 0.7;
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

	.properties-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr));
		gap: 1.75rem;
	}

	.features-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
		gap: 2rem;
		text-align: center;
	}

	.feature-icon {
		font-size: 2.2rem;
		margin-bottom: 0.75rem;
	}

	.feature-item h3 {
		color: var(--color-secondary, #c5a059);
		margin-bottom: 0.5rem;
		font-size: 1.25rem;
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

	.page-info strong {
		color: #2d3748;
	}

	@media (max-width: 768px) {
		.catalog-header-area {
			flex-direction: column;
			align-items: stretch;
			gap: 1rem;
		}
		.header-controls {
			justify-content: space-between;
			width: 100%;
		}
		.filter-trigger-btn {
			flex: 1;
			justify-content: center;
		}
		.properties-grid {
			grid-template-columns: minmax(0, 1fr);
			gap: 1.25rem;
		}
		.pagination-controls {
			gap: 0.75rem;
		}
		.pagination-controls button {
			padding: 0.6rem 1rem;
			font-size: 0.85rem;
		}
	}
</style>
