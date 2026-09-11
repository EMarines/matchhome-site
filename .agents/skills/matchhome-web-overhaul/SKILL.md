---
name: matchhome-web-overhaul
description: >-
  Estándares de arquitectura y desarrollo para la modernización integral de MatchHome: SvelteKit, Supabase PostgreSQL,
  sincronización con EasyBroker vía Edge Function, paginación configurable (20, 50, 100), filtros facetados por zonas de Chihuahua
  y funnels de conversión por WhatsApp y créditos hipotecarios.
---

# 🚀 Skill Especializado: MatchHome Web Overhaul

Este skill define la arquitectura, esquemas de datos y especificaciones técnicas para la modernización del portal inmobiliario MatchHome.

---

## 1. Arquitectura de Datos en Supabase (PostgreSQL)

### Tabla Canónica: `properties`
Para desacoplar la web de los límites de tasa de EasyBroker y posibilitar paginación exacta (20, 50, 100) y filtros combinados instantáneos:

```sql
CREATE TABLE IF NOT EXISTS public.properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    easybroker_id VARCHAR(50) UNIQUE NOT NULL,
    public_id VARCHAR(50),
    title TEXT NOT NULL,
    description TEXT,
    property_type VARCHAR(100) NOT NULL, -- Casa, Terreno, Departamento, Bodega, etc.
    operation_type VARCHAR(50) NOT NULL,  -- sale, rent
    price NUMERIC(15, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'MXN',
    formatted_price VARCHAR(50),
    
    -- Ubicación y Zonas Facetadas
    city VARCHAR(100) DEFAULT 'Chihuahua',
    state VARCHAR(100) DEFAULT 'Chihuahua',
    zone VARCHAR(150),                    -- Distrito 1, San Felipe, Campestre, El Reliz, Aeropuerto, etc.
    address TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    
    -- Características
    bedrooms INT DEFAULT 0,
    bathrooms NUMERIC(4, 1) DEFAULT 0,
    parking_spaces INT DEFAULT 0,
    lot_size NUMERIC(12, 2) DEFAULT 0,
    construction_size NUMERIC(12, 2) DEFAULT 0,
    features JSONB DEFAULT '[]'::jsonb,   -- tags, amenidades
    
    -- Multimedia
    title_image_full TEXT,
    title_image_thumb TEXT,
    images JSONB DEFAULT '[]'::jsonb,     -- array de urls
    
    -- Agente y Contacto
    agent_id VARCHAR(50),
    agent_name VARCHAR(150),
    agent_phone VARCHAR(50),
    agent_email VARCHAR(150),
    
    -- Estado y Auditoría
    status VARCHAR(50) DEFAULT 'available',
    is_featured BOOLEAN DEFAULT false,
    synced_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices Críticos para Filtros y Paginación Instantánea
CREATE INDEX IF NOT EXISTS idx_properties_operation ON public.properties (operation_type);
CREATE INDEX IF NOT EXISTS idx_properties_type ON public.properties (property_type);
CREATE INDEX IF NOT EXISTS idx_properties_zone ON public.properties (zone);
CREATE INDEX IF NOT EXISTS idx_properties_price ON public.properties (price);
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties (status);
```

---

## 2. Paginación Dinámica (20, 50, 100) en SvelteKit

En los cargadores de ruta (`+page.server.ts` o endpoints `/api/properties`):
```typescript
import { supabase } from '$lib/supabaseClient';

export async function load({ url }) {
    const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
    const rawLimit = Number(url.searchParams.get('limit')) || 20;
    const limit = [20, 50, 100].includes(rawLimit) ? rawLimit : 20;
    const offset = (page - 1) * limit;

    const operation = url.searchParams.get('operation'); // sale, rent
    const propertyType = url.searchParams.get('type');
    const zone = url.searchParams.get('zone');
    const minPrice = Number(url.searchParams.get('minPrice')) || 0;
    const maxPrice = Number(url.searchParams.get('maxPrice')) || null;

    let query = supabase
        .from('properties')
        .select('*', { count: 'exact' })
        .eq('status', 'available')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (operation) query = query.eq('operation_type', operation);
    if (propertyType) query = query.eq('property_type', propertyType);
    if (zone) query = query.ilike('zone', `%${zone}%`);
    if (minPrice > 0) query = query.gte('price', minPrice);
    if (maxPrice) query = query.lte('price', maxPrice);

    const { data: properties, count, error } = await query;

    return {
        properties: properties || [],
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
    };
}
```

---

## 3. Sincronización Automática: Supabase Edge Function (`sync-easybroker`)

Una Edge Function en Supabase (`/supabase/functions/sync-easybroker/index.ts`) ejecutada periódicamente mediante un **Cron Trigger**:
1. Invoca el endpoint paginado de EasyBroker (`https://api.easybroker.com/v1/properties?limit=50&page=N`).
2. Itera hasta obtener todas las propiedades activas.
3. Realiza un `upsert` por `easybroker_id` en la tabla `properties`.
4. Marca como `archived` o elimina las que ya no figuren en EasyBroker.
5. Registra el timestamp `synced_at`.

---

## 4. Estrategia de Conversión y Funnels

### A. WhatsApp Directo Contextualizado
Cada botón "Me Interesa" o "Contactar Asesor" construye dinámicamente el enlace de WhatsApp:
```typescript
export function buildWhatsAppLink(property: {
    easybroker_id: string;
    title: string;
    formatted_price: string;
    phoneRaw?: string;
}) {
    const phone = property.phoneRaw || '526145404003';
    const text = `Hola MatchHome, me interesa la propiedad [${property.easybroker_id}] - ${property.title} (${property.formatted_price}). ¿Podrían darme más información?`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}
```

### B. Herramientas de Captura de Leads
- **Calculadora Hipotecaria:** Componente interactivo que calcula mensualidades estimadas con tasa y enganche configurables, ofreciendo al final un botón para precalificar crédito enviando los datos a WhatsApp/CRM.
- **Formulario "¿Quieres Vender Tu Propiedad?":** Captura de datos básicos (Nombre, WhatsApp, Zona, Tipo de propiedad) almacenados en la tabla `leads` de Supabase con notificación inmediata.

---

## 5. UI/UX: Zonas Clave de Chihuahua (Chips Ultraligeros)
En lugar de mapas pesados, proveer chips de acceso rápido en el Hero y barra de filtros:
- `Distrito 1 (D1)`
- `San Felipe`
- `Campestre`
- `El Reliz / Canteras`
- `Valle Escondido`
- `Aeropuerto / Juan Pablo II`
- `Zona Centro`
- `Sacramento`
