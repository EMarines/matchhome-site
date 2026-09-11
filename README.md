# 🏠 MatchHome Web — Portal Inmobiliario & Sistema de Catálogo

Portal web oficial de **MatchHome Bienes Raíces** en Chihuahua, México (`https://matchhome.vercel.app/`).

---

## 🏗️ Arquitectura del Sistema

- **Frontend:** SvelteKit + Tailwind CSS.
- **Base de Datos & Catálogo:** Supabase (PostgreSQL) con paginación nativa exacta (20, 50, 100) y filtros facetados indexados.
- **Sincronización:** Supabase Edge Function programada (`cron`) que consume la API de EasyBroker en lotes y realiza `upsert` continuo en la base de datos.
- **Funnels de Conversión:**
  - WhatsApp directo contextualizado por ficha de propiedad.
  - Calculadora interactiva de crédito hipotecario.
  - Formulario de consignación y captación para propietarios.
- **Despliegue:** Vercel con integración continua (`origin/main`).

---

## 🚀 Variables de Entorno Requeridas (`.env`)

```env
# Supabase
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# EasyBroker API (utilizado por Edge Functions)
EASYBROKER_API_KEY=your_easybroker_api_key

# Configuración de Tenant / MatchHome
PUBLIC_TENANT_NAME="MatchHome"
PUBLIC_TENANT_PHONE="614 540 4003"
PUBLIC_TENANT_PHONE_RAW="526145404003"
PUBLIC_TENANT_EMAIL="matchhomebr@gmail.com"
```

---

## 🛠️ Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Verificación de tipos y formato
npm run check

# Compilación para producción
npm run build
```

---

## 📜 Gobernanza del Repositorio
Consulta [AGENTS.md](AGENTS.md) para las reglas operativas, el protocolo de 3 fases estrictas y la política de respaldo continuo en GitHub. Para orquestar nuevas características con agentes de IA, utiliza [PROMPT_MAESTRO.md](PROMPT_MAESTRO.md).
