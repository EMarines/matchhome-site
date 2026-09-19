# 🐆 Checklist de Auditoría y Mejoras — Lince (MatchHome)

> Plan de ejecución paso a paso para modernizar y optimizar `matchhome.vercel.app`.
> Reanudar ejecutando **una tarea a la vez**.

---

- [ ] **🔹 Tarea 1: Adelgazamiento del Payload Inicial (De 618 KB a < 70 KB)**
  - *Archivos:* `src/routes/+page.server.js` y `src/routes/propiedades/+page.server.js`
  - *Objetivo:* Enviar solo campos esenciales en el catálogo (`id`, `title`, `price`, `operation_type`, `property_type`, `location`, `bedrooms`, `bathrooms`, `lot_size`, `thumb`). Reservar descripciones largas y galerías para `/property/[id]`.

- [ ] **🔹 Tarea 2: Botón de WhatsApp Directo en Cada Tarjeta**
  - *Archivo:* `src/lib/components/PropertyCard.svelte`
  - *Objetivo:* Agregar botón secundario verde de WhatsApp con mensaje contextual pre-llenado (`ID`, `Título`, `Precio`) junto al botón "Ver Detalles".

- [ ] **🔹 Tarea 3: Optimización de Imágenes y Estabilidad Visual (CLS)**
  - *Archivo:* `src/lib/components/PropertyCard.svelte`
  - *Objetivo:* Agregar `loading="lazy"`, `decoding="async"` y fijar `aspect-ratio: 16/10` con contenedor placeholder para evitar saltos en pantalla.

- [x] **🔹 Tarea 4: Motor de Filtros Robustecido, Botón Ocultable y Paginación Dinámica (12 / 24 / 48 / 96)**
  - *Archivos:* `src/lib/utils/filterProperties.js`, `src/lib/components/Filters.svelte`, `src/lib/components/Hero.svelte`, `src/routes/+page.svelte`, `src/routes/propiedades/+page.svelte`
  - *Objetivo:* Botón prominente `⚡ Filtrar Propiedades` con badge de filtros activos, filtros ocultos por defecto, normalización NFD de texto y acentos, compatibilidad con EasyBroker/Firestore (zonas en `locaProperty`/`location`, amenidades en `features`, tipos bilingües y sanitización de precios), píldoras activas con remoción rápida y paginación reactiva sincronizada con URL.

- [ ] **🔹 Tarea 5: Buscador del Hero con Selector Venta/Renta y Zonas de Chihuahua**
  - *Archivo:* `src/lib/components/Hero.svelte`
  - *Objetivo:* Pestañas de Comprar/Rentar y chips directos para zonas clave (`Distrito 1`, `San Felipe`, `Campestre`, `El Reliz`, `Aeropuerto`, `Centro`).

- [ ] **🔹 Tarea 6: Cabeceras HTTP de Seguridad Defensiva en Vercel**
  - *Archivo:* `vercel.json`
  - *Objetivo:* Agregar `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff` y `Referrer-Policy`.

- [ ] **🔹 Tarea 7: Pulido de Fallback en Propuesta Personalizada**
  - *Archivo:* `src/routes/propuesta/[id]/+page.svelte`
  - *Objetivo:* Mejorar saludo cuando no venga parámetro `?c=` y destacar llamada a la acción para agendar recorrido.
