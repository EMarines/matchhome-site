import admin from 'firebase-admin';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { env } from '$env/dynamic/private';

// Cache para mantener las instancias de Firebase activas
const firebaseApps = {};

function buildCredentialFromEnv() {
  const rawKey = env.FIREBASE_PRIVATE_KEY || process.env.FIREBASE_PRIVATE_KEY;
  const clientEmail = env.FIREBASE_CLIENT_EMAIL || process.env.FIREBASE_CLIENT_EMAIL;
  const projectId = env.FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;

  if (!rawKey || !clientEmail) {
    return null;
  }

  const privateKey = rawKey.replace(/\\n/g, '\n');

  return admin.credential.cert({
    type: 'service_account',
    project_id: projectId || 'matchhome-crm-46de4',
    private_key_id: env.FIREBASE_PRIVATE_KEY_ID || process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: privateKey,
    client_email: clientEmail,
    client_id: env.FIREBASE_CLIENT_ID || process.env.FIREBASE_CLIENT_ID,
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
  });
}

async function buildCredentialFromServiceAccountFile() {
  const candidates = [
    process.env.GOOGLE_APPLICATION_CREDENTIALS,
    env.FIREBASE_SERVICE_ACCOUNT_PATH,
    './secrets/firebase-admin-dev.json',
    resolve(process.cwd(), 'secrets/firebase-admin-dev.json')
  ].filter(Boolean);

  for (const candidate of candidates) {
    try {
      const absolutePath = candidate.startsWith('/') || /^[A-Za-z]:[\\/]/.test(candidate)
        ? candidate
        : resolve(process.cwd(), candidate);

      const fileContent = await readFile(absolutePath, 'utf8');
      const serviceAccount = JSON.parse(fileContent);

      if (serviceAccount.private_key && serviceAccount.client_email) {
        console.log(`Using service account credentials from ${absolutePath}`);
        return admin.credential.cert(serviceAccount);
      }
    } catch {
      // Intentar con la siguiente candidata
    }
  }

  return null;
}

export async function getFirebaseInstance(tenantConfig) {
  const tenantId = tenantConfig.id;

  if (firebaseApps[tenantId]) {
    return firebaseApps[tenantId];
  }

  try {
    // Evitar duplicados si ya está inicializado
    const existingApp = admin.apps.find(app => app && app.name === tenantId);
    if (existingApp) {
      firebaseApps[tenantId] = existingApp.firestore();
      return firebaseApps[tenantId];
    }

    // Intentar construir credencial desde variables de entorno o desde el JSON local
    const credential = buildCredentialFromEnv();
    const serviceAccountCredential = await buildCredentialFromServiceAccountFile();
    const resolvedCredential = credential || serviceAccountCredential;

    if (!resolvedCredential) {
      // Fallback: Application Default Credentials (para Vercel / Cloud Run)
      if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        console.log(`Using GOOGLE_APPLICATION_CREDENTIALS for tenant ${tenantId}`);
      } else if (process.env.npm_lifecycle_event === 'build') {
        console.log('Skipping Firebase init during build');
        return null;
      } else {
        console.warn(`No Firebase credentials found for ${tenantId}. Define FIREBASE_PRIVATE_KEY and FIREBASE_CLIENT_EMAIL in .env or place a service account JSON in secrets/`);
        return null;
      }
    }

    const app = admin.initializeApp({
      credential: resolvedCredential || admin.credential.applicationDefault(),
      projectId: tenantConfig.firebaseConfig.projectId
    }, tenantId);

    const db = app.firestore();
    firebaseApps[tenantId] = db;
    return db;
  } catch (error) {
    console.error(`Error initializing Firebase for ${tenantId}:`, error);
    throw error;
  }
}

