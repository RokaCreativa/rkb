# RokaMenu Dashboard V2 - Checklist de Refactorización

## Fase 1: Estructura de Archivos Inicial
- ✅ Limpieza inicial de `page.tsx` (borrar código comentado, simplificar)
- ✅ Crear archivo DashboardView.tsx como componente principal
- ✅ Crear carpeta dashboard-v2/components/modals/
- ✅ Extraer modales:
  - ✅ NewCategoryModal.tsx
  - ✅ EditCategoryModal.tsx
  - ✅ DeleteCategoryModal.tsx
  - ✅ NewSectionModal.tsx
  - ✅ EditSectionModal.tsx
  - ✅ DeleteSectionModal.tsx
  - ✅ NewProductModal.tsx
  - ✅ EditProductModal.tsx
  - ✅ DeleteProductModal.tsx
  - ✅ ProductVisibilityToggleModal.tsx (No es necesario, la visibilidad se maneja con funciones directas)
- ✅ Crear hooks para la gestión de estado
  - ✅ Carpeta dashboard-v2/hooks/ (ya existe, no fue necesario crearla)
  - ✅ useDashboardState.ts (ya existe, pero necesitará actualizaciones)
- ✅ Verificar props y callbacks desde DashboardView

**Estado actual**: Todas las modales han sido extraídas a sus respectivos archivos en el directorio dashboard-v2/components/modals/.

## Fase 2: Componentes Visuales por Dominio
- ✅ Crear carpeta dashboard-v2/components/views/
- ✅ Extraer bloques funcionales:
  - ✅ CategoryView.tsx
  - ✅ SectionView.tsx
  - ✅ ProductView.tsx
  - ✅ MobilePreview.tsx
- ✅ Refactorizar breadcrumbs y navegación
  - ✅ Crear componente Breadcrumbs.tsx
  - ✅ Crear tipos en dashboard-v2/types/dashboard.ts
- ✅ Ajustar DashboardView para utilizar los nuevos componentes
- ✅ Verificar props y callbacks

**Estado actual**: DashboardView ha sido refactorizado para utilizar los componentes visuales por dominio.

## Fase 3: Domain Hooks
- ⬜️ Dividir useDataState en:
  - ⬜️ useCategoryManagement.ts
  - ⬜️ useSectionManagement.ts
  - ⬜️ useProductManagement.ts
  - ⬜️ useVisibilityManagement.ts
- ⬜️ Crear hooks adicionales según se necesite

## Fase 4: Limpieza de page.tsx
- ⬜️ Asegurar que page.tsx solo contenga:
  - ⬜️ Metadatos
  - ⬜️ Validación de roles
  - ⬜️ Renderizado de DashboardView
  - ⬜️ Providers necesarios

## Fase 5: Normalización de Modelo de Datos
- ✅ Crear archivo de tipos específicos para el dashboard
  - ✅ ViewType
  - ✅ InteractionMode
  - ✅ LoadingState
  - ✅ ExpansionState
  - ✅ SelectionState
- ⬜️ Consolidar tipos y interfaces restantes
- ⬜️ Documentar el modelo de datos
- ⬜️ Asegurar consistencia en la nomenclatura

## Fase 6: Validación de Roles
- ⬜️ Implementar verificación de roles
- ⬜️ Pruebas de acceso por rol

## Fase 7: Revisión Final
- ⬜️ Revisión de code splitting
- ⬜️ Optimización de rendimiento
- ⬜️ Actualización de documentación

---

## Estado del Refactor (2024-06-13)

- La limpieza inicial de `page.tsx` se ha completado, moviendo la lógica a `DashboardView.tsx`.
- Se ha creado una estructura de carpetas para organizar el proyecto.
- Todos los modales han sido extraídos a archivos individuales en `dashboard-v2/components/modals/`, incluyendo los modales de confirmación para eliminar categorías, secciones y productos.
- Se han creado los componentes visuales por dominio en `dashboard-v2/components/views/`:
  - CategoryView para la gestión y visualización de categorías
  - SectionView para la gestión y visualización de secciones dentro de una categoría
  - ProductView para la gestión y visualización de productos dentro de una sección
  - MobilePreview para la visualización del menú en formato móvil
  - Breadcrumbs para la navegación entre vistas
- DashboardView ha sido refactorizado para utilizar estos nuevos componentes visuales, mejorando la modularidad y mantenibilidad del código.
- Se ha creado un archivo de tipos específicos para el dashboard, definiendo ViewType, InteractionMode y otros tipos necesarios.
- La estructura del proyecto está tomando forma, facilitando la refactorización.
- El siguiente paso es dividir el hook useDataState en hooks más específicos por dominio.

**Próximos pasos**: Dividir los hooks de datos por dominio para una mejor separación de responsabilidades.