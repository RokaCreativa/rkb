# 🧠 Estructura y Conocimiento Central de RokaMenu

> **Este documento es el cerebro del proyecto.** Es un resumen completo y detallado de la arquitectura, flujos y lógica de RokaMenu. Debe ser consultado para entender CÓMO funciona el sistema antes de modificarlo.

---

## 1. Visión General de la Aplicación

RokaMenu es una aplicación web (SaaS) diseñada para que dueños de restaurantes y negocios gastronómicos puedan crear, gestionar y personalizar sus menús digitales de forma fácil e intuitiva.

- **Usuario Principal:** Administradores de restaurantes (clientes de RokaMenu).
- **Producto Final:** Un menú digital interactivo accesible a través de un código QR.
- **Enfoque Principal:** **Mobile-First**. La experiencia de gestión está optimizada para dispositivos móviles, con una interfaz de escritorio completa también disponible.
- **Funcionalidad Clave:**
  - **Jerarquía Flexible:**
    - **Tradicional:** `Categoría` > `Sección` > `Producto` (para casos complejos como "HAMBURGUESAS" → "Tipos" → Productos específicos)
    - **Simplificada:** `Categoría` > `Producto` (para casos directos como "SNACKS" → Lista de productos)
    - **Híbrida:** EN EL MISMO MENÚ, diferentes categorías pueden usar diferentes jerarquías según su naturaleza
  - **Dashboard de Gestión Dual:**
    - `MobileView`: Una interfaz "Drill-Down" optimizada para la gestión rápida en móviles.
    - `DashboardView` (Vista de Escritorio): Implementa una **arquitectura "Master-Detail"**.
      - **Master:** La primera columna muestra siempre la lista de **categorías** (`CategoryGridView`).
      - **Detail (Nivel 1):** Al seleccionar una categoría, una segunda columna muestra sus **secciones** (`SectionGridView`) O **productos directamente** (`ProductGridView`) según el `hierarchy_mode` de la categoría.
      - **Detail (Nivel 2):** Solo en categorías con `hierarchy_mode: "sections"`, al seleccionar una sección, una tercera columna muestra sus **productos** (`ProductGridView`).
      - Esta estructura es orquestada por `DashboardView.tsx`, pero la lógica de renderizado real está encapsulada en los componentes `GridView` dedicados, que son "tontos".
    - **`DynamicView` y `DashboardClient`:** Son el corazón de la carga del dashboard. `DashboardClient` carga los datos iniciales y renderiza `DynamicView` sin SSR. `DynamicView` detecta el tipo de dispositivo y renderiza `MobileView` o `DashboardView`, previniendo errores de hidratación.
  - **Features Críticos Gastronómicos:**
    - **Alergenos:** Sistema obligatorio para todos los negocios gastronómicos (restaurantes, bares, cafeterías) con iconos visuales según normativas europeas
    - **Precios Múltiples:** Productos con variantes (Ej: Bocadillo Grande/Mediano/Pequeño) con hasta 4 precios y labels personalizables
    - **Multiidioma:** Sistema avanzado con auto-traducción y capacidad de override manual por cliente
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

- **`app/api/`**: Contiene todas las rutas de la API del backend.
  - **`app/api/upload/route.ts`**: **NUEVO Y CRÍTICO.** Es el endpoint **único y genérico** para la subida de todas las imágenes. Acepta un campo `entityType` ('categories', 'sections', 'products') para determinar dinámicamente la carpeta de destino, centralizando la lógica y mejorando la mantenibilidad.
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

- `images/`: Imágenes de la aplicación, ahora estructurada con subcarpetas por entidad:
  - `categories/`
  - `sections/`
  - `products/`

---

## 4. Flujo de Datos CRUD (Ej: Crear una Sección con Imagen)

Este flujo demuestra el nuevo patrón con Zustand y la API de subida genérica.

1.  **Componente (UI):** El usuario hace clic en "Guardar Cambios" en el modal de creación de sección (`EditModals.tsx`).
2.  **Modal (`EditModals.tsx`):**
    - **a. Obtiene los Datos:** Llama a `getFormData()` en la `ref` del `SectionForm` para obtener los datos del formulario y el `imageFile`.
    - **b. Llama al Store:** Invoca la acción `createSection(formData, imageFile)`.
3.  **Store (`dashboardStore.ts`):** La acción `createSection` se ejecuta:
    - **a. Sube la Imagen (si existe):** Llama a la acción helper `_uploadImage(imageFile, 'sections')`.
    - **b. `_uploadImage`:** Envía la petición a la API `POST /api/upload` con el archivo y el `entityType`. La API guarda la imagen en `public/images/sections/` y devuelve solo el `filename`.
    - **c. Llama a la API de Creación:** Envía una petición `POST` a `/api/sections` con los datos del formulario, incluyendo el `filename` en el campo `image`.
    - **d. Manejo de Éxito:** Si la API de secciones responde con éxito, llama a `fetchSectionsByCategory()` para recargar la lista de secciones y que la nueva aparezca en la UI.
4.  **Actualización de la UI:** El cambio en el estado de `sections` en el store provoca que los componentes suscritos se re-rendericen con los datos frescos.

---

## 5. UI/UX Móvil y Esquema de la Base de Datos

### Principios de UI/UX Móvil

- **Acciones Primarias (Creación):** Se realizan a través de un **Botón de Acción Flotante (FAB)** (`Fab.tsx`).
- **Acciones Secundarias (Edición, Eliminación):** Agrupadas dentro de un **Menú Contextual** (`ContextMenu.tsx`).

### Esquema de la Base de Datos (Resumen Prisma)

La jerarquía principal es: `Client` -> `Category` -> `Section` -> `Product`.

#### Arquitectura de Jerarquía Flexible

**NUEVA FUNCIONALIDAD EN DESARROLLO (T32):**

El sistema permite que diferentes categorías dentro del MISMO menú usen diferentes jerarquías:

```typescript
// Extensión del modelo categories
model categories {
  // ... campos existentes
  hierarchy_mode categories_hierarchy_mode @default(sections)
}

enum categories_hierarchy_mode {
  simple    // Categoría → Productos (directamente)
  sections  // Categoría → Secciones → Productos
}
```

**Casos de Uso Reales:**

- **Categoría "SNACKS" (`hierarchy_mode: "simple"`)**: Lista directa de productos (Sopas, Sándwiches, Papas Fritas)
- **Categoría "HAMBURGUESAS" (`hierarchy_mode: "sections"`)**: Secciones como tipos (Sencilla, Con Queso, Doble) → Productos específicos

**Implementación Técnica:**

- **Categorías "simple"**: Auto-creación de sección invisible para mantener integridad referencial de la DB
- **UI Adaptativa**: `DashboardView` renderiza `SectionGridView` O `ProductGridView` según `hierarchy_mode`
- **Navegación Móvil**: Se mantiene igual - el usuario navega intuitivamente sin notar la diferencia técnica

#### Nuevos Features Gastronómicos

**Alergenos (Obligatorio para Gastronomía):**

- Tablas: `allergens`, `allergens_product` (relación many-to-many)
- Iconos: `public/images/allergensIcons/`
- Aplicable a: Todos los `business_type` gastronómicos (Restaurante, Bar, Cafetería, etc.)

**Precios Múltiples:**

- Campo actual: `multiple_prices` VARCHAR("S"/"N") → **MIGRAR A**: BOOLEAN
- Campos: `price1-4`, `label_price1-4` para variantes (Grande/Mediano/Pequeño)
- Validación: Al menos `price1` requerido cuando `multiple_prices = true`

**Sistema Multiidioma:**

- Tablas existentes: `languages`, `translations`, `client_languages`
- **NUEVA FUNCIONALIDAD**: Auto-traducción + Override manual por cliente
- Fallback inteligente: Si traducción no existe → idioma principal del cliente

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

3.  **Rutas de API Atómicas y Genéricas:**

    - **Lección:** Sobrecargar rutas genéricas (ej: `PUT /api/sections/[id]`) es una mala práctica.
    - **Regla:** Crear rutas de API específicas para cada acción atómica (ej: `PUT /api/sections/[id]/visibility`). Para acciones comunes como la subida de archivos, crear un endpoint genérico bien definido (como `/api/upload`) es superior a tener uno por entidad.

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
