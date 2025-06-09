# 🧠 Estructura y Conocimiento Central de RokaMenu

> **Este documento es el cerebro del proyecto.** Es un resumen completo y detallado de la arquitectura, flujos y lógica de RokaMenu. Debe ser consultado para entender CÓMO funciona el sistema antes de modificarlo.

---

## 1. Visión General de la Aplicación

RokaMenu es una aplicación web (SaaS) diseñada para que dueños de restaurantes y negocios gastronómicos puedan crear, gestionar y personalizar sus menús digitales de forma fácil e intuitiva.

- **Usuario Principal:** Administradores de restaurantes (clientes de RokaMenu).
- **Producto Final:** Un menú digital interactivo accesible a través de un código QR.
- **Funcionalidad Clave:**
  - **Dashboard de Gestión:** Un panel de control completo para administrar categorías, secciones y productos del menú.
  - **Jerarquía Intuitiva:** `Categoría` > `Sección` > `Producto`.
  - **Drag & Drop:** Reordenamiento fácil de todos los elementos del menú.
  - **Live Preview:** Visualización en tiempo real de los cambios realizados en el menú.
  - **Personalización:** (En desarrollo) Opciones para cambiar colores, fondos y temas del menú.

---

## 2. Arquitectura General y Tecnologías Clave

- **Framework:** **Next.js 13+** con **App Router**.
- **Lenguaje:** **TypeScript**.
- **Base de Datos:** **MySQL** (actual), con plan de migración a **PostgreSQL**.
- **ORM:** **Prisma**.
- **Autenticación:** **NextAuth.js**.
- **Gestión de Estado del Servidor:** **`@tanstack/react-query` (React Query)**.
- **Gestión de Estado del Cliente:** **Zustand** (para estados globales como modales).
- **Estilos:** **Tailwind CSS**.
- **Componentes UI:** **shadcn/ui**, asegurando consistencia visual.
- **Drag & Drop:** **`dnd-kit`**.
- **Internacionalización (i18n):** **`next-intl`**.

---

## 3. Estructura de Carpetas Detallada

### `/` (Raíz)

- `next.config.js`: Configuración de Next.js.
- `tailwind.config.js`: Configuración de Tailwind CSS (colores, fuentes, etc.).
- `prisma/schema.prisma`: **LA VERDAD ABSOLUTA** sobre la estructura de la base de datos. Define todos los modelos y relaciones.
- `middleware.ts`: Gestiona la protección de rutas, redirigiendo a los usuarios no autenticados a la página de login.

### `app/`

El corazón de la aplicación, siguiendo el paradigma de App Router.

- **`app/api/`**: Contiene todas las rutas de la API del backend. La estructura es RESTful.

  - `auth/[...nextauth]/route.ts`: El endpoint principal de NextAuth para el login, logout, etc.
  - `clients/[id]/...`, `categories/[id]/...`, etc.: Endpoints para las operaciones CRUD de cada entidad.

- **`app/dashboard-v2/`**: La aplicación principal del cliente, el dashboard.

  - **`(auth)/`**: Rutas relacionadas con la autenticación (login).
  - **`layout.tsx`**: Layout principal del dashboard que incluye la navegación (Sidebar, Header).
  - **`components/`**: La carpeta más importante para la UI.
    - `core/`: Componentes agnósticos al dominio, bloques de construcción fundamentales (ej: `DashboardView`).
    - `domain/`: Componentes específicos de un modelo de datos (ej: `CategoryList`, `ProductForm`). Son componentes inteligentes que usan hooks.
    - `layout/`: Componentes estructurales del dashboard (ej: `Sidebar`, `Header`).
    - `modals/`: Contiene todos los modales de la aplicación (ej: `DeleteModal`, `ProductModal`).
    - `ui/`: Componentes "tontos" y reutilizables basados en shadcn/ui (ej: `Button`, `Input`, `Table`). No contienen lógica de negocio.
  - **`hooks/`**: La carpeta más importante para la lógica.
    - `core/`: Hooks de lógica de negocio transversal (ej: `useEntity`, que abstrae las mutaciones de creación/edición).
    - `domain/`: Hooks específicos para cada entidad, que encapsulan la lógica de `react-query` (ej: `useGetCategories`, `useCreateProduct`).
    - `ui/`: Hooks para manejar estado de la UI, como `useModalStore` (Zustand).
  - **`services/`**: Funciones que realizan las llamadas a la API. Son el puente entre el frontend y el backend. Los hooks de dominio usan estos servicios.
  - **`types/`**: Definiciones de tipos de TypeScript, cruciales para la seguridad del código.
  - **`utils/`**: Funciones de utilidad genéricas.

- **`app/lib/`**: Librerías de soporte críticas.
  - `auth.ts`: **CONFIGURACIÓN CENTRAL DE NEXTAUTH**. Define los providers (Credentials), callbacks (jwt, session) y la lógica de autorización.
  - `prisma.ts`: Instancia y exporta el cliente de Prisma para ser usado en toda la API.

### `docs/`

Nuestra base de conocimiento.

- `sistema/`: Contiene los documentos maestros que guían nuestro desarrollo (`Mandamientos.md`, `Checklist.md`, `Bitacora.md`, y este mismo archivo).

### `public/`

Recursos estáticos.

- `images/`: Todas las imágenes de la aplicación (logos, fondos, etc.), organizadas por tipo.

---

## 4. Flujos de Datos y Lógica de Negocio

### Flujo de Autenticación

1.  El usuario introduce email/contraseña en la página de login.
2.  NextAuth (`CredentialsProvider` en `lib/auth.ts`) recibe las credenciales.
3.  La función `authorize` busca al usuario en la BD (`prisma.user.findUnique`).
4.  **Importante:** Compara la contraseña. Actualmente, hace una comparación directa, pero debería usar `bcrypt`.
5.  Si es válido, el callback `jwt` se ejecuta, añadiendo datos como `id`, `role`, `client_id` al token.
6.  El callback `session` transfiere los datos del token a la sesión del cliente, haciéndolos disponibles en toda la aplicación.
7.  El `middleware.ts` protege las rutas del dashboard, verificando la existencia de este token.

### Flujo de Datos CRUD (Ej: Crear una Categoría)

1.  **Componente:** El usuario hace clic en "Crear Categoría" en un componente de `domain/`.
2.  **Hook (UI):** Se llama a `useModalStore.onOpen('createCategory')` para abrir el modal.
3.  **Componente (Modal):** El modal `CategoryForm` se renderiza.
4.  **Hook (Dominio):** Al enviar el formulario, se llama a la función `createCategory` del hook `useCreateCategory()`.
5.  **Hook (Core):** `useCreateCategory` es probablemente una implementación del hook genérico `useEntity`.
6.  **Servicio:** La mutación dentro del hook llama a `categoryService.create(data)`.
7.  **API:** El servicio hace un `POST` a `/api/categories`.
8.  **Backend:** La ruta de la API usa `prisma.category.create({ data })` para guardar en la BD.
9.  **React Query:** Tras el éxito, `react-query` automáticamente invalida las queries relevantes (ej: `['categories', clientId]`) para que la lista de categorías se actualice sola.

---

## 5. Esquema de la Base de Datos (Resumen Prisma)

La jerarquía principal es:

- `User`: Puede tener rol `ADMIN` o `CLIENT`. Un `User` de tipo `CLIENT` está asociado a un `Client`.
- `Client`: Es un cliente de RokaMenu (un restaurante). Tiene un `id` y un `slug` para su URL pública.
- `Menu`: Un `Client` puede tener varios `Menus`. Cada menú tiene su propio `slug`.
- `Category`: Un `Menu` tiene varias `Categories` (Bebidas, Entradas, etc.). Tienen un campo `order` para el drag-and-drop.
- `Section`: Una `Category` tiene varias `Sections` (Refrescos, Vinos). También tienen un campo `order`.
- `Product`: Una `Section` tiene varios `Products` (Coca-Cola, Fanta). Tienen precio, descripción y un campo `order`.

Esta estructura anidada es la base de toda la lógica de la aplicación.
