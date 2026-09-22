import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serviceAccountPath = path.resolve(__dirname, '../secrets/firebase-admin-dev.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function purgeOrphans() {
  console.log(`🚀 Iniciando proceso de PURGA de bitácoras huérfanas [${serviceAccount.project_id}]...`);

  // 1. Cargar reporte previo o regenerar lista segura
  const contactsSnap = await db.collection('contacts').get();
  const contactIds = new Set();
  contactsSnap.forEach(doc => contactIds.add(doc.id));

  const binnaclesSnap = await db.collection('binnacles').get();
  const orphansToDelete = [];

  binnaclesSnap.forEach(doc => {
    const data = doc.data();
    const id = doc.id;
    const target = (data.to || data.contactId || '').trim();

    // Solo se consideran huérfanas las que tienen un ID pero no existen en contacts
    // y NO son registros de teléfono directo ('Tel:', '+', etc.)
    if (target && !contactIds.has(target) && !target.startsWith('Tel:') && !target.startsWith('+') && !/^\d{10}$/.test(target)) {
      orphansToDelete.push({ id, target, ...data });
    }
  });

  console.log(`📊 Total contactos vivos: ${contactIds.size}`);
  console.log(`📊 Total bitácoras evaluadas: ${binnaclesSnap.size}`);
  console.log(`🗑️ Total bitácoras huérfanas a depurar: ${orphansToDelete.length}`);

  if (orphansToDelete.length === 0) {
    console.log('✅ No hay bitácoras huérfanas por depurar.');
    return;
  }

  // 2. BACKUP DE SEGURIDAD previo a la eliminación
  const backupFilename = `backup_binnacles_before_purge_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  const backupPath = path.resolve(__dirname, `../scripts/${backupFilename}`);
  
  console.log(`💾 Creando backup de seguridad en: ${backupPath}...`);
  fs.writeFileSync(backupPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    projectId: serviceAccount.project_id,
    totalPurged: orphansToDelete.length,
    data: orphansToDelete
  }, null, 2));
  console.log(`✅ Backup completado con ${orphansToDelete.length} registros respaldados.`);

  // 3. Ejecutar eliminación en lotes (Batches de 400 docs para respetar límite de Firestore)
  const BATCH_SIZE = 400;
  let deletedCount = 0;

  for (let i = 0; i < orphansToDelete.length; i += BATCH_SIZE) {
    const chunk = orphansToDelete.slice(i, i + BATCH_SIZE);
    const batch = db.batch();

    chunk.forEach(item => {
      const docRef = db.collection('binnacles').doc(item.id);
      batch.delete(docRef);
    });

    await batch.commit();
    deletedCount += chunk.length;
    console.log(`🧹 Progreso de depuración: ${deletedCount}/${orphansToDelete.length} bitácoras eliminadas...`);
  }

  console.log(`\n🎉 DEPURACIÓN EXITOSA: Se eliminaron ${deletedCount} bitácoras huérfanas en Firestore.`);
  console.log(`💾 El backup completo se encuentra preservado en: ${backupPath}`);
}

purgeOrphans().catch(err => {
  console.error('❌ Error durante la purga:', err);
  process.exit(1);
});
