import { serializeFirestoreData } from '$lib/utils/serializeFirestore';
import { trimPropertyForCatalog, isSinergia2, getAllowedPropertiesForContact } from '$lib/utils/trimPropertyPayload';
import inventoryData from '$lib/data/inventory.json';

export async function load({ locals, url, cookies }) {
  const db = locals.db;
  const contactId = url.searchParams.get('c') || url.searchParams.get('contact_id') || cookies.get('mh_contact_id');
  const phone = url.searchParams.get('tel') || url.searchParams.get('phone');

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
  
  try {
    if (db) {
      // Consultamos propiedades, contactos y liberaciones en paralelo
      const [snapshot, contactsSnap, allowedPropsSet] = await Promise.all([
        db.collection('properties').limit(100).get(),
        db.collection('contacts').select('procedencia').get().catch(() => null),
        getAllowedPropertiesForContact(db, contactId, phone)
      ]);

      const contactsSynergyMap = {};
      if (contactsSnap && !contactsSnap.empty) {
        contactsSnap.forEach(cDoc => {
          const cData = cDoc.data();
          if (cData && cData.procedencia) {
            contactsSynergyMap[cDoc.id] = cData.procedencia;
          }
        });
      }

      if (!snapshot.empty) {
        const rawProperties = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // REGLA: En MatchHomeSite SOLO se publican propiedades propias (MH/EB) y Sinergia 1 (S1), más S2/S3 liberadas para este cliente
        const publicProperties = rawProperties.filter(p => !isSinergia2(p, contactsSynergyMap, allowedPropsSet));
        const trimmed = publicProperties.map(trimPropertyForCatalog).filter(Boolean);
        return {
          properties: serializeFirestoreData(trimmed),
          contactId: contactId || ''
        };
      }
    }
  } catch (error) {
    console.error('Error loading home properties from Firestore:', error);
  }

  // Fallback to local inventory.json if Firestore fails or is empty
  const localTrimmed = inventoryData.filter(p => !isSinergia2(p)).map(trimPropertyForCatalog).filter(Boolean);
  return {
    properties: serializeFirestoreData(localTrimmed),
    contactId: contactId || ''
  };
}

