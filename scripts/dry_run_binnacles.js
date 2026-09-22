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

async function runDryRun() {
  console.log(`🚀 Conectando a Firestore [${serviceAccount.project_id}] en modo DRY-RUN (Solo Lectura)...`);

  // 1. Obtener contactos
  console.log('📥 Descargando colección "contacts"...');
  const contactsSnap = await db.collection('contacts').get();
  const contactIds = new Set();
  const contactsMap = new Map();

  contactsSnap.forEach(doc => {
    contactIds.add(doc.id);
    contactsMap.set(doc.id, doc.data());
  });
  console.log(`✅ Contactos encontrados: ${contactsSnap.size}`);

  // 2. Obtener binnacles
  console.log('📥 Descargando colección "binnacles"...');
  const binnaclesSnap = await db.collection('binnacles').get();
  console.log(`✅ Binnacles encontradas: ${binnaclesSnap.size}`);

  const validBinnacles = [];
  const orphanBinnacles = [];
  const phoneOrCustomBinnacles = [];
  const emptyTargetBinnacles = [];

  binnaclesSnap.forEach(doc => {
    const data = doc.data();
    const id = doc.id;
    const target = (data.to || data.contactId || '').trim();

    if (!target) {
      emptyTargetBinnacles.push({ id, ...data });
    } else if (contactIds.has(target)) {
      validBinnacles.push({ id, target, ...data });
    } else if (target.startsWith('Tel:') || target.startsWith('+') || /^\d{10}$/.test(target)) {
      phoneOrCustomBinnacles.push({ id, target, ...data });
    } else {
      // Tiene un ID de contacto que ya NO existe en la base de datos
      orphanBinnacles.push({ id, target, ...data });
    }
  });

  // 3. Obtener todos (tareas)
  console.log('📥 Descargando colección "todos"...');
  const todosSnap = await db.collection('todos').get();
  console.log(`✅ Todos (tareas) encontradas: ${todosSnap.size}`);

  const validTodos = [];
  const orphanTodos = [];
  const generalTodos = [];

  todosSnap.forEach(doc => {
    const data = doc.data();
    const id = doc.id;
    const target = (data.contactId || data.to || '').trim();

    if (!target) {
      generalTodos.push({ id, ...data });
    } else if (contactIds.has(target)) {
      validTodos.push({ id, target, ...data });
    } else {
      orphanTodos.push({ id, target, ...data });
    }
  });

  // 4. Reporte detallado
  console.log('\n======================================================');
  console.log(`📊 REPORTE DE ANÁLISIS DRY-RUN (BASE DE DATOS: ${serviceAccount.project_id})`);
  console.log('======================================================');
  console.log(`👥 Total Contactos Vivos:       ${contactsSnap.size}`);
  console.log(`📖 Total Registros Bitácora:    ${binnaclesSnap.size}`);
  console.log(`   ├─ ✅ Con contacto activo:    ${validBinnacles.length}`);
  console.log(`   ├─ 🗑️ Huérfanas (ID borrado): ${orphanBinnacles.length}`);
  console.log(`   ├─ 📱 Registros directos Tel: ${phoneOrCustomBinnacles.length}`);
  console.log(`   └─ ❓ Sin campo to/contactId: ${emptyTargetBinnacles.length}`);
  console.log('------------------------------------------------------');
  console.log(`📋 Total Tareas (Todos):        ${todosSnap.size}`);
  console.log(`   ├─ ✅ Con contacto activo:    ${validTodos.length}`);
  console.log(`   ├─ 🗑️ Huérfanas (ID borrado): ${orphanTodos.length}`);
  console.log(`   └─ 📌 Tareas generales:       ${generalTodos.length}`);
  console.log('======================================================\n');

  if (orphanBinnacles.length > 0) {
    console.log(`🔍 MUESTRA DE LAS PRIMERAS 10 BITÁCORAS HUÉRFANAS:`);
    orphanBinnacles.slice(0, 10).forEach((b, idx) => {
      console.log(`  ${idx + 1}. [Doc: ${b.id}] ContactId inexistente: "${b.target}" | Acción: "${b.action || ''}" | Comentario: "${b.comment || ''}" | Fecha: ${b.date ? new Date(Number(b.date)).toLocaleDateString() : 'N/A'}`);
    });

    // Agrupar por target (ID de contacto eliminado)
    const orphansByContact = {};
    orphanBinnacles.forEach(b => {
      orphansByContact[b.target] = (orphansByContact[b.target] || 0) + 1;
    });

    const uniqueDeletedContacts = Object.keys(orphansByContact).length;
    console.log(`\n📌 Estas ${orphanBinnacles.length} bitácoras huérfanas corresponden a ${uniqueDeletedContacts} contactos que fueron eliminados.`);
  }

  if (orphanTodos.length > 0) {
    console.log(`\n🔍 MUESTRA DE TAREAS HUÉRFANAS:`);
    orphanTodos.slice(0, 10).forEach((t, idx) => {
      console.log(`  ${idx + 1}. [Doc: ${t.id}] ContactId inexistente: "${t.target}" | Título: "${t.title || ''}"`);
    });
  }

  // Guardar resultado para inspección de seguridad
  const reportPath = path.resolve(__dirname, '../scripts/dry_run_report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    projectId: serviceAccount.project_id,
    summary: {
      totalContacts: contactsSnap.size,
      totalBinnacles: binnaclesSnap.size,
      validBinnacles: validBinnacles.length,
      orphanBinnacles: orphanBinnacles.length,
      phoneOrCustomBinnacles: phoneOrCustomBinnacles.length,
      emptyTargetBinnacles: emptyTargetBinnacles.length,
      totalTodos: todosSnap.size,
      validTodos: validTodos.length,
      orphanTodos: orphanTodos.length,
      generalTodos: generalTodos.length
    },
    orphanBinnacleIds: orphanBinnacles.map(b => b.id),
    orphanTodoIds: orphanTodos.map(t => t.id)
  }, null, 2));

  console.log(`\n📄 Reporte guardado en: ${reportPath}`);
}

runDryRun().catch(err => {
  console.error('❌ Error en dry-run:', err);
  process.exit(1);
});
