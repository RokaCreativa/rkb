# Documentación: Refactorización de Componentes Grid para Dashboard v2

## Introducción

Este documento presenta una propuesta para refactorizar los componentes de grid utilizados en el dashboard v2 (categorías, secciones y productos) con el objetivo de mejorar la reutilización de código, facilitar los cambios globales y mantener una experiencia visual consistente.

## Problema Actual

Actualmente, el dashboard utiliza componentes independientes para cada tipo de grid:

- `CategoryTable.tsx` para categorías (esquema indigo)
- `SectionList.tsx` para secciones (esquema teal)
- `ProductTable.tsx` para productos (esquema yellow)

Esta estructura presenta varios desafíos:

1. Duplicación de código entre componentes con estructura similar
2. Dificultad para realizar cambios globales (como actualizar un ícono en todos los grids)
3. Riesgo de inconsistencias visuales o de comportamiento entre los diferentes grids
4. Mayor esfuerzo de mantenimiento al tener que actualizar cada componente individualmente

## Propuesta de Solución

Se propone crear una arquitectura de componentes compartidos y un sistema centralizado para la gestión de íconos y estilos. Esta solución se basa en los principios establecidos en los documentos `dashboard-v2-refactoring-mandamientos.md` y `estructura-dashboard-v2.md`.

### 1. Estructura de Carpetas Propuesta

```
app/dashboard-v2/
├── shared/
│   ├── components/
│   │   ├── grid/
│   │   │   ├── GridTable.tsx        // Componente base para todas las tablas
│   │   │   ├── GridHeader.tsx       // Encabezado común para tablas
│   │   │   ├── GridRow.tsx          // Fila genérica para tablas
│   │   │   ├── GridCell.tsx         // Celda genérica para tablas
│   │   │   └── GridIcon.tsx         // Componente centralizado para íconos
│   │   └── ui/
│   │       └── ...
│   ├── constants/
│   │   └── iconConfig.ts           // Configuración centralizada de íconos
│   ├── contexts/
│   │   └── GridContext.tsx         // Contexto para manejar estilos y comportamiento de grids
│   └── hooks/
│       └── useGridIcons.ts         // Hook personalizado para gestionar íconos
└── components/
    ├── views/
    │   ├── CategoryView.tsx        // Vista principal para categorías (usa CategoryTable)
    │   ├── SectionView.tsx         // Vista principal para secciones (usa SectionList)
    │   └── ProductView.tsx         // Vista principal para productos (usa ProductTable)
    ├── CategoryTable.tsx           // Ahora usa componentes compartidos
    ├── SectionTable.tsx            // Ahora usa componentes compartidos
    └── ProductTable.tsx            // Ahora usa componentes compartidos
```

> **IMPORTANTE**: Todos los componentes de vista (CategoryView, SectionView, ProductView) deben estar en la carpeta `/components/views/`. No debe existir ningún componente de vista en la raíz de `/components/`.

### 2. Componentes Compartidos

#### 2.1 GridTable

Un componente base para todas las tablas que maneja la estructura general y la lógica de drag-and-drop:

```tsx
/**
 * Componente base para todas las tablas del dashboard
 * @param type - Tipo de grid ('category', 'section', 'product')
 * @param items - Array de elementos a mostrar
 * @param expandedItems - Registro de elementos expandidos
 * @param onItemClick - Manejador para clic en item
 * @param onReorder - Manejador opcional para reordenar elementos
 * @param headers - Configuración de encabezados
 * @param renderItem - Función para renderizar cada fila
 */
export const GridTable: React.FC<GridTableProps> = ({
  type,
  items,
  expandedItems,
  onItemClick,
  onReorder,
  headers,
  renderItem,
  // ... más props
}) => {
  // Determinar clases de estilo basadas en el tipo
  const gridClasses = useGridStyles(type);

  // Lógica compartida para drag and drop
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !onReorder) return;
    // Lógica común de reordenamiento
  };

  return (
    <div
      className={`rounded-lg border ${gridClasses.border} overflow-hidden bg-white shadow-sm`}
    >
      <GridHeader
        type={type}
        title={headers.title}
        visibleCount={headers.visibleCount}
        totalCount={headers.totalCount}
      />

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId={`${type}-items`}>
          {(provided) => (
            <table
              className={`min-w-full divide-y ${gridClasses.border}`}
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {/* Encabezados de columna */}
              <thead className="bg-gray-50">
                <tr>
                  {headers.columns.map((column) => (
                    <th
                      key={column.key}
                      scope="col"
                      className={`px-2 py-2 text-center text-xs font-medium ${
                        gridClasses.title
                      } uppercase tracking-wider ${
                        column.width ? `w-${column.width}` : ""
                      }`}
                    >
                      {column.icon ? (
                        <GridIcon type={type} icon={column.icon} />
                      ) : null}
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Filas de contenido */}
              <tbody className="bg-white divide-y section-border">
                {items.map((item, index) =>
                  renderItem(item, index, provided, gridClasses)
                )}
                {provided.placeholder}
              </tbody>
            </table>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};
```

#### 2.2 GridIcon

Un componente centralizado para manejar todos los íconos, facilitando cambios globales:

```tsx
/**
 * Tipos de íconos disponibles en el sistema
 */
export type IconType =
  | "expand"
  | "collapse"
  | "edit"
  | "delete"
  | "visibility"
  | "hidden"
  | "add"
  | "drag"
  | "column";

/**
 * Componente para renderizar íconos con estilos consistentes
 * @param type - Tipo de grid ('category', 'section', 'product')
 * @param icon - Tipo de ícono a mostrar
 * @param size - Tamaño del ícono (small, medium, large)
 * @param className - Clases adicionales
 */
export const GridIcon: React.FC<GridIconProps> = ({
  type,
  icon,
  size = "medium",
  className = "",
  ...props
}) => {
  const { getIconComponent } = useGridIcons();
  const gridClasses = useGridStyles(type);

  // Obtener el componente de ícono apropiado
  const IconComponent = getIconComponent(icon);

  // Determinar las clases de tamaño
  const sizeClasses = {
    small: "h-3 w-3",
    medium: "h-4 w-4",
    large: "h-5 w-5",
  };

  return (
    <IconComponent
      className={`${sizeClasses[size]} ${gridClasses.icon} ${className}`}
      {...props}
    />
  );
};
```

#### 2.3 iconConfig.ts

Archivo centralizado para gestionar qué íconos se utilizan para cada función:

```tsx
import {
  ChevronDownIcon,
  ChevronRightIcon,
  EyeIcon,
  EyeSlashIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  ViewColumnsIcon,
} from "@heroicons/react/24/outline";
import { Bars3Icon } from "@heroicons/react/24/solid";

// Mapa de iconos del sistema
export const ICONS = {
  expand: ChevronRightIcon,
  collapse: ChevronDownIcon,
  edit: PencilIcon,
  delete: TrashIcon,
  visibility: EyeIcon,
  hidden: EyeSlashIcon,
  add: PlusIcon,
  drag: Bars3Icon,
  column: ViewColumnsIcon,
};

// Para cambiar globalmente un ícono, simplemente actualice el valor en este objeto
```

#### 2.4 useGridIcons

Hook personalizado para gestionar los íconos:

```tsx
/**
 * Hook para manejar los íconos en componentes grid
 * Centraliza la lógica de selección de íconos
 */
export const useGridIcons = () => {
  const getIconComponent = (iconType: IconType) => {
    return ICONS[iconType];
  };

  return { getIconComponent };
};
```

#### 2.5 GridContext

Contexto para proporcionar estilos y comportamiento consistentes:

```tsx
/**
 * Contexto para gestionar estados y estilos de grids
 */
export const GridContext = React.createContext<GridContextType>(
  {} as GridContextType
);

/**
 * Proveedor para el contexto de grids
 */
export const GridProvider: React.FC<GridProviderProps> = ({ children }) => {
  // Estados compartidos entre grids
  const [showHiddenItems, setShowHiddenItems] = useState({
    category: true,
    section: true,
    product: true,
  });

  // Clases CSS por tipo de grid
  const gridStyles = {
    category: {
      border: "category-border",
      bg: "category-bg",
      title: "category-title",
      text: "category-text",
      action: "category-action",
      button: "category-button",
      hover: "category-hover",
      active: "category-active",
      icon: "category-icon-hover",
    },
    section: {
      border: "section-border",
      bg: "section-bg",
      title: "section-title",
      text: "section-text",
      action: "section-action",
      button: "section-button",
      hover: "section-hover",
      active: "section-active",
      icon: "section-icon-hover",
    },
    product: {
      border: "product-border",
      bg: "product-bg",
      title: "product-title",
      text: "product-text",
      action: "product-action",
      button: "product-button",
      hover: "product-hover",
      active: "product-active",
      icon: "product-icon-hover",
    },
  };

  const value = {
    showHiddenItems,
    setShowHiddenItems,
    gridStyles,
  };

  return <GridContext.Provider value={value}>{children}</GridContext.Provider>;
};

/**
 * Hook para acceder al contexto de grids
 */
export const useGridContext = () => useContext(GridContext);

/**
 * Hook para obtener los estilos específicos para un tipo de grid
 */
export const useGridStyles = (type: "category" | "section" | "product") => {
  const { gridStyles } = useGridContext();
  return gridStyles[type];
};
```

### 3. Implementación en Componentes Existentes

#### Ejemplo: CategoryTable refactorizado

```tsx
export const CategoryTable: React.FC<CategoryTableProps> = ({
  categories,
  expandedCategories,
  onCategoryClick,
  onToggleCategoryVisibility,
  onEditCategory,
  onDeleteCategory,
  onReorderCategory,
  // ... más props
}) => {
  const renderCategory = (category, index, provided, classes) => (
    <Draggable
      key={category.category_id.toString()}
      draggableId={category.category_id.toString()}
      index={index}
    >
      {(provided, snapshot) => (
        <React.Fragment key={`category-${category.category_id}`}>
          <tr
            ref={provided.innerRef}
            {...provided.draggableProps}
            className={/* clases condicionales */}
          >
            <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500 w-10">
              <button onClick={() => onCategoryClick(category)}>
                <GridIcon
                  type="category"
                  icon={
                    expandedCategories[category.category_id]
                      ? "collapse"
                      : "expand"
                  }
                  size="medium"
                />
              </button>
            </td>
            {/* Otras celdas... */}
          </tr>
        </React.Fragment>
      )}
    </Draggable>
  );

  const headers = {
    title: "Tus menús (Comidas, Bebidas, Postres...)",
    visibleCount: categories.filter((c) => c.status === 1).length,
    totalCount: categories.length,
    columns: [
      { key: "expander", width: "10" },
      { key: "name", label: "Nombre", icon: "column" },
      { key: "order", label: "Orden", width: "16" },
      { key: "photo", label: "Foto", width: "16" },
      { key: "visibility", icon: "visibility", width: "16" },
      { key: "actions", label: "Acciones", width: "20" },
    ],
  };

  return (
    <GridTable
      type="category"
      items={categories}
      expandedItems={expandedCategories}
      onItemClick={onCategoryClick}
      onReorder={onReorderCategory}
      headers={headers}
      renderItem={renderCategory}
    />
  );
};
```

## Beneficios de la Refactorización

### 1. Cambios Globales Simplificados

Con esta arquitectura, cambiar un ícono en todos los grids es tan simple como modificar una línea en `iconConfig.ts`:

```tsx
// Antes de cambiar
export const ICONS = {
  // ... otros íconos
  visibility: EyeIcon,
};

// Después de cambiar (por ejemplo, a un ícono diferente)
export const ICONS = {
  // ... otros íconos
  visibility: VisibilityIcon, // Cambio global de ícono
};
```

### 2. Reducción de Duplicación de Código

- La lógica compartida para drag-and-drop, renderizado de tablas y manejo de estados se centraliza
- Las estructuras HTML comunes como encabezados y filas se definen una sola vez
- Los estilos se aplican de manera consistente a través de clases CSS predefinidas

### 3. Mejora de Mantenibilidad

- La estructura modular facilita pruebas unitarias
- Los cambios en comportamiento base afectan a todos los componentes de manera consistente
- La documentación centralizada mejora la comprensión del sistema

### 4. Flexibilidad para Extensiones Futuras

- Nuevos tipos de grids pueden agregarse fácilmente heredando del sistema base
- Se pueden introducir nuevos íconos o comportamientos modificando sólo los archivos centrales
- La personalización específica por tipo sigue siendo posible a través del sistema de tipos

## Plan de Implementación

### Fase 1: Preparación

1. Crear la estructura de carpetas para los nuevos componentes compartidos
2. Implementar `GridContext` y `useGridStyles`
3. Crear el archivo de configuración de íconos `iconConfig.ts`

### Fase 2: Desarrollo de Componentes Base

1. Implementar `GridIcon`
2. Implementar `GridHeader`
3. Implementar `GridTable`

### Fase 3: Refactorización de Componentes Existentes

1. Refactorizar `CategoryTable` para usar los componentes compartidos
2. Refactorizar `SectionTable` para usar los componentes compartidos
3. Refactorizar `ProductTable` para usar los componentes compartidos

### Fase 4: Pruebas y Refinamiento

1. Ejecutar pruebas para verificar que la funcionalidad existente se mantiene
2. Refinar los componentes compartidos según sea necesario
3. Documentar el nuevo sistema para futuros desarrolladores

## Conclusión

La refactorización propuesta proporciona una solución robusta y escalable para los componentes de grid del dashboard. Siguiendo las directrices de los documentos de referencia del proyecto, esta arquitectura facilita el mantenimiento, mejora la consistencia visual y permite modificaciones globales con un esfuerzo mínimo.

## Referencias

- `docs/dashboard-v2-refactoring-mandamientos.md`
- `docs/estructura-dashboard-v2.md`
- `app/dashboard-v2/styles/grids.css`
- Artículos sobre patrones de diseño React:
  - Compound Components
  - Context API
  - Custom Hooks
  - Render Props
