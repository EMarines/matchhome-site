export function filterProperties(inventoryData, search, filters, page = 1, limit = 20) {
  const term = search.toLowerCase();
  
  const filtered = inventoryData.filter(p => {
    const title = (p.title || '').toLowerCase();
    const locationObj = p.location || {};
    const locationName = typeof p.location === 'object' 
      ? [locationObj.name, locationObj.city, locationObj.region, locationObj.city_area].filter(Boolean).join(' ') 
      : (p.location || '');
    const location = locationName.toLowerCase();
    const type = (p.property_type || '').toLowerCase();
    const matchesText = !term || title.includes(term) || location.includes(term) || type.includes(term);

    const matchesBedrooms = !filters.bedrooms || (p.bedrooms >= parseInt(filters.bedrooms));
    const matchesBathrooms = !filters.bathrooms || (p.bathrooms >= parseInt(filters.bathrooms));
    const matchesParking = !filters.parking || (p.parking_spaces >= parseInt(filters.parking));

    // Price & Operation Filter
    const min = filters.minPrice ? parseFloat(filters.minPrice) : 0;
    const max = filters.maxPrice ? parseFloat(filters.maxPrice) : Infinity;
    let matchesPrice = false;
    let matchesOperationType = false;

    if (p.operations && p.operations.length > 0) {
      // Si hay un filtro de tipo de operación, buscamos esa operación específica
      if (filters.operationType) {
        const op = p.operations.find(o => o.type === filters.operationType);
        if (op) {
          matchesOperationType = true;
          const price = op.amount;
          matchesPrice = (price >= min && price <= max);
        }
      } else {
        // Si no hay filtro de operación, buscamos SI ALGUNA operación cumple con el rango de precio
        // Esto es un poco ambiguo (podría mostrar una casa de venta cuando buscas renta si los rangos se solapan),
        // pero es mejor que no mostrar nada.
        matchesOperationType = true; // No se está filtrando por operación
        matchesPrice = p.operations.some(op => {
          const price = op.amount;
          return price >= min && price <= max;
        });
      }
    } else {
        // Si no hay operaciones, no mostramos (o mostramos si no hay filtros de precio/op)
        matchesOperationType = !filters.operationType;
        matchesPrice = !filters.minPrice && !filters.maxPrice;
    }

    // Property Type Filter (Case Insensitive)
    const matchesPropertyType = !filters.propertyType || 
      (p.property_type && p.property_type.toLowerCase() === filters.propertyType.toLowerCase());

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
