# 📦 Plan para Organización y Uso de Hooks en RokaMenu

Este documento explica la **mejor forma de organizar, estructurar e importar hooks** en un proyecto grande como RokaMenu.
Está diseñado para que un desarrollador que use Cursor entienda cómo trabajar con hooks sin romper la lógica ni generar duplicación.

---

## ✅ Objetivo

- Evitar hooks duplicados o mal organizados.
- Usar hooks relacionados dentro de una vista mediante "composite hooks".
- Mantener el código limpio, reutilizable y fácil de importar.

---

## 📁 Estructura recomendada

```txt
lib/
├─ hooks/
│  ├─ dashboard/
│  │  ├─ useDashboardState.ts
│  │  ├─ useCategoryActions.ts
│  │  ├─ useSectionActions.ts
│  │  ├─ useProductActions.ts
│  │  ├─ useDashboardHooks.ts  ← agrupador opcional
│  ├─ ui/
│  │  ├─ useToastNotifications.ts
│  │  ├─ useModalState.ts
```

---

## 🧩 ¿Qué es un composite hook?

Es un hook que **agrupa varios hooks relacionados** y los devuelve como un solo objeto.
Ideal cuando se usan siempre juntos, como en el dashboard.

```ts
// useDashboardHooks.ts
import { useDashboardState } from './useDashboardState';
import { useCategoryActions } from './useCategoryActions';
import { useSectionActions } from './useSectionActions';
import { useProductActions } from './useProductActions';

export function useDashboardHooks() {
  return {
    ...useDashboardState(),
    ...useCategoryActions(),
    ...useSectionActions(),
    ...useProductActions(),
  };
}
```

### ✅ En un componente:

```ts
const { viewLevel, setViewLevel, createCategory, updateProduct } = useDashboardHooks();
```

---

## 💡 Alternativa: importar solo lo necesario

```ts
import { useCategoryActions } from '@/lib/hooks/dashboard';
const { createCategory } = useCategoryActions();
```

---

## 📦 Uso de `index.ts` para importaciones limpias

En `lib/hooks/dashboard/index.ts` podés exportar todo así:

```ts
export * from './useDashboardState';
export * from './useCategoryActions';
export * from './useSectionActions';
export * from './useProductActions';
```

Y luego importar limpio:
```ts
import { useDashboardState, useCategoryActions } from '@/lib/hooks/dashboard';
```

---

## ✅ Beneficios de este enfoque

- Código más ordenado y escalable.
- Separación de responsabilidades.
- Mejor autocompletado en Cursor.
- Menos dependencias cruzadas y errores.

---

## 📘 Recomendación Final

- Usá `useDashboardHooks` solo en vistas principales del dashboard.
- En componentes más pequeños, importá hooks individuales.
- Mantené la documentación clara y con ejemplos como este archivo.