# 📋 ESTRUCTURA Y MANDAMIENTOS DEL DASHBOARD V2 (ACTUALIZADO)

> "Conocerás lo que existe antes de crear algo nuevo"
> "No duplicarás lo que ya está creado"
> "Separarás la función de la estética"

## 📢 ACTUALIZACIÓN IMPORTANTE

**La estructura del proyecto ha sido completamente refactorizada siguiendo un diseño orientado a dominio (Domain-Driven Design).** La nueva estructura organiza el código por áreas funcionales en lugar de por tipos de archivos, mejorando significativamente la mantenibilidad y comprensión del código.

**ACTUALIZACIÓN (10/04/2025)**: Se ha completado una limpieza exhaustiva eliminando carpetas que no seguían el patrón DDD (`shared`, `infrastructure`, `features`, `stores`) y moviendo todos los archivos a sus ubicaciones correctas. La estructura ahora sigue estrictamente el diseño orientado a dominios.

**ACTUALIZACIÓN (11/04/2025)**: Se han corregido problemas de importación en los componentes de vistas, componentes core y modales para asegurar que sigan correctamente el patrón DDD. Se corrigieron:

- Importación incorrecta en TopNavbar.tsx (CustomizationModal)
- Importación incorrecta en CategoryTable.tsx (SectionList)
- Importación incorrecta en EditSectionModal.tsx (useSectionManagement)
- Importación incorrecta en EditProductModal.tsx (useProductManagement)
- Corrección de tipos implícitos en CategoryTable.tsx

**Consulta el archivo `app/dashboard-v2/README.md` para obtener la documentación más actualizada sobre la nueva estructura.**

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

### 📌 Mandamiento de Ubicación Correcta

Este mandamiento es crítico para mantener la estructura limpia y evitar confusión:

- ✅ **NUNCA coloques** archivos en la raíz de `components/` o `hooks/`
- ✅ **SIEMPRE coloca** cada archivo en su subdirectorio específico:
  - Hooks principales → `hooks/core/`
  - Hooks de UI → `hooks/ui/`
  - Estados globales → `hooks/ui/state/`
  - Hooks específicos de dominio → `hooks/domain/category/`, `hooks/domain/section/` o `hooks/domain/product/`
  - Componentes principales → `components/core/`
  - Componentes específicos de dominio → `components/domain/categories/`, `components/domain/sections/` o `components/domain/products/`
  - Modales → `components/modals/`
  - Componentes de UI → `components/ui/`
  - Componentes de vistas → `components/views/`
- ✅ **NUNCA crees** carpetas que no sigan el patrón establecido
- ✅ **NUNCA crees** estructuras paralelas como `shared/`, `infrastructure/`, `features/` o `stores/`

La violación de este mandamiento genera:

- Duplicidad de archivos
- Confusión sobre qué versión es la correcta
- Dificultad para encontrar los archivos adecuados
- Mayor complejidad para mantener el código

#### 📋 Procedimiento de Verificación

Antes de crear cualquier elemento nuevo, seguirás este procedimiento:

1. **Consultar documentación**:

   - Revisar el archivo `app/dashboard-v2/README.md` para entender la estructura completa
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

   - Revisar `hooks/domain/`, `hooks/core/` y `hooks/ui/` en busca de hooks que puedan ser reutilizados
   - Entender la separación entre hooks por dominio
   - Verificar si la funcionalidad necesaria ya está implementada en algún hook

5. **Validar nomenclatura y ubicación**:
   - Asegurar que el nombre del nuevo elemento sigue las convenciones establecidas
   - Verificar que la ubicación propuesta es coherente con la estructura
   - Confirmar que respeta la separación de responsabilidades

### 📌 Mandamiento de Separación de Funcionalidad

> "Separarás la función de la estética, y la lógica de negocio de la presentación"

La separación de responsabilidades es fundamental para mantener un código mantenible y escalable:

1. **Cada hook debe tener una única responsabilidad**
2. **La lógica de negocio debe estar en hooks, no en componentes**
3. **Los componentes deben centrarse en la presentación**
4. **Utiliza adaptadores para convertir entre diferentes sistemas de tipos**

## 🚀 ESTRUCTURA DE ARCHIVOS Y CARPETAS DEL DASHBOARD V2 (ACTUALIZADA)

La nueva estructura sigue un diseño orientado a dominio:

```
dashboard-v2/
├── components/             # Componentes de la UI
│   ├── core/               # Componentes principales y organizadores
│   ├── domain/             # Componentes específicos de dominio
│   │   ├── categories/     # Componentes específicos para categorías
│   │   ├── sections/       # Componentes específicos para secciones
│   │   └── products/       # Componentes específicos para productos
│   ├── modals/             # Modales (creación, edición, eliminación)
│   ├── ui/                 # Componentes de UI reutilizables
│   │   ├── Button/         # Componentes de botones
│   │   ├── Form/           # Componentes de formularios
│   │   ├── Modal/          # Componentes base para modales
│   │   ├── Table/          # Componentes de tablas
│   │   └── grid/           # Componentes específicos para grids
│   └── views/              # Vistas principales de la aplicación
├── constants/              # Constantes y configuraciones
├── hooks/                  # Hooks personalizados para la lógica
│   ├── core/               # Hooks principales (fachadas, coordinación)
│   ├── domain/             # Hooks específicos de dominio
│   │   ├── category/       # Hooks para gestión de categorías
│   │   ├── section/        # Hooks para gestión de secciones
│   │   └── product/        # Hooks para gestión de productos
│   └── ui/                 # Hooks relacionados con la UI
│       └── state/          # Estados globales (stores)
├── services/               # Servicios de API y externos
├── styles/                 # Archivos CSS para estilos
│   ├── theme.css           # Variables y temas de color
│   ├── typography.css      # Estilos de tipografía
│   ├── animations.css      # Animaciones y transiciones
│   ├── index.css           # Archivo principal que importa los demás CSS
│   ├── dashboard.css       # Estilos específicos para el dashboard
│   ├── grids.css           # Estilos para tablas y grids
│   └── mobileView.css      # Estilos específicos para vista móvil, documentados con detalle
├── types/                  # Definiciones de tipos
│   ├── domain/             # Tipos específicos de dominio
│   │   ├── category.ts     # Tipos para categorías
│   │   ├── section.ts      # Tipos para secciones
│   │   └── product.ts      # Tipos para productos
│   ├── ui/                 # Tipos para componentes de UI
│   │   ├── common.ts       # Tipos compartidos de UI
│   │   └── modals.ts       # Tipos para modales
│   ├── type-adapters.ts    # Adaptadores para conversión de tipos
│   └── index.ts            # Exportaciones centralizadas
└── utils/                  # Utilidades y helpers
```

### 🔍 Elementos Clave de la Nueva Estructura

#### 📁 Organización por Dominios

Cada dominio de negocio (categorías, secciones, productos) tiene su propia carpeta dedicada para componentes, hooks y tipos.

#### 📁 Separación de Lógica y Presentación

- **hooks/domain/**: Contiene toda la lógica de negocio específica por dominio
- **hooks/core/**: Contiene hooks integradores como useDashboardState que actúa como fachada
- **hooks/ui/**: Contiene hooks específicos para la interfaz de usuario
- **hooks/ui/state/**: Contiene estados globales de la aplicación

#### 📁 Componentes UI Documentados en Detalle (ACTUALIZADO)

> **ACTUALIZACIÓN (12/04/2025):** Se han implementado comentarios detallados y documentación exhaustiva en los componentes UI fundamentales.

Los siguientes componentes cuentan ahora con documentación completa para facilitar su comprensión y uso:

1. **MobileMenu.tsx**: Menú lateral optimizado para dispositivos móviles con:

   - Soporte para gestos táctiles (deslizar para cerrar)
   - Animaciones fluidas y efectos de transición
   - Configuración flexible de posición y contenido
   - Ejemplos de uso y explicación detallada de cada prop

2. **Button.tsx**: Sistema de botones versátil que incluye:

   - Múltiples variantes visuales (primary, secondary, outline, ghost, danger)
   - Diferentes tamaños predefinidos (xs, sm, md, lg)
   - Estados de carga con indicadores visuales
   - Soporte para iconos en ambos lados

3. **Loader.tsx**: Componente de indicador de carga con:

   - Spinner SVG animado para indicar procesos en curso
   - Cuatro tamaños configurables para diferentes contextos
   - Personalización de colores mediante clases de Tailwind
   - Opción para mostrar mensajes informativos

4. **GridIcon.tsx**: Sistema centralizado de iconos para tablas y grids que:

   - Mantiene consistencia visual en toda la aplicación
   - Aplica colores específicos según el tipo de entidad
   - Facilita cambios globales mediante configuración central
   - Proporciona soporte para accesibilidad

5. **DragIndicator.tsx**: Indicador visual para operaciones de arrastre que:
   - Muestra feedback durante acciones de arrastrar y soltar
   - Detecta automáticamente el inicio y fin del arrastre
   - Se oculta automáticamente después de un tiempo
   - Mejora la experiencia de usuario en dispositivos móviles

Cada componente incluye:

- Cabecera JSDoc con descripción general, versión y autor
- Tipos e interfaces claramente documentados
- Ejemplos de uso en diferentes escenarios
- Comentarios en línea explicando la función de cada parte del código

#### 📁 Sistema de Estilos Organizado (ACTUALIZADO)

> **ACTUALIZACIÓN (23/04/2025):** Se ha implementado un sistema mejorado de estilos para la vista móvil con documentación detallada.

El proyecto utiliza un sistema de estilos CSS organizado en archivos específicos:

- **styles/theme.css**: Define variables CSS y esquemas de colores
- **styles/typography.css**: Establece estilos de texto y fuentes
- **styles/animations.css**: Contiene animaciones y transiciones
- **styles/index.css**: Archivo central que importa todos los demás CSS
- **styles/dashboard.css**: Estilos específicos para el dashboard
- **styles/grids.css**: Estilos para tablas y visualización de datos
- **styles/mobileView.css**: Estilos específicos para móviles con comentarios detallados

El nuevo archivo **mobileView.css** implementa un sistema completo de transformación de tablas a tarjetas para dispositivos móviles, con las siguientes características:

1. **Documentación exhaustiva**: Cada regla CSS incluye comentarios detallados explicando su propósito
2. **Organización por secciones**: El código está estructurado en bloques lógicos por funcionalidad
3. **Implementación de grid layout**: Utiliza CSS Grid para reorganizar el contenido en móviles
4. **Alta especificidad de selectores**: Garantiza que los estilos se apliquen correctamente
5. **Optimizaciones táctiles**: Mejora la interacción en dispositivos táctiles

#### 📁 Sistema de Tipos por Dominio

Cada dominio tiene sus propios tipos definidos en carpetas específicas:

- **types/domain/category.ts**: Tipos específicos para categorías
- **types/domain/section.ts**: Tipos específicos para secciones
- **types/domain/product.ts**: Tipos específicos para productos

#### 📁 Sistema de Adaptadores de Tipos (ACTUALIZADO)

> **ACTUALIZACIÓN (2024-06-20):** Se ha mejorado el sistema de adaptadores de tipos para garantizar una conversión segura entre diferentes sistemas de tipos.

El proyecto utiliza dos sistemas principales de tipos:

- Tipos definidos en **app/types/menu.ts** (usados por la API y componentes antiguos)
- Tipos definidos en **app/dashboard-v2/types/domain/** (específicos para la nueva arquitectura)

Para facilitar la interoperabilidad entre estos sistemas, el archivo **types/type-adapters.ts** proporciona:

1. **Funciones de conversión bidireccional**:

   - `adaptCategory`, `adaptSection`, `adaptProduct`: Convierten de DashboardX a Menu
   - `fromMenuCategory`, `fromMenuSection`, `fromMenuProduct`: Convierten de Menu a Dashboard

2. **Manejo seguro de valores null/undefined**:

   - Las funciones adaptadoras ahora manejan explícitamente valores null/undefined
   - Se realizan conversiones seguras para propiedades como `image`

3. **Conversión de tipos de datos**:

   - Conversión automática entre tipos numéricos y string para propiedades como `price`
   - Manejo adecuado de campos opcionales

4. **Adaptadores para colecciones**:
   - Funciones para adaptar arrays completos y mapas de objetos

### 🧩 Patrón Facade

El hook principal `useDashboardState` actúa como una fachada, integrando los hooks de dominio específicos y proporcionando una interfaz unificada para los componentes.

### 🔄 Flujo de Datos

El flujo de datos en el dashboard-v2 sigue el siguiente patrón:

1. Los **hooks de gestión** (`useCategoryManagement`, `useSectionManagement`, `useProductManagement`) se encargan de las operaciones CRUD para las entidades.
2. El **hook principal** `useDashboardState` coordina todos los hooks de gestión y proporciona un punto único de acceso a las funciones y estados.
3. Los **componentes de vista** utilizan `useDashboardState` para acceder a los datos y funciones necesarias.
4. Los **componentes individuales** reciben datos y callbacks a través de props.
5. Las **acciones del usuario** desencadenan operaciones que actualizan tanto el estado local como el backend a través de llamadas API.

### 🧩 Sistema de Componentes Grid

Para los componentes de grid (tablas de categorías, secciones, productos) se ha implementado un sistema especializado:

- **GridIcon**: Componente centralizado para gestionar todos los íconos del sistema
- **useGridIcons**: Hook para acceder y gestionar los íconos de manera programática
- **Identidad Visual por Tipo**:
  - Categorías: Esquema de color indigo
  - Secciones: Esquema de color teal
  - Productos: Esquema de color yellow

Para cambiar un ícono en toda la aplicación, simplemente se modifica en el archivo `constants/iconConfig.ts`.

## 📢 RECORDATORIO CRÍTICO

**NUNCA** asumas que conoces la estructura completa. **SIEMPRE** verifica antes de crear. La documentación y exploración son pasos obligatorios que no pueden ser omitidos bajo ninguna circunstancia.

**IMPORTANTE (10/04/2025)**: Se han eliminado todas las carpetas que no seguían el patrón DDD (`shared`, `infrastructure`, `features`, `stores`) y se han movido todos los archivos a sus ubicaciones correctas. La estructura ahora sigue estrictamente el diseño orientado a dominios.

> "Un minuto de verificación ahorra horas de corrección y refactorización"

## 📘 GUÍA PARA DUMMIES: PROPÓSITO DE CADA ARCHIVO

Esta sección explica en lenguaje sencillo qué hace cada archivo del proyecto. Úsala como referencia rápida para entender el propósito de cada componente sin necesidad de revisar el código.

### 🗂️ ARCHIVOS PRINCIPALES

- **page.tsx**: La página principal del dashboard. Es el punto de entrada que muestra todo el panel de administración.
- **layout.tsx**: Define la estructura general de la página, incluyendo elementos comunes como la navegación principal.
- **globals.css**: Estilos globales que se aplican a toda la aplicación del dashboard.
- **AuthDebugLayout.tsx**: Componente de depuración para verificar el estado de autenticación durante el desarrollo.

### 📁 COMPONENTES CORE

- **DashboardView.tsx**: El controlador central que orquesta todo el dashboard. Gestiona la navegación entre vistas, estados de selección y coordina todas las operaciones.
- **TopNavbar.tsx**: Barra de navegación superior que muestra el logo, nombre del cliente y controles principales.
- **Sidebar.tsx**: Menú lateral con opciones de navegación y herramientas.
- **Dashboard.tsx**: Contenedor principal que integra todas las partes del dashboard.

### 📁 COMPONENTES VISTAS

- **CategoryView.tsx**: Vista principal para mostrar y gestionar categorías de menú.
- **SectionView.tsx**: Vista para mostrar y gestionar secciones dentro de una categoría.
- **ProductView.tsx**: Vista para mostrar y gestionar productos dentro de una sección.
- **Breadcrumbs.tsx**: Muestra la ruta de navegación actual (Inicio > Categoría > Sección).
- **MobilePreview.tsx**: Muestra una vista previa de cómo se verá el menú en dispositivos móviles.
- **FloatingPhonePreview.tsx**: Vista previa flotante del menú en formato móvil que sigue al usuario mientras navega.

### 📁 COMPONENTES DE DOMINIO: CATEGORÍAS

- **CategoryList.tsx**: Lista todas las categorías del menú en formato de tabla.
- **CategoryListItem.tsx**: Representa una fila individual en la tabla de categorías.
- **CategoryTable.tsx**: Tabla completa de categorías con soporte para arrastrar y soltar.
- **CategoryActions.tsx**: Botones y controles para acciones sobre categorías (editar, eliminar, añadir).

### 📁 COMPONENTES DE DOMINIO: SECCIONES

- **SectionList.tsx**: Lista todas las secciones de una categoría en formato de tabla.
- **SectionListItem.tsx**: Representa una fila individual en la tabla de secciones.
- **SectionTable.tsx**: Tabla completa de secciones con soporte para arrastrar y soltar.
- **SectionActions.tsx**: Botones y controles para acciones sobre secciones (editar, eliminar, añadir).

### 📁 COMPONENTES DE DOMINIO: PRODUCTOS

- **ProductList.tsx**: Lista todos los productos de una sección en formato de tabla.
- **ProductListItem.tsx**: Representa una fila individual en la tabla de productos.
- **ProductTable.tsx**: Tabla completa de productos con soporte para arrastrar y soltar.
- **ProductActions.tsx**: Botones y controles para acciones sobre productos (editar, eliminar, añadir).
- **ProductGrid.tsx**: Muestra productos en formato de cuadrícula con imágenes.

### 📁 COMPONENTES UI

- **Button/Button.tsx**: Botón altamente personalizable con múltiples variantes (primario, secundario, outline, ghost, danger), tamaños (xs, sm, md, lg), soporte para estados de carga e iconos a ambos lados. Incluye sistema completo de estilos condicionales.

- **Form/Input.tsx**: Campo de entrada de texto personalizado con validación, estados de error y éxito, y soporte para iconos.

- **Form/TextArea.tsx**: Campo de texto multilínea personalizado con autoajuste de altura, contador de caracteres y validación.

- **Form/Select.tsx**: Selector desplegable personalizado con opciones de búsqueda, agrupación y selección múltiple.

- **Form/FileUpload.tsx**: Componente para subir archivos e imágenes con previsualización, validación de tipos y tamaños, y barra de progreso.

- **Modal/Modal.tsx**: Base para todos los diálogos modales de la aplicación con transiciones suaves, bloqueo de scroll de fondo y cierre con tecla Escape.

- **Modal/ModalHeader.tsx**: Encabezado estándar para modales con título, subtítulo opcional y botón de cierre.

- **Modal/ModalFooter.tsx**: Pie estándar para modales con botones de acción alineados correctamente según estándares UX.

- **Table/Table.tsx**: Componente base para todas las tablas del sistema con soporte para ordenación, paginación y selección de filas.

- **Loader.tsx**: Indicador de carga para operaciones asíncronas con múltiples tamaños configurables (xs, sm, md, lg), personalización de colores mediante clases de Tailwind y opción para mostrar mensajes. Utiliza un spinner SVG animado con círculo parcial.

- **Badge.tsx**: Etiqueta pequeña para mostrar estados (activo, inactivo, pendiente, etc.) con variantes de color según el contexto.

- **Icon.tsx**: Wrapper unificado para íconos del sistema que garantiza consistencia en tamaños y estilos.

- **grid/GridIcon.tsx**: Sistema centralizado de íconos para tablas y grids que aplica colores específicos por tipo de entidad (categoría: indigo, sección: teal, producto: amber). Facilita cambios globales de iconos mediante la configuración en `iconConfig.ts` y mantiene una identidad visual coherente.

- **DragIndicator.tsx**: Indicador visual que aparece durante operaciones de arrastrar y soltar para mejorar el feedback en dispositivos móviles. Detecta automáticamente el inicio/fin del arrastre observando cambios en las clases del body y se oculta tras 3 segundos por seguridad.

- **MobileMenu.tsx**: Menú lateral deslizable optimizado para dispositivos móviles con soporte para gestos táctiles (deslizar para cerrar), animaciones fluidas y estructura modular. Implementa cabecera con logo, lista de opciones con indicadores visuales de elemento activo y pie personalizable. Puede posicionarse a izquierda o derecha de la pantalla.

### 📁 COMPONENTES MODALES

- **NewCategoryModal.tsx**: Modal para crear una nueva categoría.
- **EditCategoryModal.tsx**: Modal para editar una categoría existente.
- **DeleteCategoryModal.tsx**: Modal de confirmación para eliminar una categoría.
- **NewSectionModal.tsx**: Modal para crear una nueva sección.
- **EditSectionModal.tsx**: Modal para editar una sección existente.
- **DeleteSectionModal.tsx**: Modal de confirmación para eliminar una sección.
- **NewProductModal.tsx**: Modal para crear un nuevo producto.
- **EditProductModal.tsx**: Modal para editar un producto existente.
- **DeleteProductModal.tsx**: Modal de confirmación para eliminar un producto.
- **CustomizationModal.tsx**: Modal para personalizar la apariencia del menú.

### 📁 HOOKS CORE

- **useDashboardState.tsx**: Hook principal que actúa como fachada para todos los hooks de dominio. Centraliza el estado y las operaciones.
- **useInitialData.tsx**: Gestiona la carga inicial de datos al abrir el dashboard.
- **useNavigation.tsx**: Controla la navegación entre diferentes vistas del dashboard.
- **useAuthentication.tsx**: Gestiona el estado de autenticación del usuario.

### 📁 HOOKS DE DOMINIO: CATEGORÍA

- **useCategoryManagement.ts**: Gestiona todas las operaciones CRUD para categorías (crear, leer, actualizar, eliminar).
- **useCategoryVisibility.ts**: Controla la visibilidad de las categorías en el menú.
- **useCategoryReordering.ts**: Maneja la reordenación de categorías mediante arrastrar y soltar.

### 📁 HOOKS DE DOMINIO: SECCIÓN

- **useSectionManagement.ts**: Gestiona todas las operaciones CRUD para secciones (crear, leer, actualizar, eliminar).
- **useSectionVisibility.ts**: Controla la visibilidad de las secciones en el menú.
- **useSectionReordering.ts**: Maneja la reordenación de secciones mediante arrastrar y soltar.

### 📁 HOOKS DE DOMINIO: PRODUCTO

- **useProductManagement.ts**: Gestiona todas las operaciones CRUD para productos (crear, leer, actualizar, eliminar).
- **useProductVisibility.ts**: Controla la visibilidad de los productos en el menú.
- **useProductReordering.ts**: Maneja la reordenación de productos mediante arrastrar y soltar.
- **useProductImage.ts**: Gestiona la carga y visualización de imágenes de productos.

### 📁 HOOKS UI

- **useGridIcons.ts**: Proporciona acceso centralizado a los íconos utilizados en tablas y grids.
- **useModal.ts**: Controla el estado y comportamiento de los modales.
- **useToast.ts**: Gestiona las notificaciones y mensajes emergentes.
- **useDragAndDrop.ts**: Hook centralizado para todas las operaciones de arrastrar y soltar.
- **state/useUIState.ts**: Almacena y gestiona el estado global de la interfaz de usuario.

### 📁 TIPOS

- **type-adapters.ts**: Funciones para convertir entre diferentes sistemas de tipos (API, UI, dominio).
- **common.ts**: Tipos comunes utilizados en toda la aplicación.
- **dashboard.ts**: Tipos específicos para el dashboard.
- **menu.ts**: Definiciones de tipos para el menú (categorías, secciones, productos).
- **domain/category.ts**: Tipos específicos para el dominio de categorías.
- **domain/section.ts**: Tipos específicos para el dominio de secciones.
- **domain/product.ts**: Tipos específicos para el dominio de productos.
- **ui/modals.ts**: Tipos para los componentes de modales.

### 📁 UTILIDADES

- **imageUtils.ts**: Funciones para manipular y optimizar imágenes.
- **formatUtils.ts**: Funciones para formatear datos (fechas, precios, etc.).
- **validationUtils.ts**: Funciones para validar datos de formularios.
- **apiUtils.ts**: Utilidades para comunicación con la API.
- **dragUtils.ts**: Funciones auxiliares para las operaciones de arrastrar y soltar.

### 📁 SERVICIOS

- **dashboardService.ts**: Servicio principal para operaciones de dashboard.
- **categoryService.ts**: Servicio para operaciones específicas de categorías.
- **sectionService.ts**: Servicio para operaciones específicas de secciones.
- **productService.ts**: Servicio para operaciones específicas de productos.
- **imageService.ts**: Servicio para gestión de imágenes y uploads.
- **authService.ts**: Servicio para autenticación y autorización.

### 📁 CONSTANTES

- **iconConfig.ts**: Configuración centralizada de íconos para toda la aplicación.
- **routes.ts**: Definición de rutas y URLs de la aplicación.
- **apiEndpoints.ts**: Lista de endpoints de la API.
- **colors.ts**: Paleta de colores y esquemas visuales.
- **settings.ts**: Configuraciones generales de la aplicación.

Recuerda, antes de crear cualquier archivo nuevo, revisa esta guía para ver si ya existe algo similar que puedas utilizar o extender. Seguir esta regla te ahorrará mucho tiempo y evitará la duplicación de código.
