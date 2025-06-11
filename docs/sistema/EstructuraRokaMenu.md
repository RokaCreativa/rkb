# 🧠 Estructura y Conocimiento Central de RokaMenu

> **Este documento es el cerebro del proyecto.** Es un resumen completo y detallado de la arquitectura, flujos y lógica de RokaMenu. Debe ser consultado para entender CÓMO funciona el sistema antes de modificarlo.

---

## 1. Visión General de la Aplicación

RokaMenu es una aplicación web (SaaS) diseñada para que dueños de restaurantes y negocios gastronómicos puedan crear, gestionar y personalizar sus menús digitales de forma fácil e intuitiva.

- **Usuario Principal:** Administradores de restaurantes (clientes de RokaMenu).
- **Producto Final:** Un menú digital interactivo accesible a través de un código QR.
- **Enfoque Principal:** **Mobile-First**. La experiencia de gestión está optimizada para dispositivos móviles, con una interfaz de escritorio completa también disponible.
- **Funcionalidad Clave:**
  - **Jerarquía Intuitiva:** `Categoría` > `Sección` > `Producto`.
  - **Dashboard de Gestión Dual:**
    - `MobileView`: Una interfaz "Drill-Down" optimizada para la gestión rápida en móviles.
    - `DashboardView` (Vista de Escritorio): Implementa una **arquitectura "Master-Detail"**.
      - **Master:** La primera columna muestra siempre la lista de **categorías** (`CategoryGridView`).
      - **Detail (Nivel 1):** Al seleccionar una categoría, una segunda columna muestra sus **secciones** (`SectionGridView`).
      - **Detail (Nivel 2):** Al seleccionar una sección, una tercera columna muestra sus **productos** (`ProductGridView`).
      - Esta estructura es orquestada por `DashboardView.tsx`, pero la lógica de renderizado real está encapsulada en los componentes `GridView` dedicados, que son "tontos".
    - **`DynamicView` y `DashboardClient`:** Son el corazón de la carga del dashboard. `DashboardClient` carga los datos iniciales y renderiza `DynamicView` sin SSR. `DynamicView` detecta el tipo de dispositivo y renderiza `MobileView` o `DashboardView`, previniendo errores de hidratación.
  - **Reordenamiento:** Drag & Drop en escritorio (`dnd-kit`) y un "modo de ordenación" planificado para móvil.
  - **Live Preview:** (En desarrollo) Visualización en tiempo real de los cambios realizados en el menú.

---

## 2. Arquitectura General y Tecnologías Clave

- **Framework:** **Next.js 13+** con **App Router**.
- **Lenguaje:** **TypeScript**.
- **Base de Datos:** **MySQL**. Se ha tomado la decisión estratégica de **cancelar la migración a PostgreSQL** y consolidar el uso de MySQL, ya que cumple con todos los requisitos actuales y futuros del proyecto.
- **ORM:** **Prisma**.
- **Autenticación:** **NextAuth.js**.
- **Gestión de Estado del Cliente:** **Zustand**. Es el **corazón de la lógica del frontend**. Un único store (`dashboardStore.ts`) centraliza todo el estado del dashboard: datos de entidades (categorías, secciones), estado de la navegación (vista activa) y las acciones para modificar dicho estado (llamadas a API, etc.). Esta decisión se tomó para eliminar los bucles de renderizado y la complejidad de la arquitectura anterior de hooks anidados.
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
- **`app/dashboard-v2/`**

  - **`components/`**: La carpeta más importante para la UI.
    - **`views/`**: **NUEVO.** Contiene los nuevos componentes de vista de alto nivel, específicos para la arquitectura Master-Detail (`CategoryGridView.tsx`, `SectionGridView.tsx`, `ProductGridView.tsx`).
    - `core/`: Componentes agnósticos al dominio. Los más importantes son `DashboardClient.tsx` (punto de entrada, carga de datos), `DynamicView.tsx` (switcher móvil/escritorio) y `DashboardView.tsx` (orquestador de la vista Master-Detail).
    - `domain/`: Componentes específicos de un modelo de datos (ej: `CategoryList`, `SectionListView`). **Son componentes "tontos"** que reciben datos y funciones como props. Ahora se usan principalmente dentro de la `MobileView`.
    - `layout/`: Componentes estructurales (ej: `Sidebar`, `Header`, `TopNavbar`).
    - `modals/`: Contiene todos los modales (ej: `DeleteModal`, `ProductModal`, `EditModals.tsx`).
    - `ui/`: Componentes reutilizables y básicos. (ej: `Fab.tsx`, `ContextMenu.tsx`).
  - **`stores/`**: **EL CEREBRO DEL FRONTEND.**
    - `dashboardStore.ts`: Este store de Zustand centraliza TODA la lógica de estado del dashboard. Maneja el estado de la UI (qué vista está activa, qué categoría está seleccionada), los datos de las entidades (arrays de categorías, secciones, etc.) y contiene todas las acciones asíncronas que llaman a las APIs y actualizan el estado de forma segura.
  - **`hooks/`**: Su rol ha sido simplificado. Ya no contiene la lógica de estado compleja. Ahora se usa para hooks de UI simples (ej: `useIsMobile`) o para stores de Zustand específicos y aislados (ej: `useModalStore`).
  - **`types/`**: Definiciones de TypeScript.
  - **`utils/`**: Funciones de utilidad genéricas.

- **`app/lib/`**: Librerías de soporte críticas.
  - `auth.ts`: Configuración de NextAuth.
  - `prisma.ts`: Cliente de Prisma.

### `docs/`

- `sistema/`: Nuestros documentos maestros (`Mandamientos.md`, `Checklist.md`, `Bitacora.md`, y este mismo archivo).

### `public/`

- `images/`: Imágenes de la aplicación.

---

## 4. Flujo de Datos CRUD (Ej: Cambiar Visibilidad de un Producto con Zustand)

Este flujo demuestra el nuevo patrón con Zustand, que es más simple y robusto.

1.  **Componente (UI):** El usuario hace clic en el ícono del "ojo" en un producto dentro de `ProductListView.tsx`. El `onClick` llama a la prop `onToggleVisibility(productId)`.
2.  **Vista (`MobileView.tsx`):** El manejador en `MobileView` recibe la llamada y la delega directamente a la acción del store de Zustand: `toggleProductVisibility(productId, activeSectionId)`.
3.  **Store (`dashboardStore.ts`):** La acción `toggleProductVisibility` se ejecuta:
    - **a. Obtiene el Estado Actual:** Usa `get()` para acceder al estado actual y encontrar el producto.
    - **b. Llamada a la API:** Envía una petición `PATCH` a la API específica: `/api/products/[id]/visibility`.
    - **c. Manejo de Éxito:** Si la API responde con éxito:
      - Actualiza el estado del producto dentro del store con `set()`.
      - **Paso Clave:** Llama a OTRA acción dentro del store, como `fetchSections(clientId)`, para recargar los datos del padre y asegurar que los contadores se actualicen. Toda la lógica de invalidación y recarga vive DENTRO del store.
    - **d. Manejo de Error:** Si la API falla, muestra una notificación. No es necesario revertir el estado porque nunca se hizo una actualización optimista directa.
4.  **Actualización de la UI:** Como el estado en el store de Zustand ha cambiado, todos los componentes que usen `useDashboardStore()` (como `MobileView`, que a su vez pasa props a `SectionListView` y `ProductListView`) se re-renderizan automáticamente con los datos frescos.

---

## 5. UI/UX Móvil y Esquema de la Base de Datos

### Principios de UI/UX Móvil

- **Acciones Primarias (Creación):** Se realizan a través de un **Botón de Acción Flotante (FAB)** (`Fab.tsx`).
- **Acciones Secundarias (Edición, Eliminación):** Agrupadas dentro de un **Menú Contextual** (`ContextMenu.tsx`).

### Esquema de la Base de Datos (Resumen Prisma)

La jerarquía principal es: `Client` -> `Category` -> `Section` -> `Product`.

#### Advertencia sobre Tipos de Datos Inconsistentes

**Un descubrimiento CRÍTICO durante la depuración** ha sido la inconsistencia en el manejo de campos "borrados", fuente recurrente de errores:

- **En `products`:** El campo `deleted` es de tipo **`Boolean?`**. Las consultas deben usar `deleted: false`.
- **En `categories` y `sections`:** El campo `deleted` es de tipo **`Int?`** (mapeado desde `TINYINT` en MySQL). Las consultas deben usar `deleted: 0`.

Esta diferencia es fundamental y debe ser respetada en todas las consultas para evitar que los contadores fallen o que se muestren datos incorrectos.

---

## 6. Errores Comunes y Lecciones Aprendidas

Esta sección documenta los problemas recurrentes y las lecciones críticas aprendidas. Consultarla es obligatorio para evitar repetir errores.

1.  **Inmutabilidad de `DashboardView.tsx`:**

    - **Lección:** Este archivo es extremadamente complejo.
    - **Regla:** **NUNCA** modificar `DashboardView.tsx` con herramientas de edición automática (`edit_file`). Cualquier intento ha resultado en la corrupción del archivo.

2.  **Inconsistencia del Campo `deleted`:**

    - **Lección:** No todos los campos `deleted` son iguales. `products.deleted` es `Boolean`, mientras que en `sections` y `categories` es `Int`.
    - **Regla:** Siempre verificar `prisma/schema.prisma` antes de escribir una consulta que involucre `deleted`. Usar `deleted: 0` para secciones/categorías y `deleted: false` para productos.

3.  **Rutas de API Atómicas:**

    - **Lección:** Sobrecargar rutas genéricas (ej: `PUT /api/sections/[id]`) es una mala práctica.
    - **Regla:** Crear rutas de API específicas para cada acción (ej: `PUT /api/sections/[id]/visibility`). Simplifica la lógica y la depuración.

4.  **Error `params should be awaited` en Next.js:**

    - **Lección:** En las rutas de API dinámicas de Next.js, no se puede desestructurar `params` directamente si se usa `await` antes en el cuerpo de la función.
    - **Regla:** La forma correcta y segura de acceder a los parámetros es asignándolos a una variable primero.
      - **Incorrecto:** `const { id } = params;`
      - **Correcto:** `const id = params.id;`

5.  **La Saga de la Visibilidad: Depuración de Fallos en Cascada**

    - **Problema Inicial:** Al cambiar la visibilidad de un ítem (producto, sección, etc.), el ítem no se movía visualmente al final de la lista hasta que se refrescaba la página manualmente.
    - **Lección #1: La actualización optimista no reordena.** La primera implementación actualizaba el estado del ítem localmente (`setProducts(...)`). Esto es rápido para la UI, pero no reordena la lista completa según las reglas (`orderBy: { status: 'desc' }`) que solo existen en el servidor.
    - **Solución #1: Forzar la recarga (`refetch`).** La solución correcta es, tras una llamada exitosa a la API, forzar una recarga completa de la lista (`fetchProductsBySection`, `fetchCategories`, etc.). Esto pide al servidor la lista fresca, que ya viene ordenada correctamente.
    - **Problema Secundario (Errores 404/405/500):** Tras implementar el refetch, la UI empezó a lanzar errores genéricos de `API Error: {}`.
    - **Lección #2: Conflictos de rutas, métodos y tipos.** La investigación reveló una cascada de errores en el backend que tuvieron que ser solucionados en orden:
      - **Conflicto de Rutas:** Existían dos carpetas dinámicas (`/api/products/[id]` y `/api/products/[productId]`), creando ambigüedad. La solución fue consolidar todo bajo `[id]`.
      - **Método HTTP Incorrecto:** Los hooks llamaban con `PATCH` (correcto para actualizaciones parciales), pero las APIs esperaban `PUT`. Esto causaba un error `405 Method Not Allowed`. La solución fue estandarizar todas las rutas de visibilidad a `PATCH`.
      - **Inconsistencia de Tipos:** El frontend enviaba el `status` como un `number` (`1`/`0`), pero el backend esperaba un `boolean` (`true`/`false`) y fallaba al validar. La solución fue alinear el frontend para que siempre envíe `boolean`.
    - **Regla:** Ante un `API Error` genérico, verificar la cadena completa de la petición: **URL de la Ruta -> Método HTTP -> Tipos de Datos del Payload (Cuerpo)**.

6.  **La Trampa de los Hooks Anidados y el Bucle Infinito:**
    - **Problema:** La aplicación sufría un bucle de renderizado infinito ("Maximum update depth exceeded"), especialmente en `MobileView`.
    - **Lección:** La arquitectura de hooks anidados (ej. `useDashboardState` usando `useCategoryManagement`, que a su vez usa `useState`) creaba referencias inestables. Cada render de un hook hijo provocaba un re-render del padre, generando un ciclo. Intentar estabilizar esto con `useMemo` y `useCallback` en cada nivel se volvió extremadamente complejo y frágil, tratando el síntoma y no la causa.
    - **Regla/Solución Definitiva:** Para estados complejos y compartidos que son modificados desde múltiples componentes, es superior usar una librería de estado dedicada. Se ha decidido migrar toda la gestión de estado del dashboard a un **único store de Zustand**. Esto elimina las dependencias circulares, garantiza referencias estables, simplifica el código al evitar el _prop drilling_, y centraliza la lógica de negocio en un solo lugar.
