export async function load({ url, locals }) {
	const contactId = String(url.searchParams.get('c') || '').trim();
	if (!contactId || !locals?.db) {
		return { contactId, prefill: null };
	}

	try {
		const snap = await locals.db.collection('contacts').doc(contactId).get();
		if (!snap.exists) {
			return { contactId, prefill: null };
		}

		const c = snap.data() || {};
		const rawOp = String(c.selecTO || c.typeOperation || '').toLowerCase();
		const operation = rawOp.includes('rent') || rawOp.includes('arrend') ? 'rental' : 'sale';

		const firstName = String(c.name || c.nombre || '').trim().split(/\s+/)[0] || '';
		const zones = Array.isArray(c.locaProperty)
			? c.locaProperty
			: typeof c.locaProperty === 'string' && c.locaProperty.trim()
				? c.locaProperty.split(',').map((z) => z.trim()).filter(Boolean)
				: [];
		const amenities = Array.isArray(c.tagsProperty) ? c.tagsProperty : [];

		return {
			contactId,
			prefill: {
				firstName,
				operation,
				propertyType: String(c.selecTP || '').trim() || 'Casa',
				budget: Number(c.budget || 0) > 0 ? String(Number(c.budget)) : '',
				bedrooms: Number(c.numBeds || 0) > 0 ? String(Math.min(4, Number(c.numBeds))) : '3',
				bathrooms: Number(c.numBaths || 0) > 0 ? String(Math.min(3, Number(c.numBaths))) : '2',
				parking: Number(c.numParks || 0) > 0 ? String(Math.min(3, Number(c.numParks))) : '2',
				zones,
				amenities
			}
		};
	} catch (err) {
		console.warn('[MatchHomeSite /buscar load] No se pudo precargar contacto:', err?.message);
		return { contactId, prefill: null };
	}
}
