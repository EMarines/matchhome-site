export const tenants = {
  'localhost': {
    id: 'dev-tenant',
    name: 'Inmobiliaria Demo',
    // En producción, esto vendría de variables de entorno o un gestor de secretos
    // Para desarrollo, usaremos un proyecto de Firebase de prueba o emuladores
    firebaseConfig: {
      projectId: 'jgcapitaldb', // ID real de tu proyecto
      serviceAccountPath: './secrets/firebase-admin-dev.json' // Ruta relativa desde la raíz
    },
    easyBrokerKey: 'pqnjps13ry7iaudododsi455mg22mt', // Demo Key
    theme: {
      primary: '#0056b3',
      secondary: '#c5a059',
      logo: '/logo.png' // Necesitaremos poner un logo genérico en static/
    }
  },
  'cliente-alpha.com': {
    id: 'alpha',
    name: 'Alpha Real Estate',
    firebaseConfig: {
      projectId: 'alpha-project'
    },
    easyBrokerKey: 'KEY_ALPHA',
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
