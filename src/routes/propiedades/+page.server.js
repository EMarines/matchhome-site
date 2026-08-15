import { serializeFirestoreData } from '$lib/utils/serializeFirestore';

export async function load({ locals }) {
  const db = locals.db;
  const tenant = locals.tenant;

  try {
    if (!db) {
      return { properties: [], tenant, error: 'Firebase no está configurado. Revisa el .env.' };
    }
    let snapshot = await db.collection('properties').get();
    if (snapshot.empty) {
      snapshot = await db.collection('easybroker_properties').get();
    }
    const properties = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return {
      properties: serializeFirestoreData(properties),
      tenant
    };
  } catch (error) {
    console.error('Error loading properties from Firestore:', error);
    return {
      properties: [],
      error: 'Error loading properties'
    };
  }
}
