import { getTenantConfig } from '../src/lib/config/tenants.js';
import { getFirebaseInstance } from '../src/lib/server/firebase.js';

async function fetchAllProperties(apiKey) {
  let page = 1;
  let allProperties = [];
  let hasNextPage = true;
  const limit = 50; // EasyBroker max limit per page

  while (hasNextPage) {
    console.log(`📥 Descargando página ${page}...`);
    const response = await fetch(`https://api.easybroker.com/v1/properties?page=${page}&limit=${limit}`, {
      headers: {
        'X-Authorization': apiKey,
        'accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Error EasyBroker API: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const properties = data.content || [];
    allProperties = [...allProperties, ...properties];

    if (data.pagination && data.pagination.next_page) {
      page++;
    } else {
      hasNextPage = false;
    }
  }

  return allProperties;
}

async function syncInventory(tenantId) {
  console.log(`\n🔄 Iniciando sincronización REAL para: ${tenantId}`);
  
  // 1. Obtener Configuración
  const config = Object.values(getTenantConfig('localhost')).find(t => t.id === tenantId) || getTenantConfig('localhost');
  
  if (!config) {
    console.error('❌ Configuración no encontrada');
    return;
  }

  console.log(`🔑 Usando API Key: ${config.easyBrokerKey.substring(0, 5)}...`);
  console.log(`🔥 Conectando a Firestore: ${config.firebaseConfig.projectId}`);

  try {
    // 2. Inicializar Firestore
    const db = await getFirebaseInstance(config);
    
    // 3. Descargar de EasyBroker
    console.log('🌍 Conectando con EasyBroker...');
    const properties = await fetchAllProperties(config.easyBrokerKey);
    console.log(`✅ ${properties.length} propiedades descargadas.`);

    if (properties.length === 0) {
      console.log('⚠️ No hay propiedades para guardar.');
      return;
    }

    // 4. Guardar en Firestore (Batch Write)
    console.log('💾 Guardando en Firestore...');
    const batchSize = 400; // Firestore limit is 500
    const chunks = [];
    
    for (let i = 0; i < properties.length; i += batchSize) {
      chunks.push(properties.slice(i, i + batchSize));
    }

    for (const [index, chunk] of chunks.entries()) {
      const batch = db.batch();
      
      chunk.forEach(property => {
        // Usar public_id como ID del documento para evitar duplicados
        const docRef = db.collection('properties').doc(property.public_id);
        
        // Añadir timestamp de actualización
        const dataToSave = {
          ...property,
          _lastUpdated: new Date()
        };
        
        batch.set(docRef, dataToSave, { merge: true });
      });

      console.log(`📦 Escribiendo lote ${index + 1}/${chunks.length} (${chunk.length} docs)...`);
      await batch.commit();
    }
    
    // 5. Actualizar timestamp de última sincronización
    await db.collection('system_status').doc('last_sync').set({
      timestamp: new Date(),
      status: 'success',
      count: properties.length
    });

    console.log('✅ Sincronización completada con éxito.');

  } catch (error) {
    console.error('❌ Error en la sincronización:', error);
  }
}

// Ejecutar
syncInventory('dev-tenant');
