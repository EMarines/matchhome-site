import { error } from '@sveltejs/kit';
import { serializeFirestoreData } from '$lib/utils/serializeFirestore';
import { isSinergia2, getAllowedPropertiesForContact } from '$lib/utils/trimPropertyPayload';
import inventoryData from '$lib/data/inventory.json';
import { mockProperties } from '$lib/data/mockProperties';

export async function load({ params, url, locals, cookies }) {
  const { id } = params;
  const db = locals.db;
  const contactId = url.searchParams.get('c') || cookies.get('mh_contact_id');

  if (url.searchParams.get('c')) {
    try {
      cookies.set('mh_contact_id', url.searchParams.get('c'), {
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
        httpOnly: false,
        sameSite: 'lax'
      });
    } catch {}
  }
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

      // ── Determinar tipo de contacto antes de la query del pool ────────────────
      const isExistingContactEarly = Boolean(contact && contact.id);
      const contactPropTypeEarly = isExistingContactEarly
        ? (contact.selecTP || contact.typeProperty || '')
        : '';
      // Determinar el tipo de propiedad a filtrar en Firestore
      const filterTypeForPool = contactPropTypeEarly || anchorPropType;

      // Load active properties filtered by type directly in Firestore (much cheaper)
      // Nota: Toda la colección 'properties' en Firestore contiene únicamente propiedades activas sincronizadas.
      try {
        let poolQuery = db.collection('properties');
        if (filterTypeForPool) {
          poolQuery = poolQuery.where('property_type', '==', filterTypeForPool);
        }
        const snapshot = await poolQuery.limit(100).get();
        if (!snapshot.empty) {
          allPropertiesPool = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        }
        // Fallback sin filtro de tipo si no trajo resultados (campo property_type inconsistente o sin coincidencias)
        if (allPropertiesPool.length === 0) {
          const fallbackSnap = await db.collection('properties').limit(100).get();
          if (!fallbackSnap.empty) {
            allPropertiesPool = fallbackSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
          }
        }
      } catch (poolErr) {
        console.error('Error loading properties pool:', poolErr);
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

  // ── Cargar mapa de sinergias y propiedades liberadas para este contacto ──────────────
  const [contactsSnap, allowedPropsSet] = await Promise.all([
    db ? db.collection('contacts').select('procedencia').get().catch(() => null) : null,
    getAllowedPropertiesForContact(db, contactId, clientPhone)
  ]);

  const contactsSynergyMap = {};
  if (contactsSnap && !contactsSnap.empty) {
    contactsSnap.forEach((cDoc) => {
      const cData = cDoc.data();
      if (cData && cData.procedencia) {
        contactsSynergyMap[cDoc.id] = cData.procedencia;
      }
    });
  }

  // ── Auto-Liberación de la Propiedad Principal en Firestore para este Contacto ──
  const anchorKey = anchorProperty?.public_id || anchorProperty?.easybroker_id || anchorProperty?.clavePropiedad || anchorProperty?.id;
  if (anchorKey) {
    allowedPropsSet.add(String(anchorKey).trim().toUpperCase());
    if (db && contact && contact.id) {
      try {
        const adminModule = await import('firebase-admin');
        const FieldValue = adminModule.default?.firestore?.FieldValue || adminModule.firestore?.FieldValue;
        if (FieldValue) {
          await db.collection('contacts').doc(contact.id).update({
            sendedProperties: FieldValue.arrayUnion(anchorKey),
            lastProposalPropertyId: anchorKey,
            lastProposalViewedAt: Date.now()
          }).catch(() => null);
        }
      } catch (e) {
        // non-blocking
      }
    }
  }

  // ── REGLA CRÍTICA SINERGIA 2 / 3 (Red Externa / Alianza Privada) ─────────────────
  // Las propiedades de Sinergia 2/3 SÍ pueden mostrarse si fueron liberadas para este cliente.
  const eligibleSimilarPool = allPropertiesPool.filter((p) => !isSinergia2(p, contactsSynergyMap, allowedPropsSet));

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

    similars = eligibleSimilarPool.filter((p) => {
      const pId = p.public_id || p.easybroker_id || p.id;
      if (pId === anchorId) return false;
      if (isSinergia2(p, contactsSynergyMap)) return false;

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

    // Ordenar por cercanía al presupuesto del contacto (si tiene), si no por precio ancla
    const baseForSort = contactBudget || anchorBasePrice;
    similars.sort((a, b) => {
      const priceA = a.price || a.precio || (a.operations?.[0]?.amount) || 0;
      const priceB = b.price || b.precio || (b.operations?.[0]?.amount) || 0;
      return Math.abs(priceA - baseForSort) - Math.abs(priceB - baseForSort);
    });

    // ── Zona como filtro real con mínimo 6 ────────────────────────────────────
    // Solo filtra por zona si hay al menos 6 propiedades que coincidan.
    // Si hay menos, ignora la zona (muestra todas las que ya pasaron los otros filtros).
    if (contactLocations.length > 0) {
      const similarsInZone = similars.filter((p) => {
        const pLocation = (p.location?.name || p.location || p.colonia || '').toLowerCase();
        return contactLocations.some(l => pLocation.includes(l) || l.includes(pLocation));
      });
      if (similarsInZone.length >= 6) {
        similars = similarsInZone;
      }
      // Si <6, se queda con todos (sin filtro de zona)
    }


  } else {
    // ── CONTACTO NUEVO: filtrar por tipo y precio ±20% de la propiedad ancla ───
    const basePrice = targetBudget || anchorBasePrice;
    const priceMin = basePrice * 0.8;
    const priceMax = basePrice * 1.2;

    similars = eligibleSimilarPool.filter((p) => {
      const pId = p.public_id || p.easybroker_id || p.id;
      if (pId === anchorId) return false;
      if (isSinergia2(p, contactsSynergyMap)) return false;

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
