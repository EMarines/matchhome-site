import { serializeFirestoreData } from '$lib/utils/serializeFirestore';
import { trimPropertyForCatalog, isSinergia2 } from '$lib/utils/trimPropertyPayload';
import inventoryData from '$lib/data/inventory.json';

export async function load({ locals, url }) {
  const db = locals.db;
  const tenant = locals.tenant;

  const contactId = url.searchParams.get('c') || url.searchParams.get('contact_id');
  const phone = url.searchParams.get('tel') || url.searchParams.get('phone');

  let prefilledContact = null;

  try {
    if (db) {
      // 1. Cargar perfil de contacto si viene ?c=ID o ?tel=...
      if (contactId) {
        const cDoc = await db.collection('contacts').doc(contactId).get();
        if (cDoc.exists) {
          prefilledContact = { id: cDoc.id, ...cDoc.data() };
        }
      } else if (phone) {
        const cleanTel = phone.replace(/\D/g, '');
        const cSnap = await db.collection('contacts').where('telefono', '==', cleanTel).limit(1).get();
        if (!cSnap.empty) {
          const doc = cSnap.docs[0];
          prefilledContact = { id: doc.id, ...doc.data() };
        }
      }

      // 2. Cargar catálogo de propiedades
      const snapshot = await db.collection('properties').get();
      if (!snapshot.empty) {
        const rawProperties = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // REGLA: Sinergia 2 no es publicable en catálogo abierto; solo se ofrece directo a contactos
        const publicProperties = rawProperties.filter(p => !isSinergia2(p));
        const trimmed = publicProperties.map(trimPropertyForCatalog).filter(Boolean);
        return {
          properties: serializeFirestoreData(trimmed),
          tenant,
          contactProfile: prefilledContact ? serializeFirestoreData(prefilledContact) : null
        };
      }
    }
  } catch (error) {
    console.error('Error loading properties or contact from Firestore:', error);
  }

  // Fallback to local inventory.json if Firestore is not connected or empty
  const localTrimmed = inventoryData.filter(p => !isSinergia2(p)).map(trimPropertyForCatalog).filter(Boolean);
  return {
    properties: serializeFirestoreData(localTrimmed),
    tenant,
    contactProfile: prefilledContact ? serializeFirestoreData(prefilledContact) : null
  };
}
