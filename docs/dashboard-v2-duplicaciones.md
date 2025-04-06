# Informe de Duplicaciones en dashboard-v2

**Fecha**: abril 2024  
**Autor**: Claude AI  
**Versión**: 1.0

## 🔍 Resumen Ejecutivo

Tras realizar una revisión profunda del código en el directorio `app/dashboard-v2`, se han identificado varias duplicaciones que contravienen los mandamientos de refactorización establecidos. Este informe detalla cada duplicación encontrada, su impacto en el proyecto y las soluciones recomendadas.

## 🚨 Duplicaciones Críticas

### 1. Hook `useDashboard`

Se encontró el hook `useDashboard` definido en **tres lugares diferentes**:

1. **app/dashboard-v2/components/DashboardProvider.tsx** (líneas 24-35)
2. **app/dashboard-v2/components/DashboardContext.tsx** (líneas 30-42)
3. **app/dashboard-v2/components/DashboardState.tsx** (líneas 10-17)

Esta es una violación grave del mandamiento "No duplicarás interfaces, tipos o componentes que ya existen". Cada implementación proporciona una funcionalidad similar pero con pequeñas diferencias, lo que puede causar comportamientos inconsistentes.

**Solución recomendada:**

- Mantener solo la implementación en `DashboardProvider.tsx`
- Eliminar los archivos `DashboardContext.tsx` y `DashboardState.tsx` si no contienen otra lógica necesaria
- Actualizar todas las importaciones para usar la implementación única

### 2. Componente `FloatingPhonePreview`

El componente `FloatingPhonePreview` aparece en dos ubicaciones:

1. **app/dashboard-v2/components/views/FloatingPhonePreview.tsx** (428 líneas)
2. **app/dashboard-v2/components/FloatingPhonePreview.tsx** (294 líneas)

Estos componentes tienen funcionalidades similares pero implementaciones ligeramente diferentes. Además, el componente en la ruta `views/` sigue el mandamiento de ubicar todos los componentes de vista en ese directorio, mientras que la otra versión viola este mandamiento.

**Solución recomendada:**

- Mantener solo la versión en `components/views/`
- Eliminar la versión en `components/`
- Actualizar todas las referencias para usar la versión en `views/`

### 3. Lógica de Drag & Drop duplicada

Se encontró código similar para manejar operaciones de drag & drop en:

1. **app/dashboard-v2/components/DashboardView.tsx** (funciones de arrastrar y soltar)
2. **app/dashboard-v2/components/CategorySections.tsx** (lógica similar)
3. **app/dashboard-v2/components/CategoryTable.tsx** (implementación paralela)
4. **app/dashboard-v2/components/ProductTable.tsx** (código duplicado)

Estas implementaciones podrían consolidarse en un hook personalizado o un servicio centralizado.

**Solución recomendada:**

- Crear un nuevo hook `useDragAndDrop.ts` en el directorio `hooks/`
- Extraer la lógica común a este hook
- Refactorizar los componentes para usar este hook centralizado

## 🔔 Otras Duplicaciones

### 1. Múltiples contextos de Dashboard

Además del hook `useDashboard` duplicado, existen varios archivos que crean contextos para el dashboard:

1. **app/dashboard-v2/components/DashboardProvider.tsx**
2. **app/dashboard-v2/components/DashboardContext.tsx**
3. **app/dashboard-v2/components/DashboardState.tsx**

**Solución recomendada:**

- Estandarizar un único patrón de Provider/Context
- Eliminar los archivos redundantes
- Seguir un enfoque basado en composición para extender la funcionalidad cuando sea necesario

### 2. Servicios de Dashboard duplicados

Existen implementaciones similares para servicios de dashboard:

1. **app/lib/services/dashboardService.ts**
2. Funciones similares dispersas en varios hooks como `useCategoryManagement.ts`, `useSectionManagement.ts`, etc.

**Solución recomendada:**

- Centralizar todas las operaciones de API en `dashboardService.ts`
- Refactorizar los hooks para utilizar este servicio centralizado
- Seguir un patrón consistente para todas las operaciones CRUD

### 3. Componentes de navegación duplicados

Existen múltiples componentes que manejan la navegación y las breadcrumbs:

1. Lógica de navegación en `DashboardView.tsx`
2. Componente `Breadcrumbs.tsx`
3. Lógica similar en varias vistas

**Solución recomendada:**

- Centralizar la lógica de navegación en un hook separado
- Hacer que Breadcrumbs consuma este hook
- Estandarizar el patrón de navegación en todas las vistas

## 📊 Impacto en el Rendimiento y Mantenibilidad

Las duplicaciones identificadas tienen varios impactos negativos:

1. **Tamaño del bundle**: Código duplicado aumenta el tamaño de la aplicación
2. **Inconsistencias**: Diferentes implementaciones pueden tener comportamientos inconsistentes
3. **Dificultad de mantenimiento**: Cambios deben aplicarse en múltiples lugares
4. **Confusión para desarrolladores**: No queda claro qué implementación usar

## 🛠️ Plan de Acción

### Prioridad Alta (Inmediata)

1. Eliminar `app/dashboard-v2/components/FloatingPhonePreview.tsx` y mantener solo la versión en `views/`
2. Consolidar el hook `useDashboard` en una única implementación
3. Eliminar los archivos de contexto duplicados

### Prioridad Media (Próxima iteración)

1. Crear un hook centralizado para operaciones de drag & drop
2. Refactorizar los componentes para usar este hook
3. Centralizar operaciones de API en `dashboardService.ts`

### Prioridad Baja (Futuras mejoras)

1. Revisar y consolidar estilos duplicados
2. Mejorar la documentación para prevenir futuras duplicaciones
3. Implementar linting específico para detectar duplicaciones

## 📝 Conclusión

Las duplicaciones identificadas en el código de `dashboard-v2` representan desviaciones significativas de los mandamientos de refactorización establecidos. Abordar estas duplicaciones no solo mejorará la calidad del código, sino que también facilitará el mantenimiento futuro y reducirá la probabilidad de errores causados por implementaciones inconsistentes.

Siguiendo el plan de acción propuesto, el equipo podrá resolver estas duplicaciones de manera sistemática, priorizando las más críticas y trabajando hacia una base de código más limpia y mantenible.

---

## Anexo: Lista completa de archivos a eliminar o consolidar

1. `app/dashboard-v2/components/DashboardContext.tsx` - Consolidar en DashboardProvider
2. `app/dashboard-v2/components/DashboardState.tsx` - Consolidar en DashboardProvider
3. `app/dashboard-v2/components/FloatingPhonePreview.tsx` - Eliminar, usar la versión en views/
