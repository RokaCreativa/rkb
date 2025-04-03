# 🧠 Technical Refactor Plan for `dashboard/page.tsx` [RokaMenu Project]

This document outlines a comprehensive refactoring strategy for the `page.tsx` file in the Dashboard module. It is written specifically for implementation by Claude 3.7 and assumes full code parsing and transformation capabilities.

---

## 🎯 Primary Objective

- Isolate business logic from rendering logic.
- Delegate responsibilities to well-scoped components and hooks.
- Increase modularity, reusability, and readability of the dashboard entry point.

---

## 🧱 Phase 1: File Responsibility Realignment

### Current issue:
- `page.tsx` is overloaded: it handles state, logic, conditional flows, and layout rendering.

### Required action:
- Create a new file: `DashboardView.tsx`.
- Move all layout/render-level composition (category, section, product blocks) to this file.
- Keep `page.tsx` as a minimal entry wrapper that just imports and renders `<DashboardView />`.

---

## 🧠 Phase 2: Extract Logic to Domain-Specific Hooks

### Target logic to extract:
- Category management: fetch, create, edit, delete.
- Section management.
- Product visibility toggles, CRUD ops.

### Hook structure:
```ts
lib/hooks/dashboard/
├─ useDashboardState.ts
├─ useCategoryActions.ts
├─ useSectionActions.ts
├─ useProductActions.ts
```

- Each hook should return minimal, composable API (methods + local state).
- All async handlers (`handleAddCategory`, `handleEditSection`, etc.) must be moved to these hooks.

---

## 🧩 Phase 3: UI Component Extraction

### Target components to extract:
- CategoryList / CategoryToolbar
- SectionGrid / SectionList
- ProductTable / ProductCards
- QRPreview (mobile simulation)
- Navigation / header controls

### Destination folder:
```txt
components/dashboard/
├─ CategoryView.tsx
├─ SectionView.tsx
├─ ProductView.tsx
├─ PreviewView.tsx
```

---

## 📦 Phase 4: Modal and Dialog Separation

### Problem:
- All modal JSX is inlined in the page file.

### Fix:
- Move each modal to its own file under `components/dashboard/modals/`.
- Recommended files:
  - `NewCategoryModal.tsx`
  - `EditCategoryModal.tsx`
  - `DeleteSectionDialog.tsx`
  - `ProductVisibilityToggleModal.tsx`

---

## 🧹 Phase 5: Cleanup and Optimization

- Remove unused `useEffect` hooks.
- Combine multiple small states into reducer or context if tightly coupled.
- Normalize variable names (avoid `value`, `item`, use `selectedCategoryId`, etc.).
- Memoize mapped data lists where applicable (categories, products, sections).
- Ensure all role-based access logic is externalized (i.e., `useRoleGuard`).

---

## ✅ Final goal: `page.tsx` must only do one thing:

> Import and render the final composed view of the dashboard (`<DashboardView />`) — nothing more.

---

## 🧠 Optional Enhancements
- Implement Zustand or React Context if dashboard state must be globally shared.
- Use Barrel exports (`index.ts`) for `hooks/dashboard/` and `components/dashboard/` folders.
- Ensure all components and hooks are documented with minimal JSDoc blocks.

---

## 🔄 Deliverables Claude 3.7 must produce:
- [ ] `DashboardView.tsx`
- [ ] `components/dashboard/*.tsx` modular views
- [ ] `components/dashboard/modals/*.tsx`
- [ ] `hooks/dashboard/*.ts` for logic delegation
- [ ] `page.tsx` stripped down to <DashboardView />