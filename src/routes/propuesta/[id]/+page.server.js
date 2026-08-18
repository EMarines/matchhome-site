import { error } from '@sveltejs/kit';
import { serializeFirestoreData } from '$lib/utils/serializeFirestore';
import inventoryData from '$lib/data/inventory.json';
import { mockProperties } from '$lib/data/mockProperties';

export async function load({ params, url, locals }) {
  const { id } = params;
  const db = locals.db;
  const contactId = url.searchParams.get('c');
  let clientName = url.searchParams.get('cliente') || 'Cliente';
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
          cData.name ||
          cData.nombre ||
          cData.fullName ||
          cData.nombreCompleto ||
          (cData.firstName ? `${cData.firstName} ${cData.lastName || ''}`.trim() : null) ||
          cData.first_name;
        if (fetchedName) {
          clientName = fetchedName;
        }
      }
    } catch (e) {
      console.error('Error loading contact from Firestore on server:', e);
    }
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

      // Load all properties for similar properties section
      const snapshot = await db.collection('properties').get();
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

  const basePrice =
    targetBudget ||
    anchorProperty.price ||
    anchorProperty.precio ||
    (anchorProperty.operations && anchorProperty.operations.length > 0
      ? anchorProperty.operations[0].amount
      : 0);

  const similars = allPropertiesPool.filter((p) => {
    const pId = p.public_id || p.easybroker_id || p.id;
    if (pId === anchorId) return false;

    const pOpType =
      p.selecTO ||
      p.tipoOperacion ||
      (p.operations && p.operations.length > 0 ? p.operations[0].type : '');
    const pPropType = p.selecTP || p.tipoPropiedad || p.property_type || '';

    if (pOpType && anchorOpType && pOpType.toLowerCase() !== anchorOpType.toLowerCase()) {
      return false;
    }
    if (pPropType && anchorPropType && pPropType.toLowerCase() !== anchorPropType.toLowerCase()) {
      return false;
    }
    return true;
  });

  similars.sort((a, b) => {
    const priceA =
      a.price ||
      a.precio ||
      (a.operations && a.operations.length > 0 ? a.operations[0].amount : 0);
    const priceB =
      b.price ||
      b.precio ||
      (b.operations && b.operations.length > 0 ? b.operations[0].amount : 0);
    return Math.abs(priceA - basePrice) - Math.abs(priceB - basePrice);
  });

  const similarProperties = similars.slice(0, 6);

  return {
    anchorProperty: serializeFirestoreData(anchorProperty),
    similarProperties: serializeFirestoreData(similarProperties),
    clientName,
    contact: serializeFirestoreData(contact),
    contactId
  };
}
