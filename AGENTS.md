# 📋 Directrices Operativas del Repositorio — MatchHomeSite

## 1. Identidad y Misión del Proyecto
Este repositorio (`matchhome-site`) contiene el portal web oficial y sistema de catálogo público de **MatchHome Bienes Raíces** (`https://matchhome.vercel.app/`), desarrollado sobre **SvelteKit** y desplegado en **Vercel**. Su propósito es ofrecer una experiencia de usuario ultra-rápida, moderna y de alta conversión para compradores, arrendatarios y propietarios en Chihuahua.

---

## 2. Regla de Oro Inviolable (Protocolo de 3 Fases Estrictas)
> ⚠️ **MANDATO OBLIGATORIO:** Ningún agente o desarrollador puede escribir código, refactorizar componentes o modificar dependencias sin completar rigurosamente este ciclo:

1. **Fase 1 — Diagnóstico y Preguntas Obligatorias:**
   - Prohibido asumir o programar a ciegas.
   - Analizar el estado actual del repositorio, verificar dependencias y formular preguntas concisas (1 a la vez con viñetas) para resolver cualquier ambigüedad.
   - Esperar la respuesta y validación explícita de Enrique.
2. **Fase 2 — Plan de Acción y Aprobación:**
   - Presentar un plan de arquitectura detallado con archivos a modificar/crear y estrategia de verificación.
   - **Detener la ejecución** y esperar la orden explícita ("Proceder", "Adelante").
3. **Fase 3 — Ejecución Quirúrgica y Verificación:**
   - Implementar los cambios de forma atómica.
   - Ejecutar verificaciones (`npm run check`, `npm run build`).
   - Entregar reporte de cierre y registrar avances.

---

## 3. Principio Canónico de Honestidad Técnica Radical
- **Cero Complacencia:** Prohibido condescender o "dar por su lado" a Enrique.
- Si una implementación degrada el rendimiento, rompe la compatibilidad móvil, sobrepasa las cuotas de API de EasyBroker o genera deuda técnica, el agente debe manifestarlo con firmeza y datos técnicos.
- *"Cada proyecto es infinitamente más importante que el ego."*

---

## 4. Política de Respaldo Continuo en GitHub
- Todo hito completado y validado debe respaldarse de inmediato en el repositorio remoto:
  ```bash
  git add -A
  git commit -m "feat/fix: descripción técnica concisa"
  git push origin main
  ```
- No se da por cerrado ningún ticket o tarea sin el respectivo push confirmado en GitHub.

---

## 5. Estándares Técnicos del Stack
- **Framework:** Svelte / SvelteKit con SSR/prerender donde aplique.
- **Estilos:** Tailwind CSS con componentes semánticos y tokens de color oficiales (`primary: #0056b3`, `secondary: #c5a059`).
- **Persistencia & API:** Supabase (PostgreSQL) para catálogo sincronizado y consultas paginadas (`LIMIT 20/50/100`).
- **Sincronización:** Supabase Edge Function programada para ingesta periódica desde EasyBroker API.
- **Rendimiento Móvil:** Prohibido incluir librerías pesadas de mapas en la vista de lista principal; privilegiar filtros rápidos por chips de zonas/colonias.
