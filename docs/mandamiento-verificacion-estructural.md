# 📋 MANDAMIENTO DE VERIFICACIÓN ESTRUCTURAL

> "Conocerás lo que existe antes de crear algo nuevo"

## 🔍 Propósito

Este mandamiento establece la obligación absoluta de verificar la estructura existente del proyecto antes de crear cualquier nuevo componente, hook, utilidad o archivo. Su propósito es prevenir duplicidades accidentales, mantener la coherencia arquitectónica y asegurar que todo desarrollo se alinee con los patrones establecidos.

## 📑 Reglas Esenciales

1. **SIEMPRE VERIFICARÁS** la estructura existente antes de crear nuevos elementos
2. **NUNCA CREARÁS** duplicados por desconocimiento de lo que ya existe
3. **CONSULTARÁS** regularmente la documentación de estructura
4. **EXPLORARÁS** el código base utilizando herramientas de búsqueda
5. **DOCUMENTARÁS** cualquier adición a la estructura

## 🗺️ Mapa Estructural del Dashboard v2

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
│   ├── animations.css
│   ├── typography.css
│   └── grids.css        # Estilos de grids (categorías, secciones, productos)
├── types/                # Tipos centralizados
│   ├── index.ts
│   └── dashboard.ts
└── utils/                # Utilidades
    ├── performance.ts
    ├── dashboardHelpers.tsx
    └── imageUtils.ts
```

## 📝 Procedimiento de Verificación

Antes de crear cualquier elemento nuevo, seguirás este procedimiento:

1. **Consultar documentación**:

   - Revisar `docs/estructura-dashboard-v2.md` para entender la estructura completa
   - Verificar `docs/dashboard-v2-modelo-datos.md` para comprender el modelo de datos
   - Examinar `docs/dashboard-v2-optimizaciones.md` para conocer las optimizaciones

2. **Explorar directorios relacionados**:

   - Utilizar `list_dir` para explorar las carpetas relevantes
   - Verificar qué archivos y componentes ya existen
   - Entender la organización y convenciones de nomenclatura

3. **Buscar elementos similares**:

   - Usar `codebase_search` para encontrar componentes o utilidades similares
   - Verificar si ya existe algún elemento que pueda ser reutilizado o adaptado
   - Examinar cómo están implementados los elementos similares

4. **Comprobar hooks existentes**:

   - Revisar `/hooks` y `/components/hooks` en busca de hooks que puedan ser reutilizados
   - Entender la separación entre hooks globales y hooks específicos de componentes
   - Verificar si la funcionalidad necesaria ya está implementada en algún hook

5. **Validar nomenclatura y ubicación**:
   - Asegurar que el nombre del nuevo elemento sigue las convenciones establecidas
   - Verificar que la ubicación propuesta es coherente con la estructura
   - Confirmar que respeta la separación de responsabilidades

## 🛠️ Herramientas para la Verificación

- **Comando `list_dir`**: Para explorar directorios y conocer archivos existentes
- **Comando `codebase_search`**: Para búsquedas semánticas en el código
- **Comando `grep_search`**: Para búsquedas de texto específicas
- **Comando `read_file`**: Para examinar el contenido de archivos existentes

## 🧠 Preguntas Clave Antes de Crear

1. ¿Existe ya algún componente que cumpla esta función o una similar?
2. ¿Hay algún hook que pueda ser reutilizado o extendido?
3. ¿La ubicación propuesta es coherente con la estructura actual?
4. ¿El nombre sigue las convenciones establecidas?
5. ¿La implementación respeta los patrones existentes?
6. ¿Es realmente necesario crear un nuevo elemento o puedo adaptar uno existente?

## 📢 Recordatorio Crítico

**NUNCA** asumas que conoces la estructura completa. **SIEMPRE** verifica antes de crear. La documentación y exploración son pasos obligatorios que no pueden ser omitidos bajo ninguna circunstancia.

> "Un minuto de verificación ahorra horas de corrección y refactorización"
