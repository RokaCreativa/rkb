# 💡 Gestión de Productos Huérfanos Globales y Productos Directos en Categorías

Este documento describe cómo implementar ambas funcionalidades de manera coherente:
1.  **Productos Directos en Categorías (T31)**: Ítems como "Sopa del día" directamente bajo la categoría "Comidas".
2.  **Productos Huérfanos Globales**: Ítems como "Especial del Chef" que no encajan en una categoría de menú estándar pero necesitan ser gestionados.

## 🚀 Estrategia Propuesta: "Categoría Contenedora Global"

En lugar de una "categoría invisible" (que podría ser confusa), proponemos una **"Categoría Contenedora Global"** visible y especial. Esta categoría:
-   Tendrá un nombre fijo y reconocible, por ejemplo: **"Productos Globales"**, **"Ítems Destacados"** o **"Generales"**.
-   Aparecerá en el grid principal junto con las demás categorías, posiblemente con un estilo o icono distintivo.
-   Funcionará como una categoría en "modo simple", es decir, al seleccionarla, mostrará directamente una lista de productos (los "huérfanos").
-   No podrá tener secciones.
-   Ciertas acciones (como renombrar o eliminar esta categoría especial) estarán deshabilitadas.

### ✅ Ventajas de esta Estrategia:
*   **Claridad en la UI**: El administrador sabe exactamente dónde encontrar y gestionar estos productos especiales.
*   **Reutilización de Lógica**: Aprovecha la funcionalidad existente de "productos directos en categorías" (T31).
*   **Modelo de Datos Consistente**: Los productos "huérfanos" siguen teniendo un `category_id`, que apunta a esta categoría contenedora.
*   **Escalabilidad**: Si en el futuro necesitas diferentes tipos de "productos globales", podrías tener múltiples categorías contenedoras especiales.

## 🛠️ Pasos de Implementación

### 1. Modelo de Datos (Backend)

*   **Tabla `categories`**:
    *   Añade una nueva categoría con un `slug` o `id` especial y conocido.
        *   Ejemplo: `name: "Productos Globales"`, `slug: "global-items"`, `is_system_category: true` (nuevo campo opcional para identificarla).
    *   Esta categoría tendrá `display_order` para posicionarla en el grid (ej. al principio o al final).
    *   No se le podrán asociar secciones.
*   **Tabla `products`**:
    *   Los productos "huérfanos" tendrán su `category_id` apuntando al `id` de esta "Categoría Contenedora Global".
    *   Su `section_id` será `null`.

### 2. Lógica del Store (Zustand - `dashboardStore.ts`)

*   **`fetchCategories`**:
    *   Debe cargar esta "Categoría Contenedora Global" como cualquier otra.
    *   Si añadiste `is_system_category`, el store podría usar este flag para lógica especial si es necesario (ej. deshabilitar ciertas acciones).
*   **`useCategoryDisplayMode(categoryId)`**:
    *   Para el `categoryId` de la "Categoría Contenedora Global", este hook **siempre** debe devolver `'simple'` (o el valor que indique que solo muestra productos).
*   **`fetchProductsByCategory(categoryId)`**:
    *   Esta función ya debería funcionar correctamente para cargar los productos de la "Categoría Contenedora Global", ya que es similar a una categoría normal con productos directos.
*   **Acciones CRUD (ej. `updateCategory`, `deleteCategory`)**:
    *   Deberán verificar si la categoría es la "Categoría Contenedora Global" (usando su `id` o `slug` conocido) y deshabilitar/modificar la acción si es necesario. Por ejemplo, no se debería poder eliminar.

### 3. Interfaz de Usuario (Componentes React)

#### A. `CategoryGridView.tsx` (Grid Principal de Categorías)

*   **Renderizado de Tarjeta**:
    *   La "Categoría Contenedora Global" se renderiza como una tarjeta más.
    *   **Opcional**: Aplicar un estilo visual distintivo (icono especial, color de fondo) a la tarjeta de esta categoría para diferenciarla.
    *   **Ejemplo de datos para la tarjeta**:
        \`\`\`javascript
        // Dentro del map de categories
        const isGlobalCategory = category.slug === 'global-items';
        // ...
        <CategoryCard
            category={category}
            isSpecial={isGlobalCategory}
            // ...
        />