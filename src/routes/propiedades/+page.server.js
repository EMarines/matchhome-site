import { serializeFirestoreData } from '$lib/utils/serializeFirestore';
import { trimPropertyForCatalog, isSinergia2, getAllowedPropertiesForContact } from '$lib/utils/trimPropertyPayload';
import inventoryData from '$lib/data/inventory.json';

export async function load({ locals, url, cookies }) {
  const db = locals.db;
  const tenant = locals.tenant;

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

  let prefilledContact = null;

  try {
    if (db) {
      // 1. Cargar perfil de contacto y conjunto de propiedades liberadas para este cliente
      const [contactProfileDoc, allowedPropsSet] = await Promise.all([
        (async () => {
          if (contactId && !contactId.includes(' ')) {
            const cDoc = await db.collection('contacts').doc(contactId).get();
            if (cDoc.exists) return { id: cDoc.id, ...cDoc.data() };
          } else if (phone) {
            const cleanTel = phone.replace(/\D/g, '');
            const cSnap = await db.collection('contacts').where('telefono', '==', cleanTel).limit(1).get();
            if (!cSnap.empty) return { id: cSnap.docs[0].id, ...cSnap.docs[0].data() };
          }
          return null;
        })(),
        getAllowedPropertiesForContact(db, contactId, phone)
      ]);

      prefilledContact = contactProfileDoc;

      // 2. Cargar catálogo de propiedades y mapa de sinergias de contactos en paralelo
      const [snapshot, contactsSnap] = await Promise.all([
        db.collection('properties').get(),
        db.collection('contacts').select('procedencia').get().catch(() => null)
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
        // REGLA CON LIBERAMIENTO: Publica MH + S1, y además permite S2/S3 liberadas específicamente para este cliente
        const publicProperties = rawProperties.filter(p => !isSinergia2(p, contactsSynergyMap, allowedPropsSet));
        const trimmed = publicProperties.map(trimPropertyForCatalog).filter(Boolean);
        return {
          properties: serializeFirestoreData(trimmed),
          tenant,
          contactProfile: prefilledContact ? serializeFirestoreData(prefilledContact) : null,
          contactId: contactId || ''
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
    contactProfile: prefilledContact ? serializeFirestoreData(prefilledContact) : null,
    contactId: contactId || ''
  };
}
