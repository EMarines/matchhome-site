import { error } from '@sveltejs/kit';
import { serializeFirestoreData } from '$lib/utils/serializeFirestore';
import inventoryData from '$lib/data/inventory.json';
import { mockProperties } from '$lib/data/mockProperties';

export async function load({ params, url, locals, cookies }) {
  const { id } = params;
  const db = locals.db;

  // ── Extraer parámetros de contacto (directos o desde backUrl o cookies) ─────────────
  let contactId = url.searchParams.get('c') || cookies.get('mh_contact_id') || '';

  if (url.searchParams.get('c')) {
    try {
      cookies.set('mh_contact_id', url.searchParams.get('c'), {
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
        httpOnly: false,
        sameSite: 'lax'
      });
    } catch {}
  }
  let clientName =
    url.searchParams.get('cliente') ||
    url.searchParams.get('nombre') ||
    url.searchParams.get('name') ||
    url.searchParams.get('first_name') ||
    url.searchParams.get('firstName') ||
    '';
  let clientPhone =
    url.searchParams.get('tel') ||
    url.searchParams.get('telefono') ||
    url.searchParams.get('phone') ||
    url.searchParams.get('celular') ||
    '';
  let clientEmail =
    url.searchParams.get('email') ||
    url.searchParams.get('correo') ||
    '';

  // Si no vinieron directos, intentar extraer de backUrl (ej. navegación desde /propuesta/[id])
  const backUrl = url.searchParams.get('backUrl');
  if (backUrl) {
    try {
      const parsedBack = new URL(backUrl, 'https://matchhome.vercel.app');
      if (!contactId) contactId = parsedBack.searchParams.get('c') || '';
      if (!clientName) {
        clientName =
          parsedBack.searchParams.get('cliente') ||
          parsedBack.searchParams.get('nombre') ||
          parsedBack.searchParams.get('name') ||
          '';
      }
      if (!clientPhone) {
        clientPhone =
          parsedBack.searchParams.get('tel') ||
          parsedBack.searchParams.get('telefono') ||
          parsedBack.searchParams.get('phone') ||
          '';
      }
      if (!clientEmail) {
        clientEmail =
          parsedBack.searchParams.get('email') ||
          parsedBack.searchParams.get('correo') ||
          '';
      }
    } catch (e) {
      // Ignorar error de parsing
    }
  }

  // Si 'c' contiene espacios o caracteres de nombre, usarlo como clientName
  if (!clientName && contactId && (contactId.includes(' ') || contactId.includes('%20'))) {
    clientName = decodeURIComponent(contactId).trim();
  }

  // Si contactId es un ID de Firestore y db está disponible, consultar documento
  if (contactId && db && !contactId.includes(' ')) {
    try {
      const contactDoc = await db.collection('contacts').doc(contactId).get();
      if (contactDoc.exists) {
        const cData = contactDoc.data();
        const fetchedName =
          (cData.name && cData.lastname ? `${cData.name} ${cData.lastname}`.trim() : null) ||
          cData.name ||
          cData.nombre ||
          cData.fullName ||
          cData.nombreCompleto;
        if (fetchedName) clientName = fetchedName;
        if (!clientPhone) {
          clientPhone = cData.phone || cData.telefono || cData.telephon || cData.celular || '';
        }
        if (!clientEmail) {
          clientEmail = cData.email || cData.correo || '';
        }
      } else if (!clientName) {
        clientName = contactId;
      }
    } catch (err) {
      console.error('Error fetching contact in property detail page:', err);
    }
  }

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
          property: serializeFirestoreData(mergedProperty),
          clientName,
          clientPhone,
          clientEmail,
          contactId
        };
      }
    } catch (e) {
      console.error('Firestore fetch failed:', e);
    }
  }

  if (localProp) {
    return {
      property: serializeFirestoreData(localProp),
      clientName,
      clientPhone,
      clientEmail,
      contactId
    };
  }

  throw error(404, `Propiedad no encontrada (${id})`);
}

