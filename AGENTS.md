# 📋 Directrices Operativas del Repositorio — MatchHomeSite

## 1. Identidad y Misión del Proyecto
Este repositorio (`matchhome-site`) contiene el portal web oficial y sistema de propuestas de **MatchHome Bienes Raíces** (`https://matchhome.vercel.app/`), desarrollado sobre **SvelteKit** y desplegado en **Vercel**.

---

## 2. Radiografía Técnica & Fuente de Datos
- **Stack:** SvelteKit + Tailwind CSS / Scoped CSS.
- **Base de Datos:** **Firebase Firestore** (Proyecto `matchhome-crm-46de4`).
  - `contacts`: Para datos de clientes y personalización de propuestas.
  - `properties`: Catálogo de inventario.
  - `$lib/data/inventory.json`: Fallback de inventario local.
- **Sin Dependencias Externas Innecesarias:** La app no requiere consultar APIs externas ni servicios de scraping; todo se lee y escribe contra Firebase y el servidor de SvelteKit.

---

## 3. Protocolo de Trabajo (Regla de Oro en 3 Fases)
1. **Fase 1 — Recepción y Diagnóstico:** Escuchar las mejoras que Enrique indique y aclarar dudas antes de tocar código.
2. **Fase 2 — Plan de Acción:** Presentar los archivos y componentes a modificar, esperando su orden explícita ("Proceder").
3. **Fase 3 — Ejecución y Respaldo:** Implementar, probar compilación (`npm run build`) y respaldar en GitHub.

---

## 4. Política de Respaldo Continuo en GitHub
- Todo cambio probado debe subirse inmediatamente al repositorio remoto:
  ```bash
  git add -A
  git commit -m "feat/fix: descripción técnica concisa"
  git push origin main
  ```
