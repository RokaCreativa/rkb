# 🛠️ Fix para errores en `ProductManager.tsx` en dashboard-v2

Este archivo resume las correcciones que debe aplicar Claude para resolver los errores de importación y props en el componente `ProductManager`.

---

## 1. ❌ Error de importación de `useDataState`

### 🔍 Problema:
```ts
import { useDataState } from "@/dashboard-v2/contexts/DataContext";
```

### ✅ Solución:
Usar ruta relativa:
```ts
import { useDataState } from "../contexts/DataContext";
```

---

## 2. ❌ Error de importación de tipos

### 🔍 Problema:
```ts
import { Section, Product } from "@/types";
```

### ✅ Solución:
Si `@/types` no funciona, usar:
```ts
import { Section, Product } from "../../types";
```

---

## 3. ❌ Error de props faltantes en `<ProductView />`

### 🔍 Problema:
Solo se pasan 3 props, pero `ProductView` espera más según `ProductViewProps`.

### ✅ Solución:
Reemplazar:

```tsx
<ProductView
  products={localProducts}
  sectionId={section?.section_id}
  isLoading={isLoading}
/>
```

Por:

```tsx
<ProductView
  products={localProducts}
  sectionId={section?.section_id}
  sectionName={section?.name || ""}
  isLoading={isLoading}
  isUpdatingVisibility={false}
  onAddProduct={() => {}}
  onToggleProductVisibility={() => {}}
  onDeleteProduct={() => {}}
  onUpdateProduct={() => {}}
/>
```

Esto permite compilar sin errores. Las funciones pueden implementarse después.

---

## ✅ Resultado esperado

- El archivo `ProductManager.tsx` compila sin errores de TypeScript.
- Se ajusta a las definiciones esperadas de `ProductViewProps`.
- Queda funcional para seguir trabajando sobre el renderizado de productos.

---
_Generado automáticamente por Nova para RokaMenu dashboard-v2._