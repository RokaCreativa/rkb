
# 🛠️ Refactor: Mostrar Productos Correctamente por Sección (`dashboard-v2`)

## ✅ Contexto

Después de una refactorización de la base de datos y del esquema de Prisma:

1. Se eliminó la tabla pivote `products_sections`.
2. La relación entre productos y secciones ahora es **1:N** usando:
   ```prisma
   section_id Int?
   section    sections? @relation("ProductSection", fields: [section_id], references: [section_id])
   ```
3. En el modelo `sections`, se agregó el campo inverso:
   ```prisma
   products_v2 products[] @relation("ProductSection")
   ```

---

## 📦 Cambios requeridos en la App

### 1. Acceso a los productos por sección

- Los productos deben ser accedidos con clave tipo `string`:
  ```ts
  const productsForSection = products?.[String(section.section_id)] || [];
  ```

### 2. Ajustes en `ProductManager.tsx`

- Al renderizar `<ProductView />`, pasar correctamente:
  ```tsx
  <ProductView
    sectionId={section.section_id}
    sectionName={section.name}
    products={products?.[String(section.section_id)] || []}
    ...
  />
  ```

### 3. Almacenamiento de productos en estado global

- En el método `fetchProductsBySection`, guardar productos así:
  ```ts
  setProducts((prev) => ({
    ...prev,
    [String(section_id)]: productosCargados,
  }));
  ```

### 4. Eliminar referencias antiguas

- Cualquier uso anterior de `products_sections` debe eliminarse.
- Usar `section_id` directamente para asignar o filtrar productos.

---

## ✅ Validación esperada

- [ ] Al seleccionar una categoría se cargan correctamente las secciones.
- [ ] Al expandir una sección se muestran correctamente los productos.
- [ ] No se producen errores al renderizar secciones sin productos.
- [ ] El acceso a `products[section_id]` usa siempre `.toString()`.

---

## 🗂️ Ubicación recomendada

Guardar este archivo como:

```txt
/docs/debug/debug-mostrar-productos-por-seccion.md
```
