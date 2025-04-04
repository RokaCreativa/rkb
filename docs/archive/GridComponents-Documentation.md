# Documentación: Sistema de Componentes Grid Compartidos

## Introducción

Este documento detalla el sistema de componentes grid compartidos implementado para el dashboard v2 de RokaMenu. El objetivo principal es facilitar la reutilización de código, mantener una experiencia visual consistente y simplificar cambios globales (como actualizar íconos) en todos los grids de la aplicación.

## Implementación Actual

Hemos implementado la primera fase del sistema propuesto en el documento [Grid-Components-Refactoring.md](./Grid-Components-Refactoring.md), centrando los esfuerzos en el sistema de íconos compartidos. La implementación incluye:

1. **Configuración centralizada de íconos** (`iconConfig.ts`)
2. **Componente de íconos reutilizable** (`GridIcon.tsx`)
3. **Hook personalizado para gestionar íconos** (`useGridIcons.tsx`)

Esta implementación permite cambiar cualquier ícono en todos los grids modificando una sola línea de código.

## Sistema de Íconos Compartidos

### 1. Configuración de Íconos (`iconConfig.ts`)

El archivo `app/dashboard-v2/shared/constants/iconConfig.ts` centraliza la configuración de íconos utilizados en los componentes de grid:

```tsx
export type IconType =
  | "expand" // Icono para expandir un elemento
  | "collapse" // Icono para colapsar un elemento
  | "edit" // Icono para editar un elemento
  | "delete" // Icono para eliminar un elemento
  | "visibility" // Icono para elementos visibles
  | "hidden" // Icono para elementos ocultos
  | "add" // Icono para añadir nuevos elementos
  | "drag" // Icono para arrastrar/reordenar
  | "column" // Icono para encabezados de columna
  | "moveUp" // Icono para mover hacia arriba
  | "moveDown" // Icono para mover hacia abajo
  | "photo"; // Icono para representar imágenes

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
  moveUp: ArrowUpIcon,
  moveDown: ArrowDownIcon,
  photo: PhotoIcon,
};
```

Para cambiar un ícono globalmente, simplemente se debe modificar la referencia correspondiente en el objeto `ICONS`. Por ejemplo:

```tsx
// Cambiar el ícono de visibilidad a un componente personalizado
import { CustomEyeIcon } from "@/app/components/icons/CustomEyeIcon";

export const ICONS = {
  // ... otros íconos
  visibility: CustomEyeIcon, // Cambio global de ícono
};
```

### 2. Componente GridIcon

El componente `GridIcon` (`app/dashboard-v2/shared/components/grid/GridIcon.tsx`) proporciona una interfaz unificada para renderizar íconos con el estilo adecuado según el tipo de grid:

```tsx
export type GridType = "category" | "section" | "product";
export type IconSize = "small" | "medium" | "large";

export interface GridIconProps {
  type: GridType; // Tipo de grid (category, section, product)
  icon: IconType; // Tipo de ícono a mostrar
  size?: IconSize; // Tamaño del ícono
  className?: string; // Clases CSS adicionales
  onClick?: React.MouseEventHandler<SVGSVGElement>;
  title?: string; // Texto para tooltip
}

export const GridIcon: React.FC<GridIconProps> = ({
  type,
  icon,
  size = "medium",
  className = "",
  onClick,
  title,
}) => {
  // Obtener el componente de ícono apropiado
  const IconComponent = ICONS[icon];

  // Aplicar estilos según el tipo de grid y tamaño
  // ...

  return (
    <IconComponent
      className={`${sizeClasses[size]} ${colorClasses[type]} ${className}`}
      onClick={onClick}
      title={title}
      aria-hidden={!title}
    />
  );
};
```

### 3. Hook useGridIcons

El hook `useGridIcons` (`app/dashboard-v2/shared/hooks/useGridIcons.tsx`) proporciona funciones útiles para trabajar con íconos:

```tsx
export const useGridIcons = () => {
  // Obtener un componente de ícono por tipo
  const getIconComponent = (iconType: IconType) => {
    return ICONS[iconType];
  };

  // Verificar si un ícono está disponible
  const isIconAvailable = (iconType: IconType) => {
    return !!ICONS[iconType];
  };

  // Renderizar un ícono con los estilos apropiados
  const renderIcon = (
    type: GridType,
    icon: IconType,
    props?: Omit<React.ComponentProps<typeof GridIcon>, "type" | "icon">
  ) => {
    if (!isIconAvailable(icon)) {
      return null;
    }

    return <GridIcon type={type} icon={icon} {...props} />;
  };

  return {
    getIconComponent,
    renderIcon,
    isIconAvailable,
  };
};
```

## Guía de Uso

### Uso Básico

Para usar el componente `GridIcon` directamente:

```tsx
import { GridIcon } from "@/app/dashboard-v2/shared/components/grid/GridIcon";

function MyComponent() {
  return (
    <button className="action-button">
      <GridIcon
        type="category"
        icon="edit"
        size="small"
        onClick={handleEdit}
        title="Editar categoría"
      />
      Editar
    </button>
  );
}
```

### Uso con el Hook useGridIcons

Usando el hook `useGridIcons` para una mayor flexibilidad:

```tsx
import { useGridIcons } from "@/app/dashboard-v2/shared/hooks/useGridIcons";

function MyComponent() {
  const { renderIcon, isIconAvailable } = useGridIcons();

  return (
    <div className="actions">
      {isIconAvailable("edit") && (
        <button onClick={handleEdit} className="action-button">
          {renderIcon("category", "edit", {
            size: "small",
            title: "Editar categoría",
          })}
          Editar
        </button>
      )}
    </div>
  );
}
```

### Ejemplo en Componentes Grid

Al refactorizar componentes existentes como `CategoryTable` o `SectionList`:

```tsx
import { useGridIcons } from "@/app/dashboard-v2/shared/hooks/useGridIcons";

export function CategoryTable({ categories, onEditCategory }) {
  const { renderIcon } = useGridIcons();

  return (
    <table className="min-w-full divide-y category-border">
      <thead>{/* ... encabezados de columna ... */}</thead>
      <tbody>
        {categories.map((category) => (
          <tr key={category.category_id}>
            {/* ... otras celdas ... */}
            <td className="px-3 py-2 whitespace-nowrap text-center">
              <button
                onClick={() => onEditCategory(category)}
                className="action-button category-action category-icon-hover"
              >
                {renderIcon("category", "edit")}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

## Ventajas del Sistema

### 1. Cambios Globales Simplificados

Para cambiar un ícono en todos los grids de la aplicación:

1. Abrir `app/dashboard-v2/shared/constants/iconConfig.ts`
2. Modificar el componente correspondiente en el objeto `ICONS`
3. ¡Listo! El cambio se refleja automáticamente en todos los lugares donde se usa ese ícono

### 2. Estilos Consistentes

El componente `GridIcon` aplica automáticamente los estilos apropiados según el tipo de grid, asegurando:

- Colores consistentes con la identidad visual de cada tipo (indigo, teal, yellow)
- Tamaños uniformes en toda la aplicación
- Comportamiento hover uniforme

### 3. Mejor Documentación y Tipado

El sistema proporciona:

- Tipos TypeScript claros para los íconos disponibles (`IconType`)
- Comentarios detallados con JSDoc
- Advertencias en la consola cuando se intenta usar un ícono no definido

## Próximos Pasos

Esta implementación representa la primera fase del sistema propuesto. Los próximos pasos incluirían:

1. Implementar los componentes `GridTable`, `GridHeader` y `GridRow`
2. Crear el contexto `GridContext` para gestionar estados compartidos
3. Refactorizar los componentes existentes (`CategoryTable`, `SectionList`, `ProductTable`) para usar el nuevo sistema

## Conclusión

El sistema de componentes grid compartidos mejora significativamente la mantenibilidad del código, facilita los cambios globales y asegura una experiencia visual consistente. La implementación actual del sistema de íconos compartidos proporciona una base sólida para continuar con la refactorización completa propuesta en el documento [Grid-Components-Refactoring.md](./Grid-Components-Refactoring.md).

## Referencias

- [Grid-Components-Refactoring.md](./Grid-Components-Refactoring.md) - Propuesta completa de refactorización
- [SectionList-Redesign-Documentation.md](./SectionList-Redesign-Documentation.md) - Documentación del rediseño de SectionList
- `app/dashboard-v2/shared/constants/iconConfig.ts` - Configuración de íconos
- `app/dashboard-v2/shared/components/grid/GridIcon.tsx` - Componente GridIcon
- `app/dashboard-v2/shared/hooks/useGridIcons.tsx` - Hook useGridIcons
