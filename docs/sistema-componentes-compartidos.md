# Sistema de Componentes Compartidos para Grids

## 🚀 Introducción

Este documento detalla el sistema de componentes compartidos implementado para estandarizar y facilitar el desarrollo de componentes de grid (tablas) en el dashboard v2 de RokaMenu. El objetivo principal es centralizar la gestión de íconos, estilos y comportamientos comunes entre los diferentes tipos de grids.

## 📋 Estructura del Sistema

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

## 🎨 Tipos de Grid

El sistema admite tres tipos de grid, cada uno con su propia identidad visual:

1. **Category**: Grids de categorías (Color: Indigo)
2. **Section**: Grids de secciones (Color: Teal)
3. **Product**: Grids de productos (Color: Yellow)

## 🧩 Componentes Disponibles

### 1. GridIcon

Componente para renderizar íconos con estilo consistente según el tipo de grid.

#### Propiedades:

- `type`: Tipo de grid ('category', 'section', 'product')
- `icon`: Identificador del ícono a renderizar
- `size`: Tamaño del ícono ('small', 'medium', 'large')
- `className`: Clases CSS adicionales
- `onClick`: Manejador de evento de clic
- `title`: Atributo title para el ícono (tooltip)

#### Ejemplo de uso:

```tsx
import { GridIcon } from "@/app/dashboard-v2/shared/components/grid/GridIcon";

// En un componente
<button className="action-button">
  <GridIcon type="category" icon="edit" size="small" onClick={handleEdit} />
  Editar
</button>;
```

## 🎣 Hooks Disponibles

### 1. useGridIcons

Hook para facilitar el trabajo con íconos en los componentes de grid.

#### Funciones:

- `getIconComponent`: Obtiene el componente React para un tipo de ícono
- `renderIcon`: Renderiza un ícono con propiedades específicas
- `isIconAvailable`: Verifica si un ícono está disponible en la configuración

#### Ejemplo de uso:

```tsx
import { useGridIcons } from "@/app/dashboard-v2/shared/hooks/useGridIcons";

// En un componente
const { renderIcon } = useGridIcons();

return (
  <button onClick={handleEdit} className="action-button">
    {renderIcon("category", "edit", { size: "small" })}
    Editar
  </button>
);
```

## 🔄 Íconos Disponibles

Todos los íconos están definidos en `iconConfig.ts` y pueden ser referenciados por su identificador:

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

## 📝 Cómo Añadir Nuevos Íconos

1. Importa el nuevo ícono en `iconConfig.ts`
2. Añade un nuevo tipo en `IconType`
3. Agrega el ícono al objeto `ICONS`
4. Documenta el nuevo ícono

```tsx
// En iconConfig.ts
import { NewIcon } from "@heroicons/react/24/outline";

export type IconType =
  // ... íconos existentes
  "newIcon"; // Nuevo ícono para X funcionalidad

export const ICONS = {
  // ... íconos existentes
  newIcon: NewIcon,
};
```

## 🌈 Estilos de Grid

Todos los estilos para grids están centralizados en `styles/grids.css`. Estos estilos se dividen en tres categorías:

1. **Estilos específicos por tipo**: Con prefijos `category-*`, `section-*`, `product-*`
2. **Estilos compartidos**: Con prefijo `grid-*`
3. **Estilos de estado**: Para diferentes estados de elementos (hover, active, etc.)

### Ejemplos de clases:

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

## 🚫 Reglas Importantes

1. **NO** importes íconos directamente en los componentes de grid, usa `GridIcon` o `useGridIcons`
2. **NO** definas nuevos estilos para grids fuera de `grids.css`
3. **NO** modifiques estilos existentes sin actualizar todos los componentes afectados
4. **SIEMPRE** documenta nuevos íconos o estilos
5. **SIEMPRE** respeta la identidad visual de cada tipo de grid (color)

## 🔍 Ejemplos Completos

### Ejemplo 1: Botón de Editar con GridIcon

```tsx
import { GridIcon } from "@/app/dashboard-v2/shared/components/grid/GridIcon";

function EditButton({ type, onEdit }) {
  return (
    <button
      onClick={onEdit}
      className={`action-button ${type}-action ${type}-icon-hover`}
    >
      <GridIcon
        type={type}
        icon="edit"
        size="medium"
        title={`Editar ${
          type === "category"
            ? "categoría"
            : type === "section"
            ? "sección"
            : "producto"
        }`}
      />
    </button>
  );
}
```

### Ejemplo 2: Cabecera de Columna con useGridIcons

```tsx
import { useGridIcons } from "@/app/dashboard-v2/shared/hooks/useGridIcons";

function ColumnHeader({ type, label, icon }) {
  const { renderIcon } = useGridIcons();

  return (
    <th
      className={`px-2 py-2 text-center text-xs font-medium ${type}-title uppercase tracking-wider`}
    >
      {icon && renderIcon(type, icon, { size: "small" })}
      <span className="ml-1">{label}</span>
    </th>
  );
}
```

## 📚 Referencia Adicional

- [GridComponents-Documentation.md](./GridComponents-Documentation.md) - Documentación detallada del sistema
- [Grid-Components-Refactoring.md](./Grid-Components-Refactoring.md) - Propuesta de refactorización completa
- [estructura-dashboard-v2.md](./estructura-dashboard-v2.md) - Mapa completo de la estructura
