import { serializeFirestoreData } from '$lib/utils/serializeFirestore';
import { trimPropertyForCatalog, isSinergia2 } from '$lib/utils/trimPropertyPayload';
import inventoryData from '$lib/data/inventory.json';

export async function load({ locals }) {
  const db = locals.db;
  
  try {
    if (db) {
      // En la colección 'properties' solo se sincronizan propiedades activas.
      // Limitamos a 100 para proteger la lectura de Firestore.
      const snapshot = await db.collection('properties')
        .limit(100)
        .get();
      if (!snapshot.empty) {
        const rawProperties = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // REGLA: Sinergia 2 no es publicable en la vitrina pública general; solo se ofrece directo a contactos
        const publicProperties = rawProperties.filter(p => !isSinergia2(p));
        const trimmed = publicProperties.map(trimPropertyForCatalog).filter(Boolean);
        return {
          properties: serializeFirestoreData(trimmed)
        };
      }
    }
  } catch (error) {
    console.error('Error loading home properties from Firestore:', error);
  }


  // Fallback to local inventory.json if Firestore fails or is empty
  const localTrimmed = inventoryData.filter(p => !isSinergia2(p)).map(trimPropertyForCatalog).filter(Boolean);
  return {
    properties: serializeFirestoreData(localTrimmed)
  };
}
