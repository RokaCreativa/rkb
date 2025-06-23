# 📘 INSTRUCCIONES COMPLETAS PARA CLAUDE
**Refactor total del sistema de reordenamiento (Categorías, Secciones, Productos)**  
**Proyecto: RokaMenu | Framework: Next.js 15 + Zustand + Prisma + React 19**

---

## 🎯 OBJETIVO GENERAL
Reemplazar el sistema actual de reordenamiento con uno **único, reutilizable e inmutable**, que:
- Funcione correctamente en los 3 grids (categorías, secciones, productos).
- Use `Zustand` con `immer` bien aplicado.
- Evite mutaciones in-place.
- Simplifique la lógica usando funciones reutilizables.
- Prepare la base para integración futura con drag & drop.

---

## 🧱 ARQUITECTURA NUEVA

### 1. Crear carpeta de utilidades:
```
/app/dashboard-v2/utils/reorder/
```

### 2. Crear archivos:

#### a) `reorderItem.ts`
```ts
export function reorderItem<T>(
  list: T[],
  index: number,
  direction: 'up' | 'down',
  getOrder: (item: T) => number,
  setOrder: (item: T, order: number) => T
): T[] {
  const targetIndex = direction === 'up' ? index - 1 : index + 1;
  if (index < 0 || targetIndex < 0 || targetIndex >= list.length) return list;

  const reordered = [...list];
  const currentItem = reordered[index];
  const targetItem = reordered[targetIndex];

  reordered[index] = setOrder(currentItem, getOrder(targetItem));
  reordered[targetIndex] = setOrder(targetItem, getOrder(currentItem));

  return reordered;
}
```

#### b) `getContextKey.ts`
```ts
export function getContextKey(context: 'category' | 'section' | 'product', contextId: number | string | null): string {
  if (context === 'category') return 'global';
  if (context === 'section') return String(contextId);
  if (context === 'product') return String(contextId);
  return 'unknown';
}
```

#### c) `getOrderField.ts`
```ts
export function getOrderField(context: 'category' | 'section' | 'product'): string {
  if (context === 'category') return 'categories_display_order';
  if (context === 'section') return 'sections_display_order';
  if (context === 'product') return 'products_display_order';
  return '';
}
```

---

## 🧠 MODIFICAR `moveItem` EN `dashboardStore.ts`

Reemplazar todo el bloque actual por esto:

```ts
import { reorderItem } from '@/app/dashboard-v2/utils/reorder/reorderItem';
import { getContextKey } from '@/app/dashboard-v2/utils/reorder/getContextKey';
import { getOrderField } from '@/app/dashboard-v2/utils/reorder/getOrderField';

moveItem: async ({ context, direction, item }) => {
  const get = getDashboardStore.getState;
  const set = getDashboardStore.setState;

  const contextId = context === 'category' ? null : item?.category_id || item?.section_id;
  const key = getContextKey(context, contextId);
  const orderField = getOrderField(context);

  const list = (
    context === 'category' ? get().categories :
    context === 'section' ? get().sections[key] :
    get().products[key]
  ) || [];

  const index = list.findIndex((i: any) => i.id === item.id);
  if (index === -1) return;

  const newList = reorderItem(
    list,
    index,
    direction,
    (i: any) => i[orderField],
    (i: any, newOrder: number) => ({ ...i, [orderField]: newOrder })
  );

  set((state) => {
    if (context === 'category') state.categories = newList;
    if (context === 'section') state.sections[key] = newList;
    if (context === 'product') state.products[key] = newList;
  });

  try {
    await apiClient.put(`/api/${context}s/reorder`, {
      items: newList.map((i: any) => ({
        id: i.id,
        order: i[orderField],
      })),
    });
  } catch (err) {
    console.error('🔥 Error en API reorder:', err);
  }
};
```

---

## 🧼 LIMPIEZA OBLIGATORIA

- ❌ Eliminar cualquier `set()` extra como:
  ```ts
  set({ products: { ...state.products, [key]: [...mutatedArray] } });
  ```
- ❌ Eliminar `productsForSection[index] = { ... }` o cualquier mutación directa.
- ✅ Todo debe pasar por `immer` (función `set((draft) => { ... })`).

---

## 🧪 RENDER SEGURO EN LOS GRIDS

En los 3 grids (`CategoryGridView`, `SectionGridView`, `ProductGridView`):

- Usar `useMemo()` para ordenar visualmente los datos antes del `.map()`:

```ts
const sortedItems = useMemo(() => {
  return [...items].sort((a, b) => (a.display_order ?? 999) - (b.display_order ?? 999));
}, [items]);
```

- Usar siempre `key={item.id}` o `key={`product-${id}`}` si es mixto.
- No mutar datos directamente en los componentes.

---

## 🔐 BONUS: PREVENCIÓN DE CLICS RÁPIDOS

En cada grid:
- Usar `isMoving` local (`useState`) para evitar doble click en flechas.
- Resetear `isMoving` con `setTimeout(() => ..., 300)`.

---

## 📋 CHECKLIST PARA CLAUDE

✅ Crear carpeta `/utils/reorder`  
✅ Implementar `reorderItem.ts`, `getContextKey.ts`, `getOrderField.ts`  
✅ Reescribir `moveItem` en `dashboardStore.ts`  
✅ Limpiar todo `set()` innecesario  
✅ Eliminar mutaciones in-place  
✅ Usar `immer` correctamente  
✅ Orden visual con `.sort()` y `useMemo()` en cada grid  
✅ Claves únicas y seguras en cada `map()`  
✅ Prevenir doble click con `isMoving`

---

## 🚮 ELIMINACIÓN DEL SISTEMA ANTERIOR (ANTES DE IMPLEMENTAR)

### 🔥 Eliminar del archivo `dashboardStore.ts`:

- Todo el contenido actual de la función `moveItem`.
- Cualquier otro método auxiliar que haga mutaciones como:
  ```ts
  productsForSection[index] = ...
  reorderedItems[index] = ...
  set({ products: { ...state.products, [key]: [...currentProducts] } });
  ```
- Logs de debug antiguos tipo:
  - `🔥 FIXING:`
  - `🔥 OPTIMISTIC UPDATE`
  - `🔥 Forzando nueva referencia del array`
- Comentarios o `setTimeout(() => ..., 1)` que intentaban forzar actualizaciones.

---

### 🧱 Otras funciones obsoletas (si existen):

- `reorderGrid1`, `reorderGrid2`, etc. (si estaban divididas)
- `getReorderedListWithUpdatedOrders`
- `forceNewReferenceAfterMutation`
- Cualquier función duplicada que calcule orden de forma no reutilizable.

---

### 🧽 Limpieza recomendada:

- Dejar solo un `moveItem()` limpio con lógica unificada.
- Reemplazar todos los `set(state => { ... })` que hacían clones innecesarios.
- Confirmar que ya no queda ninguna mutación directa de objetos en arrays de estado.
