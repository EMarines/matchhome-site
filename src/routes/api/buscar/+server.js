import { json } from '@sveltejs/kit';

const VALID_ZONES = [
	'Norte',
	'Noroeste',
	'Noreste',
	'Oeste',
	'Centronorte',
	'Este',
	'Centrosur',
	'Suroeste',
	'Sureste',
	'Sur'
];

function getLast10(raw) {
	const digits = String(raw || '').replace(/\D/g, '');
	return digits.length >= 10 ? digits.slice(-10) : digits;
}

function normalizePhoneVariants(last10) {
	if (!last10 || last10.length < 10) return [];
	const p1 = last10.slice(0, 3);
	const p2 = last10.slice(3, 6);
	const p3 = last10.slice(6, 10);
	return [
		last10,
		`52${last10}`,
		`+52${last10}`,
		`521${last10}`,
		`${p1} ${p2} ${p3}`,
		`${p1}-${p2}-${p3}`
	];
}

export async function POST({ request, locals }) {
	try {
		const body = await request.json().catch(() => ({}));
		const rawContactId = String(body?.contactId || '').trim();
		const name = String(body?.name || '').trim();
		const last10 = getLast10(body?.phone || '');
		const operation = body?.operation === 'rental' ? 'rental' : 'sale';
		const propertyType = String(body?.propertyType || 'Casa').trim();
		const budgetNum = Number(String(body?.budget || '0').replace(/\D/g, '')) || 0;
		const numBeds = Number(body?.bedrooms || 0) || 0;
		const numBaths = Number(body?.bathrooms || 0) || 0;
		const numParks = Number(body?.parking || 0) || 0;
		const zones = Array.isArray(body?.zones)
			? body.zones.map((z) => String(z).trim()).filter((z) => VALID_ZONES.includes(z))
			: [];
		const amenities = Array.isArray(body?.amenities)
			? body.amenities.map((a) => String(a).trim()).filter(Boolean).slice(0, 12)
			: [];
		const comments = String(body?.comments || '').trim().slice(0, 500);

		if (!rawContactId && last10.length < 10) {
			return json(
				{
					success: false,
					error: 'Ingresa tu número de WhatsApp a 10 dígitos para poder enviarte opciones.'
				},
				{ status: 400 }
			);
		}

		const db = locals.db;
		if (!db) {
			return json(
				{ success: false, error: 'Servicio de base de datos no disponible en este momento.' },
				{ status: 503 }
			);
		}

		let targetDocId = '';
		let existingData = null;

		if (rawContactId) {
			const snap = await db.collection('contacts').doc(rawContactId).get();
			if (snap.exists) {
				targetDocId = snap.id;
				existingData = snap.data() || {};
			}
		}

		if (!targetDocId && last10.length === 10) {
			const variants = normalizePhoneVariants(last10);
			for (const field of ['telephon', 'telefono']) {
				const qSnap = await db
					.collection('contacts')
					.where(field, 'in', variants)
					.limit(1)
					.get();
				if (!qSnap.empty) {
					targetDocId = qSnap.docs[0].id;
					existingData = qSnap.docs[0].data() || {};
					break;
				}
			}
		}

		const nowMs = Date.now();
		const isRental = operation === 'rental';
		const opLabel = isRental ? 'Renta' : 'Venta';
		const stageLabel = isRental ? 'A2' : 'Etapa 4';

		const atairPayload = {
			isActive: true,
			contactStage: stageLabel,
			selecTO: operation,
			typeOperation: opLabel,
			selecTP: propertyType,
			budget: budgetNum,
			numBeds,
			numBaths,
			numParks,
			locaProperty: zones,
			tagsProperty: amenities,
			lastResponse: nowMs,
			reactivatedAt: nowMs,
			updatedAt: nowMs,
			createdAt: nowMs
		};

		if (comments) {
			atairPayload.comContact = existingData?.comContact
				? `${existingData.comContact}\n[Formulario Web]: ${comments}`.slice(0, 1200)
				: comments;
		}

		if (targetDocId) {
			if (existingData?.createdAt && !existingData?.originalCreatedAt) {
				atairPayload.originalCreatedAt = existingData.createdAt;
			}
			await db.collection('contacts').doc(targetDocId).set(atairPayload, { merge: true });
		} else {
			const newContact = {
				...atairPayload,
				name: name || 'Prospecto Web',
				lastname: '',
				telephon: last10,
				email: '',
				typeContact: isRental ? 'Arrendatario' : 'Comprador',
				selecMC: 'Página Web',
				procedencia: 'MH',
				sendedProperties: []
			};
			const ref = await db.collection('contacts').add(newContact);
			targetDocId = ref.id;
		}

		const summaryParts = [
			`${opLabel} · ${propertyType}`,
			budgetNum > 0 ? `$${budgetNum.toLocaleString('es-MX')}` : null,
			zones.length > 0 ? `Zona: ${zones.join(', ')}` : null,
			numBeds > 0 ? `${numBeds}+ rec` : null,
			amenities.length > 0 ? `Pref: ${amenities.join(', ')}` : null
		].filter(Boolean);

		await db.collection('binnacles').add({
			date: nowMs,
			to: targetDocId,
			action: `Formulario E3 completado → ${stageLabel}: `,
			comment: `${summaryParts.join(' | ')}${comments ? ` | Notas: ${comments}` : ''}`
		});

		return json({
			success: true,
			contactId: targetDocId,
			promotedStage: stageLabel
		});
	} catch (err) {
		console.error('[MatchHomeSite /api/buscar] Error:', err);
		return json(
			{ success: false, error: 'Ocurrió un error al guardar tus preferencias.' },
			{ status: 500 }
		);
	}
}
