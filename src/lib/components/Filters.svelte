<script>
	export let filters = {};
	export let search = '';
	export let limit = 24;
	export let onFilterChange;
	export let onSearchChange;
	export let onLimitChange;
	export let onClear;
	export let onClose;
	export let totalMatches = null;

	let debounceTimer;

	// Lista oficial de Zonas de Chihuahua en orden estricto
	const ZONES = ['Norte', 'Noroeste', 'Noreste', 'Centronorte', 'Centrosur', 'Suroeste', 'Sureste'];

	// Lista de Amenidades y Características
	const AMENITIES = [
		'Fracc. Privado',
		'Una Planta',
		'Recamara en Planta Baja',
		'Alberca',
		'Frente a Parque',
		'Nueva',
		'Sobre Avenida',
		'Lista para Habitarse',
		'Patio Amplio'
	];

	function toggleTag(tag) {
		const currentTags = filters.tags || [];
		const newTags = currentTags.includes(tag)
			? currentTags.filter((t) => t !== tag)
			: [...currentTags, tag];
		onFilterChange('tags', newTags);
	}

	function handleChange(e) {
		const { name, value } = e.target;
		onFilterChange(name, value);
	}

	function handleSearchInput(e) {
		const val = e.target.value;
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			if (onSearchChange) onSearchChange(val);
		}, 250);
	}

	function clearSearchText() {
		clearTimeout(debounceTimer);
		if (onSearchChange) onSearchChange('');
	}

	function handleLimitSelect(e) {
		const val = parseInt(e.target.value) || 24;
		if (onLimitChange) onLimitChange(val);
	}

	$: activeCount = [
		search ? 1 : null,
		filters.operationType,
		filters.propertyType,
		filters.bedrooms > 0 ? filters.bedrooms : null,
		filters.bathrooms > 0 ? filters.bathrooms : null,
		filters.parking > 0 ? filters.parking : null,
		filters.minPrice,
		filters.maxPrice,
		...(filters.tags || [])
	].filter(Boolean).length;
</script>

<div class="filters-container">
	<div class="filters-header-bar">
		<div class="title-with-badge">
			<span class="icon">⚙️</span>
			<h3>Filtros de Búsqueda</h3>
			{#if activeCount > 0}
				<span class="active-badge">{activeCount} activo{activeCount > 1 ? 's' : ''}</span>
			{/if}
		</div>
		<button class="close-icon-btn" on:click={onClose} aria-label="Cerrar panel de filtros">✕</button>
	</div>

	<!-- Input de texto para búsqueda directa por Colonia, Clave o Título -->
	<div class="text-search-section">
		<label for="filter-text-search">Búsqueda rápida por texto (Colonia, Clave o Título)</label>
		<div class="search-input-box">
			<span class="search-icon">🔍</span>
			<input
				type="text"
				id="filter-text-search"
				placeholder="Ej. San Felipe, EB-FM6734, Casa en Venta, Cantera..."
				value={search}
				on:input={handleSearchInput}
				class="text-search-input"
			/>
			{#if search}
				<button type="button" class="clear-search-btn" on:click={clearSearchText} aria-label="Borrar texto">✕</button>
			{/if}
		</div>
	</div>

	<div class="filters-grid">
		<div class="filter-group">
			<label for="operationType">Operación</label>
			<select
				name="operationType"
				id="operationType"
				value={filters.operationType || ''}
				on:change={handleChange}
			>
				<option value="">Todas las Operaciones</option>
				<option value="sale">Venta</option>
				<option value="rental">Renta</option>
			</select>
		</div>

		<div class="filter-group">
			<label for="propertyType">Tipo de Inmueble</label>
			<select
				name="propertyType"
				id="propertyType"
				value={filters.propertyType || ''}
				on:change={handleChange}
			>
				<option value="">Todos los Tipos</option>
				<optgroup label="Residencial">
					<option value="Casa">Casa</option>
					<option value="Casa en condominio">Casa en Condominio</option>
					<option value="Departamento">Departamento / Penthouse</option>
					<option value="Terreno">Terreno / Lote</option>
					<option value="Quinta">Quinta / Rancho</option>
					<option value="Villa">Villa</option>
				</optgroup>
				<optgroup label="Comercial e Industrial">
					<option value="Local comercial">Local Comercial</option>
					<option value="Bodega comercial">Bodega / Nave Industrial</option>
					<option value="Oficina">Oficina</option>
					<option value="Edificio">Edificio</option>
					<option value="Casa con uso de suelo">Casa con Uso de Suelo</option>
				</optgroup>
			</select>
		</div>

		<div class="filter-group">
			<label for="bedrooms">Recámaras</label>
			<select name="bedrooms" id="bedrooms" value={filters.bedrooms || '0'} on:change={handleChange}>
				<option value="0">Cualquiera</option>
				<option value="1">1+ Recámaras</option>
				<option value="2">2+ Recámaras</option>
				<option value="3">3+ Recámaras</option>
				<option value="4">4+ Recámaras</option>
			</select>
		</div>

		<div class="filter-group">
			<label for="bathrooms">Baños</label>
			<select name="bathrooms" id="bathrooms" value={filters.bathrooms || '0'} on:change={handleChange}>
				<option value="0">Cualquiera</option>
				<option value="1">1+ Baños</option>
				<option value="2">2+ Baños</option>
				<option value="3">3+ Baños</option>
				<option value="4">4+ Baños</option>
			</select>
		</div>

		<div class="filter-group">
			<label for="parking">Estacionamiento</label>
			<select name="parking" id="parking" value={filters.parking || '0'} on:change={handleChange}>
				<option value="0">Cualquiera</option>
				<option value="1">1+ Autos</option>
				<option value="2">2+ Autos</option>
				<option value="3">3+ Autos</option>
			</select>
		</div>

		<div class="filter-group limit-group">
			<label for="filter-limit-select">Propiedades a mostrar</label>
			<select
				id="filter-limit-select"
				value={limit}
				on:change={handleLimitSelect}
			>
				<option value="12">12 por página</option>
				<option value="24">24 por página</option>
				<option value="48">48 por página</option>
				<option value="96">96 por página</option>
				<option value="200">200 (Ver todas)</option>
			</select>
		</div>

		<div class="filter-group price-group">
			<label for="minPrice">Rango de Precio ($ MXN)</label>
			<div class="price-inputs">
				<input
					type="number"
					name="minPrice"
					id="minPrice"
					placeholder="Precio Mínimo"
					value={filters.minPrice || ''}
					on:input={handleChange}
					min="0"
					step="50000"
				/>
				<span class="price-separator">—</span>
				<input
					type="number"
					name="maxPrice"
					id="maxPrice"
					placeholder="Precio Máximo"
					value={filters.maxPrice || ''}
					on:input={handleChange}
					min="0"
					step="50000"
				/>
			</div>
		</div>
	</div>

	<div class="tags-section">
		<label for="zones-group">Zonas de Chihuahua</label>
		<div class="tags-grid" id="zones-group">
			{#each ZONES as zone}
				<button
					type="button"
					class={`tag-chip ${filters.tags?.includes(zone) ? 'active' : ''}`}
					on:click={() => toggleTag(zone)}
				>
					<span class="chip-dot"></span>
					{zone}
				</button>
			{/each}
		</div>
	</div>

	<div class="tags-section">
		<label for="amenities-group">Características y Amenidades</label>
		<div class="tags-grid" id="amenities-group">
			{#each AMENITIES as amenity}
				<button
					type="button"
					class={`tag-chip ${filters.tags?.includes(amenity) ? 'active' : ''}`}
					on:click={() => toggleTag(amenity)}
				>
					<span class="chip-dot"></span>
					{amenity}
				</button>
			{/each}
		</div>
	</div>

	<div class="filter-footer">
		<div class="result-count">
			{#if totalMatches !== null}
				<span>Mostrando <strong>{totalMatches}</strong> propiedad{totalMatches === 1 ? '' : 'es'}</span>
			{/if}
		</div>
		<div class="filter-actions">
			{#if activeCount > 0}
				<button type="button" class="btn btn-outline clear-btn" on:click={onClear}>
					Limpiar Filtros
				</button>
			{/if}
			<button type="button" class="btn btn-primary apply-btn" on:click={onClose}>
				Aplicar y Ver Resultados
			</button>
		</div>
	</div>
</div>

<style>
	.filters-container {
		background: #ffffff;
		padding: 1.5rem;
		border-radius: 12px;
		box-shadow: 0 8px 24px rgba(0, 40, 90, 0.08);
		border: 1px solid rgba(0, 86, 179, 0.12);
		margin-bottom: 2rem;
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		animation: slideDown 0.25s ease-out forwards;
	}

	@keyframes slideDown {
		from {
			opacity: 0;
			transform: translateY(-8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.filters-header-bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-bottom: 0.75rem;
		border-bottom: 1px solid #edf2f7;
	}

	.title-with-badge {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.title-with-badge .icon {
		font-size: 1.2rem;
	}

	.title-with-badge h3 {
		margin: 0;
		font-size: 1.15rem;
		font-weight: 700;
		color: #1a202c;
	}

	.active-badge {
		background: var(--color-secondary, #c5a059);
		color: #ffffff;
		font-size: 0.75rem;
		font-weight: 700;
		padding: 2px 8px;
		border-radius: 12px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.close-icon-btn {
		background: #f7fafc;
		border: 1px solid #e2e8f0;
		color: #4a5568;
		border-radius: 50%;
		width: 32px;
		height: 32px;
		font-size: 1rem;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.2s;
	}

	.close-icon-btn:hover {
		background: #edf2f7;
		color: #1a202c;
	}

	/* Input de texto dentro de los filtros */
	.text-search-section {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.text-search-section label {
		font-size: 0.85rem;
		font-weight: 700;
		color: var(--color-primary, #0056b3);
	}

	.search-input-box {
		display: flex;
		align-items: center;
		background: #f8fafc;
		border: 1.5px solid #cbd5e0;
		border-radius: 8px;
		padding: 0.2rem 0.75rem;
		transition: all 0.2s;
	}

	.search-input-box:focus-within {
		border-color: var(--color-primary, #0056b3);
		background: #ffffff;
		box-shadow: 0 0 0 3px rgba(0, 86, 179, 0.15);
	}

	.search-icon {
		font-size: 1.1rem;
		color: #718096;
		margin-right: 0.5rem;
	}

	.text-search-input {
		flex: 1;
		border: none;
		background: transparent;
		padding: 0.55rem 0.25rem;
		font-size: 0.95rem;
		outline: none;
		color: #2d3748;
		font-weight: 500;
	}

	.clear-search-btn {
		background: transparent;
		border: none;
		color: #a0aec0;
		font-size: 0.9rem;
		cursor: pointer;
		padding: 4px;
		border-radius: 50%;
	}

	.clear-search-btn:hover {
		color: #e53e3e;
	}

	.filters-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 1rem;
		align-items: flex-end;
	}

	.filter-group {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.filter-group label {
		font-size: 0.85rem;
		font-weight: 600;
		color: #4a5568;
	}

	.filter-group select,
	.filter-group input {
		padding: 0.65rem 0.85rem;
		border: 1px solid #cbd5e0;
		border-radius: 8px;
		font-size: 0.95rem;
		background: #ffffff;
		color: #2d3748;
		outline: none;
		transition: border-color 0.2s, box-shadow 0.2s;
	}

	.filter-group select:focus,
	.filter-group input:focus {
		border-color: var(--color-primary, #0056b3);
		box-shadow: 0 0 0 3px rgba(0, 86, 179, 0.15);
	}

	.limit-group select {
		font-weight: 600;
		color: var(--color-primary, #0056b3);
		background-color: #f8fafc;
	}

	.price-group {
		grid-column: span 2;
	}

	.price-inputs {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.price-inputs input {
		width: 100%;
	}

	.price-separator {
		color: #a0aec0;
		font-weight: 700;
	}

	.tags-section {
		width: 100%;
	}

	.tags-section label {
		display: block;
		font-size: 0.85rem;
		font-weight: 600;
		color: #4a5568;
		margin-bottom: 0.5rem;
	}

	.tags-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.tag-chip {
		padding: 6px 14px;
		border: 1px solid #e2e8f0;
		border-radius: 20px;
		background: #f8fafc;
		color: #4a5568;
		cursor: pointer;
		font-size: 0.85rem;
		font-weight: 500;
		display: inline-flex;
		align-items: center;
		gap: 6px;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.chip-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: #cbd5e0;
		transition: background 0.2s;
	}

	.tag-chip:hover {
		background: #edf2f7;
		border-color: #cbd5e0;
		color: #1a202c;
	}

	.tag-chip.active {
		background: var(--color-primary, #0056b3);
		color: #ffffff;
		border-color: var(--color-primary, #0056b3);
		box-shadow: 0 2px 6px rgba(0, 86, 179, 0.25);
	}

	.tag-chip.active .chip-dot {
		background: #ffffff;
	}

	.filter-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-top: 1rem;
		border-top: 1px solid #edf2f7;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.result-count {
		font-size: 0.9rem;
		color: #718096;
	}

	.result-count strong {
		color: #1a202c;
	}

	.filter-actions {
		display: flex;
		gap: 0.75rem;
		align-items: center;
	}

	.clear-btn {
		border: 1px solid #e2e8f0;
		color: #718096;
		background: #ffffff;
		padding: 0.6rem 1.25rem;
		border-radius: 8px;
		font-size: 0.9rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.clear-btn:hover {
		background: #f7fafc;
		border-color: #cbd5e0;
		color: #e53e3e;
	}

	.apply-btn {
		background: var(--color-primary, #0056b3);
		color: #ffffff;
		padding: 0.6rem 1.5rem;
		border-radius: 8px;
		font-size: 0.9rem;
		font-weight: 700;
		border: none;
		cursor: pointer;
		box-shadow: 0 2px 8px rgba(0, 86, 179, 0.3);
		transition: all 0.2s;
	}

	.apply-btn:hover {
		background: #004494;
		transform: translateY(-1px);
	}

	@media (max-width: 768px) {
		.filters-container {
			padding: 1.25rem;
			gap: 1rem;
		}
		.filters-grid {
			grid-template-columns: 1fr;
		}
		.price-group {
			grid-column: span 1;
		}
		.price-inputs {
			display: grid;
			grid-template-columns: 1fr auto 1fr;
			gap: 0.4rem;
		}
		.filter-footer {
			flex-direction: column;
			align-items: stretch;
		}
		.filter-actions {
			flex-direction: column;
			width: 100%;
		}
		.clear-btn,
		.apply-btn {
			width: 100%;
			text-align: center;
		}
	}
</style>
