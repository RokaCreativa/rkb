# ESTÁNDARES TÉCNICOS DEL PROYECTO ROKAMENU

## 📋 Índice
1. [Convenciones de Tipos](#convenciones-de-tipos)
2. [Organización de Hooks](#organización-de-hooks)
3. [Estructura de Librerías](#estructura-de-librerías)
4. [Patrones de Diseño](#patrones-de-diseño)
5. [Mejores Prácticas](#mejores-prácticas)

---

## Convenciones de Tipos

### Entidades Principales

#### Category
```typescript
// En lib/types/menu.ts
export interface Category {
  category_id: number;
  name: string;
  image: string | null;
  status: boolean; // En la base de datos es 0/1, se convierte a boolean
  display_order: number;
  client_id: number;
  deleted: boolean; // En la base de datos es 0/1, se convierte a boolean
  sections?: Section[]; // Opcional para carga lazy
}

// En la API puede venir como:
interface ApiCategory {
  category_id: number;
  name: string;
  image: string | null;
  status: number; // 0 o 1
  display_order: number;
  client_id: number;
  deleted: number; // 0 o 1
}
```

#### Section
```typescript
export interface Section {
  section_id: number;
  name: string;
  image: string | null;
  status: boolean;
  display_order: number;
  category_id: number;
  client_id: number;
  deleted: boolean;
  products?: Product[]; // Opcional para carga lazy
}
```

#### Product
```typescript
export interface Product {
  product_id: number;
  name: string;
  description: string | null;
  image: string | null;
  price: number;
  status: boolean;
  display_order: number;
  section_id: number;
  client_id: number;
  deleted: boolean;
  allergens?: Allergen[];
}
```

### Conversiones y Adaptadores

Para manejar las diferencias entre tipos de la API y tipos internos:

```typescript
// lib/adapters/category-adapter.ts
export function adaptApiCategoryToDashboard(
  apiCategory: ApiCategory
): Category {
  return {
    ...apiCategory,
    status: apiCategory.status === 1,
    deleted: apiCategory.deleted === 1
  };
}

export function adaptDashboardCategoryToApi(
  category: Category
): ApiCategory {
  return {
    ...category,
    status: category.status ? 1 : 0,
    deleted: category.deleted ? 1 : 0
  };
}
```

### Estándares de Nomenclatura

- **Interfaces**: PascalCase (Ej: `Category`, `ProductResponse`)
- **Tipos**: PascalCase (Ej: `CategoryId`, `SortDirection`)
- **Enums**: PascalCase (Ej: `SortOrder`, `ViewMode`)
- **Props de Componentes**: Suffix `Props` (Ej: `CategoryTableProps`)
- **Respuestas API**: Suffix `Response` (Ej: `GetCategoriesResponse`)

---

## Organización de Hooks

### Estructura de Carpetas

```
lib/
  hooks/
    ui/                   # Hooks relacionados con UI
      useToast.ts
      useModal.ts
      usePagination.ts
    dashboard/            # Hooks específicos del dashboard
      useDashboardCategories.ts
      useDashboardSections.ts
    forms/                # Hooks para formularios
      useForm.ts
app/
  hooks/                  # Hooks específicos de la aplicación
    useCategories.tsx     # Hook principal de categorías
    useSections.tsx
    useProducts.tsx
```

### Hooks Principales y sus Responsabilidades

#### useCategories

```typescript
// Interfaz pública
interface UseCategoriesReturn {
  categories: Category[];
  isLoadingCategories: boolean;
  fetchCategories: (options?: PaginationOptions) => Promise<void>;
  createCategory: (data: CategoryFormData) => Promise<Category>;
  updateCategory: (id: number, data: CategoryFormData) => Promise<Category>;
  deleteCategory: (id: number) => Promise<void>;
  toggleCategoryVisibility: (id: number, status: boolean) => Promise<void>;
  reorderCategory: (id: number, newOrder: number) => Promise<void>;
  expandedCategories: Set<number>;
  toggleCategoryExpansion: (id: number) => void;
}

const useCategories = (clientId: number | null): UseCategoriesReturn => {
  // Implementación...
}
```

#### useDashboardCategories

```typescript
// Hook adaptado para el dashboard
interface UseDashboardCategoriesReturn {
  categories: DashboardCategory[];
  isLoading: boolean;
  pagination: PaginationState;
  setPagination: (pagination: PaginationState) => void;
  // Métodos específicos del dashboard...
}

const useDashboardCategories = (clientId: number): UseDashboardCategoriesReturn => {
  // Implementación usando adaptadores...
}
```

### Patrones para Hooks

1. **Composición sobre Herencia**: Crear hooks pequeños y especializados que se puedan componer.

   ```typescript
   // Mal
   const useGiantHook = () => { /* muchas responsabilidades */ }
   
   // Bien
   const useData = () => { /* obtener datos */ }
   const useUIState = () => { /* estado UI */ }
   const useCombined = () => {
     const data = useData();
     const ui = useUIState();
     return { ...data, ...ui };
   }
   ```

2. **Adaptadores para Compatibilidad**: Usar adaptadores para mantener la compatibilidad.

   ```typescript
   // lib/adapters/hook-adapters.ts
   export function adaptHook(hook, adapter) {
     return (...args) => {
       const hookResult = hook(...args);
       return adapter(hookResult);
     };
   }
   ```

3. **Persistencia de Estado**: Usar localStorage/sessionStorage para estados persistentes.

   ```typescript
   const usePersistedState = (key, initialState) => {
     // Implementación para persistir estado entre sesiones
   }
   ```

---

## Estructura de Librerías

### Adaptadores (lib/adapters)

Responsabilidad: Convertir datos entre diferentes formatos y sistemas de tipos.

```
lib/adapters/
  category-adapter.ts     # Adaptadores para categorías
  section-adapter.ts      # Adaptadores para secciones
  product-adapter.ts      # Adaptadores para productos
  hook-adapters.ts        # Adaptadores para hooks
```

### Servicios (lib/services)

Responsabilidad: Comunicación con APIs y servicios externos.

```
lib/services/
  api.ts                  # Cliente base API
  dashboardService.ts     # Servicios específicos del dashboard
  categoryService.ts      # Servicios para categorías
```

### Utilidades (lib/utils)

Responsabilidad: Funciones utilitarias reusables.

```
lib/utils/
  formatting.ts           # Formateo de texto, números, fechas
  validation.ts           # Validaciones comunes
  imageUtils.ts           # Utilidades para imágenes
  tailwind.ts             # Utilidades para Tailwind CSS
```

### Handlers (lib/handlers)

Responsabilidad: Manejo de eventos y acciones.

```
lib/handlers/
  categoryEventHandlers.ts # Controladores de eventos para categorías
  sectionEventHandlers.ts  # Controladores de eventos para secciones
  productEventHandlers.ts  # Controladores de eventos para productos
```

---

## Patrones de Diseño

### Patrón Adaptador

Usado para convertir interfaces incompatibles:

```typescript
// Ejemplo: Adaptador para funciones de categorías
export function adaptToggleCategoryVisibility(
  toggleFromHook: (id: number, status: boolean) => Promise<void>,
) {
  return async (id: number, status: number) => {
    // Convertir de numérico a booleano para el hook
    return toggleFromHook(id, status === 1);
  };
}
```

### Patrón Repository

Abstracción para acceso a datos:

```typescript
// Ejemplo: Repositorio para categorías
class CategoryRepository {
  async getAll(clientId: number, options?: PaginationOptions): Promise<Category[]> {
    // Implementación...
  }
  
  async create(clientId: number, data: CategoryFormData): Promise<Category> {
    // Implementación...
  }
  
  // Otros métodos...
}
```

### Container/Presenter Pattern

Separación de lógica y presentación:

```tsx
// Container Component (con lógica)
const CategoryContainer = () => {
  const { categories, isLoading, deleteCategory } = useCategories(clientId);
  return <CategoryPresenter 
    categories={categories} 
    isLoading={isLoading} 
    onDelete={deleteCategory} 
  />;
}

// Presenter Component (solo UI)
const CategoryPresenter = ({ categories, isLoading, onDelete }) => {
  // Renderizado sin lógica de negocio
}
```

---

## Mejores Prácticas

### Tipado

1. **Evitar `any`**: Preferir tipado explícito o `unknown` si es necesario.
2. **Interfaces sobre Types**: Usar interfaces para objetos y clases.
3. **Usar Tipos Utilitarios**: `Partial<T>`, `Omit<T, K>`, `Pick<T, K>`.
4. **Validar en Bordes**: Validar y tipificar datos en puntos de entrada/salida.

### Performance

1. **Memoización**: Usar `React.memo`, `useMemo` y `useCallback` para componentes costosos.
2. **Lazy Loading**: Implementar carga diferida de componentes y datos.
3. **Virtualización**: Considerar para listas largas con `react-window` o similar.
4. **Optimización de Re-renders**: Evitar props innecesarias, usar inmutabilidad.

### Manejo de Estados

1. **Lifting State Up**: Elevar estado al ancestro común más cercano.
2. **Estado Local vs Global**: Preferir estado local cuando sea posible.
3. **Inmutabilidad**: Mantener inmutabilidad en actualizaciones de estado.
4. **Estado Derivado**: Calcular estados derivados en lugar de duplicarlos.

---

**Última actualización**: Marzo 2024
**Responsable**: Equipo de Desarrollo RokaMenu 