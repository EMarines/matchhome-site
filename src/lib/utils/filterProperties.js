export function filterProperties(inventoryData, search, filters, page = 1, limit = 20) {
  const term = search.toLowerCase();
  
  const filtered = inventoryData.filter(p => {
    const title = (p.titulo || p.title || '').toLowerCase();
    const locationObj = p.location || {};
    const locationName = typeof p.location === 'object' 
      ? [locationObj.name, locationObj.city, locationObj.region, locationObj.city_area].filter(Boolean).join(' ') 
      : (p.colonia || p.ubicacion || p.location || '');
    const location = locationName.toLowerCase();
    const type = (p.selecTP || p.tipoPropiedad || p.property_type || '').toLowerCase();
    const id = (p.easybroker_id || p.public_id || p.id || '').toLowerCase();
    const matchesText = !term || title.includes(term) || location.includes(term) || type.includes(term) || id.includes(term);

    const beds = p.recamaras ?? p.bedrooms ?? 0;
    const baths = p.banos ?? p.bathrooms ?? 0;
    const parking = p.estacionamientos ?? p.parking_spaces ?? 0;

    const matchesBedrooms = !filters.bedrooms || (beds >= parseInt(filters.bedrooms));
    const matchesBathrooms = !filters.bathrooms || (baths >= parseInt(filters.bathrooms));
    const matchesParking = !filters.parking || (parking >= parseInt(filters.parking));

    // Price & Operation Filter
    const min = filters.minPrice ? parseFloat(filters.minPrice) : 0;
    const max = filters.maxPrice ? parseFloat(filters.maxPrice) : Infinity;
    let matchesPrice = false;
    let matchesOperationType = false;

    const operations = p.operaciones || p.operations;
    const priceVal = p.price ?? p.precio ?? p.budget ?? (operations && operations[0] ? operations[0].amount : 0);

    const getOpType = (val) => {
      if (!val) return '';
      const t = String(val).toLowerCase().trim();
      if (t === 'sale' || t === 'venta') return 'venta';
      if (t === 'rent' || t === 'rental' || t === 'renta') return 'renta';
      return t;
    };

    const opTypeVal = getOpType(p.selecTO || p.tipoOperacion || p.operation_type || (operations && operations[0] ? operations[0].type : ''));

    if (operations && operations.length > 0) {
      if (filters.operationType) {
        const targetOp = getOpType(filters.operationType);
        const op = operations.find(o => getOpType(o.type) === targetOp);
        if (op) {
          matchesOperationType = true;
          const price = op.amount || p.price || p.precio || 0;
          matchesPrice = (price >= min && price <= max);
        }
      } else {
        matchesOperationType = true;
        matchesPrice = operations.some(op => {
          const price = op.amount || p.price || p.precio || 0;
          return price >= min && price <= max;
        });
      }
    } else {
      if (filters.operationType) {
        const targetOp = getOpType(filters.operationType);
        matchesOperationType = (opTypeVal === targetOp || opTypeVal.includes(targetOp));
      } else {
        matchesOperationType = true;
      }
      matchesPrice = (priceVal >= min && priceVal <= max);
    }

    // Property Type Filter (Case Insensitive)
    const propTypeStr = p.selecTP || p.tipoPropiedad || p.property_type || '';
    const matchesPropertyType = !filters.propertyType || 
      (propTypeStr && propTypeStr.toLowerCase().includes(filters.propertyType.toLowerCase()));

    // Tags Filter
    const normalizeText = (text) => {
      if (!text) return '';
      return text.toString()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove accents
        .trim();
    };

    // Use ONLY the tags array from the property object as requested
    const propertyTags = (p.tags || []).map(normalizeText);
    
    const selectedTags = (filters.tags || []).map(normalizeText);
    
    // Define Zones to separate logic
    // Add variations just in case normalization produces them (e.g. "centro norte")
    const KNOWN_ZONES = ['norte', 'sur', 'este', 'oeste', 'centronorte', 'centrosur', 'centro norte', 'centro sur'];
    
    const selectedZones = selectedTags.filter(t => KNOWN_ZONES.includes(t));
    const selectedAmenities = selectedTags.filter(t => !KNOWN_ZONES.includes(t));
    
    // Logic:
    // 1. Zones: OR (If any zone is selected, property must match AT LEAST ONE of them)
    // 2. Amenities: AND (If any amenity is selected, property must match ALL of them)
    
    const matchesZones = selectedZones.length === 0 || 
      selectedZones.some(zone => propertyTags.some(pt => pt.includes(zone)));
      
    const matchesAmenities = selectedAmenities.length === 0 ||
      selectedAmenities.every(amenity => propertyTags.some(pt => pt.includes(amenity)));
      
    const matchesTags = matchesZones && matchesAmenities;

    // Debug logging for the first few items
    if (inventoryData.indexOf(p) < 3 && selectedTags.length > 0) {
       console.group(`Checking property ${p.public_id}`);
       console.log('Data:', { 
         title, 
         type: p.property_type, 
         operations: p.operations,
         bedrooms: p.bedrooms,
         price: p.operations?.[0]?.amount,
         tags: p.tags,
         features: p.features
       });
       console.log('Property Tags (normalized):', propertyTags);
       console.log('Selected Zones:', selectedZones);
       console.log('Selected Amenities:', selectedAmenities);
       console.log('Filters:', filters);
       console.log('Matches:', { 
         matchesText, 
         matchesBedrooms, 
         matchesPrice, 
         matchesOperationType,
         matchesPropertyType,
         matchesTags 
       });
       console.groupEnd();
    }

    return matchesText && matchesBedrooms && matchesBathrooms && matchesParking && matchesPrice && matchesPropertyType && matchesOperationType && matchesTags;
  });

  const total = filtered.length;
  const start = (page - 1) * limit;
  const end = start + limit;
  const items = filtered.slice(start, end);

  return {
    items,
    pagination: {
      limit,
      total,
      page,
      next_page: end < total ? true : null
    }
  };
}
