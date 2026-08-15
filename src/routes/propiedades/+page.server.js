import { serializeFirestoreData } from '$lib/utils/serializeFirestore';
import inventoryData from '$lib/data/inventory.json';

export async function load({ locals }) {
  const db = locals.db;
  const tenant = locals.tenant;

  try {
    if (db) {
      let snapshot = await db.collection('properties').get();
      if (snapshot.empty) {
        snapshot = await db.collection('easybroker_properties').get();
      }
      if (!snapshot.empty) {
        const properties = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return {
          properties: serializeFirestoreData(properties),
          tenant
        };
      }
    }
  } catch (error) {
    console.error('Error loading properties from Firestore:', error);
  }

  // Fallback to local inventory.json if Firestore is not connected or empty
  return {
    properties: serializeFirestoreData(inventoryData),
    tenant
  };
}
