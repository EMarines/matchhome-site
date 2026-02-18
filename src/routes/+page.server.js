import { serializeFirestoreData } from '$lib/utils/serializeFirestore';

export async function load({ locals }) {
  const db = locals.db;
  
  try {
    // Obtener propiedades destacadas o recientes (limitado a 50 por ahora)
    const snapshot = await db.collection('properties').limit(50).get();
    const properties = snapshot.docs.map(doc => doc.data());
    
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
