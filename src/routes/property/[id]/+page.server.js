import { error } from '@sveltejs/kit';
import { serializeFirestoreData } from '$lib/utils/serializeFirestore';

export async function load({ params, locals }) {
  const { id } = params;
  const db = locals.db;

  try {
    const doc = await db.collection('properties').doc(id).get();
    
    if (doc.exists) {
      return {
        property: serializeFirestoreData(doc.data())
      };
    }
  } catch (e) {
    console.error('Firestore fetch failed', e);
  }

  throw error(404, 'Propiedad no encontrada');
}
