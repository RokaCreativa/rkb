# 🎯 Respuestas de v0.dev con Ejemplos de Código - RokaMenu

Abordemos tus preguntas específicas con ejemplos. Ten en cuenta que estos son fragmentos ilustrativos y necesitarán adaptarse a la estructura exacta de tu store y componentes.

---

## 1. 🧠 COMPUTED VALUES REACTIVOS EN ZUSTAND (CONTADORES)

**Objetivo:** Derivar contadores como "Comidas (3 secciones, 2 directos)" y manejar optimistic updates.

**Estructura del Store y Selectores (Zustand):**

\`\`\`typescript
// store/dashboardStore.ts (fragmento)
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer'; // Para mutaciones de estado más sencillas

// Tipos (simplificados)
interface Category {
id: string;
name: string;
// ... otros campos
}
interface Section {
id: string;
name: string;
categoryId: string;
// ... otros campos
}
interface Product {
id: string;
name: string;
parentId: string; // Puede ser categoryId (directo) o sectionId
parentType: 'category' | 'section';
// ... otros campos
}

interface DashboardState {
categories: Category[];
sections: Section[];
products: Product[];
// --- Acciones ---
addDirectProductToCategory: (categoryId: string, productData: Omit<Product, 'id' | 'parentId' | 'parentType'>) => Promise<void>;
// ... otras acciones
}

// Mock de API (reemplazar con tu API real)
const fakeApi = {
addProduct: async (product: Product): Promise<Product> => {
console.log('API: Adding product', product);
await new Promise(resolve => setTimeout(resolve, 500));
if (Math.random() < 0.1) throw new Error("API Error: Failed to add product"); // Simular error
return { ...product, id: `prod_${Date.now()}` };
},
};

export const useDashboardStore = create<DashboardState>()(
immer((set, get) => ({
categories: [
{ id: 'cat1', name: 'Comidas' },
{ id: 'cat2', name: 'Bebidas' },
],
sections: [
{ id: 'sec1', name: 'Entrantes', categoryId: 'cat1' },
{ id: 'sec2', name: 'Platos Fuertes', categoryId: 'cat1' },
{ id: 'sec3', name: 'Postres', categoryId: 'cat1' },
],
products: [
{ id: 'p1', name: 'Sopa del Día', parentId: 'cat1', parentType: 'category' },
{ id: 'p2', name: 'Agua Mineral', parentId: 'cat2', parentType: 'category' },
],

    addDirectProductToCategory: async (categoryId, productData) => {
      const tempId = `temp_${Date.now()}`;
      const newProductOptimistic: Product = {
        ...productData,
        id: tempId,
        parentId: categoryId,
        parentType: 'category',
      };

      // 1. Optimistic Update
      const previousProducts = get().products;
      set((state) => {
        state.products.push(newProductOptimistic);
      });

      try {
        // 2. API Call
        const savedProduct = await fakeApi.addProduct(newProductOptimistic);
        // 3. Confirm Update (reemplazar el temporal con el real del backend)
        set((state) => {
          const productIndex = state.products.findIndex(p => p.id === tempId);
          if (productIndex !== -1) {
            state.products[productIndex] = savedProduct;
          }
        });
      } catch (error) {
        console.error("Failed to add product:", error);
        // 4. Rollback
        set((state) => {
          state.products = previousProducts;
        });
        // Aquí también deberías notificar al usuario (ej. con un toast)
        throw error; // Re-lanzar para que el componente que llamó pueda manejarlo
      }
    },

}))
);

// Selectores (fuera o dentro del componente con useMemo/useCallback si es necesario)
export const selectCategoryById = (categoryId: string) => (state: DashboardState) =>
state.categories.find(c => c.id === categoryId);

export const selectSectionsForCategory = (categoryId: string) => (state: DashboardState) =>
state.sections.filter(s => s.categoryId === categoryId);

export const selectDirectProductsForCategory = (categoryId: string) => (state: DashboardState) =>
state.products.filter(p => p.parentId === categoryId && p.parentType === 'category');

// Selector combinado para el contador
export const selectCategoryWithCounts = (categoryId: string) => (state: DashboardState) => {
const category = selectCategoryById(categoryId)(state);
if (!category) return null;

const sections = selectSectionsForCategory(categoryId)(state);
const directProducts = selectDirectProductsForCategory(categoryId)(state);

return {
...category,
sectionsCount: sections.length,
directProductsCount: directProducts.length,
};
};
\`\`\`

**Uso en Componente:**

```typescript jsx
// MyCategoryComponent.tsx
import {
  useDashboardStore,
  selectCategoryWithCounts,
} from "./store/dashboardStore";

function MyCategoryComponent({ categoryId }: { categoryId: string }) {
  // El selector se re-ejecutará si cambian categories, sections, o products,
  // pero el componente solo se re-renderizará si el *resultado* del selector cambia.
  // Zustand maneja esto eficientemente por defecto para selectores que devuelven objetos
  // si las referencias de los objetos no cambian innecesariamente.
  // Para selectores más complejos o que siempre devuelven nuevos objetos/arrays,
  // se puede usar un segundo argumento en useStore para la igualdad (shallow, etc.)
  // o librerías como `proxy-memoize`.
  const categoryData = useDashboardStore(selectCategoryWithCounts(categoryId));

  if (!categoryData) return <div>Categoría no encontrada</div>;

  return (
    <div>
      {categoryData.name} ({categoryData.sectionsCount} secciones,{" "}
      {categoryData.directProductsCount} directos)
    </div>
  );
}
```

**Notas sobre Optimistic Updates y Rollback:**

- El ejemplo usa `immer` para facilitar la actualización del estado inmutable.
- Guardar el estado previo (`previousProducts`) es crucial para el rollback.
- Notificar al usuario sobre el éxito/fallo es importante (no mostrado en el ejemplo del store).
- El `tempId` ayuda a identificar el ítem optimista para reemplazarlo o eliminarlo.
