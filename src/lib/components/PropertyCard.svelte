<script>
	export let property;
	export let backUrl = null;
	export let fromProposal = false;

	// Map EasyBroker and MatchHome CRM fields to our UI
	$: image =
		property.imagenPrincipal ||
		property.imagenMiniatura ||
		property.title_image_full ||
		property.title_image_thumb ||
		(property.images && property.images.length > 0
			? typeof property.images[0] === 'string'
				? property.images[0]
				: property.images[0]?.url
			: null) ||
		(property.property_images &&
			property.property_images.length > 0 &&
			property.property_images[0]?.url) ||
		'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22300%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20400%20300%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_1%20text%20%7B%20fill%3A%23AAAAAA%3Bfont-weight%3Abold%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A20pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_1%22%3E%3Crect%20width%3D%22400%22%20height%3D%22300%22%20fill%3D%22%23EEEEEE%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22130%22%20y%3D%22158%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';

	$: title = property.titulo || property.title || 'Propiedad sin título';

	$: location =
		property.colonia ||
		property.ubicacion ||
		(typeof property.location === 'object'
			? property.location?.name
			: property.location || 'Ubicación no disponible');

	function formatPrice(val, curr) {
		if (val === undefined || val === null || val === '') return null;
		const num = Number(val);
		if (isNaN(num) || num <= 0) return typeof val === 'string' && val.trim().length > 0 ? val : null;
		return `$${num.toLocaleString('es-MX')} ${curr || 'MXN'}`;
	}

	$: price =
		property.precioFormateado ||
		formatPrice(property.price, property.moneda || property.currency) ||
		formatPrice(property.precio, property.moneda || property.currency) ||
		formatPrice(property.budget, property.moneda || property.currency) ||
		(property.operations && property.operations.length > 0
			? property.operations[0].formatted_amount ||
				property.operations[0].formated_amount ||
				`${Number(property.operations[0].amount).toLocaleString('es-MX')} ${property.operations[0].currency || 'MXN'}`
			: 'Precio a consultar');

	function getOperationType(type) {
		if (!type) return null;
		const t = String(type).toLowerCase().trim();
		const types = {
			sale: 'Venta',
			venta: 'Venta',
			rent: 'Renta',
			rental: 'Renta',
			renta: 'Renta',
			temporary_rental: 'Renta Temporal',
			'renta temporal': 'Renta Temporal'
		};
		return types[t] || type;
	}

	$: status =
		getOperationType(property.selecTO) ||
		getOperationType(property.tipoOperacion) ||
		getOperationType(property.operation_type) ||
		(property.operations && property.operations.length > 0
			? getOperationType(property.operations[0].type)
			: 'Venta/Renta');

	$: beds = property.recamaras ?? property.bedrooms ?? 0;
	$: baths = property.banos ?? property.bathrooms ?? 0;
	$: area =
		property.construccion ||
		property.construction_size ||
		property.terreno ||
		property.lot_size ||
		0;
	$: id = property.public_id || property.easybroker_id || property.id || property.clavePropiedad;

	$: tags =
		property.amenidades?.length > 0
			? property.amenidades
			: property.tags?.length > 0
			? property.tags
			: (property.features || []).slice(0, 3).map((f) => (typeof f === 'string' ? f : f.name));
</script>

<a 
	href={`/property/${id}${backUrl ? `?backUrl=${encodeURIComponent(backUrl)}&fromProposal=${fromProposal}` : ''}`} 
	class="property-card-link"
>
	<div class="property-card">
		<div class="card-image-wrapper">
			<img src={image} alt={title} class="card-image" />
			<span class="card-status">{status}</span>
			<span class="card-id">{id}</span>
			<span class="card-price">{price}</span>
		</div>
		<div class="card-content">
			<h3 class="card-title">{title}</h3>
			<p class="card-location">{location}</p>
			<div class="card-features">
				<span class="feature"><i class="icon">🛏</i> {beds} Rec.</span>
				<span class="feature"><i class="icon">🚿</i> {baths} Baños</span>
				<span class="feature"><i class="icon">📐</i> {area} m²</span>
			</div>
			{#if tags.length > 0}
				<div class="card-tags">
					{#each tags as tag}
						<span class="card-tag">{tag}</span>
					{/each}
				</div>
			{/if}
			<span class="btn btn-secondary card-btn">Ver Detalles</span>
		</div>
	</div>
</a>

<style>
	.property-card-link {
		text-decoration: none;
		color: inherit;
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100%;
		min-width: 0;
		box-sizing: border-box;
	}
	.property-card {
		background: var(--color-white);
		border-radius: 8px;
		overflow: hidden;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		transition:
			transform 0.2s,
			box-shadow 0.2s;
		margin: 0;
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
	}
	.property-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
	}
	.card-image-wrapper {
		position: relative;
		height: 240px;
		width: 100%;
		overflow: hidden;
		flex-shrink: 0;
	}
	.card-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.card-status {
		position: absolute;
		top: 10px;
		left: 10px;
		background: var(--color-primary);
		color: var(--color-white);
		padding: 4px 10px;
		border-radius: 4px;
		font-size: var(--font-size-sm);
		font-weight: 600;
		z-index: 2;
		max-width: calc(55% - 10px);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.card-id {
		position: absolute;
		top: 10px;
		right: 10px;
		background: rgba(0, 0, 0, 0.45);
		color: #fff;
		padding: 3px 8px;
		border-radius: 4px;
		font-size: 12px;
		font-weight: 500;
		z-index: 2;
		max-width: calc(45% - 10px);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.card-price {
		position: absolute;
		bottom: 10px;
		right: 10px;
		background: rgba(0, 0, 0, 0.75);
		color: var(--color-white);
		padding: 5px 10px;
		border-radius: 4px;
		font-weight: 700;
		font-size: var(--font-size-base);
		z-index: 2;
		max-width: calc(100% - 20px);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		backdrop-filter: blur(2px);
	}
	.card-content {
		padding: var(--spacing-md);
		box-sizing: border-box;
		width: 100%;
		display: flex;
		flex-direction: column;
		flex: 1;
	}
	.card-title {
		font-size: 1.1rem;
		margin-bottom: var(--spacing-xs);
		color: var(--color-text-main);
		line-height: 1.35;
		display: -webkit-box;
		line-clamp: 2;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		min-height: 2.7rem;
		word-break: break-word;
	}
	.card-location {
		color: var(--color-text-light);
		font-size: var(--font-size-sm);
		margin-bottom: var(--spacing-md);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.card-features {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		border-top: 1px solid var(--color-border);
		padding-top: var(--spacing-sm);
		margin-bottom: var(--spacing-md);
		color: var(--color-text-light);
		font-size: var(--font-size-sm);
		gap: 0.35rem 0.5rem;
	}
	.feature {
		white-space: nowrap;
		display: inline-flex;
		align-items: center;
		gap: 0.2rem;
	}
	.card-btn {
		width: 100%;
		text-align: center;
		box-sizing: border-box;
		margin-top: auto;
	}
	.card-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
		margin-bottom: var(--spacing-md);
	}
	.card-tag {
		background: #f0f0f0;
		color: #666;
		font-size: 10px;
		padding: 2px 6px;
		border-radius: 4px;
		max-width: 100%;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	@media (max-width: 480px) {
		.card-image-wrapper {
			height: 200px;
		}
		.card-content {
			padding: 0.85rem;
		}
		.card-price {
			font-size: 0.9rem;
			padding: 4px 8px;
			bottom: 8px;
			right: 8px;
		}
		.card-status,
		.card-id {
			font-size: 0.75rem;
			padding: 3px 6px;
			top: 8px;
		}
		.card-status {
			left: 8px;
		}
		.card-id {
			right: 8px;
		}
		.card-features {
			font-size: 0.8rem;
			gap: 0.25rem 0.4rem;
		}
		.card-title {
			font-size: 1rem;
			min-height: 2.5rem;
		}
	}

	@media (max-width: 360px) {
		.card-image-wrapper {
			height: 180px;
		}
		.card-content {
			padding: 0.75rem;
		}
		.card-features {
			font-size: 0.75rem;
		}
		.card-price {
			font-size: 0.85rem;
		}
	}
</style>
