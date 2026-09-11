---
name: matchhome-web-overhaul
description: >-
  Estándares para MatchHome: SvelteKit, Firebase Firestore (matchhome-crm-46de4), propuestas personalizadas por contacto,
  paginación 20/50/100, filtros facetados por zonas de Chihuahua y conversión por WhatsApp.
---

# 🚀 Skill Especializado: MatchHome Web & Propuestas Inmobiliarias

Este skill define la arquitectura para MatchHome basada **exclusivamente en Firebase Firestore**.

---

## 1. Modelo de Datos en Firestore (`matchhome-crm-46de4`)

### Colección: `properties`
Almacena el inventario disponible. Campos clave utilizados en la app:
- `id` / `public_id` / `easybroker_id` / `clavePropiedad`
- `title` / `titulo`
- `price` / `precio` / `moneda` / `precioFormateado`
- `property_type` / `tipoPropiedad` / `selecTP` (Casa, Terreno, Departamento, etc.)
- `operation_type` / `tipoOperacion` / `selecTO` (Venta, Renta)
- `ubicacion` / `colonia` / `zone` (Zonas de Chihuahua)
- `bedrooms` / `recamaras`, `bathrooms` / `banos`, `lot_size` / `terreno`, `construction_size` / `construccion`
- `images` / `property_images` / `imagenPrincipal`

### Colección: `contacts`
Almacena los prospectos para la personalización de propuestas:
- `id`: ID del contacto pasado en la URL como parámetro `c` (`?c=contactId`).
- `name`, `lastname`, `nombre`, `fullName`: Utilizados para personalizar el saludo ("Hola Enrique").
- `phone`, `email`: Para seguimiento y validación.

---

## 2. Flujo Crítico de Propuesta Personalizada (`/propuesta/[id]?c=contactId`)

1. **Lectura de Servidor (`+page.server.js`):**
   - Recupera el contacto por `contactId` desde Firestore (`contacts.doc(contactId)`).
   - Extrae el nombre para saludarlo cálidamente en el encabezado.
   - Recupera la **propiedad ancla** (`id`) compartida con el cliente.
   - Realiza un matching inteligente para calcular las **propiedades similares/recomendadas**:
     - Mismo tipo de operación (Venta o Renta).
     - Mismo tipo de propiedad (o compatible).
     - Ordenadas por cercanía al precio/presupuesto base.
2. **Llamada a la Acción Contextual (WhatsApp):**
   - Cada propiedad genera un enlace directo a WhatsApp con el asesor:
     `Hola MatchHome, soy [NombreCliente], me interesa la propiedad [ID] - [Título] ([Precio]). ¿Podrían darme más detalles?`

---

## 3. Paginación en Catálogo (20, 50, 100)

En `/` y `/propiedades`, el catálogo soporta paginación limpia:
```javascript
// Opciones permitidas: 20, 50, 100
let pageSize = 20;
let currentPage = 1;

$: paginatedProperties = filteredProperties.slice(
  (currentPage - 1) * pageSize,
  currentPage * pageSize
);
```

---

## 4. Zonas Clave de Chihuahua (Chips Ultraligeros)
Filtros rápidos en barra superior y buscador:
- `Distrito 1 (D1)`
- `San Felipe`
- `Campestre`
- `El Reliz / Canteras`
- `Valle Escondido`
- `Aeropuerto / Juan Pablo II`
- `Zona Centro`
- `Sacramento`
