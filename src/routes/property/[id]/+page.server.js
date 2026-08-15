import { error } from '@sveltejs/kit';
import { serializeFirestoreData } from '$lib/utils/serializeFirestore';

export async function load({ params, locals }) {
  const { id } = params;
  const db = locals.db;

  if (!db) {
    throw error(503, 'Firebase no está configurado. Agrega el Service Account al .env.');
  }

  try {
    let doc = await db.collection('properties').doc(id).get();
    if (!doc.exists) {
      doc = await db.collection('easybroker_properties').doc(id).get();
    }
    
    if (doc.exists) {
      return {
        property: serializeFirestoreData({ id: doc.id, ...doc.data() })
      };
    }
  } catch (e) {
    console.error('Firestore fetch failed', e);
  }

  throw error(404, 'Propiedad no encontrada');
}
