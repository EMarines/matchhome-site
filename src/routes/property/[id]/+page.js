import inventoryData from '$lib/data/inventory.json';
import { mockProperties } from '$lib/data/mockProperties';
import { error } from '@sveltejs/kit';

export async function load({ params, fetch }) {
  const { id } = params;

  // 1. Static Inventory
  const staticProperty = inventoryData.find(p => p.public_id === id);
  if (staticProperty) return { property: staticProperty };

  // 2. API
  try {
    // Note: API Key should be in env variables, but keeping hardcoded for migration parity
    const res = await fetch(`/api/properties/${id}`, {
      headers: { 
        'X-Authorization': 'pqnjps13ry7iaudododsi455mg22mt',
        'accept': 'application/json'
      }
    });
    if (res.ok) {
      const data = await res.json();
      return { property: data };
    }
  } catch (e) {
    console.warn('API fetch failed', e);
  }

  // 3. Mock Data
  const mock = mockProperties.find(p => p.public_id === id);
  if (mock) return { property: mock };

  throw error(404, 'Propiedad no encontrada');
}
