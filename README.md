This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Estructura del Proyecto

Este proyecto está organizado siguiendo una arquitectura modular con separación clara de responsabilidades:

### Componentes

- `/components` - Componentes reutilizables para toda la aplicación
- `/app/dashboard/components` - Componentes específicos para el dashboard
  - `/views` - Vistas principales del dashboard (CategoriesView, SectionsView, ProductsView)
  - `/actions` - Componentes de acción (CategoryActions, SectionActions, ProductActions)
  - `/modals` - Modales del dashboard (confirmación, formularios, etc.)
  - `/state` - Componentes para estados de carga, error y vacíos

### Hooks

- `/lib/hooks/ui` - Hooks de UI genéricos (modales, drag-and-drop, etc.)
- `/lib/hooks/dashboard` - Hooks específicos para el dashboard

### Servicios

- `/lib/services` - Servicios para interactuar con la API

## Componentes de Modal

El proyecto incluye un sistema modular para los modales:

- `BaseModal` - Componente base para todos los modales con transiciones
- `FormModal` - Modal específico para formularios
- `ConfirmationModal` - Modal para solicitar confirmación
- `DeleteModal` - Modal especializado para confirmar eliminaciones

### Uso de Modales

```tsx
import { useModalState } from '@/lib/hooks/ui';
import { DeleteCategoryConfirmation } from '@/app/dashboard/components/modals';

// En tu componente:
const { isOpen, data, open, close } = useModalState<Category>();

// Abrir el modal con datos
const handleDeleteClick = (category) => {
  open({ initialData: category });
};

// Renderizado
return (
  <>
    <button onClick={handleDeleteClick}>Eliminar</button>
    
    <DeleteCategoryConfirmation 
      isOpen={isOpen}
      onClose={close}
      categoryId={data?.category_id}
      categoryName={data?.name}
      onDeleted={handleCategoryDeleted}
    />
  </>
);
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
