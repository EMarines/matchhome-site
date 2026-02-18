import { serializeFirestoreData } from '$lib/utils/serializeFirestore';

export async function load({ locals }) {
  const db = locals.db;
  const tenant = locals.tenant;

  try {
    const snapshot = await db.collection('properties').get();
    const properties = snapshot.docs.map(doc => doc.data());

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
