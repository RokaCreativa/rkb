# Modelo de Datos - Dashboard V2

Este documento describe el modelo de datos utilizado en el Dashboard V2 de RokaMenu, explicando las entidades principales, sus relaciones y los estados manejados por la aplicación.

## Entidades Principales

### Cliente (Client)

Representa a un negocio que utiliza RokaMenu para gestionar sus menús digitales.

```typescript
interface Client {
  id: number;               // Identificador único del cliente
  name: string;             // Nombre del negocio
  main_logo: string | null; // Logo principal del negocio
  secondary_logo: string | null; // Logo secundario (opcional)
  contact_email: string;    // Email de contacto
  contact_phone: string;    // Teléfono de contacto
  business_type: string;    // Tipo de negocio (restaurante, café, etc.)
  status: number;           // Estado del cliente (1: activo, 0: inactivo)
}
```

### Categoría (Category)

Representa una agrupación de primer nivel en el menú, como "Entradas", "Platos principales", "Postres", etc.

```typescript
interface Category {
  category_id: number;      // Identificador único de la categoría
  name: string;             // Nombre de la categoría
  image: string | null;     // Imagen representativa (opcional)
  status: number;           // Estado (1: visible, 0: oculta)
  display_order: number;    // Orden de visualización
  client_id: number;        // Cliente al que pertenece
  sections_count?: number;  // Número total de secciones (calculado)
  visible_sections_count?: number; // Número de secciones visibles (calculado)
}
```

### Sección (Section)

Representa una subdivisión dentro de una categoría, como "Pizzas", "Pastas", etc. dentro de "Platos principales".

```typescript
interface Section {
  section_id: number;       // Identificador único de la sección
  name: string;             // Nombre de la sección
  image: string | null;     // Imagen representativa
  category_id: number;      // Categoría a la que pertenece
  client_id: number;        // Cliente al que pertenece
  display_order: number;    // Orden de visualización
  status: number;           // Estado (1: visible, 0: oculta)
  created_at?: string;      // Fecha de creación
  updated_at?: string;      // Fecha de última actualización
  products_count?: number;  // Número total de productos (calculado)
  visible_products_count?: number; // Número de productos visibles (calculado)
}
```

### Producto (Product)

Representa un elemento específico que se puede ordenar, como "Pizza Margarita", "Pasta Carbonara", etc.

```typescript
interface Product {
  product_id: number;       // Identificador único del producto
  name: string;             // Nombre del producto
  image: string | null;     // Imagen del producto
  status: number;           // Estado (1: visible, 0: oculto)
  price: string;            // Precio del producto
  section_id: number;       // Sección a la que pertenece
  client_id: number;        // Cliente al que pertenece
  display_order: number;    // Orden de visualización
  description?: string;     // Descripción detallada (opcional)
}
```

## Relaciones entre Entidades

El modelo de datos sigue una estructura jerárquica:

```
Cliente
  └── Categoría
       └── Sección
            └── Producto
```

- Un **Cliente** puede tener múltiples **Categorías**
- Una **Categoría** pertenece a un único **Cliente** y puede tener múltiples **Secciones**
- Una **Sección** pertenece a una única **Categoría** y puede tener múltiples **Productos**
- Un **Producto** pertenece a una única **Sección**

## Estados del Dashboard

### Estado Global (DashboardState)

```typescript
interface DashboardState {
  client: Client | null;    // Cliente actual
  categories: Category[];   // Lista de categorías
  sections: { [key: string]: Section[] }; // Mapa de secciones por categoría
  products: { [key: string]: Product[] }; // Mapa de productos por sección
  selectedCategory: Category | null;      // Categoría seleccionada
  selectedSection: Section | null;        // Sección seleccionada
  expandedCategories: { [key: number]: boolean }; // Estado de expansión de categorías
  currentView: 'CATEGORIES' | 'SECTIONS' | 'PRODUCTS'; // Vista actual
  isLoading: boolean;       // Estado de carga general
  isSectionsLoading: boolean; // Estado de carga de secciones
  isUpdatingVisibility: number | null; // ID del elemento cuya visibilidad se está actualizando
  error: string | null;     // Mensaje de error si existe
  loadingSections: { [key: number]: boolean }; // Estado de carga por sección
  isReorderModeActive: boolean; // Modo de reordenamiento activo
}
```

### Estados por Dominio

Para una mejor organización, el estado global se divide en estados específicos por dominio:

#### Estado de Categorías (CategoryState)

```typescript
interface CategoryState {
  categories: Category[];   // Lista de categorías
  isLoading: boolean;       // Estado de carga
  error: string | null;     // Error específico de categorías
  isUpdatingVisibility: number | null; // ID de la categoría cuya visibilidad se está actualizando
}
```

#### Estado de Secciones (SectionState)

```typescript
interface SectionState {
  sections: { [key: string]: Section[] }; // Mapa de secciones por categoría
  isLoading: boolean;       // Estado de carga
  error: string | null;     // Error específico de secciones
  isUpdatingVisibility: number | null; // ID de la sección cuya visibilidad se está actualizando
}
```

#### Estado de Productos (ProductState)

```typescript
interface ProductState {
  products: { [key: string]: Product[] }; // Mapa de productos por sección
  isLoading: boolean;       // Estado de carga
  error: string | null;     // Error específico de productos
  isUpdatingVisibility: number | null; // ID del producto cuya visibilidad se está actualizando
}
```

## Tipos de Vista

El dashboard puede mostrar diferentes vistas según el nivel de navegación:

```typescript
type ViewType = 'CATEGORIES' | 'SECTIONS' | 'PRODUCTS';
```

- **CATEGORIES**: Muestra la lista de categorías del menú
- **SECTIONS**: Muestra las secciones dentro de una categoría seleccionada
- **PRODUCTS**: Muestra los productos dentro de una sección seleccionada

## Modos de Interacción

Define los diferentes modos de interacción con los elementos del menú:

```typescript
type InteractionMode = 'VIEW' | 'CREATE' | 'EDIT' | 'DELETE';
```

- **VIEW**: Modo de visualización normal
- **CREATE**: Modo de creación de nuevo elemento
- **EDIT**: Modo de edición de elemento existente
- **DELETE**: Modo de confirmación de eliminación

## Flujo de Datos

1. Al cargar el dashboard, se obtiene la información del cliente y sus categorías.
2. Las categorías se muestran como la vista inicial.
3. Al seleccionar una categoría, se cargan sus secciones y se muestra la vista de secciones.
4. Al seleccionar una sección, se cargan sus productos y se muestra la vista de productos.
5. Las acciones de creación, edición, eliminación y cambio de visibilidad se realizan mediante modales y se reflejan inmediatamente en la UI.

## Estructura de Carpetas

El código que implementa este modelo de datos está organizado en:

- `/app/dashboard-v2/types/`: Definiciones de tipos e interfaces
- `/app/dashboard-v2/hooks/`: Hooks para gestión de estado por dominio
- `/app/dashboard-v2/components/views/`: Componentes visuales por dominio
- `/app/dashboard-v2/components/modals/`: Modales para las diferentes operaciones

## Validación de Acceso

El acceso al dashboard está restringido a usuarios con roles específicos:
- **admin**: Acceso completo al dashboard
- **superadmin**: Acceso completo con permisos adicionales

La validación se realiza en `app/dashboard-v2/page.tsx` antes de renderizar el contenido. 