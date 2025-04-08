# 📘 Manual Completo: Sistema de Drag and Drop

## 📋 Descripción General

El sistema de arrastrar y soltar (drag and drop) del dashboard-v2 permite a los usuarios reordenar visualmente categorías, secciones y productos mediante interacción directa en la interfaz. El sistema sigue una arquitectura Domain-Driven Design (DDD) y está completamente integrado con los componentes existentes.

**Fecha de implementación**: Julio 2024

## 🏗️ Arquitectura del Sistema

El sistema de drag and drop sigue una arquitectura de tres capas:

1. **Capa de Presentación**: Componentes React (`CategoryTable`, `SectionList`, `ProductTable`) que implementan la interfaz visual y manejan eventos de usuario.
2. **Capa de Estado**: Hook central `useDragAndDrop` que gestiona la lógica de reordenamiento y el estado.
3. **Capa de Servicios**: API REST (`DashboardService`) que comunica los cambios al backend.

### Diagrama de Flujo de Datos

```
┌─────────────────┐     ┌────────────────┐     ┌───────────────┐     ┌──────────────┐
│ Componentes UI  │ ──▶ │ DragDropContext│ ──▶ │ useDragAndDrop│ ──▶ │DashboardService│
│(CategoryTable,  │     │(DashboardView) │     │(Estado global)│     │(API Calls)   │
│SectionList, etc)│ ◀── │                │ ◀── │              │ ◀── │              │
└─────────────────┘     └────────────────┘     └───────────────┘     └──────────────┘
                                                      │
                                                      ▼
                                              ┌──────────────┐
                                              │  Base de     │
                                              │   Datos      │
                                              └──────────────┘
```

## 🧩 Componentes Principales

### 1. Hook `useDragAndDrop`

**Ubicación**: `app/dashboard-v2/hooks/ui/useDragAndDrop.ts`

Este hook centraliza toda la lógica de arrastrar y soltar. Proporciona:

- Estados para controlar el modo de reordenamiento (`isReorderModeActive`)
- Estados para controlar operaciones de arrastre en curso (`isDragging`)
- Funciones específicas para reordenar cada tipo de elemento (`handleReorderCategories`, `handleReorderSections`, `handleReorderProducts`)
- Función central para determinar el tipo de elemento arrastrado (`handleGlobalDragEnd`)

**Inicialización en DashboardView**:

```typescript
const {
  isReorderModeActive,
  setIsReorderModeActive,
  isDragging,
  setIsDragging,
  handleGlobalDragEnd,
  handleReorderCategories,
  handleReorderSections,
  handleReorderProducts,
} = useDragAndDrop(
  localCategories,
  localSections,
  localProducts,
  setLocalCategories,
  setLocalSections,
  setLocalProducts
);
```

### 2. `DragDropContext`

**Ubicación**: `app/dashboard-v2/components/core/DashboardView.tsx`

Este componente envuelve toda la aplicación y proporciona el contexto para operaciones de arrastrar y soltar:

```typescript
<DragDropContext
  onDragEnd={(result) => {
    console.log("🔍 [DRAG DEBUG] DragDropContext.onDragEnd llamado con:", {
      result,
      type: result.type,
      source: result.source,
      destination: result.destination,
      handleGlobalDragEndExists: typeof handleGlobalDragEnd === "function",
      isReorderModeActive,
    });

    // Verificación crítica: solo procesar si el modo de reordenamiento está activo
    if (!isReorderModeActive) {
      console.error(
        "❌ [CRITICAL] Se ignoró onDragEnd porque isReorderModeActive es FALSE"
      );
      return;
    }

    if (typeof handleGlobalDragEnd === "function") {
      handleGlobalDragEnd(result);
    } else {
      console.error("❌ [DRAG ERROR] handleGlobalDragEnd no es una función");
    }
  }}
  onDragStart={(initial) => {
    console.log("🔍 [DRAG DEBUG] DragDropContext.onDragStart:", {
      initial,
      type: initial.type,
      isReorderModeActive,
    });
    setIsDragging(true);
  }}
>
  {/* Contenido de la aplicación */}
</DragDropContext>
```

### 3. Componentes `Droppable` y `Draggable`

#### Categorías (`CategoryTable.tsx`)

```typescript
<Droppable droppableId="category" type="category">
  {(provided) => (
    <table
      className="min-w-full divide-y category-border"
      {...provided.droppableProps}
      ref={provided.innerRef}
    >
      <tbody>
        {visibleCategories.map((category, index) => (
          <Draggable
            key={`category-${index}`}
            draggableId={`category-${index}`}
            index={index}
            isDragDisabled={!isReorderModeActive}
          >
            {(provided, snapshot) => (
              <tr
                ref={provided.innerRef}
                {...provided.draggableProps}
                className={
                  snapshot.isDragging ? "grid-item-dragging-category" : ""
                }
              >
                {/* Contenido de la categoría */}
                <td>
                  <div
                    {...provided.dragHandleProps}
                    className="category-drag-handle"
                  >
                    <GridIcon type="category" icon="drag" size="medium" />
                  </div>
                </td>
              </tr>
            )}
          </Draggable>
        ))}
        {provided.placeholder}
      </tbody>
    </table>
  )}
</Droppable>
```

#### Secciones (`SectionList.tsx`)

```typescript
<Droppable droppableId={`category-${categoryId}`} type="section">
  {(provided) => (
    <div {...provided.droppableProps} ref={provided.innerRef}>
      {sections.map((section, index) => (
        <Draggable
          key={`section-${section.section_id}`}
          draggableId={`section-${section.section_id}`}
          index={index}
          isDragDisabled={!isReorderModeActive}
        >
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              className={
                snapshot.isDragging ? "grid-item-dragging-section" : ""
              }
            >
              {/* Contenido de la sección */}
              <div
                {...provided.dragHandleProps}
                className="section-drag-handle"
              >
                <GridIcon type="section" icon="drag" size="medium" />
              </div>
            </div>
          )}
        </Draggable>
      ))}
      {provided.placeholder}
    </div>
  )}
</Droppable>
```

#### Productos (`ProductTable.tsx`)

```typescript
<Droppable
  droppableId={`products-section-${sectionId}`}
  type="product"
  isDropDisabled={!isReorderModeActive}
>
  {(provided, snapshot) => (
    <table
      className={`grid-table product-border ${
        snapshot.isDraggingOver ? "bg-amber-50/30" : ""
      }`}
      {...provided.droppableProps}
      ref={provided.innerRef}
    >
      <tbody>
        {visibleProducts.map((product, index) => (
          <Draggable
            key={`product-${product.product_id}`}
            draggableId={`product-${product.product_id}`}
            index={index}
            isDragDisabled={!isReorderModeActive}
          >
            {(provided, snapshot) => (
              <tr
                ref={provided.innerRef}
                {...provided.draggableProps}
                className={
                  snapshot.isDragging ? "grid-item-dragging-product" : ""
                }
              >
                {/* Contenido del producto */}
                <td>
                  <div
                    {...provided.dragHandleProps}
                    className="product-drag-handle"
                  >
                    <GridIcon type="product" icon="drag" size="medium" />
                  </div>
                </td>
              </tr>
            )}
          </Draggable>
        ))}
        {provided.placeholder}
      </tbody>
    </table>
  )}
</Droppable>
```

### 4. Servicios API (DashboardService)

**Ubicación**: `lib/services/dashboardService.ts`

El servicio centraliza las llamadas a la API para las operaciones de reordenamiento:

- `reorderCategories(categories: Category[]): Promise<ApiResponse>`
- `reorderSections(sections: Section[]): Promise<ApiResponse>`
- `reorderProducts(products: ProductOrder[]): Promise<ApiResponse>`

### 5. Endpoints de API

- `/api/categories/reorder`: Endpoint para reordenar categorías
- `/api/sections/reorder`: Endpoint para reordenar secciones
- `/api/products/reorder`: Endpoint para reordenar productos

## 🔄 Flujo de Operación

### Reordenamiento de Categorías

1. **Usuario inicia arrastre**: El usuario hace clic y arrastra una categoría usando el drag handle
2. **Evento `onDragStart`**: Se dispara en `DragDropContext`, que establece `isDragging = true`
3. **Usuario suelta elemento**: El usuario suelta el elemento en una nueva posición
4. **Evento `onDragEnd`**: Se dispara en `DragDropContext`, que llama a `handleGlobalDragEnd`
5. **Identificación de tipo**: `handleGlobalDragEnd` identifica que se trata de un elemento de tipo "category"
6. **Llamada a función específica**: Llama a `handleReorderCategories(sourceIndex, destinationIndex)`
7. **Actualización UI (optimista)**: Se actualiza inmediatamente el estado local con el nuevo orden
8. **Llamada a API**: Se envía la nueva ordenación al servidor mediante `DashboardService.reorderCategories`
9. **Notificación**: Se muestra al usuario un toast de éxito o error
10. **Rollback (si error)**: En caso de error, se revierte al estado anterior

### Reordenamiento de Secciones y Productos

Sigue un flujo similar, pero con las siguientes diferencias:

1. **Extracción de ID de entidad padre**: Para secciones, se extrae el `categoryId` del `droppableId`; para productos, se extrae el `sectionId`
2. **Filtrado por visibilidad**: Solo se reordenan elementos con `status === 1` (visibles)
3. **Actualización parcial del estado**: Se actualiza solo la porción relevante del estado, manteniendo los elementos no visibles

## 🎨 Estilos y Visualización

El sistema utiliza clases CSS especializadas para cada tipo de elemento:

### Drag Handles

```css
.drag-handle {
  @apply cursor-grab flex items-center justify-center rounded transition-colors;
  touch-action: none !important;
  user-select: none !important;
}

.category-drag-handle {
  @apply drag-handle text-indigo-500 hover:text-indigo-700 hover:bg-indigo-100 !important;
  z-index: 10 !important;
}

.section-drag-handle {
  @apply drag-handle text-teal-500 hover:text-teal-700 hover:bg-teal-100;
}

.product-drag-handle {
  @apply drag-handle text-yellow-500 hover:text-yellow-700 hover:bg-yellow-100;
}
```

### Elementos siendo arrastrados

```css
.grid-item-dragging-category {
  @apply bg-indigo-50 shadow-md border border-indigo-300 !important;
  z-index: 9999 !important;
}

.grid-item-dragging-section {
  @apply bg-teal-50 shadow-md;
}

.grid-item-dragging-product {
  @apply bg-amber-50 shadow-md border border-amber-300 !important;
  z-index: 9999 !important;
}
```

## 📦 Modelo de Datos

### Estructura de la API

#### Reordenar Categorías

```typescript
// Petición
POST /api/categories/reorder
{
  "categories": [
    { "category_id": 1, "display_order": 1 },
    { "category_id": 2, "display_order": 2 }
    // ...
  ]
}

// Respuesta
{
  "success": true,
  "message": "Categories reordered successfully",
  "updated": 2
}
```

#### Reordenar Secciones

```typescript
// Petición
POST /api/sections/reorder
{
  "sections": [
    { "section_id": 1, "display_order": 1 },
    { "section_id": 2, "display_order": 2 }
    // ...
  ]
}

// Respuesta
{
  "success": true,
  "message": "Sections reordered successfully",
  "updated": 2
}
```

#### Reordenar Productos

```typescript
// Petición
POST /api/products/reorder
{
  "products": [
    { "product_id": 1, "display_order": 1 },
    { "product_id": 2, "display_order": 2 }
    // ...
  ]
}

// Respuesta
{
  "success": true,
  "message": "Products reordered successfully",
  "updated": 2
}
```

## 🔍 Diagnóstico y Depuración

El sistema incluye logs detallados para facilitar el diagnóstico de problemas:

1. **Logs de inicialización**:

   ```typescript
   console.log("🔄 [DRAG DEBUG] Inicialización de useDragAndDrop:", {
     handleGlobalDragEndExists: typeof handleGlobalDragEnd === "function",
     handleReorderCategoriesExists:
       typeof handleReorderCategories === "function",
     // ...
   });
   ```

2. **Logs de eventos de arrastre**:

   ```typescript
   console.log("🔍 [DRAG DEBUG] DragDropContext.onDragEnd llamado con:", {
     result,
     type: result.type,
     source: result.source,
     destination: result.destination,
     // ...
   });
   ```

3. **Logs de reordenamiento**:

   ```typescript
   console.log(
     "🔄 [DRAG INFO] Reordenando CATEGORÍA:",
     source.index,
     "->",
     destination.index
   );
   ```

4. **Logs de API**:
   ```typescript
   console.log("📊 [CRITICAL] Productos enviados a API:", productsForApi);
   ```

## 🔧 Solución de Problemas Comunes

### Problema: El arrastre no funciona en absoluto

**Posibles causas y soluciones**:

1. **`isReorderModeActive` está desactivado**: Verificar que está establecido en `true` (inspeccionando `TopNavbar`)
2. **Conflicto de hook**: Verificar que no se están importando múltiples versiones de `useDragAndDrop`
3. **Error de tipo en `droppableId`**: Asegurar que los IDs siguen el formato esperado (`category`, `category-{id}`, `products-section-{id}`)

### Problema: El arrastre funciona pero la API devuelve error

**Posibles causas y soluciones**:

1. **Falta endpoint API**: Verificar que existen los endpoints necesarios (`/api/categories/reorder`, etc.)
2. **Formato de datos incorrecto**: Verificar que los datos enviados siguen el formato esperado
3. **Error de autenticación**: Verificar la sesión del usuario en el servidor

### Problema: Elementos visualmente desalineados durante el arrastre

**Posibles causas y soluciones**:

1. **Problema CSS**: Revisar los estilos en `grids.css`
2. **z-index insuficiente**: Aumentar el z-index de los elementos arrastrados
3. **Conflicto de propagación de eventos**: Verificar `stopPropagation` en los handlers

### Problema: El arrastre de productos no funciona pero el de categorías y secciones sí

**Posibles causas y soluciones**:

1. **Formatos de ID inconsistentes**: Asegurar que los formatos de ID de productos sigan exactamente el mismo patrón:

   - En `draggableId` usar exactamente `product-${product.product_id}` (no toString())
   - En `droppableId` usar exactamente `products-section-${sectionId || 'default'}`
   - Verificar que se está usando la propiedad `product_id` y no simplemente `id`

2. **Problemas con user-select**: Asegurar que solo los drag handles tengan `user-select: none` y el resto de elementos permitan selección de texto.

3. **Conflicto entre selectores en CSS**: Si hay inconsistencias en las implementaciones de `ProductList.tsx` y `SectionList.tsx`, revisar que ambos usen patrones similares.

```typescript
// Formato correcto para Draggable en productos
<Draggable
  key={`product-${product.product_id}`} // 👈 Formato correcto
  draggableId={`product-${product.product_id}`} // 👈 Formato correcto
  index={index}
  isDragDisabled={!isDragEnabled}
>
  {/* ... */}
</Draggable>

// Formato correcto para Droppable en productos
<Droppable
  droppableId={`products-section-${sectionId || 'default'}`} // 👈 Formato correcto
  type="product"
  isDropDisabled={!isDragEnabled}
>
  {/* ... */}
</Droppable>
```

4. **Procesamiento de droppableId en useDragAndDrop.ts**: Verificar que el análisis de `droppableId` en la función `handleGlobalDragEnd` esté correctamente procesando el formato `products-section-${sectionId}`.

## 📚 Referencias y Recursos

- [@hello-pangea/dnd Documentación](https://github.com/hello-pangea/dnd)
- [Proyecto de Plan de Reconstrucción](./plan-reconstruccion-drag-and-drop.md)
- [Mandamientos del Proyecto](./dashboard-v2-estructura-y-mandamientos.md)

## 🧪 Verificación del Sistema

Para verificar que el sistema funciona correctamente:

1. Activar el modo de reordenamiento (botón en `TopNavbar`)
2. Verificar que los drag handles se muestran para categorías, secciones y productos
3. Intentar arrastrar una categoría y verificar logs en consola
4. Verificar que la reordenación se refleja en la UI
5. Recargar la página y verificar que el nuevo orden persiste
6. Repetir para secciones y productos

---

**NOTA**: Este sistema está implementado siguiendo estrictamente los mandamientos del proyecto y la arquitectura DDD existente. Cualquier modificación debe respetar estos principios de diseño.
