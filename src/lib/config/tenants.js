import { env } from '$env/dynamic/private';

export const tenants = {
  'localhost': {
    id: 'dev-tenant',
    name: 'MatchHome',
    fullName: 'MatchHome Bienes Raíces',
    slogan: 'Tu Futuro En Buenas Manos',
    phone: '614 540 4003',
    phoneRaw: '526145404003',
    email: 'matchhomebr@gmail.com',
    address: 'Av. Francisco Villa # 5700, Col. Panamericana, Chihuahua, Chih.',
    city: 'Chihuahua, Chih., México',
    postalCode: '31210',
    schedule: 'Lunes a Viernes: 9:00 AM - 7:00 PM | Sábados: 9:00 AM - 2:00 PM',
    firebaseConfig: {
      projectId: env.FIREBASE_PROJECT_ID || 'matchhome-crm-46de4',
    },
    theme: {
      primary: '#0056b3',
      secondary: '#c5a059',
      logo: '/logo.png'
    }
  },
  'cliente-alpha.com': {
    id: 'alpha',
    name: 'Alpha Real Estate',
    fullName: 'Alpha Real Estate',
    slogan: 'Tu Futuro En Buenas Manos',
    phone: '614 540 4003',
    phoneRaw: '526145404003',
    email: 'matchhomebr@gmail.com',
    address: 'Av. Francisco Villa # 5700, Col. Panamericana, Chihuahua, Chih.',
    city: 'Chihuahua, Chih., México',
    postalCode: '31210',
    schedule: 'Lunes a Viernes: 9:00 AM - 7:00 PM | Sábados: 9:00 AM - 2:00 PM',
    firebaseConfig: {
      projectId: env.FIREBASE_PROJECT_ID_ALPHA || 'alpha-project'
    },
    theme: {
      primary: '#FF0000',
      secondary: '#000000',
      logo: '/logos/alpha.png'
    }
  }
};

export function getTenantConfig(host) {
  // Eliminar puerto para desarrollo local (localhost:5173 -> localhost)
  const domain = host ? host.split(':')[0] : 'localhost';
  return tenants[domain] || tenants['localhost']; // Fallback a localhost por defecto
}

