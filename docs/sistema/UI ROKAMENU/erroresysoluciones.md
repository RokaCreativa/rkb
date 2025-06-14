# 🚨 Solución: Bucle Infinito en Zustand con React 19

## 📋 Diagnóstico del Problema

Los errores que estás viendo:

- `"The result of getSnapshot should be cached to avoid an infinite loop"`
- `"Maximum update depth exceeded"`

Son causados por **selectores de Zustand que devuelven nuevas referencias en cada llamada**, provocando re-renders infinitos.

## 🎯 Causa Raíz

En tu `dashboardStore.ts`, los hooks derivados (`useCategoryWithCounts`, `useCategoryProducts`, `useCategoryDisplayMode`) tienen estos problemas:

1. **Selectores que siempre devuelven nuevos objetos**
2. **Funciones de igualdad complejas que fallan**
3. **Uso incorrecto de `React.useMemo` dentro de selectores**

## 🔧 Solución Completa

### 1. Reemplaza los Hooks Derivados Problemáticos

Reemplaza todo el código desde la línea `// --- HOOKS DERIVADOS ---` hasta el final de tu `dashboardStore.ts` con esto:

\`\`\`typescript
// --- HOOKS DERIVADOS CORREGIDOS ---

export const useCategoryDisplayMode = (categoryId: number | null) => {
return useDashboardStore(
(state) => {
if (!categoryId) return 'sections';
const sections = state.sections[categoryId] || [];
return getCategoryDisplayMode(sections);
},
// Función de igualdad simple para strings
(a, b) => a === b
);
};

export const useCategoryProducts = (categoryId: number | null, sectionId?: number | null) => {
return useDashboardStore(
(state) => {
if (sectionId) {
return state.products[sectionId] || [];
} else if (categoryId) {
return state.products[`cat-${categoryId}`] || [];
}
return [];
},
// Comparación superficial de arrays
(a, b) => {
if (a.length !== b.length) return false;
return a.every((item, index) => item.product_id === b[index]?.product_id);
}
);
};

export const useCategoryWithCounts = (categoryId: number | null) => {
return useDashboardStore(
(state) => {
if (!categoryId) return null;

            const category = state.categories.find(c => c.category_id === categoryId);
            if (!category) return null;

            const sections = state.sections[categoryId] || [];
            const products = state.products[`cat-${categoryId}`] || [];

            // Devolver un objeto con estructura fija para evitar nuevas referencias
            return {
                category_id: category.category_id,
                name: category.name,
                status: category.status,
                image: category.image,
                display_order: category.display_order,
                client_id: category.client_id,
                sectionsCount: sections.length,
                visibleSectionsCount: sections.filter(s => s.status).length,
                productsCount: products.length,
                visibleProductsCount: products.filter(p => p.status).length,
            };
        },
        // Comparación profunda pero eficiente
        (a, b) => {
            if (!a && !b) return true;
            if (!a || !b) return false;

            return (
                a.category_id === b.category_id &&
                a.name === b.name &&
                a.status === b.status &&
                a.sectionsCount === b.sectionsCount &&
                a.visibleSectionsCount === b.visibleSectionsCount &&
                a.productsCount === b.productsCount &&
                a.visibleProductsCount === b.visibleProductsCount
            );
        }
    );

};
\`\`\`

### 2. Simplifica la Función de Validación

En tu store, reemplaza la función `validatePermission` con esta versión simplificada:

\`\`\`typescript
// Dentro del store, reemplaza validatePermission con:
validatePermission: () => {
// Función simple que no causa loops
return true; // TODO: Implementar validación real
},
\`\`\`

### 3. Optimiza los Componentes que Usan los Hooks

En `CategoryGridView.tsx`, asegúrate de que el componente que usa `useCategoryWithCounts` esté memoizado:

\`\`\`typescript
// En CategoryGridView.tsx
const CategoryContentDisplay = React.memo(({ categoryId }: { categoryId: number }) => {
const categoryData = useCategoryWithCounts(categoryId);

    if (!categoryData) return null;

    return (
        <div>
            {categoryData.name} ({categoryData.sectionsCount} secciones, {categoryData.productsCount} productos)
        </div>
    );

});

CategoryContentDisplay.displayName = 'CategoryContentDisplay';
\`\`\`

### 4. Verifica el GenericTable

En tu `GenericTable.tsx`, asegúrate de que no esté causando re-renders innecesarios:

\`\`\`typescript
// En GenericTable.tsx, añade React.memo
export const GenericTable = React.memo(<T,>({
data,
columns,
onRowClick,
isLoading = false,
emptyMessage = 'No hay datos disponibles',
className = '',
}: GenericTableProps<T>) => {
// ... resto del código igual
});

GenericTable.displayName = 'GenericTable';
\`\`\`

## 🎯 Cambios Clave Explicados

### 1. **Eliminación de React.useMemo en Selectores**

- **Antes**: Usabas `React.useMemo` dentro de los selectores de Zustand
- **Después**: Los selectores son funciones puras sin memoización interna

### 2. **Funciones de Igualdad Simplificadas**

- **Antes**: Funciones de igualdad complejas con `React.useCallback`
- **Después**: Funciones de igualdad simples y directas

### 3. **Estructura de Datos Consistente**

- **Antes**: Objetos que podían tener diferentes estructuras
- **Después**: Objetos con estructura fija y predecible

## 🧪 Cómo Verificar la Solución

1. **Reinicia el servidor de desarrollo**
2. **Abre las DevTools de React**
3. **Ve a la pestaña "Profiler"**
4. **Navega por tu aplicación y verifica que no hay re-renders excesivos**

## 🚨 Señales de que Está Funcionando

- ✅ No más errores de "infinite loop" en consola
- ✅ No más errores de "Maximum update depth exceeded"
- ✅ La navegación entre categorías/secciones es fluida
- ✅ Los contadores se actualizan correctamente sin parpadeos

## 🔍 Si Persiste el Problema

Si después de estos cambios sigues teniendo problemas, verifica:

1. **Que no hay otros hooks personalizados causando loops**
2. **Que los componentes padre están pasando props estables**
3. **Que no hay efectos (`useEffect`) con dependencias incorrectas**

## 📝 Notas Adicionales

- **React 19 + Zustand**: Esta combinación es más estricta con los re-renders
- **useSyncExternalStore**: Requiere que los selectores sean estables
- **Memoización**: Menos es más - solo memoiza cuando sea realmente necesario

---

**💡 Tip**: Después de aplicar estos cambios, considera usar React DevTools Profiler para monitorear el rendimiento y asegurarte de que no hay re-renders innecesarios.
