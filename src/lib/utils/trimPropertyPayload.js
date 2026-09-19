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
    amenidades: p.amenidades || tags,
    created_at: p.created_at || p.createdAt || null,
    updated_at: p.updated_at || p.updatedAt || null
  };
}
