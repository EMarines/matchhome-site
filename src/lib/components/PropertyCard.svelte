<script>
	export let property;
	export let backUrl = null;
	export let fromProposal = false;

	// Map EasyBroker fields to our UI
	$: image =
		(property.property_images &&
			property.property_images.length > 0 &&
			property.property_images[0].url) ||
		property.title_image_thumb ||
		property.title_image_full ||
		'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22300%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20400%20300%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_1%20text%20%7B%20fill%3A%23AAAAAA%3Bfont-weight%3Abold%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A20pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_1%22%3E%3Crect%20width%3D%22400%22%20height%3D%22300%22%20fill%3D%22%23EEEEEE%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22130%22%20y%3D%22158%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';
	$: title = property.title || 'Propiedad sin título';
	$: location =
		typeof property.location === 'object'
			? property.location.name
			: property.location || 'Ubicación no disponible';
	$: price =
		property.operations && property.operations.length > 0
			? property.operations[0].formatted_amount ||
				property.operations[0].formated_amount ||
				`${property.operations[0].amount} ${property.operations[0].currency}`
			: 'Precio a consultar';

	function getOperationType(type) {
		const types = {
			sale: 'Venta',
			rental: 'Renta',
			temporary_rental: 'Renta Temporal'
		};
		return types[type] || type || 'Venta/Renta';
	}

	$: status =
		property.operations && property.operations.length > 0
			? getOperationType(property.operations[0].type)
			: 'Venta/Renta';
	$: beds = property.bedrooms || 0;
	$: baths = property.bathrooms || 0;
	$: area = property.construction_size || property.lot_size || 0;
	$: id = property.public_id;

	$: tags =
		property.tags?.length > 0
			? property.tags
			: (property.features || []).slice(0, 3).map((f) => f.name);
</script>

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
		<a 
			href={`/property/${id}${backUrl ? `?backUrl=${encodeURIComponent(backUrl)}&fromProposal=${fromProposal}` : ''}`} 
			class="btn btn-secondary card-btn"
		>
			Ver Detalles
		</a>
	</div>
</div>

<style>
	.property-card {
		background: var(--color-white);
		border-radius: 8px;
		overflow: hidden;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		transition:
			transform 0.2s,
			box-shadow 0.2s;
		margin: 0 2px;
	}
	.property-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
	}
	.card-image-wrapper {
		position: relative;
		height: 250px;
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
		padding: 4px 12px;
		border-radius: 4px;
		font-size: var(--font-size-sm);
		font-weight: 600;
	}
	.card-id {
		position: absolute;
		top: 10px;
		right: 10px;
		background: rgba(0, 0, 0, 0.3);
		color: #fff;
		padding: 2px 8px;
		border-radius: 4px;
		font-size: 13px;
		font-weight: medium;
		z-index: 2;
	}
	.card-price {
		position: absolute;
		bottom: 10px;
		right: 10px;
		background: rgba(0, 0, 0, 0.5);
		color: var(--color-white);
		padding: 6px 12px;
		border-radius: 4px;
		font-weight: 700;
		font-size: var(--font-size-lg);
	}
	.card-content {
		padding: var(--spacing-md);
	}
	.card-title {
		font-size: var(--font-size-lg);
		margin-bottom: var(--spacing-xs);
		color: var(--color-text-main);
	}
	.card-location {
		color: var(--color-text-light);
		font-size: var(--font-size-sm);
		margin-bottom: var(--spacing-md);
	}
	.card-features {
		display: flex;
		justify-content: space-between;
		border-top: 1px solid var(--color-border);
		padding-top: var(--spacing-sm);
		margin-bottom: var(--spacing-md);
		color: var(--color-text-light);
		font-size: var(--font-size-sm);
	}
	.card-btn {
		width: 100%;
		text-align: center;
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
	}
</style>
