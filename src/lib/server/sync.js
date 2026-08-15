import { getFirebaseInstance } from './firebase';
import { fetchJsonWithRetry, sleep } from './rateLimit';

const EASYBROKER_API_URL = 'https://api.easybroker.com/v1';

export async function fetchProperties(apiKey, page = 1, limit = 50) {
  return fetchJsonWithRetry(`${EASYBROKER_API_URL}/properties?page=${page}&limit=${limit}`, {
    'X-Authorization': apiKey
  });
}

export async function fetchPropertyDetails(apiKey, propertyId) {
  try {
    return await fetchJsonWithRetry(`${EASYBROKER_API_URL}/properties/${propertyId}`, {
      'X-Authorization': apiKey
    });
  } catch (error) {
    console.error(`Failed to fetch details for property ${propertyId}:`, error.message);
    return null;
  }
}

// Detect zones from location data
function detectZones(property) {
  const zones = [];
  
  // Build location string from all available fields
  const locationParts = [];
  if (property.location) {
    if (property.location.name) locationParts.push(property.location.name);
    if (property.location.city_area) locationParts.push(property.location.city_area);
    if (property.location.region) locationParts.push(property.location.region);
  }
  if (property.title) locationParts.push(property.title);
  if (property.description) locationParts.push(property.description);
  
  const locationStr = locationParts.join(' ').toLowerCase();
  
  // Check for zone keywords
  if (locationStr.includes('oeste')) zones.push('Oeste');
  if (locationStr.includes('norte') && !locationStr.includes('centronorte')) zones.push('Norte');
  if (locationStr.includes('sur') && !locationStr.includes('centrosur')) zones.push('Sur');
  if (locationStr.includes('este') && !locationStr.includes('oeste')) zones.push('Este');
  if (locationStr.includes('centro norte') || locationStr.includes('centronorte')) zones.push('CentroNorte');
  if (locationStr.includes('centro sur') || locationStr.includes('centrosur')) zones.push('CentroSur');
  
  return zones;
}

// Map EasyBroker features to our amenity tags
function mapFeaturesToAmenities(features) {
  if (!features || !Array.isArray(features)) return [];
  
  const amenityMap = {
    'una sola planta': 'Una Planta',
    'una planta': 'Una Planta',
    'un piso': 'Una Planta',
    'recamara en planta baja': 'Recamara en Planta Baja',
    'recámara en planta baja': 'Recamara en Planta Baja',
    'frente a parque': 'Frente a Parque',
    'frente al parque': 'Frente a Parque',
    'nueva': 'Nueva',
    'nuevo': 'Nueva',
    'sobre avenida': 'Sobre Avenida',
    'alberca': 'Alberca',
    'piscina': 'Alberca',
    'lista para habitarse': 'Lista para Habitarse',
    'listo para habitarse': 'Lista para Habitarse',
    'patio amplio': 'Patio Amplio',
    'patio': 'Patio Amplio' // Be careful with this one, maybe too broad?
  };
  
  const amenities = [];
  
  features.forEach(feature => {
    const featureName = (feature.name || feature).toLowerCase().trim();
    
    // Check for exact matches first
    if (amenityMap[featureName]) {
      amenities.push(amenityMap[featureName]);
    } else {
      // Check for partial matches
      for (const [key, value] of Object.entries(amenityMap)) {
        if (featureName.includes(key) && !amenities.includes(value)) {
          amenities.push(value);
        }
      }
    }
  });
  
  return amenities;
}

export async function syncTenantProperties(tenant) {
  // Asegurarnos de tener la instancia de DB
  const db = await getFirebaseInstance(tenant);
  const apiKey = tenant.easyBrokerKey;
  
  if (!apiKey) {
    console.warn(`No EasyBroker key for tenant ${tenant.id}`);
    return { success: false, error: 'No API Key configured' };
  }

  console.log(`Starting sync for ${tenant.name}...`);
  
  try {
    // 1. Fetch properties (Iterate through all pages)
    let allProperties = [];
    let page = 1;
    let hasMore = true;
    const limit = 50;

    while (hasMore) {
      console.log(`Fetching page ${page}...`);
      const data = await fetchProperties(apiKey, page, limit);
      const pageProperties = data.content || [];
      
      if (pageProperties.length > 0) {
        // Fetch details for each property in the current page
        console.log(`Fetching details for ${pageProperties.length} properties on page ${page}...`);
        
        // Procesar de forma secuencial para no saturar EasyBroker.
        const detailedProperties = [];
        for (const summaryProp of pageProperties) {
          const details = await fetchPropertyDetails(apiKey, summaryProp.public_id);
          detailedProperties.push(details || summaryProp);
          await sleep(350);
        }

        allProperties = [...allProperties, ...detailedProperties];
        
        // Check if we have more pages
        if (data.pagination && data.pagination.next_page) {
          page++;
        } else {
          hasMore = false;
        }
      } else {
        hasMore = false;
      }
    }
    
    console.log(`Fetched total of ${allProperties.length} properties from EasyBroker.`);

    if (allProperties.length === 0) {
        return { success: true, count: 0, message: 'No properties found' };
    }

    // 2. Write to Firestore using Batches (max 500 ops per batch)
    // Firestore batches have a limit of 500 operations. We need to chunk if > 500.
    const dbBatchSize = 400; // Safe limit
    const chunks = [];
    
    for (let i = 0; i < allProperties.length; i += dbBatchSize) {
        chunks.push(allProperties.slice(i, i + dbBatchSize));
    }

    for (const chunk of chunks) {
        const batch = db.batch();
        const collectionRef = db.collection('easybroker_properties');
        
        chunk.forEach(property => {
      // Usamos public_id como ID del documento para evitar duplicados
      const docRef = collectionRef.doc(property.public_id);
      
      // Generate tags from location and features
      const zones = detectZones(property);
      const amenities = mapFeaturesToAmenities(property.features);
      const generatedTags = [...zones, ...amenities];
      
      // console.log(`Property ${property.public_id}: Generated tags:`, generatedTags);
      
      batch.set(docRef, {
        ...property,
        tags: generatedTags, // Add our generated tags
        _syncedAt: new Date().toISOString()
      }, { merge: true });
    });
    
    await batch.commit();
    console.log(`Synced chunk of ${chunk.length} properties.`);
  }
    
    console.log(`Successfully synced total of ${allProperties.length} properties to Firestore.`);
    
    // Update system_status
    try {
      await db.collection('system_status').doc('last_sync').set({
        lastSync: new Date().toISOString(),
        status: 'success',
        count: allProperties.length,
        updatedAt: new Date() // Firestore timestamp
      });
      console.log('Updated system_status/last_sync');
    } catch (statusError) {
      console.error('Failed to update system_status:', statusError);
    }

    return { success: true, count: allProperties.length };
    
  } catch (error) {
    console.error(`Sync failed for ${tenant.name}:`, error);
    
    // Try to update system_status with error
    try {
      await db.collection('system_status').doc('last_sync').set({
        lastSync: new Date().toISOString(),
        status: 'error',
        error: error.message,
        updatedAt: new Date()
      }, { merge: true });
    } catch (e) {
      // Ignore error updating status if main sync failed
    }

    return { success: false, error: error.message };
  }
}
