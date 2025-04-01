# ESTRUCTURA DEL PROYECTO ROKAMENU

## 📋 Índice
1. [Visión General](#visión-general)
2. [Estructura de Carpetas](#estructura-de-carpetas)
3. [Arquitectura](#arquitectura)
4. [Flujos de Datos](#flujos-de-datos)
5. [Componentes Principales](#componentes-principales)
6. [Modelos de Datos](#modelos-de-datos)

---

## Visión General

RokaMenu es una aplicación Next.js para la gestión de menús digitales accesibles mediante códigos QR. La aplicación permite a los usuarios crear, editar y gestionar categorías, secciones y productos, así como configurar las opciones de visualización del menú.

### Tecnologías Principales

- **Frontend**: Next.js 13+, React 18+, TailwindCSS
- **Backend**: API Routes de Next.js
- **Base de datos**: MySQL con Prisma ORM
- **Estado**: Combinación de React Context, useState y custom hooks
- **Estilos**: TailwindCSS con componentes shadow-ui

---

## Estructura de Carpetas

```
rokamenu-next/
├── app/                    # Carpeta principal de la aplicación Next.js
│   ├── api/                # API Routes de Next.js
│   ├── dashboard/          # Panel de administración
│   │   ├── components/     # Componentes específicos del dashboard
│   │   ├── page.tsx        # Página principal del dashboard
│   │   └── ...
│   ├── hooks/              # Hooks específicos de la aplicación
│   ├── menu/               # Visualización pública del menú
│   │   └── [clientId]/     # Ruta dinámica para menús de clientes
│   └── ...
├── components/             # Componentes compartidos
│   ├── ui/                 # Componentes de UI reutilizables
│   ├── forms/              # Componentes de formulario
│   └── ...
├── contexts/               # Contextos de React
├── lib/                    # Código compartido y utilitarios
│   ├── adapters/           # Adaptadores para convertir datos
│   ├── handlers/           # Manejadores de eventos
│   ├── hooks/              # Hooks compartidos
│   │   ├── ui/             # Hooks relacionados con UI
│   │   └── dashboard/      # Hooks específicos del dashboard
│   ├── services/           # Servicios para API
│   ├── types/              # Tipos TypeScript
│   └── utils/              # Funciones utilitarias
├── prisma/                 # Configuración y esquema de Prisma
│   ├── schema.prisma       # Esquema de la base de datos
├── public/                 # Archivos públicos
└── ...
```

---

## Arquitectura

### Capas de la Aplicación

1. **Capa de Presentación**
   - Componentes React
   - Páginas Next.js
   - Estilos TailwindCSS

2. **Capa de Lógica de Negocio**
   - Hooks personalizados
   - Contextos
   - Adaptadores

3. **Capa de Datos**
   - API Routes
   - Servicios
   - Prisma ORM

4. **Capa de Persistencia**
   - MySQL
   - Prisma

### Diagrama de Interacción

```
[Componentes UI] ←→ [Hooks] ←→ [Servicios/Adaptadores] ←→ [API Routes] ←→ [Prisma] ←→ [MySQL]
```

---

## Flujos de Datos

### Dashboard Principal

1. El usuario accede al dashboard (`/dashboard`)
2. Se cargan los datos iniciales:
   - Categorías (paginadas)
   - Datos de configuración del cliente
3. El usuario expande una categoría:
   - Se cargan las secciones asociadas bajo demanda
4. El usuario expande una sección:
   - Se cargan los productos asociados bajo demanda
5. CRUD de categorías, secciones y productos:
   - Se actualizan los datos localmente (optimista)
   - Se sincronizan con el servidor
   - Se muestra feedback al usuario

### Visualización del Menú

1. El usuario accede al menú público (`/menu/[clientId]`)
2. Se cargan los datos del menú:
   - Datos del cliente
   - Categorías visibles
   - Secciones visibles
   - Productos visibles
3. Navegación por categorías y secciones
4. Visualización de detalles de productos

---

## Componentes Principales

### Dashboard (`app/dashboard/page.tsx`)

Componente principal del dashboard con más de 2000 líneas que está en proceso de refactorización. Actualmente maneja:

- Estado global del dashboard
- Gestión de categorías, secciones y productos
- Modales y formularios
- Lógica de navegación
- Operaciones CRUD

**Nota**: Este componente está siendo modularizado según el plan de refactorización.

### TabContent (`app/dashboard/components/TabContent.tsx`)

Maneja el contenido de cada pestaña del dashboard:

```tsx
const TabContent = ({ activeTab, children }) => {
  return (
    <div className="tab-content">
      {React.Children.map(children, (child, index) => {
        if (child.props.id === activeTab) {
          return child;
        }
        return null;
      })}
    </div>
  );
};
```

### CategoryTable (`components/tables/CategoryTable.tsx`)

Tabla para visualizar y gestionar categorías:

```tsx
const CategoryTable = ({ 
  categories, 
  expandedCategories, 
  onToggleExpand, 
  onEdit, 
  onDelete,
  onReorder 
}) => {
  // Implementación...
};
```

### Modales (`app/dashboard/components/modals/`)

Sistema de modales para operaciones CRUD:

- `BaseModal.tsx` - Componente base para modales
- `EditCategoryModal.tsx` - Modal para editar categorías
- `DeleteConfirmationModal.tsx` - Modal para confirmar eliminación

---

## Modelos de Datos

### Entidades Principales

#### Category
```typescript
interface Category {
  category_id: number;
  name: string;
  image: string | null;
  status: boolean;
  display_order: number;
  client_id: number;
  deleted: boolean;
  sections?: Section[];
}
```

#### Section
```typescript
interface Section {
  section_id: number;
  name: string;
  image: string | null;
  status: boolean;
  display_order: number;
  category_id: number;
  client_id: number;
  deleted: boolean;
  products?: Product[];
}
```

#### Product
```typescript
interface Product {
  product_id: number;
  name: string;
  description: string | null;
  image: string | null;
  price: number;
  status: boolean;
  display_order: number;
  section_id: number;
  client_id: number;
  deleted: boolean;
  allergens?: Allergen[];
}
```

#### Client
```typescript
interface Client {
  client_id: number;
  name: string;
  logo: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  status: boolean;
  business_type_id: number;
  description?: string;
  social_media?: SocialMedia;
}
```

### Relaciones

- **Client** tiene muchas **Categories**
- **Category** tiene muchas **Sections**
- **Section** tiene muchos **Products**
- **Product** puede tener muchos **Allergens**

### Esquema Prisma

Fragmento del esquema `schema.prisma`:

```prisma
model clients {
  client_id       Int      @id @default(autoincrement())
  name            String?  @db.VarChar(255)
  logo            String?  @db.VarChar(255)
  // ...otros campos
  categories      categories[]
}

model categories {
  category_id     Int      @id @default(autoincrement())
  name            String?  @db.VarChar(50)
  image           String?  @db.VarChar(45)
  status          Int?     @db.TinyInt
  display_order   Int?
  client_id       Int?
  deleted         Int?     @default(0) @db.TinyInt
  // ...otros campos
  client          clients? @relation(fields: [client_id], references: [client_id])
  sections        sections[]
}

model sections {
  section_id      Int      @id @default(autoincrement())
  name            String?  @db.VarChar(50)
  // ...otros campos
  category        categories? @relation(fields: [category_id], references: [category_id], onDelete: Cascade, onUpdate: Cascade)
  products        products[]
}

model products {
  product_id      Int      @id @default(autoincrement())
  name            String?  @db.VarChar(100)
  // ...otros campos
  section         sections? @relation(fields: [section_id], references: [section_id])
  allergens       allergens_product[]
}
```

---

## Actualizaciones Recientes

### Versión 2.0 (Marzo 2024)

1. **Mejoras en la Estructura**
   - Reorganización de carpetas siguiendo principios de arquitectura hexagonal
   - Separación más clara de responsabilidades

2. **Nuevos Flujos**
   - Implementación de paginación en endpoints principales
   - Carga diferida de datos para mejorar rendimiento

3. **Componentes Refactorizados**
   - Extracción de handlers de eventos a archivos separados
   - Implementación de adaptadores para compatibilidad entre sistemas

4. **Nuevas Características**
   - Soporte para múltiples idiomas en menús
   - Mejora en la gestión de alérgenos
   - Nueva tabla para marketing y promociones

---

**Última actualización**: Marzo 2024
**Responsable**: Equipo de Desarrollo RokaMenu 