import { json } from '@sveltejs/kit';
import { syncTenantProperties } from '$lib/server/sync';

export async function POST({ locals }) {
  const tenant = locals.tenant;
  
  if (!tenant) {
    return json({ error: 'Tenant not found' }, { status: 404 });
  }

  // En un escenario real, aquí verificaríamos permisos de administrador
  // Por ahora, como es una demo/dev, lo permitimos.
  
  try {
    const result = await syncTenantProperties(tenant);
    return json(result);
  } catch (error) {
    console.error('Sync API Error:', error);
    return json({ error: error.message }, { status: 500 });
  }
}
