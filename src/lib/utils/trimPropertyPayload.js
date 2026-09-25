/**
 * Adelgazador de Payload para Catálogo y Home de MatchHome
 * Extrae únicamente los campos indispensables para renderizar y filtrar
 * las tarjetas de propiedades, reduciendo el peso de la transferencia inicial
 * de ~618 KB a < 70 KB.
 */

export function trimPropertyForCatalog(p) {
  if (!p) return null;

  // Extraer la imagen principal en alta resolución (title_image_full / imagenPrincipal)
  const mainImage =
    p.title_image_full ||
    p.imagenPrincipal ||
    (Array.isArray(p.images) && p.images.length > 0
      ? typeof p.images[0] === 'string'
        ? p.images[0]
        : p.images[0]?.url
      : null) ||
    (Array.isArray(p.property_images) && p.property_images.length > 0
      ? p.property_images[0]?.url
      : null) ||
    p.title_image_thumb ||
    p.imagenMiniatura ||
    '';

  // Operaciones ligeras
  const rawOps = Array.isArray(p.operaciones) ? p.operaciones : (Array.isArray(p.operations) ? p.operations : []);
  const operations = rawOps.map((op) => ({
    type: op.type || '',
    amount: op.amount || 0,
    currency: op.currency || 'MXN',
    formatted_amount: op.formatted_amount || op.formated_amount || ''
  }));

  // Ubicación ligera
  let location = p.location;
  if (typeof location === 'object' && location !== null) {
    location = {
      name: location.name || '',
      city: location.city || '',
      region: location.region || '',
      city_area: location.city_area || ''
    };
  }

  // Tags y features esenciales (máximo 5)
  const tags = Array.isArray(p.tags) ? p.tags.slice(0, 5) : [];
  const features = Array.isArray(p.features)
    ? p.features.slice(0, 5).map((f) => (typeof f === 'object' && f ? f.name : f)).filter(Boolean)
    : [];

  return {
    id: p.id || p.public_id || p.easybroker_id || p.clavePropiedad || '',
    public_id: p.public_id || p.easybroker_id || p.id || '',
    easybroker_id: p.easybroker_id || p.public_id || '',
    clavePropiedad: p.clavePropiedad || p.internal_id || p.clave || '',
    title: p.titulo || p.title || 'Propiedad sin título',
    titulo: p.titulo || p.title || 'Propiedad sin título',
    title_image_thumb: mainImage,
    title_image_full: mainImage,
    imagenPrincipal: mainImage,
    imagenMiniatura: mainImage,
    price: p.price ?? p.precio ?? p.budget ?? (operations[0]?.amount || 0),
    precio: p.price ?? p.precio ?? p.budget ?? (operations[0]?.amount || 0),
    currency: p.currency || p.moneda || operations[0]?.currency || 'MXN',
    moneda: p.moneda || p.currency || operations[0]?.currency || 'MXN',
    operations,
    operaciones: operations,
    operation_type: p.operation_type || p.tipoOperacion || p.selecTO || operations[0]?.type || '',
    tipoOperacion: p.tipoOperacion || p.selecTO || p.operation_type || operations[0]?.type || '',
    selecTO: p.selecTO || p.tipoOperacion || p.operation_type || operations[0]?.type || '',
    property_type: p.property_type || p.tipoPropiedad || p.selecTP || '',
    tipoPropiedad: p.tipoPropiedad || p.selecTP || p.property_type || '',
    selecTP: p.selecTP || p.tipoPropiedad || p.property_type || '',
    location,
    colonia: p.colonia || (typeof p.location === 'object' ? p.location?.name : '') || '',
    ubicacion: p.ubicacion || p.colonia || '',
    locaProperty: p.locaProperty || p.zona || '',
    zona: p.zona || p.locaProperty || '',
    bedrooms: p.recamaras ?? p.bedrooms ?? null,
    recamaras: p.recamaras ?? p.bedrooms ?? null,
    bathrooms: p.banos ?? p.bathrooms ?? null,
    banos: p.banos ?? p.bathrooms ?? null,
    parking_spaces: p.estacionamientos ?? p.parking_spaces ?? null,
    estacionamientos: p.estacionamientos ?? p.parking_spaces ?? null,
    construction_size: p.construccion ?? p.construction_size ?? null,
    construccion: p.construccion ?? p.construction_size ?? null,
    lot_size: p.terreno ?? p.lot_size ?? null,
    terreno: p.terreno ?? p.lot_size ?? null,
    tags,
    features,
    procedencia: p.procedencia || '',
    procedenciaNombre: p.procedenciaNombre || '',
    created_at: p.created_at || p.createdAt || null,
    updated_at: p.updated_at || p.updatedAt || null
  };
}

/**
 * Determina si una propiedad pertenece a Sinergia 2 o Sinergia 3 (Red Externa / Alianza no publicable).
 * Regla de negocio estricta con Liberamiento:
 * - En MatchHomeSite SOLO se publican propiedades propias (MH / EB propio) y de Sinergia 1 (S1).
 * - Sinergia 2 (S2) y Sinergia 3 (S3) solo pueden verse:
 *   1) Si el contacto específico la tiene liberada en `allowedPropsSet` (sendedProperties o bitácora).
 *   2) Como propiedad principal de propuesta directa (`/propuesta/[id]`).
 * - NUNCA se muestran al público general ni a contactos a los que no se les haya enviado.
 */
export function isSinergia2(p, contactsSynergyMap = null, allowedPropsSet = null) {
  if (!p) return false;

  // 0. LIBERAMIENTO EXCLUSIVO 1-A-1: Si la propiedad fue enviada/liberada a este contacto, NO se bloquea
  if (allowedPropsSet && allowedPropsSet.size > 0) {
    const pKeys = [p.id, p.public_id, p.easybroker_id, p.clavePropiedad]
      .filter(Boolean)
      .map((k) => String(k).trim().toUpperCase());
    if (pKeys.some((k) => allowedPropsSet.has(k))) {
      return false; // ¡Liberada exclusivamente para este contacto!
    }
  }

  // 1. Verificar procedencia en vivo del contacto captador vinculado (si se provee mapa de contactos)
  const cid = String(p.contactId || p.idContactoCaptador || '').trim();
  if (cid && contactsSynergyMap && contactsSynergyMap[cid]) {
    const contactProc = String(contactsSynergyMap[cid]).trim().toUpperCase();
    if (contactProc === 'S2' || contactProc === 'S3') return true;
    if (contactProc === 'S1' || contactProc === 'MH') return false;
  }

  // 2. Verificar campo procedencia directo en la propiedad
  const proc = String(p.procedencia || '').trim().toUpperCase();
  if (proc === 'S2' || proc === 'S3') return true;

  // 3. Verificar textos de procedenciaNombre y sourceName
  const procNombre = String(p.procedenciaNombre || '').toUpperCase();
  if (
    procNombre.includes('SINERGIA 2') ||
    procNombre.includes('(S2)') ||
    procNombre.includes('SINERGIA 3') ||
    procNombre.includes('(S3)')
  ) {
    return true;
  }

  const sourceName = String(p.sourceName || '').toUpperCase();
  if (
    sourceName.includes('(S2)') ||
    sourceName.includes('SINERGIA (S2)') ||
    sourceName.includes('SINERGIA 2') ||
    sourceName.includes('(S3)') ||
    sourceName.includes('SINERGIA (S3)') ||
    sourceName.includes('SINERGIA 3')
  ) {
    return true;
  }

  // 4. Verificar prefijos de clave S2- / S3-
  const key = String(p.clavePropiedad || p.public_id || p.id || '').trim().toUpperCase();
  if (key.startsWith('S2-') || key.startsWith('S2_') || key.startsWith('S3-') || key.startsWith('S3_')) {
    return true;
  }

  // 5. Si tiene un contacto externo o inmobiliaria externa asignada (no Match Home ni aliados S1 fijados),
  // solo permitir si explícitamente está marcada como S1 o MH.
  const comp = String(p.companiaCaptadora || p.idCompaniaCaptadora || '').trim().toUpperCase();
  const isOwnOrPinnedS1 =
    !cid ||
    cid === 'pinned-mh' ||
    cid === 'pinned-jgcapital' ||
    cid === 'pinned-agh' ||
    comp === '' ||
    comp.includes('MATCH HOME') ||
    comp.includes('MATCHHOME') ||
    comp.includes('JGCAPITAL') ||
    comp.includes('AGH');

  if (!isOwnOrPinnedS1 && proc !== 'S1') {
    return true;
  }

  return false;
}

/**
 * Consulta en Firestore todas las propiedades liberadas o enviadas para un contacto específico.
 */
export async function getAllowedPropertiesForContact(db, contactId, phone = null) {
  const allowed = new Set();
  if (!db) return allowed;

  let contactDoc = null;
  if (contactId && !contactId.includes(' ')) {
    try {
      const cSnap = await db.collection('contacts').doc(contactId).get();
      if (cSnap.exists) contactDoc = cSnap;
    } catch {
      // Ignorar error de doc
    }
  }

  if (!contactDoc && phone) {
    try {
      const cleanTel = String(phone).replace(/\D/g, '');
      const q = await db.collection('contacts').where('telefono', '==', cleanTel).limit(1).get();
      if (!q.empty) contactDoc = q.docs[0];
    } catch {
      // Ignorar error de teléfono
    }
  }

  if (contactDoc) {
    const cData = contactDoc.data();
    // 1. Array sendedProperties
    if (Array.isArray(cData.sendedProperties)) {
      cData.sendedProperties.forEach((id) => {
        if (id) allowed.add(String(id).trim().toUpperCase());
      });
    }
    // 2. Propiedad de última propuesta vista
    if (cData.lastProposalPropertyId) {
      allowed.add(String(cData.lastProposalPropertyId).trim().toUpperCase());
    }
    // 3. Propiedad vinculada
    if (cData.propCont) {
      allowed.add(String(cData.propCont).trim().toUpperCase());
    }
    // 4. Bitácoras de envío
    try {
      const binnSnap = await db.collection('binnacles').where('to', '==', contactDoc.id).limit(50).get();
      binnSnap.forEach((b) => {
        const bd = b.data();
        const action = String(bd.action || bd.tipo || '');
        const comment = String(bd.comment || bd.propertyId || '').trim();
        if (comment && (action.includes('Propiedad enviada') || action.includes('enviada') || action.includes('Propuesta'))) {
          allowed.add(comment.toUpperCase());
        }
      });
    } catch {
      // Continuar si falla lectura de bitácoras
    }
  }

  return allowed;
}


