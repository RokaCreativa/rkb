# Registro de Errores y Soluciones - Integración Hook useCategories

Este documento registra los errores específicos encontrados durante la integración del hook useCategories y sus soluciones, para facilitar la resolución de problemas similares en el futuro.

## Errores de API y Rutas

### Error 1: Method Not Allowed (405) en carga de categorías

**Descripción:**
Al cargar categorías mediante el hook useCategories, se produce un error HTTP 405 (Method Not Allowed).

**Detalles del error:**
```
AxiosError: Request failed with status code 405
    at settle (http://localhost:3000/_next/static/chunks/node_modules_93211165._.js:20403:16)
    at XMLHttpRequest.onloadend (http://localhost:3000/_next/static/chunks/node_modules_93211165._.js:20907:174)
    at Axios.request (http://localhost:3000/_next/static/chunks/node_modules_93211165._.js:21632:49)
    at async useCategories.useCallback[fetchCategories] (http://localhost:3000/_next/static/chunks/_256816cc._.js:4988:34)
```

**Causa:**
La función `fetchCategories` en el hook `useCategories` estaba utilizando una ruta API incorrecta:
```typescript
const response = await axios.get(`/api/clients/${clientId}/categories`);
```
Esta ruta existe pero solo admite el método GET para obtener la lista de categorías para un cliente específico. El error 405 indica que el método utilizado no está permitido en este endpoint.

**Solución:**
Modificar la función `fetchCategories` para usar la ruta API correcta que implementa la funcionalidad deseada:

```typescript
// Antes
const response = await axios.get(`/api/clients/${clientId}/categories`);

// Después
const response = await axios.get(`/api/categories`);
```

La ruta `/api/categories` está configurada correctamente con los controladores necesarios para gestionar las categorías.

### Error 2: Not Found (404) en cambio de visibilidad

**Descripción:**
Al intentar cambiar la visibilidad de una categoría, se produce un error HTTP 404 (Not Found).

**Detalles del error:**
```
AxiosError: Request failed with status code 404
    at settle (http://localhost:3000/_next/static/chunks/node_modules_93211165._.js:20403:16)
    at XMLHttpRequest.onloadend (http://localhost:3000/_next/static/chunks/node_modules_93211165._.js:20907:174)
    at Axios.request (http://localhost:3000/_next/static/chunks/node_modules_93211165._.js:21632:49)
    at async useCategories.useCallback[toggleCategoryVisibility] (http://localhost:3000/_next/static/chunks/_256816cc._.js:5018:17)
    at async http://localhost:3000/_next/static/chunks/_256816cc._.js:12495:13
```

**Causa:**
La función `toggleCategoryVisibility` en el hook `useCategories` estaba utilizando una ruta API inexistente:
```typescript
await axios.patch(`/api/clients/${clientId}/categories/${categoryId}`, {
  status: newStatus
});
```
Esta ruta no existe en la aplicación ya que no hay un controlador específico para actualizar una categoría por cliente.

**Solución:**
Modificar la función `toggleCategoryVisibility` para usar la ruta API correcta:

```typescript
// Antes
await axios.patch(`/api/clients/${clientId}/categories/${categoryId}`, {
  status: newStatus
});

// Después
await axios.patch(`/api/categories/${categoryId}`, {
  status: newStatus
});
```

La ruta `/api/categories/${categoryId}` está configurada con un controlador PATCH que maneja correctamente la actualización de la visibilidad de una categoría.

## Errores de Actualización de Estado

### Error 3: Cambios no visibles sin recargar la página

**Descripción:**
Al cambiar la visibilidad de una categoría, el cambio no se refleja inmediatamente en la interfaz sin recargar la página (F5).

**Causa:**
El adaptador `adaptToggleCategoryVisibility` no actualiza el estado local del dashboard después de llamar a la función del hook. Esto causa una desincronización entre el estado del hook y el estado del dashboard.

**Solución:**
Modificar el adaptador para actualizar explícitamente ambos estados:

```typescript
// Antes
export function adaptToggleCategoryVisibility(
  hookToggleVisibility: (id: number, currentStatus: number) => Promise<void>
) {
  return async (categoryId: number, currentVisibility: number, categories: Category[], setCategories: (categories: Category[]) => void) => {
    try {
      await hookToggleVisibility(categoryId, currentVisibility);
      return true;
    } catch (error) {
      console.error('Error en toggleCategoryVisibility adaptado:', error);
      return false;
    }
  };
}

// Después
export function adaptToggleCategoryVisibility(
  hookToggleVisibility: (id: number, currentStatus: number) => Promise<void>
) {
  return async (categoryId: number, currentVisibility: number, categories: Category[], setCategories: (categories: Category[]) => void) => {
    try {
      await hookToggleVisibility(categoryId, currentVisibility);
      
      // Actualizar explícitamente el estado del dashboard también
      const newStatus = currentVisibility === 1 ? 0 : 1;
      setCategories(categories.map((cat: Category) => 
        cat.category_id === categoryId ? { ...cat, status: newStatus } : cat
      ));
      
      return true;
    } catch (error) {
      console.error('Error en toggleCategoryVisibility adaptado:', error);
      return false;
    }
  };
}
```

Esta solución garantiza que tanto el estado interno del hook como el estado del dashboard se actualicen correctamente, manteniendo la interfaz sincronizada con los cambios.

### Error 5: Mensajes de éxito duplicados

**Descripción:**
Al eliminar una categoría mediante el adaptador `adaptDeleteCategory`, aparecen dos mensajes toast de éxito duplicados.

**Causa:**
Tanto el hook `useCategories` como el componente `DeleteCategoryConfirmation` muestran mensajes de éxito. Además, en el dashboard también hay una función que muestra otro mensaje de éxito al completar la operación.

**Solución:**
Eliminar los mensajes toast redundantes, dejando solo uno controlado por el hook principal:

```typescript
// En la función handleDeleteCategoryConfirmed del dashboard:
if (success) {
  // El hook ya muestra un mensaje de éxito, no es necesario duplicarlo
  return true;
} else {
  toast.error('No se pudo eliminar la categoría');
  return false;
}

// En el método de fallback del componente DeleteCategoryConfirmation:
if (!response.ok) {
  throw new Error('Error al eliminar la categoría');
}

// El mensaje de éxito ya lo muestra el hook, no es necesario duplicarlo aquí
onDeleted(categoryId);
onClose();
```

Esta solución proporciona una experiencia de usuario más limpia al mostrar un único mensaje de confirmación cuando la operación es exitosa.

### Error 6: Error interno del servidor (500) al reordenar categorías

**Descripción:**
Al intentar reordenar categorías mediante drag and drop, se produce un error HTTP 500 (Internal Server Error).

**Detalles del error:**
```
AxiosError: Request failed with status code 500
    at settle (http://localhost:3000/_next/static/chunks/node_modules_93211165._.js:20403:16)
    at XMLHttpRequest.onloadend (http://localhost:3000/_next/static/chunks/node_modules_93211165._.js:20907:174)
    at Axios.request (http://localhost:3000/_next/static/chunks/node_modules_93211165._.js:21632:49)
    at async useCategories.useCallback[reorderCategory] (http://localhost:3000/_next/static/chunks/_b48c1f91._.js:5230:17)
```

**Causa:**
Había una discrepancia entre la validación de datos en el endpoint `/api/categories/reorder`:

1. En la validación se usaba `deleted: { not: 'Y' }` pero en la base de datos el campo `deleted` parece ser un valor numérico (0/1).
2. La condición de verificación de categorías podía fallar pero el error no se registraba correctamente.
3. No había un manejo específico de errores en la transacción de la base de datos.

**Solución:**
1. Corregir la condición de validación para usar una condición compatible con el tipo de datos de `deleted` en la base de datos:
```typescript
// Antes
const existingCategories = await prisma.categories.findMany({
  where: {
    category_id: { in: categoryIds },
    client_id: user.client_id,
    deleted: { not: 'Y' },
  },
  //...
});

// Después
const existingCategories = await prisma.categories.findMany({
  where: {
    category_id: { in: categoryIds },
    client_id: user.client_id,
    OR: [
      { deleted: 0 as any },
      { deleted: null }
    ]
  },
  //...
});
```

2. Mejorar el registro de logs y el manejo de errores:
```typescript
// Añadir logs detallados
console.log("[DEBUG] Reordenando categorías IDs:", categoryIds);
console.log("[DEBUG] Categorías encontradas:", existingCategories.map(c => c.category_id));

// Mejorar el manejo de errores
try {
  // Código de la transacción
} catch (txError) {
  console.error('[ERROR] Error en la transacción:', txError);
  return NextResponse.json(
    { error: 'Error al actualizar el orden de las categorías en la base de datos' }, 
    { status: 500 }
  );
}
```

3. Mejorar el manejo de errores en el cliente para mostrar información más específica:
```typescript
catch (error: any) {
  console.error('Error al reordenar categorías:', error);
  
  // Mostrar mensaje de error más específico si está disponible
  const errorMessage = error.response?.data?.error || 
                       error.message || 
                       'No se pudo actualizar el orden';
  
  // Registrar detalles técnicos para depuración
  if (error.response) {
    console.error('Detalles del error de respuesta:', {
      status: error.response.status,
      data: error.response.data,
      headers: error.response.headers
    });
  }
  
  toast.error(errorMessage);
}
```

Estas mejoras permiten:
- Identificar el origen exacto del error 500
- Proporcionar mensajes de error más descriptivos
- Mejorar la capacidad de depuración mediante logs detallados
- Ofrecer una mejor experiencia al usuario con mensajes de error específicos

## Problemas de Tipado

### Error 4: Error de tipo en el adaptador

**Descripción:**
Aparecen errores de TypeScript en el adaptador `adaptToggleCategoryVisibility` relacionados con tipos implícitos.

**Detalles del error:**
```
Line 64: Parameter 'prev' implicitly has an 'any' type., severity: 1
Line 64: Argument of type '(prev: any) => any' is not assignable to parameter of type 'Category[]'., severity: 1
Line 64: Parameter 'cat' implicitly has an 'any' type., severity: 1
```

**Causa:**
Los parámetros en la función de mapeo no tienen tipos explícitos, lo que causa errores de TypeScript.

**Solución:**
Modificar el adaptador para usar tipos explícitos y pasar directamente el array de categorías:

```typescript
// Antes
setCategories(prev => prev.map(cat => 
  cat.category_id === categoryId ? { ...cat, status: newStatus } : cat
));

// Después
setCategories(categories.map((cat: Category) => 
  cat.category_id === categoryId ? { ...cat, status: newStatus } : cat
));
```

Esta solución proporciona tipos explícitos para todos los parámetros y elimina los errores de TypeScript.

## Problemas Recientes Resueltos

### Error 7: Tipo incorrecto en campo 'deleted' de productos

**Descripción:**
Al editar productos a través del modal de edición, se producía un error al cargar los detalles del producto.

**Detalles del error:**
```
Error de API: "{\"error\":\"Error al obtener detalles del producto\"}"
at createUnhandledError (http://localhost:3000/_next/static/chunks/node_modules_next_dist_client_c24f7707._.js:879:71)
at handleClientError (http://localhost:3000/_next/static/chunks/node_modules_next_dist_client_c24f7707._.js:1052:56)
at console.error (http://localhost:3000/_next/static/chunks/node_modules_next_dist_client_c24f7707._.js:1191:56)
at EditProductModal.useEffect.fetchProductDetails (http://localhost:3000/_next/static/chunks/_b48c1f91._.js:5401:37)
```

**Causa:**
En la API de productos (`app/api/products/[id]/route.ts`), el campo `deleted` en las consultas de Prisma estaba usando un valor numérico (`0 as any`) en lugar de un booleano. El esquema de Prisma define el campo `deleted` como tipo `Boolean`, lo que causaba el siguiente error:

```
Argument 'deleted': Invalid value provided. Expected BoolNullableFilter, Boolean or Null, provided Int.
```

**Solución:**
1. Modificar las consultas de Prisma para usar el tipo booleano correcto:

```typescript
// Antes
const product = await prisma.products.findFirst({
  where: {
    product_id: parseInt(id),
    client_id: user.client_id,
    deleted: 0 as any,
  },
});

// Después
const product = await prisma.products.findFirst({
  where: {
    product_id: parseInt(id),
    client_id: user.client_id,
    deleted: false,
  },
});
```

2. Actualizar también la función `DELETE` para usar el tipo booleano:

```typescript
// Antes
data: {
  deleted: 1 as any,
  // ...otros campos
}

// Después
data: {
  deleted: true,
  // ...otros campos
}
```

3. Actualizar la comparación de valores deleted:

```typescript
// Antes
const deletedValue = typeof product.deleted === 'string' 
  ? parseInt(product.deleted) || 0
  : (product.deleted ?? 0);
  
if (deletedValue === 1) {
  // Producto ya eliminado
}

// Después
if (product.deleted === true) {
  // Producto ya eliminado
}
```

Este cambio resuelve la consistencia de tipos entre el esquema de Prisma y las consultas realizadas, permitiendo que la edición de productos funcione correctamente.

**Nota**: Este tipo de inconsistencia también puede existir en otras entidades. Se recomienda revisar todos los endpoints API para asegurar que utilizan los tipos correctos según el esquema de Prisma.

## Recomendaciones para Futuras Integraciones

1. **Verificar rutas API**: Antes de implementar una función que interactúa con la API, verificar que la ruta exista y acepte el método HTTP utilizado.

2. **Probar después de cada cambio**: Probar cada función inmediatamente después de modificarla para detectar errores temprano.

3. **Actualizar estados explícitamente**: Cuando se trabaja con múltiples estados que representan los mismos datos, asegurarse de actualizar todos los estados relevantes.

4. **Usar tipos explícitos**: Evitar tipos implícitos que puedan causar errores de TypeScript, especialmente en funciones de orden superior como map, filter, reduce, etc.

5. **Implementar mecanismos de fallback**: Incluir manejo de errores con fallback a métodos alternativos para mejorar la robustez.

---

*Este documento se actualizará a medida que se encuentren y resuelvan nuevos errores durante la integración.* 