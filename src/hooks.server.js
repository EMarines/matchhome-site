import { getTenantConfig } from '$lib/config/tenants';
import { getFirebaseInstance } from '$lib/server/firebase';

export async function handle({ event, resolve }) {
  const host = event.request.headers.get('host');
  
  // 1. Identificar Tenant
  const tenant = getTenantConfig(host);
  
  if (!tenant) {
    return new Response('Empresa no encontrada', { status: 404 });
  }

  // 2. Inyectar en locals
  event.locals.tenant = tenant;
  
  // 3. Inicializar DB
  try {
    event.locals.db = await getFirebaseInstance(tenant);
  } catch (error) {
    console.error('Error connecting to Firebase:', error);
    // En build time (o si faltan credenciales), db será null.
    // La aplicación debe manejar gracefully cuando event.locals.db no existe.
    event.locals.db = null;
  }

  // 4. Pasar variables de tema al cliente (opcional, también se puede hacer en layout.server.js)
  
  const response = await resolve(event);

  return response;
}
