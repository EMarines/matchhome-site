import { error } from '@sveltejs/kit';
import { serializeFirestoreData } from '$lib/utils/serializeFirestore';
import inventoryData from '$lib/data/inventory.json';
import { mockProperties } from '$lib/data/mockProperties';

export async function load({ params, locals }) {
  const { id } = params;
  const db = locals.db;

  const localProp =
    inventoryData.find(
      (p) => p.public_id === id || p.easybroker_id === id || p.id === id || p.clavePropiedad === id
    ) ||
    mockProperties.find(
      (p) => p.public_id === id || p.easybroker_id === id || p.id === id || p.clavePropiedad === id
    );

  if (db) {
    try {
      const fields = ['public_id', 'easybroker_id', 'clavePropiedad', 'id'];
      let doc = null;

      // 1. Direct doc ID lookup in properties
      const docRef = await db.collection('properties').doc(id).get();
      if (docRef.exists) {
        doc = docRef;
      }

      // 2. Search across fields in properties
      if (!doc) {
        for (const field of fields) {
          const q = await db.collection('properties').where(field, '==', id).limit(1).get();
          if (!q.empty) {
            doc = q.docs[0];
            break;
          }
        }
      }

      if (doc && doc.exists) {
        const firestoreData = doc.data();
        const mergedProperty = {
          ...(localProp || {}),
          ...firestoreData,
          id: doc.id,
          description:
            firestoreData.description ||
            firestoreData.descripcion ||
            localProp?.description ||
            localProp?.descripcion ||
            null
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

  throw error(404, `Propiedad no encontrada (${id})`);
}

