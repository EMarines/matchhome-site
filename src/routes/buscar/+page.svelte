<script>
	import { page } from '$app/stores';

	export let data;

	const ZONES = [
		'Norte',
		'Noroeste',
		'Noreste',
		'Centronorte',
		'Centrosur',
		'Suroeste',
		'Sureste',
		'Sur'
	];

	const PROPERTY_TYPES = ['Casa', 'Departamento', 'Terreno', 'Local Comercial', 'Bodega', 'Oficina'];

	const BUDGET_CHIPS = [
		{ label: 'Hasta $1.5M', value: 1500000 },
		{ label: '$1.5M - $2.5M', value: 2500000 },
		{ label: '$2.5M - $4M', value: 4000000 },
		{ label: '$4M - $6M', value: 6000000 },
		{ label: '$6M - $10M', value: 10000000 },
		{ label: '$10M+', value: 12000000 }
	];

	const AMENITIES = [
		'Una planta',
		'Recamara en planta baja',
		'Fraccionamiento privado',
		'Frente a parque',
		'Patio amplio',
		'Lista para habitar',
		'Nueva',
		'Alberca',
		'Sobre Avenida Principal'
	];

	$: contactId = data?.contactId || $page.url.searchParams.get('c') || '';
	$: tenant = $page.data?.tenant || {};
	$: companyName = tenant.name || 'MatchHome';

	const p = data?.prefill || null;

	let name = '';
	let phone = '';
	let operation = p?.operation || 'sale';
	let propertyType = p?.propertyType || 'Casa';
	let budget = p?.budget || '';
	let bedrooms = p?.bedrooms || '3';
	let bathrooms = p?.bathrooms || '2';
	let parking = p?.parking || '2';
	let selectedZones = Array.isArray(p?.zones) ? [...p.zones] : [];
	let selectedAmenities = Array.isArray(p?.amenities) ? [...p.amenities] : [];
	let comments = '';

	let isSubmitting = false;
	let isSubmitted = false;
	let errorMessage = '';

	function toggleItem(list, item) {
		if (list.includes(item)) {
			return list.filter((x) => x !== item);
		}
		return [...list, item];
	}

	function selectBudgetChip(val) {
		budget = String(val);
	}

	async function handleSubmit() {
		if (isSubmitting) return;
		errorMessage = '';

		if (!contactId && phone.replace(/\D/g, '').length < 10) {
			errorMessage = 'Por favor ingresa tu WhatsApp a 10 dígitos para enviarte las opciones.';
			return;
		}

		isSubmitting = true;
		try {
			const res = await fetch('/api/buscar', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					contactId,
					name: name.trim(),
					phone: phone.trim(),
					operation,
					propertyType,
					budget,
					bedrooms,
					bathrooms,
					parking,
					zones: selectedZones,
					amenities: selectedAmenities,
					comments: comments.trim()
				})
			});

			const data = await res.json();
			if (!res.ok || !data.success) {
				errorMessage = data.error || 'No pudimos guardar tus preferencias. Intenta de nuevo.';
				return;
			}

			isSubmitted = true;
		} catch (err) {
			errorMessage = 'Error de conexión. Intenta nuevamente en unos segundos.';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<svelte:head>
	<title>¿Qué propiedad buscas? | {companyName}</title>
	<meta
		name="description"
		content="Cuéntanos qué propiedad buscas en Chihuahua y recibe únicamente opciones que cumplen tus requisitos."
	/>
</svelte:head>

<section class="buscar-page">
	<div class="buscar-shell">
		<div class="buscar-header">
			<span class="badge-pill">✨ Búsqueda Personalizada · 30 segundos</span>
			<h1>{p?.firstName ? `¡Hola ${p.firstName}! Confirma qué propiedad buscas` : 'Cuéntanos qué propiedad buscas'}</h1>
			<p>
				{p
					? 'Ya tenemos estos datos de tu búsqueda; confirma o ajusta lo que necesites para mandarte solo opciones que sí te interesen.'
					: 'Para enviarte únicamente opciones que sí te interesen y no llenarte de mensajes, dime tus requisitos principales.'}
			</p>
		</div>

		{#if isSubmitted}
			<div class="success-card">
				<div class="success-icon">✅</div>
				<h2>¡Listo, ya actualizamos tu búsqueda!</h2>
				<p>
					A partir de ahora recibirás solo propiedades nuevas y de nuestra red que coincidan con lo
					que nos indicaste.
				</p>
				<a href="/propiedades" class="btn-catalog">Ver Catálogo Disponible →</a>
			</div>
		{:else}
			<form class="buscar-form" on:submit|preventDefault={handleSubmit}>
				{#if !contactId}
					<div class="form-row-2">
						<div class="field">
							<label for="leadName">Tu Nombre</label>
							<input id="leadName" type="text" bind:value={name} placeholder="Ej. Ana López" />
						</div>
						<div class="field">
							<label for="leadPhone">Tu WhatsApp (10 dígitos) *</label>
							<input
								id="leadPhone"
								type="tel"
								bind:value={phone}
								placeholder="Ej. 6141234567"
								required
							/>
						</div>
					</div>
				{/if}

				<div class="form-row-2">
					<div class="field">
						<span class="field-label">¿Buscas comprar o rentar?</span>
						<div class="seg-group">
							<button
								type="button"
								class="seg-btn"
								class:active={operation === 'sale'}
								on:click={() => (operation = 'sale')}
							>
								Comprar
							</button>
							<button
								type="button"
								class="seg-btn"
								class:active={operation === 'rental'}
								on:click={() => (operation = 'rental')}
							>
								Rentar
							</button>
						</div>
					</div>

					<div class="field">
						<label for="propType">Tipo de propiedad</label>
						<select id="propType" bind:value={propertyType}>
							{#each PROPERTY_TYPES as t}
								<option value={t}>{t}</option>
							{/each}
						</select>
					</div>
				</div>

				<div class="field">
					<label for="budgetInput">Presupuesto aproximado (MXN)</label>
					<div class="chip-grid">
						{#each BUDGET_CHIPS as chip}
							<button
								type="button"
								class="chip-btn"
								class:active={Number(budget) === chip.value}
								on:click={() => selectBudgetChip(chip.value)}
							>
								{chip.label}
							</button>
						{/each}
					</div>
					<input
						id="budgetInput"
						type="number"
						min="0"
						step="50000"
						bind:value={budget}
						placeholder="O escribe un monto exacto, ej. 3200000"
					/>
				</div>

				{#if propertyType === 'Casa' || propertyType === 'Departamento'}
					<div class="form-row-3">
						<div class="field">
							<label for="beds">Recámaras mín.</label>
							<select id="beds" bind:value={bedrooms}>
								<option value="1">1+</option>
								<option value="2">2+</option>
								<option value="3">3+</option>
								<option value="4">4+</option>
							</select>
						</div>
						<div class="field">
							<label for="baths">Baños mín.</label>
							<select id="baths" bind:value={bathrooms}>
								<option value="1">1+</option>
								<option value="2">2+</option>
								<option value="3">3+</option>
							</select>
						</div>
						<div class="field">
							<label for="parks">Cochera mín.</label>
							<select id="parks" bind:value={parking}>
								<option value="1">1+</option>
								<option value="2">2+</option>
								<option value="3">3+</option>
							</select>
						</div>
					</div>
				{/if}

				<div class="field">
					<span class="field-label">Zonas de interés en Chihuahua</span>
					<div class="chip-grid">
						{#each ZONES as z}
							<button
								type="button"
								class="chip-btn"
								class:active={selectedZones.includes(z)}
								on:click={() => (selectedZones = toggleItem(selectedZones, z))}
							>
								{z}
							</button>
						{/each}
					</div>
				</div>

				<div class="field">
					<span class="field-label">Características importantes para ti</span>
					<div class="chip-grid">
						{#each AMENITIES as a}
							<button
								type="button"
								class="chip-btn"
								class:active={selectedAmenities.includes(a)}
								on:click={() => (selectedAmenities = toggleItem(selectedAmenities, a))}
							>
								{a}
							</button>
						{/each}
					</div>
				</div>

				<div class="field">
					<label for="comments">¿Algo más que debamos considerar? (Opcional)</label>
					<textarea
						id="comments"
						rows="2"
						bind:value={comments}
						placeholder="Ej. Crédito autorizado, necesito patio para perro, cerca de Periférico..."
					></textarea>
				</div>

				{#if errorMessage}
					<div class="error-box">⚠️ {errorMessage}</div>
				{/if}

				<button type="submit" class="btn-submit" disabled={isSubmitting}>
					{isSubmitting ? 'Guardando...' : 'Guardar y recibir opciones compatibles →'}
				</button>
			</form>
		{/if}
	</div>
</section>

<style>
	.buscar-page {
		padding: 2.25rem 1rem 3.5rem;
		background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
		min-height: 75vh;
	}

	.buscar-shell {
		max-width: 680px;
		margin: 0 auto;
	}

	.buscar-header {
		text-align: center;
		margin-bottom: 1.5rem;
	}

	.badge-pill {
		display: inline-block;
		padding: 0.3rem 0.85rem;
		border-radius: 999px;
		font-size: 0.78rem;
		font-weight: 700;
		background: rgba(15, 23, 42, 0.08);
		color: var(--color-primary, #1e293b);
		margin-bottom: 0.65rem;
	}

	.buscar-header h1 {
		margin: 0 0 0.45rem;
		font-size: clamp(1.45rem, 3.5vw, 2rem);
		color: #0f172a;
	}

	.buscar-header p {
		margin: 0;
		color: #475569;
		font-size: 0.95rem;
	}

	.buscar-form,
	.success-card {
		background: #ffffff;
		border: 1px solid #e2e8f0;
		border-radius: 16px;
		padding: 1.5rem;
		box-shadow: 0 10px 30px rgba(15, 23, 42, 0.07);
		display: flex;
		flex-direction: column;
		gap: 1.15rem;
	}

	.success-card {
		text-align: center;
		align-items: center;
		padding: 2.25rem 1.5rem;
	}

	.success-icon {
		font-size: 2.5rem;
	}

	.btn-catalog {
		display: inline-block;
		padding: 0.75rem 1.4rem;
		border-radius: 10px;
		background: var(--color-primary, #0f172a);
		color: #ffffff;
		text-decoration: none;
		font-weight: 700;
	}

	.form-row-2 {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.85rem;
	}

	.form-row-3 {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.75rem;
	}

	@media (max-width: 600px) {
		.form-row-2,
		.form-row-3 {
			grid-template-columns: 1fr;
		}
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	label,
	.field-label {
		font-size: 0.82rem;
		font-weight: 700;
		color: #1e293b;
	}

	input,
	select,
	textarea {
		width: 100%;
		padding: 0.62rem 0.75rem;
		border-radius: 9px;
		border: 1px solid #cbd5e1;
		font-family: inherit;
		font-size: 0.92rem;
		background: #ffffff;
		color: #0f172a;
	}

	.seg-group {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.45rem;
	}

	.seg-btn {
		padding: 0.58rem;
		border-radius: 9px;
		border: 1px solid #cbd5e1;
		background: #f8fafc;
		font-weight: 700;
		cursor: pointer;
	}

	.seg-btn.active {
		background: var(--color-primary, #0f172a);
		color: #ffffff;
		border-color: var(--color-primary, #0f172a);
	}

	.chip-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}

	.chip-btn {
		padding: 0.38rem 0.72rem;
		border-radius: 999px;
		border: 1px solid #cbd5e1;
		background: #f8fafc;
		color: #334155;
		font-size: 0.8rem;
		font-weight: 600;
		cursor: pointer;
	}

	.chip-btn.active {
		background: var(--color-primary, #0f172a);
		color: #ffffff;
		border-color: var(--color-primary, #0f172a);
	}

	.error-box {
		padding: 0.65rem 0.85rem;
		border-radius: 8px;
		background: #fef2f2;
		border: 1px solid #fecaca;
		color: #b91c1c;
		font-size: 0.85rem;
		font-weight: 600;
	}

	.btn-submit {
		padding: 0.85rem 1.2rem;
		border: none;
		border-radius: 10px;
		background: var(--color-primary, #0f172a);
		color: #ffffff;
		font-size: 0.96rem;
		font-weight: 700;
		cursor: pointer;
	}

	.btn-submit:disabled {
		opacity: 0.7;
		cursor: wait;
	}
</style>
