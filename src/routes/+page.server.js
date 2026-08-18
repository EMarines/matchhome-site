import { serializeFirestoreData } from '$lib/utils/serializeFirestore';
import inventoryData from '$lib/data/inventory.json';

export async function load({ locals }) {
  const db = locals.db;
  
  try {
    if (db) {
      const snapshot = await db.collection('properties').get();
      if (!snapshot.empty) {
        const properties = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return {
          properties: serializeFirestoreData(properties)
        };
      }
    }
  } catch (error) {
    console.error('Error loading home properties from Firestore:', error);
  }

  // Fallback to local inventory.json if Firestore fails or is empty
  return {
    properties: serializeFirestoreData(inventoryData)
  };
}
