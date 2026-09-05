import admin from 'firebase-admin';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// 1. Cargar Service Account de Producción (matchhome-crm-46de4)
const serviceAccountPath = resolve(process.cwd(), 'secrets/firebase-admin-dev.json');
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}
const prodAdminDb = admin.firestore();

// 2. Configuración de Destino: Sandbox (curso-svelte-58c5d)
const devConfig = {
  apiKey: "AIzaSyCkuw82zTqtiPDp3eS2qwGr8UUQFDBBglM",
  authDomain: "curso-svelte-58c5d.firebaseapp.com",
  projectId: "curso-svelte-58c5d"
};

const devClientApp = initializeApp(devConfig, 'sandbox-cleaner');
const devDb = getFirestore(devClientApp);

async function analyzeAndClean() {
  console.log("🔍 Analizando contactos de Producción vs Sandbox...");
  
  const prodSnap = await prodAdminDb.collection('contacts').get();
  const prodIds = new Set(prodSnap.docs.map(d => d.id));
  console.log(`📦 Contactos en Producción: ${prodIds.size}`);

  const devSnap = await getDocs(collection(devDb, 'contacts'));
  console.log(`📦 Contactos en Sandbox (curso-svelte-58c5d): ${devSnap.size}`);

  const fromProd = [];
  const nativeSandbox = [];

  for (const d of devSnap.docs) {
    if (prodIds.has(d.id)) {
      fromProd.push(d);
    } else {
      nativeSandbox.push(d);
    }
  }

  console.log(`\n📊 Diagnóstico:`);
  console.log(` - Contactos clonados de Producción en Sandbox: ${fromProd.length}`);
  console.log(` - Contactos nativos propios de Sandbox:          ${nativeSandbox.length}`);

  if (nativeSandbox.length > 0) {
    console.log(`\nEjemplos de contactos nativos propios del Sandbox:`);
    nativeSandbox.slice(0, 5).forEach(d => {
      const data = d.data();
      console.log(`   [${d.id}] ${data.name || ''} ${data.lastname || ''} | Tel: ${data.telephon || ''}`);
    });
  }

  // Eliminar los contactos de producción de Sandbox
  console.log(`\n🧹 Eliminando ${fromProd.length} contactos de producción del Sandbox para evitar envíos no deseados...`);
  let deleted = 0;
  for (const d of fromProd) {
    try {
      await deleteDoc(doc(devDb, 'contacts', d.id));
      deleted++;
      if (deleted % 50 === 0 || deleted === fromProd.length) {
        process.stdout.write(`   Eliminados: ${deleted}/${fromProd.length}\r`);
      }
    } catch (err) {
      console.error(`\n❌ Error eliminando ${d.id}:`, err.message);
    }
  }

  console.log(`\n\n✅ ¡Purga completada! Eliminados ${deleted} contactos de producción de Sandbox.`);
  
  const finalSnap = await getDocs(collection(devDb, 'contacts'));
  console.log(`🔒 Contactos remanentes en Sandbox: ${finalSnap.size} (100% seguros y aislados)`);
  process.exit(0);
}

analyzeAndClean().catch(err => {
  console.error("❌ Error en script:", err);
  process.exit(1);
});
