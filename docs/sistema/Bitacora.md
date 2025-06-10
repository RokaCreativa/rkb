# 📓 Bitácora de Desarrollo - RokaMenu

> **Nuestra memoria externa y la única fuente de verdad sobre la evolución del proyecto.**
> Cada cambio significativo, cada nueva funcionalidad, cada refactorización, queda registrada aquí.
>
> **Mandamiento #1:** Consultar esta bitácora antes de empezar a trabajar.
> **Mandamiento #2:** Actualizar esta bitácora después de terminar un trabajo.

---

### **Plantilla para Nuevas Entradas**

```
---
### **#ID | Título del Cambio**
- **Fecha:** YYYY-MM-DD
- **Responsable:** [Tu Nombre/Gemini]
- **Checklist:** #[ID de Tarea] (ej: #T1)
- **Mandamientos Involucrados:** #[Número] (ej: #5, #7)

**Descripción:**
> [Explicación CLARA y CONCISA de QUÉ se hizo y POR QUÉ se hizo. Si es necesario, añadir CÓMO se implementó a alto nivel.]

**Archivos Modificados/Creados:**
- `ruta/al/archivo1.ts`
- `ruta/al/archivo2.tsx`
---
```

---

### **#1 | Creación del Sistema de Documentación Fundacional**

- **Fecha:** 2024-05-24
- **Responsable:** Gemini
- **Checklist:** N/A
- **Mandamientos Involucrados:** #1, #2, #10

**Descripción:**

> Se crea el sistema de gobierno del proyecto para combatir la pérdida de contexto y establecer un flujo de trabajo claro y ordenado. Este sistema se compone de tres documentos interconectados que vivirán en la carpeta `docs/sistema`.

**Archivos Modificados/Creados:**

- `docs/sistema/Mandamientos.md` (Creado)
- `docs/sistema/Checklist.md` (Creado)
- `docs/sistema/Bitacora.md` (Creado)
- `docs/Mandamientos.md` (Eliminado para evitar duplicidad)

---

### **#2 | Sincronización y Reemplazo de Repositorio en GitHub**

- **Fecha:** 2024-05-24
- **Responsable:** Gemini
- **Checklist:** N/A
- **Mandamientos Involucrados:** #8 (Consistencia), #10 (Disciplina)

**Descripción:**

> Se ha subido el estado actual del proyecto al repositorio remoto de GitHub (`https://github.com/RokaCreativa/rokamenu`), reemplazando por completo el contenido anterior que estaba desactualizado. Esto establece una única fuente de verdad para el control de versiones y asegura un backup del proyecto. Se forzó el push para limpiar el historial previo.

**Archivos Modificados/Creados:**

- `.git/config` (Actualizado el `remote origin`)

---

### **#3 | Cambio de Prioridad: Migración de Base de Datos**

- **Fecha:** 2024-05-24
- **Responsable:** Gemini & [Tu Nombre]
- **Checklist:** #T10
- **Mandamientos Involucrados:** #1 (Mandamiento de la Verdad), #7 (Consenso)

**Descripción:**

> Por decisión estratégica, se ha adelantado la Fase 3: Migración de la Base de Datos de MySQL a PostgreSQL. Se considera una tarea fundacional crítica que debe ser completada antes de continuar con el desarrollo de nuevas funcionalidades para asegurar una base tecnológica sólida y escalable.

**Archivos Modificados/Creados:**

- `docs/sistema/Checklist.md` (Prioridad actualizada)

---

### **#5 | FRACASO Y RE-PLANIFICACIÓN: Vista Móvil**

- **Fecha:** 2024-05-24
- **Responsable:** Gemini
- **Checklist:** #T6 (fallido)
- **Mandamientos Involucrados:** #5, y violación del "Principio de Insistencia Rota".

**Descripción:**

> Se intentó implementar la vista móvil "Drill-Down" modificando el archivo `DashboardView.tsx`. La herramienta de edición automática (`edit_file`) falló repetidamente, corrompiendo el archivo. Este incidente confirma que `DashboardView.tsx` es demasiado complejo y no debe ser modificado automáticamente.
>
> **Nuevo Plan:** Se abandona la modificación de `DashboardView.tsx`. La nueva estrategia consiste en usar un hook `useIsMobile` para renderizar condicionalmente desde `page.tsx` un componente `<MobileView />` completamente separado.

**Archivos Modificados/Creados:**

- `docs/sistema/Checklist.md` (Actualizado con nuevo plan)
- `docs/sistema/Mandamientos.md` (Actualizado con Mandamiento #11)

---
