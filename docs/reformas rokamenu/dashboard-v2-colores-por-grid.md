
# 🎨 Restaurar Esquema de Colores Original por Grid

Este cambio tiene como objetivo **recuperar la diferenciación visual clara** entre los tres niveles jerárquicos del dashboard (`dashboard-v2`): Categorías, Secciones y Productos.

---

## 🎯 Objetivo

Volver al sistema de colores original que permitía al usuario identificar visualmente en qué nivel se encuentra, mejorando la experiencia de navegación.

---

## ✅ Cambios por archivo

### 1. `CategoryTable.tsx` → **Color: Indigo**
- Reemplazar:
  - `bg-teal-50`, `bg-teal-100` → `bg-indigo-50`, `bg-indigo-100`
  - `text-teal-700`, `text-teal-600` → `text-indigo-700`, `text-indigo-600`
  - `border-teal-100` → `border-indigo-100`

---

### 2. `SectionTable.tsx` → **Color: Green**
- Reemplazar:
  - `bg-teal-50`, `bg-teal-100` → `bg-green-50`, `bg-green-100`
  - `text-teal-700`, `text-teal-600` → `text-green-700`, `text-green-600`
  - `border-teal-100` → `border-green-100`

---

### 3. `ProductTable.tsx` → **Color: Yellow**
- Reemplazar:
  - `bg-teal-50`, `bg-teal-100` → `bg-yellow-50`, `bg-yellow-100`
  - `text-teal-700`, `text-teal-600` → `text-yellow-700`, `text-yellow-600`
  - `border-teal-100` → `border-yellow-100`

---

## 📌 Notas adicionales

- El sistema actual está unificado en `teal`, pero este cambio busca volver al sistema anterior para **reforzar la jerarquía visual** del dashboard.
- Estos cambios se deben aplicar solo a las clases de Tailwind relevantes en los archivos mencionados.
- Verificar que los botones, headers y filas seleccionadas reflejen la nueva paleta de color correspondiente a su nivel jerárquico.

---

## 🔄 Resultado Esperado

- Categorías = tonos Indigo
- Secciones = tonos Green
- Productos = tonos Yellow

Cada bloque del dashboard tendrá su **propio color visual**, permitiendo una navegación clara y diferenciada.
