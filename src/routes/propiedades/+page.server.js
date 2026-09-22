import { serializeFirestoreData } from '$lib/utils/serializeFirestore';
import { trimPropertyForCatalog, isSinergia2 } from '$lib/utils/trimPropertyPayload';
import inventoryData from '$lib/data/inventory.json';

export async function load({ locals }) {
  const db = locals.db;
  const tenant = locals.tenant;

  try {
    if (db) {
      const snapshot = await db.collection('properties').get();
      if (!snapshot.empty) {
        const rawProperties = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // REGLA: Sinergia 2 no es publicable en catálogo abierto; solo se ofrece directo a contactos
        const publicProperties = rawProperties.filter(p => !isSinergia2(p));
        const trimmed = publicProperties.map(trimPropertyForCatalog).filter(Boolean);
        return {
          properties: serializeFirestoreData(trimmed),
          tenant
        };
      }
    }
  } catch (error) {
    console.error('Error loading properties from Firestore:', error);
  }

  // Fallback to local inventory.json if Firestore is not connected or empty
  const localTrimmed = inventoryData.filter(p => !isSinergia2(p)).map(trimPropertyForCatalog).filter(Boolean);
  return {
    properties: serializeFirestoreData(localTrimmed),
    tenant
  };
}
