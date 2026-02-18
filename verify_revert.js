import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { filterProperties } from './src/lib/utils/filterProperties.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inventoryPath = path.join(__dirname, 'src/lib/data/inventory.json');

try {
  const data = fs.readFileSync(inventoryPath, 'utf8');
  const inventoryData = JSON.parse(data);

  console.log(`Total inventory: ${inventoryData.length}`);

  // Test Sur (Previously had 1 tag match, 6 total matches with fallback)
  // Should now return only 1 match (or however many have the tag)
  const filtersSur = { tags: ['Sur'] };
  const resultSur = filterProperties(inventoryData, '', filtersSur);
  console.log(`\nFiltering by 'Sur' (Tags Only): Found ${resultSur.items.length} items`);
  resultSur.items.forEach(p => console.log(` - ${p.public_id}: ${p.title} (Tags: ${p.tags})`));

} catch (err) {
  console.error('Error:', err);
}
