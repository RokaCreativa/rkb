# ✅ RokaMenu Refactor Checklist - `dashboard-v2/page.tsx`

Este archivo contiene el checklist oficial para refactorizar el archivo `dashboard-v2/page.tsx`, el segundo dashboard del proyecto RokaMenu.
Diseñado para ejecución progresiva dentro de Cursor o en coordinación con Claude 3.7.

---

## 🧱 Fase 1: Extracción de Modales

- [ ] Crear carpeta `dashboard-v2/components/modals/`
- [ ] Extraer cada modal embebido en `dashboard-v2/page.tsx` a su propio archivo:
  - [ ] NewCategoryModal.tsx
  - [ ] EditCategoryModal.tsx
  - [ ] DeleteSectionModal.tsx
  - [ ] ProductVisibilityToggleModal.tsx
- [ ] Verificar props y callbacks desde `DashboardView`

---

## 📦 Fase 2: Componentes visuales por dominio

- [ ] Crear carpeta `dashboard-v2/components/views/`
- [ ] Extraer cada bloque funcional:
  - [ ] CategoryView.tsx
  - [ ] SectionView.tsx
  - [ ] ProductView.tsx
  - [ ] MobilePreview.tsx
- [ ] Asegurar integración correcta desde `DashboardView`

---

## 🧠 Fase 3: Hooks de dominio

- [ ] Crear carpeta `dashboard-v2/hooks/`
- [ ] Dividir `useDataState` en hooks individuales:
  - [ ] useDashboardState.ts
  - [ ] useCategoryActions.ts
  - [ ] useSectionActions.ts
  - [ ] useProductActions.ts
- [ ] Incluir JSDoc para cada hook

---

## 🧹 Fase 4: Limpieza del archivo page.tsx

- [ ] Eliminar lógica duplicada, estados innecesarios
- [ ] Reemplazar `useState` por hooks externos
- [ ] Dejar `dashboard-v2/page.tsx` como un importador de `<DashboardView />`

---

## 📘 Fase 5: Normalización de modelos de datos

- [ ] Consolidar tipos en `dashboard-v2/types/menu.ts`
- [ ] Usarlos en componentes y hooks

---

## 🔐 Fase 6: Roles y accesos

- [ ] Extraer validación de rol a hook `useRoleGuard.ts`
- [ ] Aplicar en `DashboardView` si aplica

---

## ✅ Final: Revisión total

- [ ] Tests manuales en entorno local
- [ ] Documentación incluida (JSDoc)
- [ ] Validación con Claude 3.7 o revisión por pares