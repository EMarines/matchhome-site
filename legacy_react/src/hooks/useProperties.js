import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import inventoryData from '../data/inventory.json';

export const useProperties = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Initialize state from URL params
  const initialSearch = searchParams.get('q') || '';
  const initialFilters = {
    bedrooms: searchParams.get('bedrooms') || 0,
    bathrooms: searchParams.get('bathrooms') || 0,
    parking: searchParams.get('parking') || 0,
    minPrice: searchParams.get('min_price') || '',
    maxPrice: searchParams.get('max_price') || '',
    propertyType: searchParams.get('property_type') || '',
    operationType: searchParams.get('operation_type') || '',
    tags: searchParams.get('tags') ? searchParams.get('tags').split(',') : []
  };

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [search, setSearch] = useState(initialSearch);
  const [filters, setFilters] = useState(initialFilters);
  const [pagination, setPagination] = useState({
    limit: 20,
    total: 0,
    next_page: null,
    page: 1
  });

  // Sync URL when state changes
  const updateUrl = (newSearch, newFilters, newPage) => {
    const params = {};
    if (newSearch) params.q = newSearch;
    if (newPage > 1) params.page = newPage;
    
    if (newFilters.bedrooms > 0) params.bedrooms = newFilters.bedrooms;
    if (newFilters.bathrooms > 0) params.bathrooms = newFilters.bathrooms;
    if (newFilters.parking > 0) params.parking = newFilters.parking;
    if (newFilters.minPrice) params.min_price = newFilters.minPrice;
    if (newFilters.maxPrice) params.max_price = newFilters.maxPrice;
    if (newFilters.propertyType) params.property_type = newFilters.propertyType;
    if (newFilters.operationType) params.operation_type = newFilters.operationType;
    if (newFilters.tags && newFilters.tags.length > 0) params.tags = newFilters.tags.join(',');
    
    setSearchParams(params, { replace: true });
  };

  useEffect(() => {
    const filterAndPaginate = () => {
      setLoading(true);
      
      // Update URL
      updateUrl(search, filters, page);

      // 1. Filter
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
        // Logic: (Zone A OR Zone B) AND (Amenity X AND Amenity Y)
        const ZONES = ['Norte', 'Sur', 'Este', 'Oeste', 'CentroNorte', 'CentroSur'];
        
        const propertyTags = (p.tags || []).map(t => t.toString().toLowerCase().trim());
        const propertyFeatures = (p.features || []).map(f => (f.name || '').toLowerCase().trim());
        const allPropertyTags = [...propertyTags, ...propertyFeatures];
        
        const selectedTags = (filters.tags || []).map(t => t.toLowerCase().trim());
        
        // Split selected tags into Zones and Amenities
        const selectedZones = selectedTags.filter(t => ZONES.map(z => z.toLowerCase()).includes(t));
        const selectedAmenities = selectedTags.filter(t => !ZONES.map(z => z.toLowerCase()).includes(t));

        // 1. Zone Check (OR logic): If any zones are selected, property must have at least one
        const matchesZones = selectedZones.length === 0 || 
          selectedZones.some(zone => allPropertyTags.includes(zone));

        // 2. Amenity Check (AND logic): If any amenities are selected, property must have ALL of them
        const matchesAmenities = selectedAmenities.length === 0 || 
          selectedAmenities.every(amenity => allPropertyTags.includes(amenity));

        const matchesTags = matchesZones && matchesAmenities;

        return matchesText && matchesBedrooms && matchesBathrooms && matchesParking && matchesPrice && matchesPropertyType && matchesOperationType && matchesTags;
      });

      // 2. Paginate
      const limit = 20;
      const total = filtered.length;
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedItems = filtered.slice(start, end);

      setProperties(paginatedItems);
      setPagination({
        limit,
        total,
        page,
        next_page: end < total ? true : null
      });
      setLoading(false);
    };

    filterAndPaginate();
  }, [page, search, filters]); 

  const nextPage = () => {
    if (pagination.next_page) {
      setPage(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevPage = () => {
    if (page > 1) {
      setPage(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSearch = (term) => {
    setSearch(term);
    setPage(1);
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPage(1);
  };

  const clearFilters = () => {
    setSearch('');
    setFilters({
      bedrooms: 0,
      bathrooms: 0,
      parking: 0,
      minPrice: '',
      maxPrice: '',
      propertyType: '',
      operationType: '',
      tags: []
    });
    setPage(1);
  };

  return { properties, loading, error, pagination, nextPage, prevPage, page, search, handleSearch, filters, handleFilterChange, clearFilters };
};
