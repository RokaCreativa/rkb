
# 🧩 Unificación de Modales CRUD - Dashboard-v2

Este documento describe el objetivo y los pasos técnicos para **unificar visualmente y estructuralmente** los modales de creación de Categorías, Secciones y Productos en el sistema RokaMenu (`dashboard-v2`).

---

## 🎯 Objetivo

> Alinear todos los modales del CRUD bajo una misma estructura visual y técnica, asegurando consistencia, mantenibilidad y mejor experiencia de usuario.

---

## 🔍 Análisis de situación actual

### ✅ `NewSectionModal.tsx` y `NewProductModal.tsx`
- Uso de `@headlessui/react` con `Dialog` y `Transition`
- Inclusión del ícono `PlusIcon` en el título.
- Disposición visual moderna con imagen + campos en columna.
- Props estándar: `isOpen`, `onClose`, `onSave`
- Composición modular, limpia y reutilizable.
- Buen uso del eventBus y feedback con `react-hot-toast`.

### ⚠️ `NewCategoryModal.tsx`
- Estructura antigua, más rígida.
- No incluye `PlusIcon` ni layout visual unificado.
- Props y handlers escritos con lógica menos desacoplada.
- Menos claridad visual y consistencia con los otros dos.

---

## ✅ Recomendación

1. **Crear un componente base reutilizable**
    - `components/dashboard-v2/modals/FormModal.tsx`
    - Recibe:
      - `title: string`
      - `icon: ReactNode`
      - `isOpen`, `onClose`, `onSave`
      - `children`: formulario específico

2. **Actualizar `NewCategoryModal.tsx`**
    - Usar el mismo layout que los otros dos.
    - Incluir `PlusIcon` en el encabezado.
    - Agrupar `Image` y campos en columna (igual que productos/secciones).
    - Usar el componente `FormModal` como base.

3. **Refactor visual final**
    - Estilo unificado para:
        - Botones
        - Inputs
        - Colores de fondo y texto
        - Header del modal

---

## 💡 Resultado Esperado

Todos los modales CRUD deben:
- Ser visualmente coherentes.
- Compartir estructura base (encabezado + formulario + imagen).
- Tener comportamiento consistente al abrir, cerrar y guardar.
- Poder extenderse fácilmente (multiidioma, validaciones, etc).

---

## 🧠 Bonus (opcional)

- Si los formularios se parecen, crear componentes como:
    - `CategoryFormFields.tsx`
    - `SectionFormFields.tsx`
    - `ProductFormFields.tsx`

Así mantenemos todo organizado y fácil de evolucionar.

---

## 🔄 Archivos afectados

- [ ] `NewCategoryModal.tsx` (refactor)
- [ ] `FormModal.tsx` (nuevo)
- [ ] Posiblemente ajustes menores a `NewSectionModal.tsx` y `NewProductModal.tsx` para centralizar lógica.

