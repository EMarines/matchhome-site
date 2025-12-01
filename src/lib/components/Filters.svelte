<script>
	export let filters;
	export let onFilterChange;
	export let onClear;
	export let onClose;

	const ZONES = ['Norte', 'Sur', 'Este', 'Oeste', 'CentroNorte', 'CentroSur'];
	const AMENITIES = [
		'Recamara en Planta Baja',
		'Una Planta',
		'Frente a Parque',
		'Nueva',
		'Sobre Avenida',
		'Alberca',
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
</script>

<div class="filters-container">
	<div class="filters-grid">
		<div class="filter-group">
			<label for="operationType">Operación</label>
			<select
				name="operationType"
				id="operationType"
				value={filters.operationType}
				on:change={handleChange}
			>
				<option value="">Cualquiera</option>
				<option value="sale">Venta</option>
				<option value="rental">Renta</option>
			</select>
		</div>

		<div class="filter-group">
			<label for="propertyType">Tipo de Propiedad</label>
			<select
				name="propertyType"
				id="propertyType"
				value={filters.propertyType}
				on:change={handleChange}
			>
				<option value="">Cualquiera</option>
				<optgroup label="Residencial">
					<option value="Casa">Casa</option>
					<option value="Casa en condominio">Casa en condominio</option>
					<option value="Departamento">Departamento</option>
					<option value="Quinta">Quinta</option>
					<option value="Rancho">Rancho</option>
					<option value="Terreno">Terreno</option>
					<option value="Villa">Villa</option>
				</optgroup>
				<optgroup label="Comercial">
					<option value="Bodega comercial">Bodega comercial</option>
					<option value="Casa con uso de suelo">Casa con uso de suelo</option>
					<option value="Edificio">Edificio</option>
					<option value="Huerta">Huerta</option>
					<option value="Local comercial">Local comercial</option>
					<option value="Local en centro comercial">Local en centro comercial</option>
				</optgroup>
			</select>
		</div>

		<div class="filter-group">
			<label for="bedrooms">Recámaras</label>
			<select name="bedrooms" id="bedrooms" value={filters.bedrooms} on:change={handleChange}>
				<option value="0">Cualquiera</option>
				<option value="1">1+</option>
				<option value="2">2+</option>
				<option value="3">3+</option>
				<option value="4">4+</option>
			</select>
		</div>

		<div class="filter-group">
			<label for="bathrooms">Baños</label>
			<select name="bathrooms" id="bathrooms" value={filters.bathrooms} on:change={handleChange}>
				<option value="0">Cualquiera</option>
				<option value="1">1+</option>
				<option value="2">2+</option>
				<option value="3">3+</option>
				<option value="4">4+</option>
			</select>
		</div>

		<div class="filter-group">
			<label for="parking">Estacionamientos</label>
			<select name="parking" id="parking" value={filters.parking} on:change={handleChange}>
				<option value="0">Cualquiera</option>
				<option value="1">1+</option>
				<option value="2">2+</option>
				<option value="3">3+</option>
				<option value="4">4+</option>
			</select>
		</div>

		<div class="filter-group price-group">
			<label for="minPrice">Precio</label>
			<div class="price-inputs">
				<input
					type="number"
					name="minPrice"
					id="minPrice"
					placeholder="Min"
					value={filters.minPrice}
					on:input={handleChange}
					min="0"
				/>
				<span>-</span>
				<input
					type="number"
					name="maxPrice"
					id="maxPrice"
					placeholder="Max"
					value={filters.maxPrice}
					on:input={handleChange}
					min="0"
				/>
			</div>
		</div>
	</div>

	<div class="tags-section">
		<label for="zones">Zonas</label>
		<div class="tags-grid" id="zones">
			{#each ZONES as zone}
				<button
					class={`tag-chip ${filters.tags?.includes(zone) ? 'active' : ''}`}
					on:click={() => toggleTag(zone)}
				>
					{zone}
				</button>
			{/each}
		</div>
	</div>

	<div class="tags-section">
		<label for="amenities">Amenidades</label>
		<div class="tags-grid" id="amenities">
			{#each AMENITIES as amenity}
				<button
					class={`tag-chip ${filters.tags?.includes(amenity) ? 'active' : ''}`}
					on:click={() => toggleTag(amenity)}
				>
					{amenity}
				</button>
			{/each}
		</div>
	</div>

	<div class="filter-actions" style="display: flex; gap: var(--spacing-md);">
		<button class="btn btn-outline clear-btn" on:click={onClear}> Limpiar Filtros </button>
		<button class="btn btn-secondary" on:click={onClose}> Cerrar </button>
	</div>
</div>

<style>
	.filters-container {
		background: white;
		padding: var(--spacing-md);
		border-radius: 8px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		margin-bottom: var(--spacing-xl);
		display: flex;
		flex-direction: column;
		gap: var(--spacing-lg);
	}
	.filters-grid {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-lg);
		align-items: flex-end;
	}
	.filter-group {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
	}
	.filter-group label {
		font-size: var(--font-size-sm);
		font-weight: 600;
		color: var(--color-text-light);
	}
	.filter-group select,
	.filter-group input {
		padding: var(--spacing-sm);
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: var(--font-size-base);
		min-width: 120px;
	}
	.price-group {
		flex: 1;
		min-width: 250px;
	}
	.price-inputs {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
	}
	.price-inputs input {
		width: 100%;
	}
	.tags-section {
		width: 100%;
	}
	.tags-section label {
		display: block;
		font-size: var(--font-size-sm);
		font-weight: 600;
		color: var(--color-text-light);
		margin-bottom: var(--spacing-xs);
	}
	.tags-grid {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-sm);
	}
	.tag-chip {
		padding: 6px 12px;
		border: 1px solid #ddd;
		border-radius: 20px;
		background: white;
		cursor: pointer;
		font-size: var(--font-size-sm);
		transition: all 0.2s;
	}
	.tag-chip:hover {
		background: #f5f5f5;
	}
	.tag-chip.active {
		background: var(--color-primary);
		color: white;
		border-color: var(--color-primary);
	}
	@media (max-width: 768px) {
		.filters-grid {
			flex-direction: column;
			align-items: stretch;
		}
		.filter-group select,
		.filter-group input {
			width: 100%;
		}
		.clear-btn {
			width: 100%;
		}
	}
	.clear-btn {
		border: 1px solid var(--color-secondary);
		color: var(--color-secondary);
		padding: var(--spacing-sm) var(--spacing-md);
		height: 42px;
		align-self: flex-start;
		background: transparent;
	}
	.clear-btn:hover {
		background: var(--color-secondary);
		color: white;
	}
</style>
