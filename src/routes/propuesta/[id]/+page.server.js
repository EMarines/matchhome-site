import { error } from '@sveltejs/kit';
import { serializeFirestoreData } from '$lib/utils/serializeFirestore';
import inventoryData from '$lib/data/inventory.json';
import { mockProperties } from '$lib/data/mockProperties';

export async function load({ params, url, locals }) {
  const { id } = params;
  const db = locals.db;
  const contactId = url.searchParams.get('c');
  const paramNombre = url.searchParams.get('nombre') || url.searchParams.get('name') || url.searchParams.get('first_name') || url.searchParams.get('firstName') || '';
  const paramApellido = url.searchParams.get('apellido') || url.searchParams.get('lastname') || url.searchParams.get('lastName') || url.searchParams.get('last_name') || url.searchParams.get('apellidos') || '';
  const paramCliente = url.searchParams.get('cliente') || '';

  let clientName = '';
  if (paramNombre || paramApellido) {
    clientName = `${paramNombre} ${paramApellido}`.trim();
  } else if (paramCliente) {
    clientName = paramCliente.trim();
  }

  let clientPhone =
    url.searchParams.get('tel') ||
    url.searchParams.get('telefono') ||
    url.searchParams.get('phone') ||
    url.searchParams.get('celular') ||
    url.searchParams.get('mobile') ||
    '';

  const targetBudget = parseFloat(url.searchParams.get('presupuesto'));
  let contact = null;

  console.log(`[propuesta load] ID: "${id}", db available: ${Boolean(db)}, contactId: "${contactId || ''}"`);

  if (contactId && db) {
    try {
      const contactDoc = await db.collection('contacts').doc(contactId).get();
      if (contactDoc.exists) {
        const cData = contactDoc.data();
        contact = { id: contactDoc.id, ...cData };
        const fetchedName =
          (cData.name && cData.lastname ? `${cData.name} ${cData.lastname}`.trim() : null) ||
          cData.name ||
          cData.nombre ||
          cData.fullName ||
          cData.nombreCompleto ||
          (cData.firstName ? `${cData.firstName} ${cData.lastName || ''}`.trim() : null) ||
          cData.first_name;
        if (fetchedName) {
          clientName = fetchedName;
        }
        if (!clientPhone) {
          clientPhone =
            cData.phone ||
            cData.telefono ||
            cData.telephon ||
            cData.celular ||
            cData.mobile ||
            cData.phone_number ||
            '';
        }
      } else if (!clientName && contactId) {
        clientName = contactId;
      }
    } catch (e) {
      console.error('Error loading contact from Firestore on server:', e);
      if (!clientName && contactId) {
        clientName = contactId;
      }
    }
  } else if (!clientName && contactId) {
    clientName = contactId;
  }

  if (!clientName) {
    clientName = 'Cliente';
  }

  let anchorProperty = null;
  let allPropertiesPool = [];

  const localAnchor =
    inventoryData.find(
      (p) => p.public_id === id || p.easybroker_id === id || p.id === id || p.clavePropiedad === id
    ) ||
    mockProperties.find(
      (p) => p.public_id === id || p.easybroker_id === id || p.id === id || p.clavePropiedad === id
    );

  if (db) {
    try {
      const fields = ['public_id', 'easybroker_id', 'clavePropiedad', 'id'];
      let doc = null;

      // 1. Direct doc ID lookup
      const docRef = await db.collection('properties').doc(id).get();
      if (docRef.exists) {
        doc = docRef;
      }

      // 2. Search across fields
      if (!doc) {
        for (const field of fields) {
          const q = await db.collection('properties').where(field, '==', id).limit(1).get();
          if (!q.empty) {
            doc = q.docs[0];
            break;
          }
        }
      }

      if (doc && doc.exists) {
        const firestoreData = doc.data();
        anchorProperty = {
          ...(localAnchor || {}),
          ...firestoreData,
          id: doc.id,
          public_id: firestoreData.public_id || firestoreData.easybroker_id || doc.id
        };
      }

      // Load active properties for similar properties section (limit to avoid Firestore overcharge)
      const snapshot = await db.collection('properties')
        .where('isActive', '==', true)
        .limit(200)
        .get();

      if (!snapshot.empty) {
        allPropertiesPool = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      }
    } catch (e) {
      console.error('Firestore proposal load failed:', e);
    }
  }

  if (!anchorProperty) {
    anchorProperty = localAnchor;
  }

  if (!anchorProperty) {
    console.error(`[propuesta load] Property not found: "${id}"`);
    throw error(404, `Propiedad de propuesta no encontrada (${id})`);
  }

  if (allPropertiesPool.length === 0) {
    allPropertiesPool = [...inventoryData, ...mockProperties];
  }

  const anchorId = anchorProperty.public_id || anchorProperty.easybroker_id || anchorProperty.id;
  const anchorOpType =
    anchorProperty.selecTO ||
    anchorProperty.tipoOperacion ||
    (anchorProperty.operations && anchorProperty.operations.length > 0
      ? anchorProperty.operations[0].type
      : 'sale');
  const anchorPropType =
    anchorProperty.selecTP ||
    anchorProperty.tipoPropiedad ||
    anchorProperty.property_type ||
    '';

  const anchorBasePrice =
    anchorProperty.price ||
    anchorProperty.precio ||
    (anchorProperty.operations && anchorProperty.operations.length > 0
      ? anchorProperty.operations[0].amount
      : 0);

  // ── Determinar si es contacto existente con preferencias propias ──────────────
  const isExistingContact = Boolean(contact && contact.id);

  let similars = [];

  if (isExistingContact && contact) {
    // ── CONTACTO EXISTENTE: filtrar por sus preferencias guardadas en Firestore ─
    const contactBudget = parseFloat(contact.budget) || 0;
    const contactPropType = contact.selecTP || contact.typeProperty || '';
    const contactOpType = contact.typeOperation || contact.selecTO || '';
    const contactBeds = parseInt(contact.numBeds) || 0;
    const contactBaths = parseInt(contact.numBaths) || 0;
    const contactParks = parseInt(contact.numParks) || 0;
    const contactLocations = Array.isArray(contact.locaProperty) ? contact.locaProperty.map(l => l.toLowerCase()) : [];
    const contactTags = Array.isArray(contact.tagsProperty) ? contact.tagsProperty.map(t => t.toLowerCase()) : [];

    similars = allPropertiesPool.filter((p) => {
      const pId = p.public_id || p.easybroker_id || p.id;
      if (pId === anchorId) return false;

      // Tipo de propiedad
      const pPropType = p.selecTP || p.tipoPropiedad || p.property_type || '';
      if (contactPropType && pPropType && pPropType.toLowerCase() !== contactPropType.toLowerCase()) return false;

      // Tipo de operación
      const pOpType = p.selecTO || p.tipoOperacion || (p.operations?.[0]?.type) || '';
      if (contactOpType && pOpType && pOpType.toLowerCase() !== contactOpType.toLowerCase()) return false;

      // Recámaras mínimas
      if (contactBeds > 0 && (p.bedrooms || 0) < contactBeds) return false;

      // Baños mínimos
      if (contactBaths > 0 && (p.bathrooms || 0) < contactBaths) return false;

      // Cajones mínimos
      if (contactParks > 0 && (p.parking_spaces || 0) < contactParks) return false;

      return true;
    });

    // Ordenar por cercanía al presupuesto del contacto (si tiene), si no por precio
    const baseForSort = contactBudget || anchorBasePrice;
    similars.sort((a, b) => {
      const priceA = a.price || a.precio || (a.operations?.[0]?.amount) || 0;
      const priceB = b.price || b.precio || (b.operations?.[0]?.amount) || 0;
      return Math.abs(priceA - baseForSort) - Math.abs(priceB - baseForSort);
    });

    // Boost: propiedades que coincidan con ubicaciones o tags preferidos van primero
    if (contactLocations.length > 0 || contactTags.length > 0) {
      similars.sort((a, b) => {
        const scoreA = _matchScore(a, contactLocations, contactTags);
        const scoreB = _matchScore(b, contactLocations, contactTags);
        return scoreB - scoreA; // mayor score primero
      });
    }

  } else {
    // ── CONTACTO NUEVO: filtrar por tipo y precio ±20% de la propiedad ancla ───
    const basePrice = targetBudget || anchorBasePrice;
    const priceMin = basePrice * 0.8;
    const priceMax = basePrice * 1.2;

    similars = allPropertiesPool.filter((p) => {
      const pId = p.public_id || p.easybroker_id || p.id;
      if (pId === anchorId) return false;

      const pOpType = p.selecTO || p.tipoOperacion || (p.operations?.[0]?.type) || '';
      const pPropType = p.selecTP || p.tipoPropiedad || p.property_type || '';

      if (pOpType && anchorOpType && pOpType.toLowerCase() !== anchorOpType.toLowerCase()) return false;
      if (pPropType && anchorPropType && pPropType.toLowerCase() !== anchorPropType.toLowerCase()) return false;

      // Filtrar por precio ±20% solo si la propiedad ancla tiene precio
      if (basePrice > 0) {
        const pPrice = p.price || p.precio || (p.operations?.[0]?.amount) || 0;
        if (pPrice > 0 && (pPrice < priceMin || pPrice > priceMax)) return false;
      }

      return true;
    });

    similars.sort((a, b) => {
      const priceA = a.price || a.precio || (a.operations?.[0]?.amount) || 0;
      const priceB = b.price || b.precio || (b.operations?.[0]?.amount) || 0;
      return Math.abs(priceA - (targetBudget || anchorBasePrice)) - Math.abs(priceB - (targetBudget || anchorBasePrice));
    });
  }

  const similarProperties = similars.slice(0, 6);

  // ── Helper: puntuación de coincidencia de preferencias ──────────────────────
  function _matchScore(p, locations, tags) {
    let score = 0;
    const pLocation = (p.location?.name || p.location || p.colonia || '').toLowerCase();
    if (locations.length > 0 && locations.some(l => pLocation.includes(l) || l.includes(pLocation))) score += 2;
    const pFeatures = (Array.isArray(p.tags) ? p.tags : []).map(t => t.toLowerCase());
    if (tags.length > 0) {
      const matchingTags = tags.filter(t => pFeatures.some(f => f.includes(t) || t.includes(f)));
      score += matchingTags.length;
    }
    return score;
  }

  return {
    anchorProperty: serializeFirestoreData(anchorProperty),
    similarProperties: serializeFirestoreData(similarProperties),
    clientName,
    clientPhone,
    contact: serializeFirestoreData(contact),
    contactId,
    isExistingContact
  };

}
