# 🧠 Estructura y Conocimiento Central de RokaMenu

> **Este documento es el cerebro del proyecto.** Es un resumen completo y detallado de la arquitectura, flujos y lógica de RokaMenu. Debe ser consultado para entender CÓMO funciona el sistema antes de modificarlo.

---

## 1. Visión General de la Aplicación

RokaMenu es una aplicación web (SaaS) diseñada para que dueños de restaurantes y negocios gastronómicos puedan crear, gestionar y personalizar sus menús digitales de forma fácil e intuitiva.

- **Usuario Principal:** Administradores de restaurantes (clientes de RokaMenu).
- **Producto Final:** Un menú digital interactivo accesible a través de un código QR.
- **Enfoque Principal:** **Mobile-First**. La experiencia de gestión está optimizada para dispositivos móviles, con una interfaz de escritorio completa también disponible.
- **Funcionalidad Clave:**
  - **Dashboard de Gestión Dual:**
    - `MobileView`: Una interfaz de usuario diseñada específicamente para la gestión rápida y eficiente en móviles.
    - `DashboardView`: Una vista de escritorio más tradicional y completa.
    - `ViewSwitcher`: Un componente que renderiza automáticamente la vista correcta según el tamaño de la pantalla.
  - **Jerarquía Intuitiva:** `Categoría` > `Sección` > `Producto`.
  - **Reordenamiento:** Drag & Drop en escritorio (`dnd-kit`) y un "modo de ordenación" planificado para móvil.
  - **Live Preview:** (En desarrollo) Visualización en tiempo real de los cambios realizados en el menú.

---

## 2. Arquitectura General y Tecnologías Clave

- **Framework:** **Next.js 13+** con **App Router**.
- **Lenguaje:** **TypeScript**.
- **Base de Datos:** **MySQL**. Se ha tomado la decisión estratégica de **cancelar la migración a PostgreSQL** y consolidar el uso de MySQL, ya que cumple con todos los requisitos actuales y futuros del proyecto.
- **ORM:** **Prisma**.
- **Autenticación:** **NextAuth.js**.
- **Gestión de Estado del Servidor:** Aunque **`@tanstack/react-query`** está presente, la gestión de datos del dashboard se realiza principalmente a través de un **patrón de hooks de gestión de estado personalizados** (ver sección de Hooks más abajo).
- **Gestión de Estado del Cliente:** **Zustand** (para estados globales como la visibilidad de modales, ej. `useModalStore`).
- **Estilos:** **Tailwind CSS**.
- **Componentes UI:** **shadcn/ui**, asegurando consistencia visual. Componentes personalizados reutilizables.
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

- **`app/dashboard-v2/`**

  - **`views/`**: Contiene los componentes de vista de alto nivel, que son los puntos de entrada principales para la UI del usuario.
    - `MobileView.tsx`: La vista optimizada para dispositivos móviles. Contiene la lógica de navegación entre listas (categorías, secciones, productos).
    - `DashboardView.tsx`: La vista tradicional para escritorio.
  - **`components/`**: La carpeta más importante para la UI.
    - `core/`: Componentes agnósticos al dominio. El más importante es `ViewSwitcher.tsx` que elige entre la vista móvil y de escritorio.
    - `domain/`: Componentes específicos de un modelo de datos (ej: `CategoryList`, `ProductForm`). Son componentes inteligentes que utilizan los hooks de gestión.
    - `layout/`: Componentes estructurales del dashboard (ej: `Sidebar`, `Header`).
    - `modals/`: Contiene todos los modales de la aplicación (ej: `DeleteModal`, `ProductModal`).
    - `ui/`: Componentes "tontos" y reutilizables basados en shadcn/ui. No contienen lógica de negocio. **Ejemplos recientes:** `Fab.tsx` (Botón de Acción Flotante), `ContextMenu.tsx`.
  - **`hooks/`**: La carpeta más importante para la lógica. Aquí reside el "cerebro" del frontend.
    - **`domain/`**: **EL PATRÓN ARQUITECTÓNICO CENTRAL**. En lugar de usar `react-query` directamente en los componentes, se encapsula toda la lógica de una entidad en un único hook de gestión.
      - **Ejemplo:** `useCategoryManagement.ts`.
      - **Responsabilidades de cada hook:**
        - **Gestión de Estado:** Mantiene el estado de la entidad (la lista de ítems, el estado de carga, los errores) usando `useState`.
        - **Comunicación con la API:** Contiene todas las funciones `fetch` para las operaciones CRUD (`fetchCategories`, `createCategory`, etc.).
        - **Actualizaciones Optimistas:** Implementa la lógica para actualizar la UI _antes_ de que la API confirme el cambio, proporcionando una experiencia de usuario instantánea (ej. `toggleCategoryVisibility`).
        - **Manejo de Errores y Notificaciones:** Utiliza `react-hot-toast` para informar al usuario sobre el resultado de las operaciones.
    - `ui/`: Hooks para manejar estado de la UI, como `useModalStore` (Zustand) o `useIsMobile`.
  - **`services/`**: Funciones que podrían realizar las llamadas a la API. Actualmente, esta lógica está integrada directamente en los hooks de dominio para mayor cohesión.
  - **`types/`**: Definiciones de tipos de TypeScript, cruciales para la seguridad del código. Se organizan por `domain`, `api`, `ui`.
  - **`utils/`**: Funciones de utilidad genéricas, como `imageUtils.ts` para gestionar rutas de imágenes.

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

### Flujo de Datos CRUD (Ej: Cambiar Visibilidad de una Sección en Móvil)

Este flujo demuestra el patrón de **hook de gestión** y la **actualización optimista**, que es el estándar actual en el dashboard.

1.  **Componente (UI):** El usuario hace clic en el ícono del "ojo" en un elemento de la lista dentro de `MobileView.tsx`.
2.  **Componente (Handler):** El `onClick` llama a la función `handleToggleVisibility(item)`, que es una función centralizada en `MobileView`.
3.  **Lógica del Handler:** `handleToggleVisibility` identifica el tipo de `item` (Categoría, Sección o Producto) y llama a la función correspondiente del hook de gestión que ha sido instanciado en el scope de `MobileView`.
    - `sectionManager.toggleSectionVisibility(item.section_id, item.categoryId, item.status)`
4.  **Hook (Dominio - `useSectionManagement`):** La función `toggleSectionVisibility` se ejecuta:
    - **a. Actualización Optimista:** Inmediatamente, usa `setSections()` para actualizar el estado local, cambiando el `status` del ítem. La UI reacciona al instante, cambiando la opacidad del elemento y el icono.
    - **b. Llamada a la API:** Envía una petición `PUT` a la API (`/api/sections/[id]/visibility`) con el nuevo estado.
    - **c. Manejo de Éxito:** Si la API devuelve un `200 OK`, no se necesita hacer nada más, ya que la UI ya fue actualizada. Se podría mostrar un toast de éxito si se deseara.
    - **d. Manejo de Error:** Si la API falla, el bloque `catch` se ejecuta. **Revierte el cambio en el estado local** (vuelve a poner el `status` original) y muestra un `toast.error()` al usuario. La UI vuelve a su estado anterior.

Este patrón hace que la aplicación se sienta extremadamente rápida y robusta, y centraliza toda la lógica de una entidad en un solo lugar, haciendo que sea fácil de mantener y depurar.

---

## 5. Principios de UI/UX Móvil

Para asegurar una experiencia de usuario consistente y eficiente en dispositivos móviles, se han establecido los siguientes principios:

- **Acciones Primarias (Creación):** Se realizan a través de un **Botón de Acción Flotante (FAB)** (`Fab.tsx`), siempre visible en la esquina inferior derecha. Esto proporciona un punto de entrada claro para añadir nuevos elementos.
- **Acciones Secundarias (Edición, Eliminación):** Están agrupadas dentro de un **Menú Contextual** (`ContextMenu.tsx`), accesible a través de un icono de tres puntos en cada elemento de la lista. Esto mantiene la interfaz limpia y evita la sobrecarga de botones.
- **Navegación Jerárquica:** La navegación es clara y sigue la estructura de datos: `Categorías -> Secciones -> Productos`, con botones de "Volver" prominentes para facilitar el retroceso.

---

## 6. Esquema de la Base de Datos (Resumen Prisma)

La jerarquía principal es la base de toda la lógica de la aplicación.

- `Client`: Es un cliente de RokaMenu (un restaurante).
- `Category`: Un `Client` tiene varias `Categories`.
  - `name`, `image`, `status` (1 para visible, 0 para oculto), `order`.
  - `sections_count`, `visible_sections_count`: Contadores cacheados para eficiencia.
- `Section`: Una `Category` tiene varias `Sections`.
  - `name`, `image`, `status`, `order`.
  - `products_count`, `visible_products_count`: Contadores cacheados.
- `Product`: Una `Section` tiene varios `Products`.
  - `name`, `description`, `price`, `image`, `status`, `order`.
