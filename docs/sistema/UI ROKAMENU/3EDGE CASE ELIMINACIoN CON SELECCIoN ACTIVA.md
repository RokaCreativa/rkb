**Objetivo:** Resetear selecciones dependientes en Zustand y manejar cascada.

```typescript
// store/dashboardStore.ts (fragmento de la acción de eliminar)
// Asume que tienes selectedCategoryId, selectedSectionId en tu estado

// ... (definiciones de estado y tipos como antes) ...

interface DashboardState {
// ... (estado previo)
selectedCategoryId: string | null;
selectedSectionId: string | null;

deleteCategoryAndCleanup: (categoryIdToDelete: string) => Promise`<void>`;
}

// ... (dentro de create(immer((set, get) => ({ ... })))) ...
selectedCategoryId: null,
selectedSectionId: null,

deleteCategoryAndCleanup: async (categoryIdToDelete) => {
  // Guardar estado previo para rollback
  const prevState = {
    categories: [...get().categories],
    sections: [...get().sections],
    products: [...get().products],
    selectedCategoryId: get().selectedCategoryId,
    selectedSectionId: get().selectedSectionId,
  };

  // 1. Optimistic Update y Limpieza en Cascada
  set((state) => {
    state.categories = state.categories.filter(c => c.id !== categoryIdToDelete);
    // Eliminar secciones hijas
    state.sections = state.sections.filter(s => s.categoryId !== categoryIdToDelete);
    // Eliminar productos hijos (directos de categoría y de secciones hijas)
    state.products = state.products.filter(p => {
      if (p.parentType === 'category' && p.parentId === categoryIdToDelete) return false;
      // Para productos en secciones, necesitamos saber qué secciones se eliminaron
      const sectionWasChildOfDeletedCategory = prevState.sections.find(s => s.id === p.parentId && s.categoryId === categoryIdToDelete);
      if (p.parentType === 'section' && sectionWasChildOfDeletedCategory) return false;
      return true;
    });

    // 2. Resetear Selecciones Dependientes
    if (state.selectedCategoryId === categoryIdToDelete) {
      state.selectedCategoryId = null;
      state.selectedSectionId = null; // Si la categoría se elimina, la sección seleccionada (si era hija) ya no es válida
    }
    // Podrías añadir lógica más fina si selectedSectionId pertenece a una categoría diferente
  });

  try {
    // await api.deleteCategory(categoryIdToDelete); // API call
    console.log(`API: Deleting category ${categoryIdToDelete} and its children`);
    await new Promise(resolve => setTimeout(resolve, 500));
    if (Math.random() < 0.1) throw new Error("API Error: Failed to delete category");
  } catch (error) {
    console.error("Failed to delete category:", error);
    // 3. Rollback
    set((state) => {
      state.categories = prevState.categories;
      state.sections = prevState.sections;
      state.products = prevState.products;
      state.selectedCategoryId = prevState.selectedCategoryId;
      state.selectedSectionId = prevState.selectedSectionId;
    });
    throw error;
  }
},


```

**Notas:**

- La limpieza de productos de secciones hijas es un poco más compleja porque necesitas saber qué secciones pertenecían a la categoría eliminada. El ejemplo lo simplifica usando `prevState.sections`.
- El backend también debería manejar esta eliminación en cascada para asegurar la integridad de los datos. El frontend lo hace optimistamente.

---

## 4. 🎨 LISTA MIXTA PERFORMANTE

**Objetivo:** Componente para lista mixta (secciones + productos directos) con `React.memo` y `useCallback`.

**Selector Combinado (Zustand):**

\`\`\`typescript
// store/dashboardStore.ts
export type MixedListItem = (Section & { itemType: 'section' }) | (Product & { itemType: 'product' });

export const selectMixedContentForCategory = (categoryId: string) => (state: DashboardState): MixedListItem[] => {
const sections = selectSectionsForCategory(categoryId)(state)
.map(s => ({ ...s, itemType: 'section' as const })) // Añadir itemType
.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)); // Asume displayOrder

const directProducts = selectDirectProductsForCategory(categoryId)(state)
.map(p => ({ ...p, itemType: 'product' as const })) // Añadir itemType
.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)); // Asume displayOrder

// Secciones primero, luego productos directos
return [...sections, ...directProducts];
};

**Componente de Ítem y Lista:**

// MixedListItemComponent.tsx
import React, { useCallback } from 'react';
import { MixedListItem, Section, Product } from './store/dashboardStore'; // Asume displayOrder en tipos
import { Folder, Package } from 'lucide-react'; // Iconos

interface ItemDisplayProps {
item: MixedListItem;
onSelect: (item: MixedListItem) => void;
}

const ItemDisplay: React.FC<ItemDisplayProps> = React.memo(({ item, onSelect }) => {
const Icon = item.itemType === 'section' ? Folder : Package;
const handleClick = () => onSelect(item);

console.log(`Rendering Item: ${item.name}`); // Para depurar re-renders

return (
<div
      onClick={handleClick}
      className="p-2 border-b cursor-pointer hover:bg-gray-100 flex items-center"
    >
<Icon className="h-5 w-5 mr-2" />
{item.name}
{item.itemType === 'product' && <span className="ml-2 text-sm text-gray-500">${(item as Product).price}</span>}
</div>
);
});
ItemDisplay.displayName = 'ItemDisplay';

// CategoryContentView.tsx
import { useDashboardStore, selectMixedContentForCategory, MixedListItem } from './store/dashboardStore';

interface CategoryContentViewProps {
categoryId: string;
onItemSelected: (item: MixedListItem) => void; // Para manejar la selección
}

export function CategoryContentView({ categoryId, onItemSelected }: CategoryContentViewProps) {
const mixedContent = useDashboardStore(selectMixedContentForCategory(categoryId));

// useCallback para asegurar que la prop onSelect no cambie en cada render de CategoryContentView,
// lo que permitiría a React.memo en ItemDisplay funcionar correctamente.
const handleItemSelect = useCallback((item: MixedListItem) => {
console.log("Selected item:", item);
onItemSelected(item);
}, [onItemSelected]); // Depende de onItemSelected, que debería ser estable o también memoizada por el padre

if (!mixedContent.length) {
return <p className="p-4 text-gray-500">Esta categoría está vacía o no tiene secciones/productos directos.</p>;
}

return (
<div className="border rounded">
{mixedContent.map(item => (
<ItemDisplay key={item.id} item={item} onSelect={handleItemSelect} />
))}
</div>
);
}
