import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = 'pqnjps13ry7iaudododsi455mg22mt';
const BASE_URL = 'https://api.easybroker.com/v1';

async function fetchAllProperties() {
  console.log('🚀 Iniciando descarga de inventario...');
  
  try {
    // 1. Fetch all properties (pagination)
    let allProperties = [];
    let page = 1;
    let hasNextPage = true;

    while (hasNextPage) {
      console.log(`📄 Descargando página ${page}...`);
      const response = await fetch(`${BASE_URL}/properties?page=${page}&limit=50`, {
        headers: {
          'X-Authorization': API_KEY,
          'accept': 'application/json'
        }
      });

      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
      
      const data = await response.json();
      const content = data.content || [];
      allProperties = [...allProperties, ...content];
      
      if (data.pagination && data.pagination.next_page) {
        page++;
      } else {
        hasNextPage = false;
      }
    }

    console.log(`✅ Se encontraron ${allProperties.length} propiedades en total.`);

    // 2. Fetch details for EACH property (to get tags)
    console.log('🔍 Descargando detalles (etiquetas) de cada propiedad...');
    const detailedProperties = [];
    const batchSize = 5; // Conservative batch size
    
    for (let i = 0; i < allProperties.length; i += batchSize) {
      const batch = allProperties.slice(i, i + batchSize);
      const progress = Math.min(i + batchSize, allProperties.length);
      process.stdout.write(`\r⏳ Procesando: ${progress}/${allProperties.length}`);

      const batchPromises = batch.map(async (p) => {
        try {
          const res = await fetch(`${BASE_URL}/properties/${p.public_id}`, {
            headers: { 'X-Authorization': API_KEY, 'accept': 'application/json' }
          });
          if (!res.ok) return p; // Fallback to simple object
          return await res.json();
        } catch (e) {
          console.error(`\n❌ Error en ${p.public_id}:`, e.message);
          return p;
        }
      });

      const results = await Promise.all(batchPromises);
      detailedProperties.push(...results);

      // Delay to respect rate limit
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n✨ Descarga completada.');

    // 3. Save to file
    const outputPath = path.join(__dirname, '../src/data/inventory.json');
    fs.writeFileSync(outputPath, JSON.stringify(detailedProperties, null, 2));
    console.log(`💾 Inventario guardado en: ${outputPath}`);

  } catch (error) {
    console.error('❌ Error fatal:', error);
  }
}

fetchAllProperties();
