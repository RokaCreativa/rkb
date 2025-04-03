# ✅ RokaMenu Refactor Implementation Checklist (Cursor + Claude 3.7)

Este archivo guía la implementación paso a paso del refactor del archivo `dashboard/page.tsx`.
Cada fase contiene tareas individuales que se pueden marcar como completas `[x]`.

---

## 🧱 Fase 1: Extracción de Modales

- [ ] Crear carpeta `components/dashboard/modals/`
- [ ] Extraer cada modal embebido en `page.tsx` a su propio archivo:
  - [ ] NewCategoryModal.tsx
  - [ ] EditCategoryModal.tsx
  - [ ] DeleteSectionModal.tsx
  - [ ] ProductVisibilityToggleModal.tsx
- [ ] Verificar que los props y handlers se pasen correctamente
- [ ] Probar visualmente cada modal para asegurar funcionalidad

---

## 📦 Fase 2: Componentes visuales por dominio

- [ ] Crear carpeta `components/dashboard/`
- [ ] Extraer cada bloque funcional del dashboard en su archivo:
  - [ ] CategoryView.tsx
  - [ ] SectionView.tsx
  - [ ] ProductView.tsx
  - [ ] MobilePreview.tsx
- [ ] Cada uno debe recibir props desde `DashboardView`

---

## 🧠 Fase 3: Hooks de dominio

- [ ] Crear carpeta `lib/hooks/dashboard/`
- [ ] Extraer lógica de `useDataState` en hooks más pequeños:
  - [ ] useDashboardState.ts
  - [ ] useCategoryActions.ts
  - [ ] useSectionActions.ts
  - [ ] useProductActions.ts
- [ ] Asegurar que cada hook tenga sus responsabilidades bien separadas
- [ ] Agregar JSDoc a cada hook

---

## 🧹 Fase 4: Limpieza del archivo page.tsx

- [ ] Eliminar lógica duplicada, efectos innecesarios, estados no usados
- [ ] Eliminar todos los `useState` que fueron migrados a hooks externos
- [ ] Importar solo `<DashboardView />` en `page.tsx`

---

## 📘 Fase 5: Mejora de modelos de datos

- [ ] Unificar los tipos Category, CategoryPreview, etc. en `types/menu.ts`
- [ ] Usar estos tipos de forma centralizada en componentes y hooks

---

## 🔐 Fase 6: Roles y accesos

- [ ] Extraer lógica de roles a un hook `useRoleGuard.ts`
- [ ] Usarlo en `DashboardView` o middleware de layout

---

## ✅ Final: Revisión completa

- [ ] Todos los cambios probados manualmente en entorno local
- [ ] Código documentado con JSDoc en hooks y componentes
- [ ] Código validado por Claude 3.7 o revisión de equipo