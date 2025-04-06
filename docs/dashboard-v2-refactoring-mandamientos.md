# Los Mandamientos de la Refactorización 📜

> "Conocerás lo que existe antes de crear algo nuevo"
> "Utilizarás componentes compartidos siempre que sea posible"
> "No duplicarás interfaces, tipos o componentes que ya existen"
> "Al cambiar funcionalidad, no tocarás la estética ni los estilos"

## 🎯 Objetivo Principal

- Mantener EXACTAMENTE la misma funcionalidad
- Aplicar patrones modernos SIN sobre-ingenierizar
- Implementar arquitectura limpia
- **VERIFICAR LA ESTRUCTURA EXISTENTE** antes de crear cualquier componente nuevo
- Mantener total separación de responsabilidades

## 🚫 MANDAMIENTO SUPREMO: RESPETARÁS LA REFACTORIZACIÓN REALIZADA

- **NUNCA crearás duplicados de componentes o hooks existentes**
- **NUNCA volverás a mezclar responsabilidades que han sido separadas**
- **NUNCA duplicarás interfaces, tipos o componentes en diferentes ubicaciones**
- Honrarás la estructura de carpetas establecida:
  - Componentes principales en `dashboard-v2/components/core/`
  - Componentes de dominio en `dashboard-v2/components/domain/` (categorías, secciones, productos)
  - Modales en `dashboard-v2/components/modals/`
  - Componentes de vista en `dashboard-v2/components/views/` (**TODOS los componentes de vista deben estar aquí**)
  - Hooks principales en `dashboard-v2/hooks/core/`
  - Hooks de dominio en `dashboard-v2/hooks/domain/` (categoría, sección, producto)
  - Hooks de UI en `dashboard-v2/hooks/ui/`
  - Tipos en `dashboard-v2/types/` organizados por dominio, API y UI
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

## 🔍 MANDAMIENTO DE PUREZA FUNCIONAL: SEPARARÁS FUNCIONALIDAD DE ESTÉTICA

- **Cuando se solicite cambiar solo la funcionalidad, NO TOCARÁS aspectos estéticos**
- **NUNCA cambiarás colores, márgenes, padding o diseño si solo se pide cambiar lógica**
- **RESPETARÁS el ámbito de los cambios solicitados sin modificar otros aspectos**
- Utilizarás componentes existentes con sus estilos actuales
- Mantendrás consistencia visual incluso cuando añadas nuevas funcionalidades
- Documentarás claramente los cambios funcionales realizados
- Separás estrictamente lógica de presentación en cada componente
- **Cuando debas añadir nueva funcionalidad, mantendrás el estilo visual existente**

## 📋 MANDAMIENTO CRÍTICO: CONOCERÁS LA ESTRUCTURA ANTES DE CREAR

- **SIEMPRE VERIFICARÁS lo que ya existe antes de crear cualquier nuevo componente o archivo**
- **NUNCA crearás un componente o hook si ya existe uno con la misma funcionalidad**
- Consultarás el siguiente mapa de estructura regularmente para evitar duplicidades:
  ```
  app/dashboard-v2/
  ├── api/                  # APIs y endpoints
  │   └── categories/
  │       └── reorder/      # API para reordenar categorías
  ├── components/           # Componentes UI
  │   ├── actions/          # Componentes para acciones
  │   ├── core/             # Componentes principales
  │   │   ├── DashboardView.tsx     # Vista principal del dashboard
  │   │   ├── TopNavbar.tsx         # Barra de navegación superior
  │   │   └── DashboardProvider.tsx # Proveedor de contexto del dashboard
  │   ├── domain/           # Componentes específicos de dominio
  │   │   ├── categories/   # Componentes de categorías
  │   │   │   ├── CategoryList.tsx      # Lista de categorías
  │   │   │   ├── CategoryTable.tsx     # Tabla de categorías
  │   │   │   └── CategorySections.tsx  # Secciones de una categoría
  │   │   ├── sections/     # Componentes de secciones
  │   │   │   ├── SectionList.tsx       # Lista de secciones
  │   │   │   ├── SectionTable.tsx      # Tabla de secciones
  │   │   │   └── SectionDetail.tsx     # Detalle de sección
  │   │   └── products/     # Componentes de productos
  │   │       ├── ProductTable.tsx      # Tabla de productos
  │   │       └── ProductManager.tsx    # Gestor de productos
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
  │   ├── sections/         # Componentes de secciones (antigua estructura)
  │   ├── ui/               # Componentes UI reutilizables
  │   │   ├── VirtualizedList.tsx
  │   │   ├── Loader.tsx
  │   │   └── SuccessMessage.tsx
  │   └── views/            # Vistas principales
  │       ├── CategoryView.tsx
  │       ├── SectionView.tsx
  │       ├── ProductView.tsx
  │       ├── OptimizedCategoryView.tsx
  │       └── FloatingPhonePreview.tsx
  ├── hooks/                # Hooks globales
  │   ├── core/             # Hooks principales
  │   │   ├── useDashboardState.ts    # Estado global del dashboard
  │   │   ├── useClient.ts            # Información de cliente
  │   │   └── useDragAndDrop.ts       # Funcionalidad de drag & drop
  │   ├── domain/           # Hooks específicos de dominio
  │   │   ├── category/     # Hooks de categorías
  │   │   │   ├── useCategoryManagement.ts   # Gestión de categorías
  │   │   │   └── useCategoryReorder.tsx     # Reordenamiento de categorías
  │   │   ├── section/      # Hooks de secciones
  │   │   │   └── useSectionManagement.ts    # Gestión de secciones
  │   │   └── product/      # Hooks de productos
  │   │       └── useProductManagement.ts    # Gestión de productos
  │   └── ui/               # Hooks relacionados con UI
  │       ├── useTheme.ts              # Gestión de temas
  │       ├── useVirtualizedList.ts    # Listas virtualizadas
  │       ├── useViewState.tsx         # Estado de vista
  │       ├── useModalState.tsx        # Estado de modales
  │       └── useExpansionState.tsx    # Estado de expansión
  ├── shared/               # Recursos compartidos
  │   ├── components/       # Componentes compartidos
  │   │   └── grid/         # Componentes para grids reutilizables
  │   │       └── GridIcon.tsx # Componente centralizado para íconos
  │   ├── constants/        # Constantes compartidas
  │   │   └── iconConfig.ts # Configuración de íconos
  │   └── hooks/            # Hooks compartidos
  │       └── useGridIcons.tsx # Hook para manejo de íconos
  ├── styles/               # Estilos
  │   ├── dashboard.css
  │   ├── index.css
  │   ├── theme.css
  │   ├── animations.css
  │   ├── typography.css
  │   └── grids.css
  ├── types/                # Tipos centralizados
  │   ├── domain/           # Tipos del dominio
  │   ├── api/              # Tipos de API
  │   ├── ui/               # Tipos de UI
  │   ├── index.ts
  │   ├── dashboard.ts
  │   └── type-adapters.ts
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

## 📋 MANDAMIENTO DE VERIFICACIÓN ESTRUCTURAL

- **SIEMPRE VERIFICARÁS** la estructura existente antes de crear algo nuevo
- Seguirás el procedimiento de verificación documentado:
  1. **Consultar documentación actualizada** para entender el contexto
  2. **Explorar directorios relevantes** usando `list_dir`
  3. **Buscar elementos similares** usando `codebase_search`
  4. **Comprobar hooks y utilidades disponibles** antes de crear nuevos
  5. **Validar ubicación y nomenclatura** para mantener coherencia
- Hacerte siempre estas preguntas clave:
  - ¿Existe ya algún componente que cumpla esta función o una similar?
  - ¿Hay algún hook que pueda ser reutilizado o extendido?
  - ¿La ubicación propuesta es coherente con la estructura actual?
  - ¿El nombre sigue las convenciones establecidas?
  - ¿La implementación respeta los patrones existentes?
  - ¿Es realmente necesario crear un nuevo elemento o puedo adaptar uno existente?
- Recuerda: **NUNCA** asumas que conoces la estructura completa. **SIEMPRE** verifica antes de crear.

## 🧩 MANDAMIENTO DEL SISTEMA DE COMPONENTES COMPARTIDOS

### Estructura del Sistema de Grid Compartidos

El sistema se compone de los siguientes elementos principales:

```
app/dashboard-v2/
├── shared/
│   ├── components/
│   │   └── grid/
│   │       └── GridIcon.tsx        # Componente para íconos de grid
│   ├── constants/
│   │   └── iconConfig.ts           # Configuración centralizada de íconos
│   └── hooks/
│       └── useGridIcons.tsx        # Hook para gestionar íconos
└── styles/
    └── grids.css                   # Estilos centralizados para grids
```

### Reglas y Mandamientos para Componentes Compartidos

- **UTILIZARÁS los componentes compartidos de grid para todos los íconos de tablas**
- **NO** importarás íconos directamente en los componentes de grid, usarás siempre `GridIcon` o `useGridIcons`
- **NO** definirás nuevos estilos para grids fuera de `grids.css`
- **NO** modificarás estilos existentes sin actualizar todos los componentes afectados
- Centralizarás la gestión de íconos en `shared/constants/iconConfig.ts`
- Implementarás `useGridIcons` para obtener íconos de manera consistente
- Seguirás patrones visuales establecidos según el tipo de grid:
  - Categorías: Indigo
  - Secciones: Teal
  - Productos: Yellow
- **CUANDO NECESITES CAMBIAR UN ÍCONO GLOBALMENTE**, lo modificarás en `iconConfig.ts`, no en cada componente
- **DOCUMENTARÁS** cualquier adición de nuevo ícono en los comentarios de `iconConfig.ts`
- **RESPETARÁS** la estructura definida para componentes de grid
- **ANTES DE CREAR NUEVO COMPONENTE**, verificarás si se puede implementar con los compartidos

### Tipos de Grid y Componentes Disponibles

El sistema admite tres tipos de grid, cada uno con su propia identidad visual:

1. **Category**: Grids de categorías (Color: Indigo)
2. **Section**: Grids de secciones (Color: Teal)
3. **Product**: Grids de productos (Color: Yellow)

#### Componente GridIcon

```tsx
// Uso básico del componente GridIcon
import { GridIcon } from "@/app/dashboard-v2/shared/components/grid/GridIcon";

<button className="action-button">
  <GridIcon
    type="category"
    icon="edit"
    size="small"
    onClick={handleEdit}
    title="Editar categoría"
  />
  Editar
</button>;
```

#### Hook useGridIcons

```tsx
// Uso del hook useGridIcons
import { useGridIcons } from "@/app/dashboard-v2/shared/hooks/useGridIcons";

const { renderIcon } = useGridIcons();

<button onClick={handleEdit} className="action-button">
  {renderIcon("category", "edit", { size: "small" })}
  Editar
</button>;
```

### Íconos Disponibles

Todos los íconos están definidos en `iconConfig.ts` y se pueden referenciar por su identificador:

- `expand`: Para expandir elementos (ChevronRightIcon)
- `collapse`: Para colapsar elementos (ChevronDownIcon)
- `edit`: Para editar elementos (PencilIcon)
- `delete`: Para eliminar elementos (TrashIcon)
- `visibility`: Para elementos visibles (EyeIcon)
- `hidden`: Para elementos ocultos (EyeSlashIcon)
- `add`: Para añadir elementos (PlusIcon)
- `drag`: Para arrastrar/ordenar (Bars3Icon)
- `column`: Para encabezados de columna (ViewColumnsIcon)
- `moveUp`: Para mover hacia arriba (ArrowUpIcon)
- `moveDown`: Para mover hacia abajo (ArrowDownIcon)
- `photo`: Para representar imágenes (PhotoIcon)

## 📊 MANDAMIENTO DEL MODELO DE DATOS

### Entidades Principales y su Jerarquía

El modelo de datos sigue una estructura jerárquica:

```
Cliente
  └── Categoría
       └── Sección
            └── Producto
```

#### Cliente (Client)

```typescript
interface Client {
  id: number; // Identificador único del cliente
  name: string; // Nombre del negocio
  main_logo: string | null; // Logo principal
  // ... otros campos
}
```

#### Categoría (Category)

```typescript
interface Category {
  category_id: number; // Identificador único
  name: string; // Nombre de la categoría
  status: number; // Estado (1: visible, 0: oculta)
  display_order: number; // Orden de visualización
  // ... otros campos
}
```

#### Sección (Section)

```typescript
interface Section {
  section_id: number; // Identificador único
  name: string; // Nombre de la sección
  category_id: number; // Categoría a la que pertenece
  status: number; // Estado (1: visible, 0: oculta)
  display_order: number; // Orden de visualización
  // ... otros campos
}
```

#### Producto (Product)

```typescript
interface Product {
  product_id: number; // Identificador único
  name: string; // Nombre del producto
  section_id: number; // Sección a la que pertenece
  status: number; // Estado (1: visible, 0: oculto)
  display_order: number; // Orden de visualización
  // ... otros campos
}
```

### Relaciones y Reglas

- Un **Cliente** puede tener múltiples **Categorías**
- Una **Categoría** pertenece a un único **Cliente** y puede tener múltiples **Secciones**
- Una **Sección** pertenece a una única **Categoría** y puede tener múltiples **Productos**
- Un **Producto** pertenece a una única **Sección** (relación directa a través del campo `section_id`)

> **Nota importante**: Se ha simplificado la relación entre Productos y Secciones. Anteriormente existía una tabla pivote `products_sections` que permitía que un producto perteneciera a múltiples secciones (relación N:M). Con la nueva estructura, cada producto pertenece directamente a una única sección (relación 1:N), lo que simplifica las consultas y la gestión de datos.

### Estados del Dashboard

El estado global se divide en estados específicos por dominio para mejor organización:

- **CategoryState**: Gestión de categorías
- **SectionState**: Gestión de secciones
- **ProductState**: Gestión de productos

## 🎨 MANDAMIENTO DE ESTILOS Y COHERENCIA VISUAL

- **USARÁS el archivo `styles/grids.css` para todos los estilos relacionados con grids**
- Centralizarás los estilos de categorías, secciones y productos en el archivo dedicado
- No duplicarás estilos de grid en archivos globales ni en componentes individuales
- Mantendrás la coherencia visual entre grids con los mismos patrones de diseño
- Respetarás la identidad de color para cada tipo de entidad:
  - Categorías: Indigo
  - Secciones: Teal
  - Productos: Yellow
- Usarás las clases de grid con prefijos específicos:
  - `category-*` para elementos de categorías
  - `section-*` para elementos de secciones
  - `product-*` para elementos de productos
  - `grid-*` para elementos comunes entre los tres tipos
- Verificarás siempre la existencia de clases en `grids.css` antes de crear nuevas
- Documentarás cualquier adición o modificación a los estilos de grid en los comentarios

### Ejemplo de Clases CSS de Grid

```css
/* Específicas por tipo */
.category-border, .section-border, .product-border
.category-bg, .section-bg, .product-bg
.category-title, .section-title, .product-title

/* Compartidas */
.grid-header, .grid-table, .grid-title, .grid-container

/* Estados */
.grid-item-hidden
.grid-item-dragging-category, .grid-item-dragging-section, .grid-item-dragging-product;
```

## 🔒 MANDAMIENTO DE VALIDACIÓN DE ACCESO

- **IMPLEMENTARÁS verificación de roles en cada punto de entrada**
- Mantendrás redirecciones a /unauthorized cuando un usuario no tenga permisos
- Validarás roles tanto en el cliente como en el servidor
- Mantendrás consistencia en los mensajes de error de acceso
- Documentarás claramente los requisitos de acceso para cada sección
- Implementarás pruebas de acceso para cada rol
- Asegurarás que la redirección sea inmediata y clara
- Proporcionarás retroalimentación específica sobre los permisos faltantes
- Mantendrás actualizados los requisitos de acceso según evolucione la aplicación

## 🔄 MANDAMIENTO DE COHERENCIA EN REDISEÑOS

Al rediseñar componentes existentes (como SectionList, CategoryTable, etc.):

- Mantendrás estructura de tabla similar entre componentes relacionados
- Preservarás la identidad de color de cada tipo de grid
- Adaptarás la estructura visual pero mantendrás todas las funcionalidades originales
- Utilizarás los mismos patrones de interacción entre componentes similares
- Implementarás soporte para las mismas operaciones (añadir, editar, eliminar, reordenar)
- Documentarás cualquier cambio significativo en la estructura o comportamiento
- Asegurarás compatibilidad con el sistema de tipos existente
- Incorporarás las optimizaciones de rendimiento establecidas

## 📚 BUENAS PRÁCTICAS DE PROGRAMACIÓN

- Implementarás principios SOLID
- Mantendrás una separación clara de responsabilidades
- Implementarás un sistema de manejo de estado eficiente
- Incorporarás manejo de errores robusto
- Realizarás testing sistemático (unitario y de integración)
- Documentarás el código de manera detallada (como para dummies)

## 🚀 ESCALABILIDAD REAL

- Arquitectura que permita crecimiento
- Código modular y reutilizable
- Patrones consistentes
- Fácil de extender sin modificar

## 🧠 RECURSOS Y REFERENCIAS

Para obtener información detallada sobre temas específicos, consultar los siguientes documentos:

- `docs/dashboard-v2-estructura-y-mandamientos.md` - Estructura completa y mandamientos del proyecto
- `docs/archive/dashboard-v2-modelo-datos.md` - Modelo de datos detallado
- `docs/archive/sistema-componentes-compartidos.md` - Sistema de componentes compartidos
- `docs/archive/GridComponents-Documentation.md` - Documentación detallada del sistema de grid
- `docs/archive/SectionList-Redesign-Documentation.md` - Documentación del rediseño de SectionList
- `docs/dashboard-v2-mejoras-estructura.md` - Propuesta de mejoras en la estructura

> "Un proyecto ordenado es un proyecto mantenible"
> "Conocer la estructura es el primer paso para respetarla"
