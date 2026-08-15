import { error } from '@sveltejs/kit';
import { serializeFirestoreData } from '$lib/utils/serializeFirestore';
import inventoryData from '$lib/data/inventory.json';

export async function load({ params, locals }) {
  const { id } = params;
  const db = locals.db;

  const localProp = inventoryData.find(
    (p) => p.public_id === id || p.easybroker_id === id || p.id === id || p.clavePropiedad === id
  );

  if (db) {
    try {
      let doc = await db.collection('properties').doc(id).get();
      if (!doc.exists) {
        doc = await db.collection('easybroker_properties').doc(id).get();
      }
      if (!doc.exists) {
        let q = await db.collection('properties').where('public_id', '==', id).limit(1).get();
        if (q.empty) {
          q = await db.collection('easybroker_properties').where('public_id', '==', id).limit(1).get();
        }
        if (q.empty) {
          q = await db.collection('properties').where('easybroker_id', '==', id).limit(1).get();
        }
        if (!q.empty) {
          doc = q.docs[0];
        }
      }

      if (doc.exists) {
        const firestoreData = doc.data();
        const mergedProperty = {
          ...(localProp || {}),
          ...firestoreData,
          id: doc.id,
          description: firestoreData.description || firestoreData.descripcion || localProp?.description || localProp?.descripcion || null
        };
        return {
          property: serializeFirestoreData(mergedProperty)
        };
      }
    } catch (e) {
      console.error('Firestore fetch failed:', e);
    }
  }

  if (localProp) {
    return {
      property: serializeFirestoreData(localProp)
    };
  }

  throw error(404, 'Propiedad no encontrada');
}
