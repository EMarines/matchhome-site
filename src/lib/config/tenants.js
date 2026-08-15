import { env } from '$env/dynamic/private';

export const tenants = {
  'localhost': {
    id: 'dev-tenant',
    name: 'Inmobiliaria Demo',
    firebaseConfig: {
      projectId: env.FIREBASE_PROJECT_ID || 'matchhome-crm-46de4',
    },
    easyBrokerKey: env.EASYBROKER_API_KEY || '',
    theme: {
      primary: '#0056b3',
      secondary: '#c5a059',
      logo: '/logo.png'
    }
  },
  'cliente-alpha.com': {
    id: 'alpha',
    name: 'Alpha Real Estate',
    firebaseConfig: {
      projectId: env.FIREBASE_PROJECT_ID_ALPHA || 'alpha-project'
    },
    easyBrokerKey: env.EASYBROKER_API_KEY_ALPHA || '',
    theme: {
      primary: '#FF0000',
      secondary: '#000000',
      logo: '/logos/alpha.png'
    }
  }
};

export function getTenantConfig(host) {
  // Eliminar puerto para desarrollo local (localhost:5173 -> localhost)
  const domain = host.split(':')[0];
  return tenants[domain] || tenants['localhost']; // Fallback a localhost por defecto
}
