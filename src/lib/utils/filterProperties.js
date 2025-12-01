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

    const price = p.operations && p.operations[0] ? p.operations[0].amount : 0;
    const min = filters.minPrice ? parseFloat(filters.minPrice) : 0;
    const max = filters.maxPrice ? parseFloat(filters.maxPrice) : Infinity;
    const matchesPrice = price >= min && price <= max;

    const matchesPropertyType = !filters.propertyType || (p.property_type === filters.propertyType);
    const matchesOperationType = !filters.operationType || (p.operations && p.operations.some(op => op.type === filters.operationType));

    // Tags Filter
    const ZONES = ['Norte', 'Sur', 'Este', 'Oeste', 'CentroNorte', 'CentroSur'];
    
    const propertyTags = (p.tags || []).map(t => t.toString().toLowerCase().trim());
    const propertyFeatures = (p.features || []).map(f => (f.name || '').toLowerCase().trim());
    const allPropertyTags = [...propertyTags, ...propertyFeatures];
    
    const selectedTags = (filters.tags || []).map(t => t.toLowerCase().trim());
    
    const selectedZones = selectedTags.filter(t => ZONES.map(z => z.toLowerCase()).includes(t));
    const selectedAmenities = selectedTags.filter(t => !ZONES.map(z => z.toLowerCase()).includes(t));

    const matchesZones = selectedZones.length === 0 || 
      selectedZones.some(zone => allPropertyTags.includes(zone));

    const matchesAmenities = selectedAmenities.length === 0 || 
      selectedAmenities.every(amenity => allPropertyTags.includes(amenity));

    const matchesTags = matchesZones && matchesAmenities;

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
