# Los Mandamientos de la Refactorización 📜

> "No tocarás el código original, ni harás daño a la funcionalidad existente"
> "Conocerás lo que existe antes de crear algo nuevo"

## 🎯 Objetivo Principal

- **NO TOCARÁS** el dashboard original
- Refactorizar = Reorganizar código existente
- Mantener EXACTAMENTE la misma funcionalidad
- Aplicar patrones modernos SIN sobre-ingenierizar
- Implementar arquitectura limpia
- **VERIFICAR LA ESTRUCTURA EXISTENTE** antes de crear cualquier componente nuevo
- **PROHIBIDO USAR COMPONENTES DEL DASHBOARD ORIGINAL**
  - Si necesitas un componente similar, cópialo y adáptalo en dashboard-v2
  - Mantén total separación entre las dos implementaciones
  - No mezclar importaciones entre dashboard y dashboard-v2

## 🚫 MANDAMIENTO SUPREMO: RESPETARÁS LA REFACTORIZACIÓN REALIZADA

- **NUNCA volverás a mezclar responsabilidades que han sido separadas**
- Honrarás la estructura de carpetas establecida:
  - Modales en `dashboard-v2/components/modals/`
  - Componentes de vista en `dashboard-v2/components/views/`
  - Hooks específicos en `dashboard-v2/hooks/`
  - Tipos en `dashboard-v2/types/`
  - Utilidades en `dashboard-v2/utils/`
- Preservarás la separación de responsabilidades:
  - Hooks por dominio: useCategoryManagement, useSectionManagement, useProductManagement
  - useDashboardState como fachada para coordinar los hooks de dominio
  - Componentes visuales solo para renderizado y eventos
- Mantendrás la documentación actualizada
- Conservarás las optimizaciones implementadas:
  - Virtualización para listas largas
  - Lazy loading para carga de datos
  - Memoización en componentes pesados
  - Utilidades de rendimiento (debounce, throttle, cache)
- **TODA NUEVA FUNCIONALIDAD** debe seguir los mismos patrones establecidos
- Consultarás los archivos de documentación antes de hacer cambios:
  - `docs/dashboard-v2-modelo-datos.md`
  - `docs/dashboard-v2-optimizaciones.md`
  - `docs/estructura-dashboard-v2.md`
  - `docs/mandamiento-verificacion-estructural.md`
  - `RokaMenu_Refactor_Checklist_dashboard-v2.md`

## 📋 MANDAMIENTO CRÍTICO: CONOCERÁS LA ESTRUCTURA ANTES DE CREAR

- **SIEMPRE VERIFICARÁS lo que ya existe antes de crear cualquier nuevo componente o archivo**
- Consultarás el siguiente mapa de estructura regularmente para evitar duplicidades:
  ```
  app/dashboard-v2/
  ├── api/                  # APIs y endpoints
  │   └── categories/
  │       └── reorder/      # API para reordenar categorías
  ├── components/           # Componentes UI
  │   ├── actions/          # Componentes para acciones
  │   ├── hooks/            # Hooks específicos de componentes
  │   │   └── useTogglePreview.ts
  │   ├── layout/           # Componentes de layout
  │   ├── modals/           # Ventanas modales
  │   │   ├── buttons/
  │   │   ├── FormModal.tsx, DeleteModal.tsx, BaseModal.tsx
  │   │   ├── NewCategoryModal.tsx, EditCategoryModal.tsx
  │   │   ├── NewSectionModal.tsx, EditSectionModal.tsx
  │   │   ├── NewProductModal.tsx, EditProductModal.tsx
  │   │   └── DeleteCategoryModal.tsx, DeleteSectionModal.tsx, DeleteProductModal.tsx
  │   ├── sections/         # Componentes de secciones
  │   │   ├── SectionList.tsx
  │   │   ├── SectionListItem.tsx
  │   │   ├── ProductList.tsx
  │   │   └── ProductListItem.tsx
  │   ├── ui/               # Componentes UI reutilizables
  │   │   ├── VirtualizedList.tsx
  │   │   ├── Loader.tsx
  │   │   └── SuccessMessage.tsx
  │   ├── views/            # Vistas principales
  │   │   ├── CategoryView.tsx
  │   │   ├── SectionView.tsx
  │   │   ├── ProductView.tsx
  │   │   └── OptimizedCategoryView.tsx
  │   ├── CategoryList.tsx
  │   ├── DashboardView.tsx
  │   ├── TopNavbar.tsx
  │   └── Breadcrumbs.tsx
  ├── hooks/                # Hooks globales
  │   ├── useCategoryManagement.ts
  │   ├── useSectionManagement.ts
  │   ├── useProductManagement.ts
  │   ├── useDashboardState.ts
  │   ├── useViewState.tsx
  │   ├── useModalState.tsx
  │   └── useVirtualizedList.ts
  ├── styles/               # Estilos
  │   ├── dashboard.css
  │   ├── theme.css
  │   └── typography.css
  ├── types/                # Tipos centralizados
  │   ├── index.ts
  │   └── dashboard.ts
  └── utils/                # Utilidades
      ├── performance.ts
      ├── dashboardHelpers.tsx
      └── imageUtils.ts
  ```
- Verificarás cada subdirectorio relevante para entender qué componentes ya existen
- Buscarás archivos similares antes de crear nuevos para evitar duplicados
- Documentarás cualquier componente nuevo en `docs/estructura-dashboard-v2.md`
- **NUNCA CREARÁS duplicados accidentales** por falta de conocimiento de la estructura existente
- Antes de implementar algo nuevo, preguntarás: "¿Existe ya algo que cumpla esta función?"
- Revisarás los hooks existentes para reutilizarlos en lugar de crear nuevos con funciones similares
- Consultarás la jerarquía de componentes para seguir patrones consistentes
- Utilizarás `codebase_search` y `list_dir` para explorar exhaustivamente antes de crear
- SIEMPRE consultarás `docs/estructura-dashboard-v2.md` para entender la estructura de datos y componentes

## 📚 Buenas Prácticas de Programación

- Implementar principios SOLID
- Separación clara de responsabilidades
- Sistema de manejo de estado eficiente
- Manejo de errores robusto
- Testing sistemático (unitario y de integración)
- Documentar el codigo de manera detallada (como para dummies)

## 🔒 MANDAMIENTO CRÍTICO: Validación de Acceso

- **IMPLEMENTARÁS verificación de roles en cada punto de entrada**
- Mantener redirecciones a /unauthorized cuando un usuario no tenga permisos
- Validar roles tanto en el cliente como en el servidor
- Mantener consistencia en los mensajes de error de acceso
- Documentar claramente los requisitos de acceso para cada sección
- Implementar pruebas de acceso para cada rol
- Asegurar que la redirección sea inmediata y clara
- Proporcionar retroalimentación específica sobre los permisos faltantes
- Mantener actualizados los requisitos de acceso según evolucione la aplicación
- Verificar periódicamente que las restricciones de acceso funcionen correctamente

## 📋 MANDAMIENTO CRÍTICO: Verificación Estructural

- **SIEMPRE VERIFICARÁS** la estructura existente antes de crear algo nuevo
- Consultar `docs/mandamiento-verificacion-estructural.md` para el mapa estructural completo
- Revisar directorios y archivos existentes usando `list_dir` y `codebase_search`
- Nunca crear duplicados accidentales por desconocimiento
- Verificar hooks existentes antes de crear nuevos
- Estudiar la nomenclatura y patrones establecidos
- Seguir el procedimiento de verificación documentado:
  - Consultar documentación actualizada
  - Explorar directorios relevantes
  - Buscar elementos similares
  - Comprobar hooks y utilidades disponibles
  - Validar que la ubicación y nomenclatura son consistentes
- Hacerte las preguntas clave:
  - ¿Existe algo similar?
  - ¿Puedo reutilizar o adaptar algo existente?
  - ¿La estructura propuesta es coherente?
- Documentar cualquier adición en `docs/estructura-dashboard-v2.md`

## 🚀 Escalabilidad Real

- Arquitectura que permita crecimiento
- Código modular y reutilizable
- Patrones consistentes
- Fácil de extender sin modificar
