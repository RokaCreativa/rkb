# PLAN MAESTRO DEL PROYECTO ROKAMENU

## 📋 Índice
1. [Visión General](#visión-general)
2. [Estado Actual](#estado-actual)
3. [Plan de Implementación](#plan-de-implementación)
4. [Plan de Limpieza del Dashboard](#plan-de-limpieza-del-dashboard)
5. [Siguientes Pasos](#siguientes-pasos)
6. [Checklist de Progreso](#checklist-de-progreso)

---

## Visión General

RokaMenu es una plataforma de menús digitales que permite a restaurantes y otros negocios crear y gestionar menús accesibles mediante códigos QR. Este documento es la guía principal para el desarrollo, mantenimiento y evolución del proyecto.

### Objetivos Estratégicos

- Refactorizar el dashboard para mejorar mantenibilidad
- Centralizar lógica de negocio en hooks reutilizables
- Optimizar tiempos de carga inicial y rendering
- Mejorar la UX mediante feedback visual más consistente
- Implementar patrones de diseño modular y escalable

---

## Estado Actual

El proyecto se encuentra en fase de refactorización, con énfasis en:

- **Dashboard Principal**: Archivo `app/dashboard/page.tsx` con más de 2000 líneas
- **Hooks Centralizados**: En proceso de implementación (useCategories, useSections, useProducts)
- **Adaptadores**: Creados para compatibilidad entre diferentes sistemas de tipos
- **Handlers de Eventos**: Extraídos a `lib/handlers` para mejor organización

### Diagnóstico Técnico

El archivo `page.tsx` actualmente:
- Concentra múltiples responsabilidades (UI, lógica, estado, API calls)
- Tiene redundancia de código y componentes similares
- Presenta problemas de rendimiento por carga excesiva inicial
- Dificulta las pruebas unitarias por alto acoplamiento

---

## Plan de Implementación

### Fase 1: Extracción de Handlers de Eventos ✅
- [x] Crear handlers independientes para categorías
- [x] Crear handlers independientes para secciones
- [x] Crear handlers independientes para productos
- [x] Implementar manejo de errores consistente

### Fase 2: Optimización de Carga Inicial ✅
- [x] Implementar paginación en endpoint de categorías
- [x] Convertir carga eager a lazy para elementos no visibles
- [x] Reducir payload inicial de API
- [x] Implementar estrategia de carga progresiva

### Fase 3: Separación de Componentes Visuales ⏳
- [ ] Crear componentes de vista independientes
- [ ] Separar componentes de tabla
- [ ] Implementar sistema unificado de modales
- [ ] Aplicar patrón de Container/Presenter

### Fase 4: Implementación de Routing Interno ⏳
- [ ] Crear sistema de tabs con estado en URL
- [ ] Implementar navegación interna sin recarga
- [ ] Mantener estado entre navegaciones

### Fase 5: Extracción de Lógica de Datos ⏳
- [ ] Migrar funcionalidad a hooks especializados
- [ ] Implementar adaptadores para mantener compatibilidad
- [ ] Crear servicios para interacción con API

### Fase 6: Estado Global ⏳
- [ ] Evaluar implementación de Context API vs. Zustand
- [ ] Centralizar estado de UI
- [ ] Implementar sistema de notificaciones unificado

### Fase 7: Estrategia de Caché ⏳
- [ ] Implementar SWR o React-Query
- [ ] Definir políticas de invalidación de caché
- [ ] Optimizar refetching de datos

---

## Plan de Limpieza del Dashboard

### 📌 Objetivos Generales

- Dividir responsabilidades del archivo `page.tsx`
- Eliminar componentes duplicados y código obsoleto
- Centralizar hooks, tipos y utilidades
- Mantener la estructura actual del proyecto
- Documentar cada avance por fase

### 🧩 Fase 1: Análisis y Consolidación de Componentes [ ]

- [ ] Identificar y conservar los componentes más actualizados
- [ ] Eliminar duplicados en `components/tables/`, `app/components/`, `test-components/`
- [ ] Confirmar que se usan las versiones de `components/` y `app/dashboard/components/`
- [ ] Consolidar `CategoryTable.tsx`, `ProductTable.tsx`, `BaseModal.tsx` en sus versiones correctas

### 🧠 Fase 2: Extracción de Vistas desde `page.tsx` [ ]

- [ ] Crear archivo `DashboardView.tsx` como contenedor
- [ ] Dividir la lógica en:
  - [ ] `CategoryView.tsx`
  - [ ] `SectionView.tsx`
  - [ ] `ProductView.tsx`
  - [ ] `MobilePreview.tsx`
- [ ] Mover estos componentes a `components/dashboard/`

### 🧠 Fase 3: Organización y Consolidación de Hooks [ ]

- [ ] Crear `useDashboardState.ts` para centralizar navegación y estado global
- [ ] Consolidar hooks en `lib/hooks/` y eliminar `test-hooks/` si no se usan
- [ ] Reunificar hooks duplicados como:
  - [ ] `useCategoryManagement`
  - [ ] `useSectionManagement`
  - [ ] `useProductManagement`
  - [ ] `useToastNotifications`
- [ ] Documentar cada hook (parámetros, returns)

### 🧹 Fase 4: Limpieza de Librerías y Utilidades [ ]

- [ ] Consolidar `imageUtils.ts` y `tailwind.ts` en una única versión en `lib/utils/`
- [ ] Eliminar funciones duplicadas o no usadas en `lib/`
- [ ] Unificar y centralizar adaptadores en `lib/adapters/`

### 🧾 Fase 5: Tipos y Normalización de Interfaces [ ]

- [ ] Crear archivo central `lib/types/menu.ts`
- [ ] Usar `Category`, `Section`, `Product` desde allí en todo el proyecto
- [ ] Quitar declaraciones locales de tipos repetidos en componentes

### ✨ Fase 6: Refactor Visual y Rendimiento [ ]

- [ ] Implementar lazy loading en vistas pesadas
- [ ] Optimizar renderizado condicional
- [ ] Aplicar memoización y `React.memo` donde sea útil
- [ ] Revisión final de duplicados con consola limpia

### 📦 Resultado esperado del proyecto limpio

```txt
components/
├─ dashboard/
│  ├─ DashboardView.tsx
│  ├─ CategoryView.tsx
│  ├─ SectionView.tsx
│  ├─ ProductView.tsx
│  ├─ MobilePreview.tsx
├─ tables/
│  ├─ CategoryTable.tsx
│  ├─ ProductTable.tsx
├─ modals/
│  ├─ BaseModal.tsx
lib/
├─ hooks/
│  ├─ useDashboardState.ts
│  ├─ useCategoryActions.ts
│  ├─ useSectionActions.ts
│  ├─ useProductActions.ts
│  ├─ ui/useToastNotifications.ts
├─ types/
│  ├─ menu.ts
├─ utils/
│  ├─ imageUtils.ts
│  ├─ tailwind.ts
```

---

## Siguientes Pasos

1. **Prioridad Alta**: Completar la integración de `useCategories`
2. **Prioridad Alta**: Finalizar extracción de componentes visuales
3. **Prioridad Media**: Documentar patrones implementados
4. **Prioridad Media**: Crear pruebas para componentes clave
5. **Prioridad Baja**: Optimizar bundle size

---

## Checklist de Progreso

### Hooks Centralizados
- [x] useCategories (básico)
- [x] adaptadores para useCategories
- [ ] useSections
- [ ] useProducts
- [ ] useDashboardState

### Componentes Refactorizados
- [x] BaseModal
- [ ] CategoryTable
- [ ] SectionTable
- [ ] ProductTable
- [ ] DashboardView

### Optimizaciones
- [x] Paginación de categorías
- [x] Carga diferida de secciones
- [ ] Caché inteligente
- [ ] Bundle splitting

---

**Última actualización**: Marzo 2024
**Responsable**: Equipo de Desarrollo RokaMenu 