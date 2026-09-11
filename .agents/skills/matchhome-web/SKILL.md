---
name: matchhome-web
description: >-
  Estándares de desarrollo para MatchHome Web (https://matchhome.vercel.app/): SvelteKit, Firebase Firestore
  (matchhome-crm-46de4), rutas de catálogo y propuesta personalizada, y despliegue en Vercel.
---

# 🚀 Skill: MatchHome Web & Firebase

Este skill proporciona el contexto y directrices técnicas para trabajar en `matchhome-site`.

---

## 1. Arquitectura de Datos y Conexión
- **Servidor:** `$lib/server/firebase.js` usa `firebase-admin` inicializado con Service Account o variables de entorno en `.env`.
- **Cliente:** `$lib/firebase-client.js` usa el SDK modular de Firebase para operaciones en el navegador.
- **Colecciones Principales:**
  - `properties`: Inventario de inmuebles.
  - `contacts`: Clientes para propuestas personalizadas (`?c=contactId`).

---

## 2. Convenciones de Rutas SvelteKit
- `src/routes/+page.svelte` / `+page.server.js`: Página de inicio y destacados.
- `src/routes/propiedades/`: Catálogo completo, buscador y filtros.
- `src/routes/property/[id]/`: Ficha de propiedad individual.
- `src/routes/propuesta/[id]/`: Propuesta personalizada para clientes.

---

## 3. Identidad Visual
- Primario: `#0056b3`
- Secundario / Acentos: `#c5a059`
- Fuentes y diseño optimizado para navegación móvil rápida.
