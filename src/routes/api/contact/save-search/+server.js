import { json } from '@sveltejs/kit';

const ZONES = ['Norte', 'Noroeste', 'Noreste', 'Centronorte', 'Centrosur', 'Suroeste', 'Sureste'];

export async function POST({ request, locals }) {
  try {
    const { contactId, name, phone, email, filters = {}, search = '' } = await request.json();

    const cleanPhone = (phone || '').replace(/\D/g, '');
    if (!contactId && !cleanPhone && !email) {
      return json(
        { success: false, error: 'Por favor ingresa tu número de WhatsApp o correo electrónico.' },
        { status: 400 }
      );
    }

    const db = locals.db;
    if (!db) {
      return json({
        success: true,
        message: 'Modo sin base de datos activa',
        offline: true
      });
    }

    const allTags = Array.isArray(filters.tags) ? filters.tags : [];
    const selectedZones = allTags.filter((t) => ZONES.includes(t));
    const selectedAmenities = allTags.filter((t) => !ZONES.includes(t));

    const interestData = {
      tipoPropiedad: filters.propertyType || '',
      tipoOperacion: filters.operationType || '',
      recamaras: filters.bedrooms || '0',
      banos: filters.bathrooms || '0',
      estacionamiento: filters.parking || '0',
      minPrice: filters.minPrice ? Number(filters.minPrice) : null,
      maxPrice: filters.maxPrice ? Number(filters.maxPrice) : null,
      zonas: selectedZones,
      amenidades: selectedAmenities,
      textoLibre: search || ''
    };

    let targetDocId = contactId || null;
    let isNewContact = false;

    // 1. Si no hay contactId pero sí teléfono, buscar si ya existe en `contacts`
    if (!targetDocId && cleanPhone) {
      const phoneSnap = await db
        .collection('contacts')
        .where('telefono', '==', cleanPhone)
        .limit(1)
        .get();

      if (!phoneSnap.empty) {
        targetDocId = phoneSnap.docs[0].id;
      }
    }

    // 2. Actualizar contacto existente o crear uno nuevo
    if (targetDocId) {
      const contactRef = db.collection('contacts').doc(targetDocId);
      const updatePayload = {
        updatedAt: new Date(),
        interes: interestData,
        selectTP: filters.propertyType || '',
        selecTO: filters.operationType || '',
        budget: Number(filters.maxPrice || filters.minPrice || 0),
        bedrooms: filters.bedrooms || '0',
        bathrooms: filters.bathrooms || '0',
        parking: filters.parking || '0',
        locaProperty: selectedZones.join(', '),
        tagsProperty: selectedAmenities
      };
      if (name) updatePayload.nombre = name;
      if (email) updatePayload.email = email;
      if (cleanPhone) updatePayload.telefono = cleanPhone;

      await contactRef.set(updatePayload, { merge: true });
    } else {
      isNewContact = true;
      const newContactPayload = {
        nombre: name || 'Prospecto Web MatchHome',
        telefono: cleanPhone,
        email: email || '',
        tipo: 'lead',
        procedencia: 'MH',
        status: 'nuevo',
        contactStage: 'Etapa1',
        selectTP: filters.propertyType || '',
        selecTO: filters.operationType || '',
        budget: Number(filters.maxPrice || filters.minPrice || 0),
        bedrooms: filters.bedrooms || '0',
        bathrooms: filters.bathrooms || '0',
        parking: filters.parking || '0',
        locaProperty: selectedZones.join(', '),
        tagsProperty: selectedAmenities,
        interes: interestData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await db.collection('contacts').add(newContactPayload);
      targetDocId = docRef.id;
    }

    // 3. Registrar evento en bitácora de seguimiento (binnacles)
    try {
      await db.collection('binnacles').add({
        contactId: targetDocId,
        tipo: 'web_filter_sync',
        descripcion: `Filtros guardados desde catálogo web: ${filters.operationType === 'rental' ? 'Renta' : 'Venta'} ${filters.propertyType || 'Cualquier tipo'} ${selectedZones.length ? 'en ' + selectedZones.join(', ') : ''} ${filters.maxPrice ? 'hasta $' + Number(filters.maxPrice).toLocaleString('es-MX') : ''}`,
        fecha: new Date(),
        asesor: 'Portal MatchHome'
      });
    } catch (binnacleErr) {
      console.warn('Error no fatal al registrar binnacle:', binnacleErr.message);
    }

    return json({
      success: true,
      contactId: targetDocId,
      isNew: isNewContact,
      message: 'Preferencias guardadas exitosamente en tu expediente.'
    });
  } catch (error) {
    console.error('Error en save-search API:', error);
    return json({ success: false, error: error.message }, { status: 500 });
  }
}
