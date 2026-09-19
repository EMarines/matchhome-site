import { serializeFirestoreData } from '$lib/utils/serializeFirestore';
import { trimPropertyForCatalog } from '$lib/utils/trimPropertyPayload';
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
        const trimmed = rawProperties.map(trimPropertyForCatalog).filter(Boolean);
        return {
          properties: serializeFirestoreData(trimmed)
        };
      }
    }
  } catch (error) {
    console.error('Error loading home properties from Firestore:', error);
  }


  // Fallback to local inventory.json if Firestore fails or is empty
  const localTrimmed = inventoryData.map(trimPropertyForCatalog).filter(Boolean);
  return {
    properties: serializeFirestoreData(localTrimmed)
  };
}
