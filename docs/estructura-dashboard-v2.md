# Estructura de Archivos y Carpetas Dashboard v2 - Guía para Principiantes 🚀

Este documento detalla la estructura completa del Dashboard v2 de RokaMenu. Está diseñado como una guía exhaustiva para entender cada parte del sistema de manera sencilla.

## 📁 Estructura Principal

```
app/dashboard-v2/
├── api/             # APIs y endpoints
├── components/      # Componentes UI
├── features/        # Características específicas
├── hooks/           # Hooks globales
├── infrastructure/  # Servicios e infraestructura
├── shared/          # Recursos compartidos
├── stores/          # Stores globales (Zustand)
├── styles/          # Estilos globales
├── types/           # Tipos e interfaces
├── utils/           # Utilidades y helpers
├── layout.tsx       # Layout principal
├── page.tsx         # Página principal
└── AuthDebugLayout.tsx # Layout para depuración de autenticación
```

## 🔍 Descripción Detallada de Cada Carpeta

### 📁 `/api`

Contiene todos los endpoints API específicos para el dashboard-v2. Estos endpoints se comunican con el backend y gestionan los datos que se muestran en la interfaz.

```
api/
└── categories/
    └── reorder/
        └── route.ts    # Endpoint para reordenar categorías
```

- **Propósito**: Proporcionar endpoints API específicos para el dashboard-v2
- **Uso**: Comunicación con el backend, gestión CRUD de elementos del menú

### 📁 `/components`

El corazón de la interfaz de usuario del dashboard. Contiene todos los componentes React organizados en subcarpetas según su funcionalidad.

```
components/
├── actions/          # Componentes para acciones específicas
├── hooks/            # Hooks específicos para componentes
├── layout/           # Componentes de layout
├── modals/           # Diálogos y ventanas modales
│   ├── buttons/      # Botones específicos para modales
│   └── ...
├── sections/         # Componentes relacionados con secciones
│   ├── ProductList.tsx       # Lista de productos
│   ├── SectionList.tsx       # Lista de secciones
│   ├── SectionListItem.tsx   # Ítem individual de sección
│   └── ProductListItem.tsx   # Ítem individual de producto
├── ui/               # Componentes de UI reutilizables
│   ├── VirtualizedList.tsx   # Lista virtualizada para rendimiento
│   ├── Loader.tsx            # Componente de carga
│   ├── disclosure.tsx        # Componente para mostrar/ocultar contenido
│   └── SuccessMessage.tsx    # Mensaje de éxito
└── views/            # Vistas principales
    ├── SectionView.tsx       # Vista de secciones
    ├── MobilePreview.tsx     # Vista previa móvil
    ├── CategoryView.tsx      # Vista de categorías
    ├── OptimizedCategoryView.tsx # Vista optimizada de categorías
    ├── Breadcrumbs.tsx       # Navegación de migas de pan
    └── ProductView.tsx       # Vista de productos
```

Componentes principales (nivel raíz):

- `CategoryList.tsx` - Lista de categorías
- `FloatingPhonePreview.tsx` - Vista previa flotante de móvil
- `CategorySections.tsx` - Secciones dentro de una categoría
- `ReorderControls.tsx` - Controles para reordenar elementos
- `ProductTable.tsx` - Tabla de productos
- `NewCategoryModal.tsx` - Modal para nueva categoría
- `CategoryTable.tsx` - Tabla de categorías
- `SectionTable.tsx` - Tabla de secciones
- `DashboardView.tsx` - Vista principal del dashboard
- `TopNavbar.tsx` - Barra de navegación superior
- `ProductManager.tsx` - Gestor de productos
- `SectionDetail.tsx` - Detalle de sección
- `Breadcrumbs.tsx` - Navegación de migas de pan
- `DashboardProvider.tsx` - Proveedor de contexto para dashboard
- `DashboardContext.tsx` - Contexto para el dashboard
- `DashboardState.tsx` - Estado del dashboard
- `PhonePreview.tsx` - Vista previa de teléfono
- `RolesDropdown.tsx` - Menú desplegable de roles
- `RoleSelector.tsx` - Selector de roles
- `Header.tsx` - Cabecera

### 📁 `/features`

Contiene módulos organizados por funcionalidad o característica específica del negocio. Cada carpeta agrupa todo lo relacionado con una entidad específica.

```
features/
├── products/     # Características relacionadas con productos
├── sections/     # Características relacionadas con secciones
└── categories/   # Características relacionadas con categorías
```

- **Propósito**: Organizar el código por funcionalidad o característica del negocio
- **Uso**: Facilitar el mantenimiento y la escalabilidad del código

### 📁 `/hooks`

Contiene hooks de React personalizados que encapsulan la lógica de negocio reutilizable. Estos hooks proporcionan una capa de abstracción para operaciones comunes.

```
hooks/
├── useProductManagement.ts   # Gestión de productos
├── useSectionManagement.ts   # Gestión de secciones
├── useCategoryManagement.ts  # Gestión de categorías
├── useDashboardState.ts      # Estado global del dashboard
├── useCategoryReorder.tsx    # Funcionalidad de reordenamiento
├── useClient.ts              # Información del cliente
├── useLazyLoading.ts         # Carga perezosa de datos
├── useTheme.ts               # Gestión de temas
├── useVirtualizedList.ts     # Listas virtualizadas
├── useDataState.tsx          # Estado de datos
├── useViewState.tsx          # Estado de la vista
├── useModalState.tsx         # Estado para modales
└── useExpansionState.tsx     # Estado de expansión
```

- **Propósito**: Proporcionar lógica de negocio reutilizable
- **Uso**: Cada hook está especializado en una funcionalidad específica

### 📁 `/infrastructure`

Contiene código relacionado con servicios externos, configuración de cliente HTTP, y otras herramientas de infraestructura.

```
infrastructure/
└── api/          # Configuración API y clientes HTTP
```

- **Propósito**: Gestionar comunicación con servicios externos
- **Uso**: Configuración de clientes HTTP, autenticación, etc.

### 📁 `/shared`

Contiene recursos compartidos que pueden ser utilizados en múltiples partes de la aplicación.

```
shared/
└── components/   # Componentes compartidos
```

- **Propósito**: Proporcionar recursos reutilizables
- **Uso**: Componentes, utilidades o hooks que se utilizan en múltiples partes

### 📁 `/stores`

Contiene almacenes de estado global utilizando Zustand. Estos stores mantienen el estado que necesita ser accesible desde múltiples componentes.

```
stores/
└── customizationStore.ts    # Store para la personalización
```

- **Propósito**: Gestionar estado global de la aplicación
- **Uso**: Mantener datos que deben ser accesibles desde múltiples componentes

### 📁 `/styles`

Contiene archivos CSS para estilos globales y específicos del dashboard.

```
styles/
├── dashboard.css      # Estilos específicos del dashboard
├── index.css          # Estilos generales
├── theme.css          # Variables de tema
├── animations.css     # Animaciones
└── typography.css     # Estilos de tipografía
```

- **Propósito**: Proporcionar estilos globales
- **Uso**: Definir apariencia visual consistente

### 📁 `/types`

Centraliza todos los tipos e interfaces TypeScript utilizados en el dashboard.

```
types/
├── index.ts       # Tipos e interfaces principales
└── dashboard.ts   # Tipos específicos del dashboard
```

- **Propósito**: Centralizar definiciones de tipos
- **Uso**: Garantizar coherencia de tipos en toda la aplicación

### 📁 `/utils`

Contiene funciones utilitarias y helpers que pueden ser utilizados en toda la aplicación.

```
utils/
├── performance.ts         # Utilidades para optimizar rendimiento
├── dashboardHelpers.tsx   # Helpers específicos del dashboard
└── imageUtils.ts          # Utilidades para gestión de imágenes
```

- **Propósito**: Proporcionar funciones utilitarias
- **Uso**: Operaciones comunes como formateo de datos, validaciones, etc.

## 🔑 Archivos Principales

### 📄 `layout.tsx`

- **Propósito**: Define el layout principal del dashboard-v2
- **Uso**: Envuelve todas las páginas y componentes del dashboard

### 📄 `page.tsx`

- **Propósito**: Página principal del dashboard-v2
- **Uso**: Punto de entrada al dashboard-v2

### 📄 `AuthDebugLayout.tsx`

- **Propósito**: Layout para depuración de autenticación
- **Uso**: Utilizado durante el desarrollo para verificar el estado de autenticación

## 🧩 Componentes Clave

### 📦 Vistas

Las vistas (`/components/views/`) son componentes principales que representan páginas o secciones completas:

- **CategoryView.tsx**: Vista para gestionar categorías
- **SectionView.tsx**: Vista para gestionar secciones dentro de una categoría
- **ProductView.tsx**: Vista para gestionar productos dentro de una sección
- **OptimizedCategoryView.tsx**: Versión optimizada para mostrar muchas categorías

### 📦 Modales

Los modales (`/components/modals/`) son ventanas emergentes para acciones específicas:

- **NewCategoryModal.tsx**: Para crear nuevas categorías
- **EditCategoryModal.tsx**: Para editar categorías existentes
- **DeleteCategoryModal.tsx**: Confirmación para eliminar categorías
- **NewSectionModal.tsx**: Para crear nuevas secciones
- **EditSectionModal.tsx**: Para editar secciones existentes
- **DeleteSectionModal.tsx**: Confirmación para eliminar secciones
- **NewProductModal.tsx**: Para crear nuevos productos
- **EditProductModal.tsx**: Para editar productos existentes
- **DeleteProductModal.tsx**: Confirmación para eliminar productos
- **CustomizationModal.tsx**: Para personalizar la apariencia

### 📦 Componentes de Sección

Los componentes en `/components/sections/` gestionan la visualización de secciones:

- **SectionList.tsx**: Muestra una lista de secciones
- **SectionListItem.tsx**: Representa una sección individual
- **ProductList.tsx**: Muestra una lista de productos
- **ProductListItem.tsx**: Representa un producto individual

## 🔄 Flujo de Datos

El flujo de datos en el dashboard-v2 sigue el siguiente patrón:

1. Los **hooks de gestión** (`useCategoryManagement`, `useSectionManagement`, `useProductManagement`) se encargan de las operaciones CRUD para las entidades.
2. El **hook principal** `useDashboardState` coordina todos los hooks de gestión y proporciona un punto único de acceso a las funciones y estados.
3. Los **componentes de vista** utilizan `useDashboardState` para acceder a los datos y funciones necesarias.
4. Los **componentes individuales** (como `SectionListItem` o `ProductList`) reciben datos y callbacks a través de props.
5. Las **acciones del usuario** desencadenan operaciones que actualizan tanto el estado local como el backend a través de llamadas API.

## 🚀 Optimizaciones

El dashboard-v2 implementa varias optimizaciones para mejorar el rendimiento:

1. **Virtualización**: Para listas largas, se utiliza `VirtualizedList` que solo renderiza los elementos visibles.
2. **Carga perezosa**: Los datos se cargan según se necesitan, no todos al inicio.
3. **Memoización**: Se utilizan React.memo, useMemo y useCallback para evitar re-renders innecesarios.
4. **Utilidades de rendimiento**: Funciones como debounce y throttle para optimizar eventos frecuentes.

## 🔒 Seguridad

La seguridad se implementa a través de:

1. **Verificación de roles**: Cada punto de entrada verifica si el usuario tiene los permisos necesarios.
2. **Redirección a /unauthorized**: Si un usuario no tiene permisos, se redirige a esta página.
3. **Validación en cliente y servidor**: Los permisos se verifican en ambos lados.

## 🔧 Hooks Especializados

### 🔄 `useDashboardState.ts`

- **Propósito**: Hook principal que combina todos los hooks de dominio
- **Uso**: Proporciona un punto único de acceso a todas las funciones y estados

### 📊 `useCategoryManagement.ts`

- **Propósito**: Gestionar operaciones CRUD para categorías
- **Uso**: Cargar, crear, actualizar y eliminar categorías

### 📋 `useSectionManagement.ts`

- **Propósito**: Gestionar operaciones CRUD para secciones
- **Uso**: Cargar, crear, actualizar y eliminar secciones

### 🛒 `useProductManagement.ts`

- **Propósito**: Gestionar operaciones CRUD para productos
- **Uso**: Cargar, crear, actualizar y eliminar productos

### 🔄 `useCategoryReorder.tsx`

- **Propósito**: Facilitar el reordenamiento de categorías
- **Uso**: Implementar funcionalidad de arrastrar y soltar

### 📱 `useClient.ts`

- **Propósito**: Gestionar información del cliente
- **Uso**: Obtener y actualizar datos del cliente

### 🔄 `useLazyLoading.ts`

- **Propósito**: Implementar carga perezosa
- **Uso**: Cargar datos solo cuando se necesitan

### 🎨 `useTheme.ts`

- **Propósito**: Gestionar temas visuales
- **Uso**: Cambiar entre temas claro y oscuro

### 📋 `useVirtualizedList.ts`

- **Propósito**: Optimizar listas largas
- **Uso**: Renderizar solo elementos visibles

## 📁 Tipos

### 📄 `/types/index.ts`

- **Propósito**: Centralizar tipos e interfaces
- **Uso**: Definir estructuras de datos para toda la aplicación
- **Contenido**: Interfaces para entidades principales (Category, Section, Product, etc.)

### 📄 `/types/dashboard.ts`

- **Propósito**: Tipos específicos del dashboard
- **Uso**: Definir tipos como ViewType, InteractionMode, etc.
- **Contenido**: Enumeraciones y tipos específicos para el dashboard

## 🛠️ Utilidades

### 📄 `/utils/performance.ts`

- **Propósito**: Optimizar rendimiento
- **Uso**: Proporcionar funciones como debounce, throttle, memoización
- **Contenido**: Utilidades para mejorar el rendimiento de la aplicación

### 📄 `/utils/dashboardHelpers.tsx`

- **Propósito**: Helpers específicos del dashboard
- **Uso**: Proporcionar funciones auxiliares comunes
- **Contenido**: Formateo de datos, validaciones, transformaciones

### 📄 `/utils/imageUtils.ts`

- **Propósito**: Gestión de imágenes
- **Uso**: Cargar, validar y optimizar imágenes
- **Contenido**: Funciones como getImagePath, handleImageError

## 🧠 Modelo de Datos

El dashboard-v2 se basa en un modelo de datos jerárquico:

1. **Cliente** (`Client`): Representa al restaurante o negocio
2. **Categoría** (`Category`): Grupo principal de elementos del menú (ej: Entrantes, Platos Principales)
3. **Sección** (`Section`): Subdivisión de categoría (ej: Pastas, Carnes)
4. **Producto** (`Product`): Elemento individual del menú (ej: Spaghetti Carbonara)

Cada nivel tiene sus propios atributos y relaciones:

- **Client**: id, name, logos, contacto
- **Category**: category_id, name, order, status
- **Section**: section_id, name, image, category_id, status, order
- **Product**: product_id, name, description, price, image, section_id, status, order

## 🔍 Conclusión

El dashboard-v2 es una aplicación bien estructurada que sigue principios modernos de desarrollo:

- **Arquitectura limpia**: Separación clara de responsabilidades
- **Componentes modulares**: Cada componente tiene un propósito único
- **Estado centralizado**: Hooks especializados y stores para gestionar datos
- **Optimizaciones de rendimiento**: Virtualización, memoización, carga perezosa
- **Tipado estricto**: TypeScript para garantizar la integridad de los datos

Esta estructura facilita el mantenimiento, la escalabilidad y la comprensión del código, permitiendo añadir nuevas funcionalidades de manera coherente con el resto de la aplicación.
