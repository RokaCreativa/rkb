# Estructura del Proyecto RokaMenu

## Índice

1. [Introducción](#introducción)
2. [Estructura de Carpetas](#estructura-de-carpetas)
3. [Componentes](#componentes)
4. [Hooks](#hooks)
5. [Servicios](#servicios)
6. [Contextos](#contextos)
7. [Flujo de Datos](#flujo-de-datos)
8. [Convenciones de Código](#convenciones-de-código)

## Introducción

Este documento proporciona una descripción detallada de la estructura del proyecto RokaMenu, diseñado para facilitar la gestión de menús digitales para restaurantes. La aplicación está construida con Next.js y sigue una arquitectura modular, con una clara separación de responsabilidades.

## Estructura de Carpetas

La estructura de carpetas principal es la siguiente:

```
/
├── app/                    # Rutas y páginas de Next.js App Router
│   ├── api/                # Endpoints de la API
│   ├── dashboard/          # Páginas del panel de administración
│   │   ├── components/     # Componentes específicos del dashboard
│   │   ├── context/        # Contexto global del dashboard
│   │   └── ...
│   ├── hooks/              # Hooks específicos de la aplicación
│   └── types/              # Definiciones de tipos TypeScript
│
├── components/             # Componentes reutilizables en toda la aplicación
│   ├── ui/                 # Componentes UI básicos
│   ├── forms/              # Componentes de formularios
│   ├── modals/             # Componentes base para modales
│   └── tables/             # Componentes de tablas
│
├── lib/                    # Código de biblioteca del lado del cliente
│   ├── hooks/              # Hooks reutilizables
│   │   ├── ui/             # Hooks para UI
│   │   └── dashboard/      # Hooks para el dashboard
│   ├── services/           # Servicios para interactuar con APIs
│   └── utils/              # Funciones utilitarias
│
├── public/                 # Archivos estáticos
└── prisma/                 # Esquema y configuración de Prisma
```

## Componentes

### Componentes del Dashboard (`app/dashboard/components/`)

El dashboard está organizado en componentes modulares para facilitar el mantenimiento:

#### Estructura

```
app/dashboard/components/
├── actions/               # Componentes para acciones específicas
│   ├── CategoryActions.tsx
│   ├── SectionActions.tsx
│   ├── ProductActions.tsx
│   └── index.ts
│
├── modals/                # Modales específicos del dashboard
│   ├── base/              # Componentes base para modales
│   ├── DeleteCategoryConfirmation.tsx
│   ├── DeleteSectionConfirmation.tsx
│   ├── DeleteProductConfirmation.tsx
│   └── index.ts
│
├── views/                 # Vistas principales del dashboard
│   ├── CategoriesView.tsx
│   ├── SectionsView.tsx
│   ├── ProductsView.tsx
│   └── index.ts
│
└── tables/                # Tablas específicas del dashboard
    ├── CategoryTable.tsx
    ├── SectionTable.tsx
    ├── ProductTable.tsx
    └── index.ts
```

#### Responsabilidades

- **Actions**: Componentes que proporcionan acciones para cada entidad (crear, editar, etc.)
- **Modals**: Componentes para mostrar modales específicos (confirmación de eliminación, formularios, etc.)
- **Views**: Componentes principales para la visualización de las diferentes secciones
- **Tables**: Componentes para mostrar datos tabulares con funcionalidades como ordenación y filtrado

### Componentes Globales (`components/`)

Componentes reutilizables en toda la aplicación:

#### Estructura

```
components/
├── ui/                    # Componentes UI básicos
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Modal.tsx
│   └── ...
│
├── forms/                 # Componentes de formularios
│   ├── CategoryForm.tsx
│   ├── SectionForm.tsx
│   └── ProductForm.tsx
│
├── modals/                # Componentes base para modales
│   ├── BaseModal.tsx
│   ├── FormModal.tsx
│   └── ConfirmationModal.tsx
│
└── tables/                # Componentes de tablas
    ├── CategoryTable.tsx
    ├── SectionTable.tsx
    └── ProductTable.tsx
```

#### Responsabilidades

- **UI**: Componentes UI básicos que siguen los principios de diseño
- **Forms**: Formularios reutilizables para crear y editar entidades
- **Modals**: Componentes base para construir modales en toda la aplicación
- **Tables**: Componentes de tabla genéricos con funcionalidades comunes

## Hooks

### Hooks de UI (`lib/hooks/ui/`)

```
lib/hooks/ui/
├── useDragAndDrop.ts       # Hook para funcionalidad de arrastrar y soltar
├── useModalState.ts        # Hook para gestionar estados de modales
├── useLoadingState.ts      # Hook para gestionar estados de carga
└── useToastNotifications.ts # Hook para gestionar notificaciones toast
```

#### Responsabilidades

- **useDragAndDrop**: Proporciona funcionalidad de arrastrar y soltar para listas reordenables
- **useModalState**: Gestiona el estado de los modales (abierto/cerrado)
- **useLoadingState**: Gestiona estados de carga para operaciones asíncronas
- **useToastNotifications**: Proporciona una interfaz para mostrar notificaciones toast

### Hooks del Dashboard (`lib/hooks/dashboard/`)

```
lib/hooks/dashboard/
├── useDashboardService.ts   # Hook para acceder a servicios del dashboard
├── useDashboardCategories.ts # Hook para gestionar categorías
├── useDashboardSections.ts  # Hook para gestionar secciones
├── useDashboardProducts.ts  # Hook para gestionar productos
└── useDashboardModals.ts    # Hook para gestionar modales del dashboard
```

#### Responsabilidades

- **useDashboardService**: Proporciona acceso a las operaciones CRUD del dashboard
- **useDashboardCategories**: Gestiona el estado y operaciones de categorías
- **useDashboardSections**: Gestiona el estado y operaciones de secciones
- **useDashboardProducts**: Gestiona el estado y operaciones de productos
- **useDashboardModals**: Gestiona los diversos modales del dashboard

## Servicios

Los servicios están ubicados en `lib/services/` y proporcionan una capa de abstracción para interactuar con la API:

```
lib/services/
├── api.ts                  # Cliente base para peticiones API
├── dashboardService.ts     # Servicios para el dashboard
├── categoryService.ts      # Servicios para categorías
├── sectionService.ts       # Servicios para secciones
└── productService.ts       # Servicios para productos
```

### Responsabilidades

- **api.ts**: Proporciona un cliente HTTP configurable para las peticiones API
- **dashboardService.ts**: Operaciones específicas del dashboard
- **categoryService.ts**: Operaciones CRUD para categorías
- **sectionService.ts**: Operaciones CRUD para secciones
- **productService.ts**: Operaciones CRUD para productos

## Contextos

La aplicación utiliza contextos de React para gestionar el estado global:

```
app/dashboard/context/
├── DashboardContext.tsx    # Contexto principal del dashboard
└── index.ts                # Exportaciones del contexto
```

### Responsabilidades

- **DashboardContext**: Proporciona acceso global al estado del dashboard, incluyendo:
  - Estado de categorías, secciones y productos
  - Estado de navegación (vista actual, elementos seleccionados)
  - Estado de UI (carga, errores, expansión de elementos)
  - Funciones para actualizar el estado

## Flujo de Datos

El flujo de datos en la aplicación sigue un patrón similar a Flux/Redux:

1. **UI**: Los componentes muestran datos y capturan eventos de usuario
2. **Hooks**: Proporcionan funciones para actualizar el estado en respuesta a eventos
3. **Servicios**: Realizan operaciones CRUD mediante llamadas a la API
4. **Contexto**: Mantiene el estado global y notifica a los componentes de los cambios

### Ejemplo: Eliminar una categoría

1. El usuario hace clic en "Eliminar" en una categoría
2. El componente llama a `handleDeleteCategory(categoryId)`
3. Esta función abre un modal de confirmación
4. Si el usuario confirma:
   - Se llama a `deleteCategory(categoryId)` del hook `useDashboardService`
   - Este hook llama a `dashboardService.deleteCategory(categoryId)`
   - El servicio hace una petición DELETE a `/api/categories/${categoryId}`
   - Si la petición es exitosa, se actualiza el estado en el contexto
   - Los componentes se re-renderizan con los datos actualizados

## Convenciones de Código

### Nomenclatura

- **Componentes**: PascalCase (ej. `CategoryTable.tsx`)
- **Hooks**: camelCase con prefijo "use" (ej. `useModalState.ts`)
- **Servicios**: camelCase con sufijo "Service" (ej. `dashboardService.ts`)
- **Contextos**: PascalCase con sufijo "Context" (ej. `DashboardContext.tsx`)

### Estructura de Componentes

```tsx
/**
 * @fileoverview Descripción del componente
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-03-27
 */

import React from 'react';

/**
 * Props para el componente
 */
interface ComponentProps {
  // Propiedades con JSDoc
}

/**
 * Componente Component
 * 
 * Descripción detallada del componente
 * 
 * @example
 * // Ejemplo de uso
 * <Component prop1="value" />
 */
const Component: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // Lógica del componente
  
  return (
    // JSX
  );
};

export default Component;
```

### Estructura de Hooks

```tsx
/**
 * @fileoverview Descripción del hook
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-03-27
 */

import { useState, useCallback } from 'react';

/**
 * Hook useCustomHook
 * 
 * Descripción detallada del hook
 * 
 * @example
 * // Ejemplo de uso
 * const { value, setValue } = useCustomHook();
 * 
 * @returns Objeto con valores y funciones
 */
export function useCustomHook() {
  // Lógica del hook
  
  return {
    // Valores y funciones
  };
}

export default useCustomHook;
``` 