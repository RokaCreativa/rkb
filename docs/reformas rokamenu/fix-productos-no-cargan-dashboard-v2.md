
# 🛠️ Fix - Productos no cargan en `dashboard-v2`

Este documento explica el problema detectado en el archivo `ProductManager.tsx` del dashboard-v2 y cómo solucionarlo para que los productos se muestren correctamente al seleccionar una sección.

---

## ❌ Problema detectado

En `ProductManager.tsx`, se realiza la carga de productos con:

```ts
await fetchProductsBySection(section.section_id);
```

Sin embargo, **después de la carga, no se actualiza el estado `localProducts`**, por lo tanto, `ProductView` no recibe los productos para renderizar.

---

## ✅ Solución recomendada

### 🔁 Paso 1: Actualizar el estado `localProducts` después del fetch

Reemplazar el efecto actual por:

```tsx
useEffect(() => {
  const loadProducts = async () => {
    if (!section) return;
    setIsLoading(true);

    try {
      await fetchProductsBySection(section.section_id);
      const updated = productsMap[section.section_id] ?? [];
      setLocalProducts(updated);
    } catch (error) {
      console.error("Error al cargar productos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  loadProducts();
}, [section.section_id]);
```

---

### 🔄 Paso 2 (opcional): Sincronizar `localProducts` cuando cambie `productsMap`

Esto es útil si hay ediciones posteriores:

```tsx
useEffect(() => {
  setLocalProducts(productsMap[section.section_id] ?? []);
}, [productsMap, section.section_id]);
```

---

## ✅ Resultado esperado

- Al seleccionar una sección, los productos correspondientes se cargarán correctamente.
- El componente `ProductView` recibirá los datos desde `localProducts` y renderizará la tabla de productos.

---

## 📁 Archivo afectado

```
app/dashboard-v2/components/ProductManager.tsx
```

