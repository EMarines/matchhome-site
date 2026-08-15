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
  
  // 3. Inicializar Firebase Admin SDK (requiere Service Account en .env)
  try {
    const db = await getFirebaseInstance(tenant);
    event.locals.db = db;
    if (!db) {
      console.warn(
        '⚠️  Firebase no está conectado. Para conectar el proyecto matchhome-crm-46de4:\n' +
        '   1. Ve a Firebase Console > matchhome-crm-46de4 > Configuración del proyecto > Cuentas de servicio\n' +
        '   2. Genera una nueva clave privada (JSON)\n' +
        '   3. Copia FIREBASE_CLIENT_EMAIL y FIREBASE_PRIVATE_KEY del JSON al archivo .env'
      );
    }
  } catch (error) {
    console.error('Error conectando Firebase:', error.message);
    event.locals.db = null;
  }

  const response = await resolve(event);
  return response;
}
