import inventoryData from '$lib/data/inventory.json';
import { mockProperties } from '$lib/data/mockProperties';
import { error } from '@sveltejs/kit';

export function load({ params, url }) {
  const { id } = params;
  const clientName = url.searchParams.get('cliente') || 'Cliente';
  const targetBudget = parseFloat(url.searchParams.get('presupuesto'));
  const targetZone = url.searchParams.get('zona');

  // 1. Anchor Property
  let anchorProperty = inventoryData.find(p => p.public_id === id);
  if (!anchorProperty) {
    anchorProperty = mockProperties.find(p => p.public_id === id);
  }

  if (!anchorProperty) {
    throw error(404, 'Propiedad no encontrada');
  }

  // 2. Similar Properties
  const operationType = anchorProperty.operations && anchorProperty.operations.length > 0 
    ? anchorProperty.operations[0].type 
    : 'sale';
  
  const basePrice = targetBudget || (anchorProperty.operations && anchorProperty.operations.length > 0 ? anchorProperty.operations[0].amount : 0);
  
  const similars = inventoryData.filter(p => {
    if (p.public_id === anchorProperty.public_id) return false;
    const pOpType = p.operations && p.operations.length > 0 ? p.operations[0].type : '';
    if (pOpType !== operationType) return false;
    if (p.property_type !== anchorProperty.property_type) return false;
    return true;
  });

  similars.sort((a, b) => {
    const priceA = a.operations && a.operations.length > 0 ? a.operations[0].amount : 0;
    const priceB = b.operations && b.operations.length > 0 ? b.operations[0].amount : 0;
    return Math.abs(priceA - basePrice) - Math.abs(priceB - basePrice);
  });

  const similarProperties = similars.slice(0, 6);

  return {
    anchorProperty,
    similarProperties,
    clientName
  };
}
