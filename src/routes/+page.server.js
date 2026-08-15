import { serializeFirestoreData } from '$lib/utils/serializeFirestore';

export async function load({ locals }) {
  const db = locals.db;
  
  try {
    if (!db) {
      return { properties: [], error: 'Firebase no está configurado. Revisa el .env.' };
    }
    let snapshot = await db.collection('properties').get();
    if (snapshot.empty) {
      snapshot = await db.collection('easybroker_properties').get();
    }
    const properties = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    return {
      properties: serializeFirestoreData(properties)
    };
  } catch (error) {
    console.error('Error loading home properties:', error);
    return {
      properties: []
    };
  }
}
