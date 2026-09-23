/**
 * Motor de filtrado y búsqueda robusto para MatchHome
 * Normaliza acentos, soporta esquemas híbridos (EasyBroker, Firestore ATAIR, JSON local),
 * mapeo bilingüe de tipos de propiedad, zonas geográficas y amenidades.
 */

function normalizeText(text) {
  if (text === null || text === undefined) return '';
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quita acentos
    .trim();
}

function parseNumber(val, defaultVal = 0) {
  if (val === null || val === undefined || val === '') return defaultVal;
  if (typeof val === 'number') return isNaN(val) ? defaultVal : val;
  const cleaned = String(val).replace(/[^0-9.-]+/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? defaultVal : parsed;
}

function getOpTypeNormalized(val) {
  if (!val) return '';
  const t = normalizeText(val);
  if (t === 'sale' || t === 'venta') return 'venta';
  if (t === 'rent' || t === 'rental' || t === 'renta' || t === 'alquiler') return 'renta';
  return t;
}

// Mapeo bilingüe y de variantes para tipos de propiedad
const PROPERTY_TYPE_SYNONYMS = {
  casa: ['casa', 'house', 'residencia', 'villa'],
  'casa en condominio': ['casa en condominio', 'condominio', 'condo'],
  departamento: ['departamento', 'depto', 'apartment', 'flat', 'penthouse', 'loft', 'estudio'],
  terreno: ['terreno', 'land', 'lote', 'solar'],
  'local comercial': ['local', 'comercial', 'commercial', 'retail', 'local comercial'],
  'local en centro comercial': ['local en centro comercial', 'mall', 'centro comercial'],
  'bodega comercial': ['bodega', 'warehouse', 'industrial', 'nave', 'bodega comercial'],
  'casa con uso de suelo': ['casa con uso de suelo', 'uso de suelo'],
  edificio: ['edificio', 'building'],
  oficina: ['oficina', 'office'],
  quinta: ['quinta', 'villa', 'rancho', 'finca'],
  rancho: ['rancho', 'ranch', 'hacienda'],
  huerta: ['huerta', 'orchard'],
  villa: ['villa', 'quinta']
};

function getEffectivePrice(p) {
  if (Array.isArray(p.operations) && p.operations.length > 0) {
    const amt = parseNumber(p.operations[0].amount ?? p.operations[0].price);
    if (amt > 0) return amt;
  }
  if (Array.isArray(p.operaciones) && p.operaciones.length > 0) {
    const amt = parseNumber(p.operaciones[0].amount ?? p.operaciones[0].precio);
    if (amt > 0) return amt;
  }
  return parseNumber(p.price ?? p.precio ?? p.budget ?? 0);
}

function getEffectiveDate(p) {
  const d = p.updated_at || p.updatedAt || p.created_at || p.createdAt || p.fecha;
  if (!d) return 0;
  if (typeof d === 'number') return d;
  if (typeof d === 'string') {
    const parsed = Date.parse(d);
    return isNaN(parsed) ? 0 : parsed;
  }
  if (d && typeof d === 'object') {
    if (d._seconds) return d._seconds * 1000;
    if (d.seconds) return d.seconds * 1000;
  }
  return 0;
}

export function filterProperties(inventoryData = [], search = '', filters = {}, page = 1, limit = 24, sortBy = 'recent') {
  const term = normalizeText(search);

  const filtered = inventoryData.filter((p) => {
    if (!p) return false;

    // --- 1. Extracción de textos para búsqueda libre (Colonia, Clave, Título, etc.) ---
    const title = normalizeText(p.titulo || p.title || '');
    const desc = normalizeText(p.descripcion || p.description || '');
    const id = normalizeText(p.easybroker_id || p.public_id || p.id || p.internal_id || p.clave || '');
    
    const locationObj = p.location || {};
    const locParts = typeof p.location === 'object'
      ? [locationObj.name, locationObj.city, locationObj.region, locationObj.city_area, locationObj.street]
      : [p.colonia, p.ubicacion, p.location];
    const locationText = normalizeText(locParts.filter(Boolean).join(' '));
    const coloniaText = normalizeText(p.colonia || '');
    const typeRaw = p.selecTP || p.tipoPropiedad || p.property_type || '';
    const typeText = normalizeText(typeRaw);

    const matchesText = !term || 
      title.includes(term) || 
      locationText.includes(term) || 
      coloniaText.includes(term) || 
      typeText.includes(term) || 
      id.includes(term) ||
      desc.includes(term);

    if (!matchesText) return false;

    // --- 2. Recámaras, Baños, Estacionamientos ---
    const beds = parseNumber(p.recamaras ?? p.bedrooms);
    const baths = parseNumber(p.banos ?? p.bathrooms);
    const parking = parseNumber(p.estacionamientos ?? p.parking_spaces);

    const filterBeds = parseNumber(filters.bedrooms, 0);
    const filterBaths = parseNumber(filters.bathrooms, 0);
    const filterParking = parseNumber(filters.parking, 0);

    if (filterBeds > 0 && beds < filterBeds) return false;
    if (filterBaths > 0 && baths < filterBaths) return false;
    if (filterParking > 0 && parking < filterParking) return false;

    // --- 3. Tipo de Operación y Rango de Precios ---
    const minPrice = filters.minPrice ? parseNumber(filters.minPrice, 0) : 0;
    const maxPrice = filters.maxPrice ? parseNumber(filters.maxPrice, Infinity) : Infinity;

    const operations = Array.isArray(p.operaciones) ? p.operaciones : (Array.isArray(p.operations) ? p.operations : []);
    const targetOp = filters.operationType ? getOpTypeNormalized(filters.operationType) : '';

    let matchesOp = true;
    let matchesPrice = false;

    if (operations.length > 0) {
      if (targetOp) {
        const matchingOp = operations.find((o) => getOpTypeNormalized(o.type) === targetOp);
        if (!matchingOp) {
          matchesOp = false;
        } else {
          const amt = parseNumber(matchingOp.amount ?? p.price ?? p.precio);
          matchesPrice = amt >= minPrice && amt <= maxPrice;
        }
      } else {
        matchesPrice = operations.some((o) => {
          const amt = parseNumber(o.amount ?? p.price ?? p.precio);
          return amt >= minPrice && amt <= maxPrice;
        });
      }
    } else {
      const directOp = getOpTypeNormalized(p.selecTO || p.tipoOperacion || p.operation_type || '');
      if (targetOp && directOp && !directOp.includes(targetOp) && !targetOp.includes(directOp)) {
        matchesOp = false;
      }
      const directPrice = parseNumber(p.price ?? p.precio ?? p.budget ?? 0);
      matchesPrice = directPrice >= minPrice && directPrice <= maxPrice;
    }

    if (!matchesOp || !matchesPrice) return false;

    // --- 4. Tipo de Propiedad ---
    if (filters.propertyType && filters.propertyType !== '' && filters.propertyType !== '0') {
      const targetTypeNorm = normalizeText(filters.propertyType);
      const synonyms = PROPERTY_TYPE_SYNONYMS[targetTypeNorm] || [targetTypeNorm];
      
      const propTypeCombined = `${typeText} ${title}`;
      const typeMatches = synonyms.some((syn) => propTypeCombined.includes(syn));
      if (!typeMatches) return false;
    }

    // --- 5. Zonas y Amenidades (Tags / Features / LocaProperty) ---
    const selectedTags = (filters.tags || []).map(normalizeText).filter(Boolean);

    if (selectedTags.length > 0) {
      // Lista oficial de zonas de Chihuahua
      const KNOWN_ZONES = [
        'norte',
        'noroeste',
        'noreste',
        'centronorte',
        'centro norte',
        'centrosur',
        'centro sur',
        'suroeste',
        'sureste'
      ];
      const selectedZones = selectedTags.filter((t) => KNOWN_ZONES.includes(t));
      const selectedAmenities = selectedTags.filter((t) => !KNOWN_ZONES.includes(t));

      // Extraer todas las señales de zona de la propiedad
      const propertyZoneSignals = [
        p.locaProperty,
        p.zona,
        p.colonia,
        locationText,
        title,
        ...(Array.isArray(p.tags) ? p.tags : [])
      ]
        .filter(Boolean)
        .map(normalizeText);

      // Extraer todas las señales de amenidades
      const featureList = Array.isArray(p.features)
        ? p.features.map((f) => (typeof f === 'object' && f ? f.name : f)).filter(Boolean)
        : [];
      const propertyAmenitySignals = [
        ...featureList,
        ...(Array.isArray(p.tags) ? p.tags : []),
        p.fraccionamiento,
        p.condominio,
        p.privada,
        desc,
        title
      ]
        .filter(Boolean)
        .map(normalizeText);

      // Zonas: OR (Debe coincidir con al menos una de las zonas seleccionadas)
      if (selectedZones.length > 0) {
        const matchesAnyZone = selectedZones.some((zone) => {
          const compactZone = zone.replace(/\s+/g, '');
          return propertyZoneSignals.some((sig) => {
            const compactSig = sig.replace(/\s+/g, '');
            return sig.includes(zone) || compactSig.includes(compactZone);
          });
        });
        if (!matchesAnyZone) return false;
      }

      // Amenidades: AND (Debe contener todas las amenidades seleccionadas)
      if (selectedAmenities.length > 0) {
        const matchesAllAmenities = selectedAmenities.every((amenity) => {
          // Soporte especial para Fracc. Privado / Fraccionamiento Cerrado / Privada
          if (amenity.includes('fracc') || amenity.includes('privad')) {
            return propertyAmenitySignals.some((sig) =>
              sig.includes('fracc') ||
              sig.includes('privad') ||
              sig.includes('cerrad') ||
              sig.includes('acceso controlado') ||
              sig.includes('seguridad') ||
              sig.includes('condominio')
            );
          }
          return propertyAmenitySignals.some((sig) => sig.includes(amenity));
        });
        if (!matchesAllAmenities) return false;
      }
    }

    return true;
  });

  // --- 6. Ordenamiento (Sort) ---
  if (sortBy === 'price_asc') {
    filtered.sort((a, b) => getEffectivePrice(a) - getEffectivePrice(b));
  } else if (sortBy === 'price_desc') {
    filtered.sort((a, b) => getEffectivePrice(b) - getEffectivePrice(a));
  } else if (sortBy === 'featured') {
    filtered.sort((a, b) => {
      const featA = a.destacada || a.featured || a.procedencia === 'MH' ? 1 : 0;
      const featB = b.destacada || b.featured || b.procedencia === 'MH' ? 1 : 0;
      return featB - featA;
    });
  } else {
    // Por defecto: 'recent' (más recientes primero)
    filtered.sort((a, b) => getEffectiveDate(b) - getEffectiveDate(a));
  }

  const total = filtered.length;
  const parsedLimit = parseNumber(limit, 24);
  const parsedPage = Math.max(1, parseNumber(page, 1));
  const start = (parsedPage - 1) * parsedLimit;
  const end = start + parsedLimit;
  const items = filtered.slice(start, end);

  return {
    items,
    pagination: {
      limit: parsedLimit,
      total,
      page: parsedPage,
      total_pages: Math.ceil(total / parsedLimit) || 1,
      next_page: end < total ? parsedPage + 1 : null,
      prev_page: parsedPage > 1 ? parsedPage - 1 : null
    }
  };
}
