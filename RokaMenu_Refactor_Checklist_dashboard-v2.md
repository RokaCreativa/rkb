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
- ✅ Dividir useDataState en:
  - ✅ useCategoryManagement.ts
  - ✅ useSectionManagement.ts
  - ✅ useProductManagement.ts
  - ⬜️ useVisibilityManagement.ts (Se integraron las funciones de visibilidad en los hooks correspondientes)
- ✅ Actualizar useDashboardState.ts para utilizar los nuevos hooks
- ⬜️ Crear hooks adicionales según se necesite

**Estado actual**: Los hooks por dominio han sido creados y están funcionando correctamente.

## Fase 4: Limpieza de page.tsx
- ✅ Asegurar que page.tsx solo contenga:
  - ✅ Metadatos
  - ✅ Validación de roles
  - ✅ Renderizado de DashboardView
  - ✅ Providers necesarios

**Estado actual**: El archivo page.tsx ha sido simplificado para contener solo lo esencial.

## Fase 5: Normalización de Modelo de Datos
- ✅ Crear archivo de tipos específicos para el dashboard
  - ✅ ViewType
  - ✅ InteractionMode
  - ✅ LoadingState
  - ✅ ExpansionState
  - ✅ SelectionState
- ✅ Consolidar tipos e interfaces restantes
  - ✅ Crear archivo centralizado app/dashboard-v2/types/index.ts
  - ✅ Normalizar nombres y estructuras
  - ✅ Exportar interfaces de componentes
- ✅ Documentar el modelo de datos
  - ✅ Crear archivo docs/dashboard-v2-modelo-datos.md
  - ✅ Describir entidades principales y sus relaciones
  - ✅ Explicar estados y flujo de datos
- ✅ Asegurar consistencia en la nomenclatura

**Estado actual**: Se ha creado un archivo centralizado con todos los tipos e interfaces utilizados en el dashboard, asegurando consistencia en la nomenclatura. Además, se ha documentado completamente el modelo de datos en un archivo dedicado.

## Fase 6: Validación de Roles
- ✅ Implementar verificación de roles
- ✅ Crear página de acceso no autorizado (/unauthorized)
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
- Los hooks de estado han sido divididos por dominio siguiendo el patrón de separación de responsabilidades:
  - useCategoryManagement.ts para la gestión de categorías
  - useSectionManagement.ts para la gestión de secciones
  - useProductManagement.ts para la gestión de productos
  - El hook useDashboardState.ts ahora actúa como fachada, combinando todos los hooks anteriores
- El archivo page.tsx ha sido mejorado para incluir metadatos apropiados y validación de roles, manteniendo una estructura limpia y enfocada.
- Se ha implementado verificación básica de roles para restringir el acceso al dashboard.
- Se ha creado un archivo de tipos específicos para el dashboard, definiendo ViewType, InteractionMode y otros tipos necesarios.
- Se ha consolidado todos los tipos e interfaces en un archivo centralizado app/dashboard-v2/types/index.ts, asegurando consistencia en la nomenclatura.
- Se ha documentado completamente el modelo de datos en docs/dashboard-v2-modelo-datos.md, explicando las entidades, relaciones, estados y flujo de datos.
- Se ha creado una página de acceso no autorizado en /unauthorized para manejar los casos en que un usuario intenta acceder sin los permisos adecuados.
- La estructura del proyecto está bien organizada, facilitando el mantenimiento y la escalabilidad.

**Próximos pasos**: Finalizar las pruebas de acceso por rol y revisar el rendimiento general de la aplicación.