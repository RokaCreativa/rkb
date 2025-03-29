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

## Recomendaciones para Futuras Integraciones

1. **Verificar rutas API**: Antes de implementar una función que interactúa con la API, verificar que la ruta exista y acepte el método HTTP utilizado.

2. **Probar después de cada cambio**: Probar cada función inmediatamente después de modificarla para detectar errores temprano.

3. **Actualizar estados explícitamente**: Cuando se trabaja con múltiples estados que representan los mismos datos, asegurarse de actualizar todos los estados relevantes.

4. **Usar tipos explícitos**: Evitar tipos implícitos que puedan causar errores de TypeScript, especialmente en funciones de orden superior como map, filter, reduce, etc.

5. **Implementar mecanismos de fallback**: Incluir manejo de errores con fallback a métodos alternativos para mejorar la robustez.

---

*Este documento se actualizará a medida que se encuentren y resuelvan nuevos errores durante la integración.* 