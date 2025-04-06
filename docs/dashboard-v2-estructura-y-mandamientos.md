# 📋 ESTRUCTURA Y MANDAMIENTOS DEL DASHBOARD V2

> "Conocerás lo que existe antes de crear algo nuevo"
> "No duplicarás lo que ya está creado"
> "Separarás la función de la estética"

## 🔍 MANDAMIENTOS DE DESARROLLO Y REFACTORIZACIÓN

### 📌 Mandamiento Principal de Verificación Estructural

Este mandamiento establece la obligación absoluta de verificar la estructura existente del proyecto antes de crear cualquier nuevo componente, hook, utilidad o archivo. Su propósito es prevenir duplicidades accidentales, mantener la coherencia arquitectónica y asegurar que todo desarrollo se alinee con los patrones establecidos.

#### 📑 Reglas Esenciales

1. **SIEMPRE VERIFICARÁS** la estructura existente antes de crear nuevos elementos
2. **NUNCA CREARÁS** duplicados por desconocimiento de lo que ya existe
3. **CONSULTARÁS** regularmente la documentación de estructura
4. **EXPLORARÁS** el código base utilizando herramientas de búsqueda
5. **DOCUMENTARÁS** cualquier adición a la estructura
6. **VERIFICARÁS** que no existan archivos o interfaces con propósitos similares en ubicaciones diferentes

#### 🔄 Regla Anti-Duplicidad

Es **ESTRICTAMENTE PROHIBIDO** crear:

- Componentes duplicados con el mismo nombre en diferentes ubicaciones
- Interfaces duplicadas o similares para los mismos propósitos
- Hooks con funcionalidades similares en diferentes ubicaciones
- Utilidades que duplican funcionalidad existente

Por ejemplo:

- **INCORRECTO**: Tener `ProductView.tsx` en `/components/` y otro en `/components/views/`
- **CORRECTO**: Tener un único `ProductView.tsx` en `/components/views/`

#### 📋 Procedimiento de Verificación

Antes de crear cualquier elemento nuevo, seguirás este procedimiento:

1. **Consultar documentación**:

   - Revisar esta guía para entender la estructura completa
   - Examinar modelos de datos y optimizaciones

2. **Explorar directorios relacionados**:

   - Explorar las carpetas relevantes
   - Verificar qué archivos y componentes ya existen
   - Entender la organización y convenciones de nomenclatura
   - **Buscar archivos con nombres similares o propósitos similares**

3. **Buscar elementos similares**:

   - Buscar componentes o utilidades similares
   - Verificar si ya existe algún elemento que pueda ser reutilizado o adaptado
   - Examinar cómo están implementados los elementos similares

4. **Comprobar hooks existentes**:

   - Revisar `/hooks` y `/components/hooks` en busca de hooks que puedan ser reutilizados
   - Entender la separación entre hooks globales y hooks específicos de componentes
   - Verificar si la funcionalidad necesaria ya está implementada en algún hook

5. **Validar nomenclatura y ubicación**:
   - Asegurar que el nombre del nuevo elemento sigue las convenciones establecidas
   - Verificar que la ubicación propuesta es coherente con la estructura
   - Confirmar que respeta la separación de responsabilidades

#### 🧠 Preguntas Clave Antes de Crear

1. ¿Existe ya algún componente que cumpla esta función o una similar?
2. ¿Hay algún hook que pueda ser reutilizado o extendido?
3. ¿La ubicación propuesta es coherente con la estructura actual?
4. ¿El nombre sigue las convenciones establecidas?
5. ¿La implementación respeta los patrones existentes?
6. ¿Es realmente necesario crear un nuevo elemento o puedo adaptar uno existente?

### 📌 Mandamiento de Separación de Funcionalidad

> "Separarás la función de la estética, y la lógica de negocio de la presentación"

La separación de responsabilidades es fundamental para mantener un código mantenible y escalable:

1. **Cada hook debe tener una única responsabilidad**
2. **La lógica de negocio debe estar en hooks, no en componentes**
3. **Los componentes deben centrarse en la presentación**
4. **Utiliza adaptadores para convertir entre diferentes sistemas de tipos**

## 🚀 ESTRUCTURA DE ARCHIVOS Y CARPETAS DEL DASHBOARD V2

Esta sección detalla la estructura completa del Dashboard v2 de RokaMenu, diseñada como una guía exhaustiva para entender cada parte del sistema.

### 📁 Estructura Principal

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

### 🔍 Descripción Detallada de Cada Carpeta

#### 📁 `/api`

Contiene todos los endpoints API específicos para el dashboard-v2. Estos endpoints se comunican con el backend y gestionan los datos que se muestran en la interfaz.

```
api/
└── categories/
    └── reorder/
        └── route.ts    # Endpoint para reordenar categorías
```

- **Propósito**: Proporcionar endpoints API específicos para el dashboard-v2
- **Uso**: Comunicación con el backend, gestión CRUD de elementos del menú

#### 📁 `/components`

El corazón de la interfaz de usuario del dashboard. Contiene todos los componentes React organizados en subcarpetas según su funcionalidad.

```
components/
├── actions/          # Componentes para acciones específicas
├── core/             # Componentes principales del dashboard
│   ├── DashboardView.tsx     # Vista principal del dashboard
│   ├── TopNavbar.tsx         # Barra de navegación superior
│   └── DashboardProvider.tsx # Proveedor de contexto para el dashboard
├── domain/           # Componentes específicos del dominio
│   ├── categories/   # Componentes relacionados con categorías
│   │   ├── CategoryList.tsx      # Lista de categorías
│   │   ├── CategoryTable.tsx     # Tabla de categorías
│   │   └── CategorySections.tsx  # Secciones de una categoría
│   ├── sections/     # Componentes relacionados con secciones
│   │   ├── SectionList.tsx       # Lista de secciones
│   │   ├── SectionTable.tsx      # Tabla de secciones
│   │   └── SectionDetail.tsx     # Detalle de una sección
│   └── products/     # Componentes relacionados con productos
│       ├── ProductTable.tsx      # Tabla de productos
│       └── ProductManager.tsx    # Gestor de productos
├── hooks/            # Hooks específicos para componentes
├── layout/           # Componentes de layout
├── modals/           # Diálogos y ventanas modales
│   ├── buttons/      # Botones específicos para modales
│   └── ...
├── sections/         # Componentes de secciones (estructura anterior)
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
    ├── FloatingPhonePreview.tsx  # Vista previa flotante
    ├── Breadcrumbs.tsx       # Navegación de migas de pan
    └── ProductView.tsx       # Vista de productos
```

> **IMPORTANTE**: Todos los componentes de vista DEBEN estar en la carpeta `/components/views/` para mantener la coherencia de la estructura. No debe existir ningún componente de vista en la raíz de `/components/`.

#### 📁 `/features`

Contiene módulos organizados por funcionalidad o característica específica del negocio. Cada carpeta agrupa todo lo relacionado con una entidad específica.

```
features/
├── products/     # Características relacionadas con productos
├── sections/     # Características relacionadas con secciones
└── categories/   # Características relacionadas con categorías
```

- **Propósito**: Organizar el código por funcionalidad o característica del negocio
- **Uso**: Facilitar el mantenimiento y la escalabilidad del código

#### 📁 `/hooks`

Contiene hooks de React personalizados que encapsulan la lógica de negocio reutilizable. Estos hooks proporcionan una capa de abstracción para operaciones comunes.

```
hooks/
├── core/                     # Hooks principales del sistema
│   ├── useDashboardState.ts  # Estado global del dashboard
│   ├── useClient.ts          # Información del cliente
│   └── useDragAndDrop.ts     # Lógica centralizada para drag and drop
├── domain/                   # Hooks específicos del dominio
│   ├── category/             # Hooks relacionados con categorías
│   │   ├── useCategoryManagement.ts  # Gestión de categorías
│   │   └── useCategoryReorder.tsx    # Reordenamiento de categorías
│   ├── section/              # Hooks relacionados con secciones
│   │   └── useSectionManagement.ts   # Gestión de secciones
│   └── product/              # Hooks relacionados con productos
│       └── useProductManagement.ts   # Gestión de productos
└── ui/                       # Hooks relacionados con UI
    ├── useTheme.ts           # Gestión de temas
    ├── useVirtualizedList.ts # Listas virtualizadas
    ├── useViewState.tsx      # Estado de la vista
    ├── useModalState.tsx     # Estado para modales
    └── useExpansionState.tsx # Estado de expansión
```

- **Propósito**: Proporcionar lógica de negocio reutilizable
- **Uso**: Cada hook está especializado en una funcionalidad específica

#### 📁 `/infrastructure`

Contiene código relacionado con servicios externos, configuración de cliente HTTP, y otras herramientas de infraestructura.

```
infrastructure/
└── api/          # Configuración API y clientes HTTP
```

- **Propósito**: Gestionar comunicación con servicios externos
- **Uso**: Configuración de clientes HTTP, autenticación, etc.

#### 📁 `/shared`

Contiene recursos compartidos que pueden ser utilizados en múltiples partes de la aplicación.

```
shared/
├── components/          # Componentes compartidos
│   └── grid/            # Componentes para grids reutilizables
│       └── GridIcon.tsx # Componente centralizado para íconos en grids
├── constants/           # Constantes compartidas
│   └── iconConfig.ts    # Configuración centralizada de íconos
└── hooks/               # Hooks compartidos
    └── useGridIcons.tsx # Hook para gestionar íconos en grids
```

- **Propósito**: Proporcionar recursos reutilizables
- **Uso**: Componentes, utilidades o hooks que se utilizan en múltiples partes
- **Componentes Grid**: Sistema centralizado para manejar grids de categorías, secciones y productos
  - **GridIcon.tsx**: Componente para renderizar íconos con estilo consistente según tipo de grid
  - **iconConfig.ts**: Configuración centralizada de todos los íconos del sistema
  - **useGridIcons.tsx**: Hook para facilitar el uso de íconos en los componentes

#### 📁 `/stores`

Contiene almacenes de estado global utilizando Zustand. Estos stores mantienen el estado que necesita ser accesible desde múltiples componentes.

```
stores/
└── customizationStore.ts    # Store para la personalización
```

- **Propósito**: Gestionar estado global de la aplicación
- **Uso**: Mantener datos que deben ser accesibles desde múltiples componentes

#### 📁 `/styles`

Contiene archivos CSS para estilos globales y específicos del dashboard.

```
styles/
├── dashboard.css      # Estilos específicos del dashboard
├── index.css          # Estilos generales
├── theme.css          # Variables de tema
├── animations.css     # Animaciones
├── typography.css     # Estilos de tipografía
└── grids.css          # Estilos específicos para grids (categorías, secciones, productos)
```

- **Propósito**: Proporcionar estilos globales
- **Uso**: Definir apariencia visual consistente
- **Estructura**:
  - `dashboard.css`: Estilos generales para el dashboard
  - `theme.css`: Variables CSS para personalización de temas
  - `animations.css`: Animaciones CSS para transiciones y efectos
  - `typography.css`: Configuración de fuentes y tipografía
  - `grids.css`: Estilos unificados para los grids de categorías, secciones y productos

#### 📁 `/types`

Centraliza todos los tipos e interfaces TypeScript utilizados en el dashboard.

```
types/
├── domain/           # Tipos específicos del dominio
├── api/              # Tipos relacionados con la API
├── ui/               # Tipos relacionados con la UI
├── index.ts          # Tipos e interfaces principales
├── dashboard.ts      # Tipos específicos del dashboard
└── type-adapters.ts  # Adaptadores entre sistemas de tipos
```

- **Propósito**: Centralizar definiciones de tipos
- **Uso**: Garantizar coherencia de tipos en toda la aplicación

#### 📁 `/utils`

Contiene funciones utilitarias y helpers que pueden ser utilizados en toda la aplicación.

```
utils/
├── performance.ts         # Utilidades para optimizar rendimiento
├── dashboardHelpers.tsx   # Helpers específicos del dashboard
└── imageUtils.ts          # Utilidades para gestión de imágenes
```

- **Propósito**: Proporcionar funciones utilitarias
- **Uso**: Operaciones comunes como formateo de datos, validaciones, etc.

### 🔑 Archivos Principales

#### 📄 `layout.tsx`

- **Propósito**: Define el layout principal del dashboard-v2
- **Uso**: Envuelve todas las páginas y componentes del dashboard

#### 📄 `page.tsx`

- **Propósito**: Página principal del dashboard-v2
- **Uso**: Punto de entrada al dashboard-v2

#### 📄 `AuthDebugLayout.tsx`

- **Propósito**: Layout para depuración de autenticación
- **Uso**: Utilizado durante el desarrollo para verificar el estado de autenticación

### 🧩 Componentes Clave

#### 📦 Modales

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

### 🔄 Flujo de Datos

El flujo de datos en el dashboard-v2 sigue el siguiente patrón:

1. Los **hooks de gestión** (`useCategoryManagement`, `useSectionManagement`, `useProductManagement`) se encargan de las operaciones CRUD para las entidades.
2. El **hook principal** `useDashboardState` coordina todos los hooks de gestión y proporciona un punto único de acceso a las funciones y estados.
3. Los **componentes de vista** utilizan `useDashboardState` para acceder a los datos y funciones necesarias.
4. Los **componentes individuales** (como `SectionListItem` o `ProductList`) reciben datos y callbacks a través de props.
5. Las **acciones del usuario** desencadenan operaciones que actualizan tanto el estado local como el backend a través de llamadas API.

### 🚀 Optimizaciones

El dashboard-v2 implementa varias optimizaciones para mejorar el rendimiento:

1. **Virtualización**: Para listas largas, se utiliza `VirtualizedList` que solo renderiza los elementos visibles.
2. **Carga perezosa**: Los datos se cargan según se necesitan, no todos al inicio.
3. **Memoización**: Se utilizan React.memo, useMemo y useCallback para evitar re-renders innecesarios.
4. **Utilidades de rendimiento**: Funciones como debounce y throttle para optimizar eventos frecuentes.

### 🔒 Seguridad

La seguridad se implementa a través de:

1. **Verificación de roles**: Cada punto de entrada verifica si el usuario tiene los permisos necesarios.
2. **Redirección a /unauthorized**: Si un usuario no tiene permisos, se redirige a esta página.
3. **Validación en cliente y servidor**: Los permisos se verifican en ambos lados.

### 🧠 Modelo de Datos

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

## 📢 RECORDATORIO CRÍTICO

**NUNCA** asumas que conoces la estructura completa. **SIEMPRE** verifica antes de crear. La documentación y exploración son pasos obligatorios que no pueden ser omitidos bajo ninguna circunstancia.

> "Un minuto de verificación ahorra horas de corrección y refactorización"
