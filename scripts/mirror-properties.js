import admin from 'firebase-admin';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, collection, getDocs } from 'firebase/firestore';
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
  projectId: "curso-svelte-58c5d",
  storageBucket: "curso-svelte-58c5d.appspot.com",
  messagingSenderId: "1067367490239",
  appId: "1:1067367490239:web:8a8aeae384fa8319515c0a"
};

const devClientApp = initializeApp(devConfig, 'sandbox-target');
const devDb = getFirestore(devClientApp);

async function mirror() {
  console.log("==========================================================");
  console.log("🔄 SINCRONIZACIÓN ESPEJO DE PROPIEDADES (PROD ➔ SANDBOX)");
  console.log("==========================================================");
  console.log(`📡 Origen (PROD - Admin SDK): ${serviceAccount.project_id}`);
  console.log(`📡 Destino (SANDBOX):          ${devConfig.projectId}\n`);

  console.log("📥 Leyendo todas las propiedades de Producción...");
  const prodSnap = await prodAdminDb.collection('properties').get();
  console.log(`✅ ${prodSnap.size} propiedades encontradas en Producción.`);

  if (prodSnap.empty) {
    console.log("⚠️ No se encontraron propiedades en Producción.");
    process.exit(0);
  }

  console.log("\n🚀 Copiando propiedades a Sandbox (curso-svelte-58c5d)...");
  let count = 0;
  let errors = 0;

  for (const docSnapshot of prodSnap.docs) {
    const data = docSnapshot.data();
    const docId = docSnapshot.id;

    // Convertir timestamps de Admin SDK a formato serializable o mantenerlos
    const cleanData = {};
    for (const [key, val] of Object.entries(data)) {
      if (val && typeof val === 'object' && typeof val.toDate === 'function') {
        cleanData[key] = val.toDate();
      } else {
        cleanData[key] = val;
      }
    }

    try {
      await setDoc(doc(devDb, 'properties', docId), cleanData, { merge: true });
      count++;
      if (count % 10 === 0 || count === prodSnap.size) {
        process.stdout.write(`   Copiadas: ${count}/${prodSnap.size} (Doc ID: ${docId})\r`);
      }
    } catch (e) {
      console.error(`\n❌ Error en propiedad ${docId}:`, e.message);
      errors++;
    }
  }

  console.log(`\n\n🎉 ¡ESPEJO DE PROPIEDADES COMPLETADO! (${count} propiedades copiadas)`);
  console.log(`🔒 NOTA: La colección 'contacts' se mantiene desacoplada en Sandbox para proteger los datos de clientes reales.\n`);
  process.exit(0);
}

mirror().catch(err => {
  console.error("❌ Error en script de espejo:", err);
  process.exit(1);
});
