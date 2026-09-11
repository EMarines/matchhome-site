# 📋 Directrices Operativas del Repositorio — MatchHomeSite

## 1. Identidad y Misión del Proyecto
Este repositorio (`matchhome-site`) contiene el portal web oficial y el sistema de **Propuestas Inmobiliarias Personalizadas** de **MatchHome Bienes Raíces** (`https://matchhome.vercel.app/`), desarrollado sobre **SvelteKit** y desplegado en **Vercel**.

---

## 2. Regla Fundamental de Datos: Solo Firebase Firestore
- **Cero EasyBroker:** La aplicación **NO** debe consultar EasyBroker en tiempo real ni implementar webhooks/scrapers.
- **Fuente de Verdad:** Toda la información proviene de **Firebase Firestore (`matchhome-crm-46de4`)**:
  - `contacts`: Datos del cliente (nombre, teléfono, correo) para personalizar `/propuesta/[id]?c=contact_id`.
  - `properties`: Catálogo de inventario para alimentar la casa ancla, las propiedades sugeridas y el catálogo público.
- **Respaldo Local:** Si Firestore no está conectado en local, se utiliza `inventory.json` como fallback seguro.

---

## 3. Regla de Oro Inviolable (3 Fases Estrictas)
1. **Fase 1 — Diagnóstico y Preguntas Obligatorias:** Validar supuestos, credenciales de Firebase en `.env` y resolver dudas antes de codificar.
2. **Fase 2 — Plan de Acción y Aprobación:** Presentar el plan paso a paso y esperar confirmación explícita ("Proceder").
3. **Fase 3 — Ejecución Quirúrgica y Verificación:** Desarrollar, probar compilación (`npm run build`) y verificar que las rutas `/propuesta/[id]` y `/propiedades` funcionen impecablemente.

---

## 4. Política de Respaldo Continuo en GitHub
- Todo cambio probado debe subirse inmediatamente:
  ```bash
  git add -A
  git commit -m "feat/fix: descripción clara"
  git push origin main
  ```

---

## 5. Estándares Técnicos
- **Framework:** SvelteKit + Tailwind CSS.
- **Paginación:** Selector visible en catálogo para mostrar 20, 50 o 100 propiedades.
- **Filtros:** Chips facetados por zonas de Chihuahua (Distrito 1, San Felipe, Campestre, El Reliz, Aeropuerto, etc.).
- **Conversión:** WhatsApp contextualizado con la clave y título de la propiedad compartida.
