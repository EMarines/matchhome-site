# Plan de Arquitectura Multi-Tenant con SvelteKit y Firestore

Este documento describe la estrategia para convertir `MatchHomeSite` en una plataforma SaaS (Software as a Service) capaz de alojar múltiples inmobiliarias con identidad y datos independientes.

## 1. Estrategia de Base de Datos (Firestore)

Tenemos dos opciones principales. Debemos decidir cuál usar:

### Opción A: Aislamiento Lógico (Recomendada para empezar)
*   **Un solo proyecto de Firebase** para todos.
*   **Separación**: Cada documento tiene un campo `tenantId` o las colecciones están anidadas bajo `/tenants/{tenantId}/properties/...`.
*   **Ventajas**: Más barato, fácil de mantener, una sola autenticación.
*   **Desventajas**: Requiere reglas de seguridad estrictas para que la Empresa A no vea datos de la Empresa B.

### Opción B: Aislamiento Físico (Lo que mencionaste)
*   **Un proyecto de Firebase distinto** para cada cliente.
*   **Separación**: Total.
*   **Ventajas**: Aislamiento total de datos y facturación.
*   **Desventajas**: Complejidad técnica alta. Necesitamos gestionar N credenciales de servicio (Service Accounts).

*Asumiremos la **Opción B** para este plan, ya que mencionaste "cada una tendría su db", pero podemos simplificar a la A si lo prefieres.*

## 2. Gestión de Credenciales y Configuración

No podemos usar un solo `.env` para 50 clientes. Usaremos un enfoque híbrido:

1.  **Base de Datos Maestra (o Archivo Config)**:
    Una fuente de verdad que mapea dominios a configuraciones.
    ```json
    // tenants.json (o en una DB central)
    {
      "inmobiliaria-alpha.com": {
        "id": "alpha",
        "name": "Inmobiliaria Alpha",
        "firebaseConfig": { ...credenciales... },
        "theme": {
          "primaryColor": "#FF0000",
          "logoUrl": "/logos/alpha.png"
        }
      },
      "beta-realty.com": {
        "id": "beta",
        "firebaseConfig": { ...credenciales... },
        ...
      }
    }
    ```

2.  **Variables de Entorno (.env)**:
    Solo para la clave de encriptación de las credenciales de los clientes (si las guardamos en DB) o para la conexión a la DB Maestra.

## 3. Implementación en SvelteKit

### A. Identificación del Inquilino (Tenant)
Usaremos `src/hooks.server.js` para interceptar la petición.

```javascript
// Pseudocódigo hook
export async function handle({ event, resolve }) {
  const host = event.request.headers.get('host');
  
  // 1. Buscar configuración basada en el host
  const tenantConfig = await getTenantConfig(host);
  
  if (!tenantConfig) return new Response('Empresa no encontrada', { status: 404 });

  // 2. Inyectar en locals (disponible en toda la app)
  event.locals.tenant = tenantConfig;
  
  // 3. Inicializar Firebase Admin para este tenant si no existe
  event.locals.db = await getFirebaseInstance(tenantConfig.firebaseConfig);

  return resolve(event);
}
```

### B. Frontend Dinámico (Theming)
En `src/routes/+layout.server.js`, pasamos la configuración visual al cliente.

```javascript
export function load({ locals }) {
  return {
    theme: locals.tenant.theme,
    companyName: locals.tenant.name
  };
}
```

En `src/routes/+layout.svelte`, aplicamos las variables CSS dinámicamente:

```svelte
<script>
  export let data;
</script>

<div style="--color-primary: {data.theme.primaryColor}">
  <slot />
</div>
```

## 4. Pasos de Ejecución

1.  **Configurar Firebase**: Crear un proyecto de prueba y obtener las credenciales de servicio (`serviceAccountKey.json`).
2.  **Crear el "Tenant Store"**: Por ahora, un archivo `src/lib/config/tenants.js` que simule ser la DB maestra.
3.  **Implementar Hooks**: Crear `src/hooks.server.js` para la lógica de detección.
4.  **Conectar Firestore**: Crear un servicio que lea de Firestore usando las credenciales del tenant detectado.
5.  **Adaptar UI**: Hacer que el Header y Footer lean los datos del tenant (Logo, Colores).

---
**Pregunta para el usuario**: ¿Prefieres gestionar múltiples proyectos de Firebase (Opción B - más complejo, aislamiento total) o un solo proyecto con datos separados (Opción A - más rápido, gestión centralizada)?
