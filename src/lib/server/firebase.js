import admin from 'firebase-admin';
import { readFile } from 'fs/promises';
import { resolve } from 'path';

// Cache para mantener las instancias de Firebase activas
const firebaseApps = {};

export async function getFirebaseInstance(tenantConfig) {
  const tenantId = tenantConfig.id;

  if (firebaseApps[tenantId]) {
    return firebaseApps[tenantId];
  }

  try {
    // Check if app already exists in admin.apps list to avoid duplicates
    const existingApp = admin.apps.find(app => app && app.name === tenantId);
    if (existingApp) {
      firebaseApps[tenantId] = existingApp.firestore();
      return firebaseApps[tenantId];
    }

    // Cargar credenciales
    let credential;
    
    if (process.env.NODE_ENV === 'development' && tenantConfig.firebaseConfig.serviceAccountPath) {
      // Desarrollo: Cargar desde archivo local
      const serviceAccountPath = resolve(process.cwd(), tenantConfig.firebaseConfig.serviceAccountPath);
      const serviceAccount = JSON.parse(await readFile(serviceAccountPath, 'utf-8'));
      credential = admin.credential.cert(serviceAccount);
    } else {
      // Producción: Usar Application Default Credentials (si está configurado en Vercel)
      // O intentar cargar desde variable de entorno si existe
      if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
         credential = admin.credential.applicationDefault();
      } else {
         console.warn(`No credentials found for ${tenantId}. Firebase Admin might not work.`);
         // Return a placeholder or null if strict mode not required, or let it fail later
         // For build purposes, we might want to skip initialization if no creds
         if (process.env.npm_lifecycle_event === 'build') {
             console.log('Skipping Firebase init during build');
             return null; 
         }
         credential = admin.credential.applicationDefault();
      }
    }
    
    const app = admin.initializeApp({
      credential,
      projectId: tenantConfig.firebaseConfig.projectId
    }, tenantId); // Nombre único para la instancia

    const db = app.firestore();
    firebaseApps[tenantId] = db;
    return db;
  } catch (error) {
    console.error(`Error initializing Firebase for ${tenantId}:`, error);
    throw error;
  }
}
