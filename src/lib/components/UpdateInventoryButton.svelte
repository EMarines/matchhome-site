<script>
	let updating = false;

	async function handleUpdate() {
		if (!confirm('¿Estás seguro de actualizar el inventario? Esto tomará unos minutos.')) return;

		updating = true;
		try {
			const res = await fetch('/update-inventory', { method: 'POST' });
			if (res.ok) {
				alert('¡Inventario actualizado con éxito! La página se recargará.');
				window.location.reload();
			} else {
				alert('Error al actualizar el inventario.');
			}
		} catch (e) {
			console.error(e);
			alert('Error de conexión.');
		} finally {
			updating = false;
		}
	}
</script>

<button on:click={handleUpdate} disabled={updating} class="update-btn">
	{updating ? '⏳ Actualizando...' : '🔄 Actualizar Inventario (Dev)'}
</button>

<style>
	.update-btn {
		background: #fff;
		border: 1px solid #fff;
		color: #000;
		font-weight: bold;
		font-size: 0.8rem;
		padding: 8px 16px;
		border-radius: 4px;
		cursor: pointer;
		margin-top: 15px;
		display: inline-block;
	}
	.update-btn:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}
</style>
