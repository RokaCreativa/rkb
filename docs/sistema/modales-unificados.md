# Sistema de Modales Unificados para RokaMenu

## 📄 Resumen

Este documento describe la implementación del sistema de modales unificados en RokaMenu, específicamente el proceso de refactorización de los modales de eliminación (DeleteCategoryModal, DeleteSectionModal, DeleteProductModal) en un único componente genérico `DeleteModal`. Esta mejora:

- Elimina la duplicación de código
- Mejora la mantenibilidad
- Sigue los principios del patrón DDD (Domain-Driven Design)
- Permite una gestión centralizada de errores y estados de carga

## 🔍 Problema Identificado

Anteriormente, existían múltiples modales específicos para cada tipo de entidad:

- `DeleteCategoryModal.tsx`
- `DeleteSectionModal.tsx`
- `DeleteProductModal.tsx`

Estos componentes contenían código casi idéntico, excepto por pequeñas variaciones en los mensajes y en cómo se manejaba la eliminación. Esta duplicación violaba el mandamiento "No duplicarás lo que ya está creado" y dificultaba el mantenimiento.

## 💡 Solución Implementada

### 1. Hook Genérico - `useEntityOperations`

Se implementó un hook genérico `useEntityOperations` que:

```typescript
/**
 * Hook genérico para operaciones de entidades
 *
 * @template T - Tipo de ID de la entidad
 * @template A - Tipo de argumentos adicionales para la eliminación
 * @param options - Opciones para configurar el comportamiento
 * @returns Objeto con estados y funciones para operar con la entidad
 */
export function useEntityOperations<T = number, A = unknown>(
  options: EntityOperationsOptions<T, A>
) {
  // ...implementación...

  return {
    isDeleting, // Estado de eliminación en progreso
    deleteError, // Error de eliminación, si ocurre
    deleteEntity, // Función para eliminar una entidad
  };
}
```

Este hook maneja:

- Estados de carga durante la eliminación
- Captura y formateo de errores
- Notificaciones toast para el feedback al usuario
- Callbacks de éxito

### 2. Componente Modal Unificado - `DeleteModal`

Se creó un componente `DeleteModal` genérico que puede eliminar cualquier tipo de entidad:

```typescript
/**
 * Modal unificado para eliminación de entidades
 *
 * @template T - Tipo del ID de la entidad (normalmente number)
 * @template A - Tipo de argumentos adicionales para la función de eliminación
 */
function DeleteModal<T = number, A = unknown>({
  entityType, // 'category', 'section' o 'product'
  entityId, // ID de la entidad a eliminar
  entityName, // Nombre para mostrar
  deleteFunction, // Función que realiza la eliminación
  deleteArgs = [], // Argumentos adicionales
}: // ...otros props
DeleteModalProps<T, A>) {
  // ...implementación...
}
```

### 3. Integración en el DashboardView

El componente `DashboardView` fue actualizado para usar el nuevo modal unificado:

```tsx
{showDeleteModal && itemToDelete && (
  <DeleteModal
    isOpen={showDeleteModal}
    onClose={() => setShowDeleteModal(false)}
    entityType={deleteEntityType} // 'category', 'section' o 'product'
    entityId={
      // Lógica para obtener el ID correcto según el tipo
      deleteEntityType === 'category' && 'category_id' in itemToDelete
        ? itemToDelete.category_id
        : // ...más condiciones...
    }
    entityName={itemToDelete.name}
    deleteFunction={
      // Función correcta según el tipo
      deleteEntityType === 'category'
        ? deleteCategory
        : // ...más condiciones...
    }
    deleteArgs={
      // Argumentos adicionales si son necesarios
      deleteEntityType === 'section' && 'category_id' in itemToDelete
        ? [itemToDelete.category_id]
        : []
    }
    onDeleteSuccess={() => {
      // Actualización de listas después de eliminación exitosa
    }}
  />
)}
```

## 🧩 Estructura de Archivos

- `app/dashboard-v2/hooks/core/useEntityOperations.ts`: Hook genérico para operaciones CRUD.
- `app/dashboard-v2/components/modals/DeleteModal.tsx`: Componente modal unificado.
- `app/dashboard-v2/components/core/DashboardView.tsx`: Uso del modal en la interfaz principal.

## 🛠 Cómo Usar

### Para eliminar una categoría:

```tsx
// 1. Configurar el estado
setItemToDelete(category);
setDeleteEntityType("category");
setShowDeleteModal(true);

// 2. El DeleteModal usará automáticamente la función correcta
// deleteCategory(category.category_id)
```

### Para eliminar una sección:

```tsx
// 1. Configurar el estado
setItemToDelete(section);
setDeleteEntityType("section");
setShowDeleteModal(true);

// 2. El DeleteModal usará automáticamente la función correcta
// deleteSection(section.section_id, section.category_id)
```

### Para eliminar un producto:

```tsx
// 1. Configurar el estado
setItemToDelete(product);
setDeleteEntityType("product");
setShowDeleteModal(true);

// 2. El DeleteModal usará automáticamente la función correcta
// deleteProduct(product.product_id)
```

## 📊 Ventajas

1. **Reducción de código**: Eliminamos ~300 líneas de código duplicado.
2. **Mantenibilidad mejorada**: Un solo lugar para cambios en la lógica de eliminación.
3. **Consistencia**: Experiencia uniforme para todas las operaciones de eliminación.
4. **Tipado seguro**: Uso de TypeScript genérico para adaptarse a diferentes entidades.
5. **Manejo mejorado de errores**: Feedback consistente para todos los tipos de entidades.
6. **Experiencia móvil optimizada**: Botones con estados de deshabilitado adecuados durante la eliminación.

## 🚀 Extensibilidad Futura

Este patrón puede extenderse a:

1. **Modales de creación**: Un `CreateModal` genérico para todos los tipos de entidades.
2. **Modales de edición**: Un `EditModal` genérico para actualizar cualquier entidad.
3. **Operaciones por lotes**: Eliminar múltiples elementos con un solo modal.

## 📝 Alineación con los Mandamientos

Esta implementación sigue los siguientes mandamientos establecidos:

- "No duplicarás lo que ya está creado"
- "Separarás la función de la estética"
- "Garantizarás experiencia perfecta en múltiples dispositivos"
- "Conocerás lo que existe antes de crear algo nuevo"
