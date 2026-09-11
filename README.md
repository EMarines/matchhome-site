# 🏠 MatchHome Web — Portal & Propuestas Inmobiliarias

Portal web oficial y motor de propuestas personalizadas de **MatchHome Bienes Raíces** en Chihuahua, México (`https://matchhome.vercel.app/`).

---

## 🏗️ Arquitectura del Sistema

- **Frontend:** SvelteKit + Tailwind CSS.
- **Base de Datos:** **Firebase Firestore (`matchhome-crm-46de4`)**
  - `contacts`: Prospectos y clientes para personalizar propuestas por ID (`?c=contactId`).
  - `properties`: Inventario de propiedades activas.
- **Ruta Estrella:** `/propuesta/[id]?c=contact_id`
  - Saludo personalizado con el nombre del cliente.
  - Ficha completa de la propiedad ancla compartida.
  - Sección inteligente de "Propiedades que te podrían interesar" (matching por presupuesto y tipo de inmueble).
- **Catálogo Público:** `/propiedades` con selector de paginación para **20, 50 y 100 propiedades**, y filtros facetados por zonas de Chihuahua.
- **Conversión:** Botón de WhatsApp directo pre-cargado con el nombre del cliente y datos de la casa.
- **Despliegue:** Vercel con integración continua (`origin/main`).

---

## 🚀 Variables de Entorno Requeridas (`.env`)

```env
# Firebase Admin SDK (Servidor)
FIREBASE_PROJECT_ID=matchhome-crm-46de4
FIREBASE_CLIENT_EMAIL=your-service-account@matchhome-crm-46de4.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Firebase Client SDK (Navegador)
PUBLIC_FIREBASE_API_KEY=your-api-key
PUBLIC_FIREBASE_AUTH_DOMAIN=matchhome-crm-46de4.firebaseapp.com
PUBLIC_FIREBASE_PROJECT_ID=matchhome-crm-46de4
PUBLIC_FIREBASE_STORAGE_BUCKET=matchhome-crm-46de4.firebasestorage.app
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
PUBLIC_FIREBASE_APP_ID=your-app-id

# MatchHome Config
PUBLIC_TENANT_PHONE_RAW=526145404003
```

---

## 🛠️ Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Servidor local
npm run dev

# Verificación de compilación
npm run build
```
