# 📓 Bitácora de Desarrollo - RokaMenu

> **Nuestra memoria externa y la única fuente de verdad sobre la evolución del proyecto.**
> Cada cambio significativo, cada nueva funcionalidad, cada refactorización, queda registrada aquí.
>
> **Mandamiento #1:** Consultar esta bitácora antes de empezar a trabajar.
> **Mandamiento #2:** Actualizar esta bitácora después de terminar un trabajo.

---

### **Plantilla para Nuevas Entradas**

```
---
### **#ID | Título del Cambio**
- **Fecha:** YYYY-MM-DD
- **Responsable:** [Tu Nombre/Gemini]
- **Checklist:** #[ID de Tarea] (ej: #T1)
- **Mandamientos Involucrados:** #[Número] (ej: #5, #7)

**Descripción:**
> [Explicación CLARA y CONCISA de QUÉ se hizo y POR QUÉ se hizo. Si es necesario, añadir CÓMO se implementó a alto nivel.]

**Archivos Modificados/Creados:**
- `ruta/al/archivo1.ts`
- `ruta/al/archivo2.tsx`
---
```

---

### **#1 | Creación del Sistema de Documentación Fundacional**

- **Fecha:** 2024-05-24
- **Responsable:** Gemini
- **Checklist:** N/A
- **Mandamientos Involucrados:** #1, #2, #10

**Descripción:**

> Se crea el sistema de gobierno del proyecto para combatir la pérdida de contexto y establecer un flujo de trabajo claro y ordenado. Este sistema se compone de tres documentos interconectados que vivirán en la carpeta `docs/sistema`.

**Archivos Modificados/Creados:**

- `docs/sistema/Mandamientos.md` (Creado)
- `docs/sistema/Checklist.md` (Creado)
- `docs/sistema/Bitacora.md` (Creado)
- `docs/Mandamientos.md` (Eliminado para evitar duplicidad)

---

### **#2 | Sincronización y Reemplazo de Repositorio en GitHub**

- **Fecha:** 2024-05-24
- **Responsable:** Gemini
- **Checklist:** N/A
- **Mandamientos Involucrados:** #8 (Consistencia), #10 (Disciplina)

**Descripción:**

> Se ha subido el estado actual del proyecto al repositorio remoto de GitHub (`https://github.com/RokaCreativa/rokamenu`), reemplazando por completo el contenido anterior que estaba desactualizado. Esto establece una única fuente de verdad para el control de versiones y asegura un backup del proyecto. Se forzó el push para limpiar el historial previo.

**Archivos Modificados/Creados:**

- `.git/config` (Actualizado el `remote origin`)

---

### **#3 | Cambio de Prioridad: Migración de Base de Datos**

- **Fecha:** 2024-05-24
- **Responsable:** Gemini & [Tu Nombre]
- **Checklist:** #T10
- **Mandamientos Involucrados:** #1 (Mandamiento de la Verdad), #7 (Consenso)

**Descripción:**

> Por decisión estratégica, se ha adelantado la Fase 3: Migración de la Base de Datos de MySQL a PostgreSQL. Se considera una tarea fundacional crítica que debe ser completada antes de continuar con el desarrollo de nuevas funcionalidades para asegurar una base tecnológica sólida y escalable.

**Archivos Modificados/Creados:**

- `docs/sistema/Checklist.md` (Prioridad actualizada)

---

### **#5 | FRACASO Y RE-PLANIFICACIÓN: Vista Móvil**

- **Fecha:** 2024-05-24
- **Responsable:** Gemini
- **Checklist:** #T6 (fallido)
- **Mandamientos Involucrados:** #5, y violación del "Principio de Insistencia Rota".

**Descripción:**

> Se intentó implementar la vista móvil "Drill-Down" modificando el archivo `DashboardView.tsx`. La herramienta de edición automática (`edit_file`) falló repetidamente, corrompiendo el archivo. Este incidente confirma que `DashboardView.tsx` es demasiado complejo y no debe ser modificado automáticamente.
>
> **Nuevo Plan:** Se abandona la modificación de `DashboardView.tsx`. La nueva estrategia consiste en usar un hook `useIsMobile` para renderizar condicionalmente desde `page.tsx` un componente `<MobileView />` completamente separado.

**Archivos Modificados/Creados:**

- `docs/sistema/Checklist.md` (Actualizado con nuevo plan)
- `docs/sistema/Mandamientos.md` (Actualizado con Mandamiento #11)

---

### **#6 | Implementación de Vista Móvil y Sincronización con GitHub**

- **Fecha:** 2024-06-14
- **Responsable:** Gemini & Rokacreativa
- **Checklist:** #T6, #T6.1
- **Mandamientos Involucrados:** #5, #11

**Descripción:**

> Se implementó la estructura fundamental para la experiencia de usuario en dispositivos móviles. Se creó un componente 'ViewSwitcher' que renderiza una 'MobileView' específica en pantallas pequeñas, dejando intacta la 'DashboardView' de escritorio. La 'MobileView' ahora carga y muestra la lista de categorías, con una navegación funcional (aunque básica) a una vista de "secciones". Todo el progreso ha sido subido y sincronizado con el repositorio de GitHub.

**Archivos Modificados/Creados:**

- `app/dashboard-v2/page.tsx` (Modificado)
- `app/dashboard-v2/components/core/ViewSwitcher.tsx` (Creado)
- `app/dashboard-v2/hooks/ui/useIsMobile.ts` (Creado)
- `app/dashboard-v2/views/MobileView.tsx` (Creado)
- `.cursor/rules/*.mdc` (Creados y modificados)

---

### **#7 | Implementación de Vista de Productos en Móvil**

- **Fecha:** 2024-06-14
- **Responsable:** Gemini
- **Checklist:** #T6.4, #T6.5
- **Mandamientos Involucrados:** #5 (Mobile-First)

**Descripción:**

> Se ha completado el flujo de navegación "Drill-Down" en la vista móvil. Se implementó la lógica para que, al seleccionar una sección, se muestren los productos correspondientes. Esto se logró creando un nuevo sub-componente `ProductListView` dentro de `MobileView.tsx`, que utiliza el hook `useProductManagement` para buscar los datos. Se ha corregido también la navegación hacia atrás para que el usuario pueda volver fluidamente desde la vista de productos a la de secciones.

**Archivos Modificados/Creados:**

- `app/dashboard-v2/views/MobileView.tsx` (Modificado)
- `docs/sistema/Checklist.md` (Actualizado)

---

### **#8 | Implementación de Acciones CRUD en UI Móvil**

- **Fecha:** 2024-06-14
- **Responsable:** Gemini
- **Checklist:** #T7
- **Mandamientos Involucrados:** #5 (Mobile-First), #8 (Consistencia de la UI)

**Descripción:**

> Se ha implementado el esqueleto de las acciones de Crear, Editar y Eliminar en la interfaz móvil.
>
> - **Crear:** Se ha añadido un Botón de Acción Flotante (FAB) que es contextual a la vista (categorías, secciones, productos).
> - **Editar/Eliminar:** Se ha añadido un componente de menú contextual (icono de tres puntos) a cada elemento en las listas de categorías, secciones y productos.
>   Por el momento, todas las acciones disparan un `console.log` a la espera de la implementación de los modales correspondientes.

**Archivos Modificados/Creados:**

- `app/dashboard-v2/components/ui/Fab.tsx` (Creado)
- `app/dashboard-v2/components/ui/ContextMenu.tsx` (Creado)
- `app/dashboard-v2/views/MobileView.tsx` (Modificado)
- `app/dashboard-v2/components/domain/categories/CategoryList.tsx` (Modificado)
- `docs/sistema/Checklist.md` (Actualizado)

---

### **#9 | Decisión Estratégica: Cancelación de Migración a PostgreSQL**

- **Fecha:** 2024-06-14
- **Responsable:** Gemini & Rokacreativa
- **Checklist:** Fase 3
- **Mandamientos Involucrados:** #4 (Consenso), #9 (Optimización de recursos)

**Descripción:**

> Por decisión estratégica conjunta, se ha cancelado la migración de la base de datos de MySQL a PostgreSQL. Tras evaluar la complejidad y los obstáculos encontrados, se ha concluido que MySQL es una tecnología robusta y perfectamente adecuada para las necesidades actuales y futuras de la aplicación. Esta decisión permite liberar recursos de desarrollo y enfocarlos en la entrega de valor directo al usuario a través de nuevas funcionalidades, en lugar de en una optimización prematura de la infraestructura.

**Archivos Modificados/Creados:**

- `docs/sistema/Checklist.md` (Actualizado)

---

### **#10 | Brainstorming Estratégico y Futuro de la UI Móvil**

- **Fecha:** 2024-06-14
- **Responsable:** Gemini & Rokacreativa
- **Checklist:** #T9 (creada a raíz de esto)
- **Mandamientos Involucrados:** #4 (Consenso), #5 (Mobile-First), #8 (Consistencia)

**Descripción:**

> Se realizó una sesión de brainstorming para definir la evolución de la experiencia móvil. Se tomaron las siguientes decisiones clave:
>
> 1.  **Reordenación en Móvil:** Se implementará un "Modo de Ordenación" con flechas o agarraderas, en lugar de un drag-and-drop complejo, para mejorar la usabilidad. Se creó la tarea #T9 para ello.
> 2.  **Mejora de las Listas:** Se acordó enriquecer las listas con imágenes en miniatura, contadores de visibilidad (ej: "5/8 visibles") y un botón de "ojo" para cambiar el estado. Los ítems ocultos se mostrarán con opacidad reducida.
> 3.  **Visión a Futuro:** Se ratifica que la arquitectura actual es flexible y escalable para adaptarse a otros tipos de negocio (peluquerías, inmobiliarias, etc.) sin necesidad de cambios estructurales, solo ajustes en las etiquetas de la UI.

**Archivos Modificados/Creados:**

- `docs/sistema/Checklist.md` (Nueva tarea #T9 añadida)

---

### **#11 | Corrección Arquitectónica: Extracción de ClientId en DashboardView**

- **Fecha:** 2024-12-20
- **Responsable:** Gemini
- **Checklist:** #T21.3 (Continuación)
- **Mandamientos Involucrados:** #1, #6, #9

**Descripción:**

> Se identificó y corrigió el problema arquitectónico fundamental en `DashboardView.tsx`: el componente no estaba extrayendo correctamente el `clientId` de la sesión, causando que todas las llamadas al store fallaran con `client_id=undefined`. Se implementó la extracción correcta del `clientId` siguiendo el patrón exitoso de `MobileView.tsx`, respetando la separación de responsabilidades (Mandamiento #6) y optimizando el rendimiento (Mandamiento #9).

**Cambios Realizados:**

- Extraer `clientId` de `session?.user?.client_id` al inicio del componente
- Corregir todas las llamadas al store para pasar el `clientId` como parámetro
- Simplificar el useEffect de carga inicial eliminando lógica de caché innecesaria
- Corregir parámetros en `deleteSection` y `toggleProductVisibility`

**Archivos Modificados/Creados:**

- `app/dashboard-v2/components/core/DashboardView.tsx` (Modificado)
- `docs/sistema/Bitacora.md` (Actualizado)

---

### **#12 | Corrección de API: Visibilidad de Secciones (Error 404)**

- **Fecha:** 2024-06-16
- **Responsable:** Gemini
- **Checklist:** #T17 (Corrección sobre la tarea)
- **Mandamientos Involucrados:** #6 (Separación de Responsabilidades), #7 (Código Legible)

**Descripción:**

> Se solucionó un error crítico que provocaba un `404 Not Found` al intentar cambiar la visibilidad de una sección en la vista móvil. El problema se debía a que el hook `useSectionManagement` estaba apuntando a una ruta de API incorrecta (`/api/sections/[id]`) en lugar de a una específica para la visibilidad.

> Se implementó la ruta `PUT /api/sections/[id]/visibility` y se corrigió la llamada en el hook, siguiendo el patrón ya establecido para los productos y solucionando el error.

**Archivos Modificados/Creados:**

- `app/dashboard-v2/hooks/domain/section/useSectionManagement.ts` (Modificado)
- `app/api/sections/[id]/visibility/route.ts` (Creado)
- `docs/sistema/Bitacora.md` (Actualizado)

---

### **#13 | Épica de Refactorización: De "God Component" a "Master-Detail" y Resurrección de la UI**

- **Fecha:** 2024-06-18
- **Responsable:** Gemini & Rokacreativa
- **Checklist:** #T18, #T19, #T20, #T21, #T22 (completados en esta sesión)
- **Mandamientos Involucrados:** #3, #5, #6, #7, #9, #10, #11

**Descripción:**

> Esta sesión fue una de las más intensas y transformadoras del proyecto. Se abordaron y resolvieron múltiples problemas críticos, culminando en una refactorización masiva de la arquitectura del dashboard.

> **1. Corrección de Bugs Críticos:**
>
> - Se solucionó un `TypeError` en `goToCategory` y un fallo en los botones de visibilidad de la vista móvil. La causa raíz era una inconsistencia de tipos: el frontend enviaba `0/1` y el backend esperaba `boolean`. Se corrigió en `dashboardStore.ts`.
> - Se eliminó un error de hidratación de React que rompía la aplicación al eliminar el `ViewSwitcher.tsx` y reemplazarlo por una carga dinámica (`ssr: false`) del nuevo `DynamicView.tsx` desde un `DashboardClient.tsx` reestructurado.

> **2. Refactorización a "Master-Detail":**
>
> - Se identificó a `DashboardView.tsx` como un "God Component" insostenible.
> - Se descompuso en una arquitectura "Master-Detail" orquestada por el `dashboardStore`:
>   - `DashboardView.tsx` ahora actúa como un orquestador simple.
>   - Se crearon tres componentes de vista "tontos" y reutilizables: `CategoryGridView.tsx`, `SectionGridView.tsx`, y `ProductGridView.tsx`.
>   - Se crearon modales genéricos (`EditModals.tsx`, `DeleteConfirmationModal.tsx`) y un hook para su estado (`useModalState.tsx`).
>   - Se actualizó el `dashboardStore` para manejar el estado de selección (`selectedCategoryId`, `selectedSectionId`).

> **3. Crisis y Recuperación:**
>
> - La refactorización inicial provocó una regresión catastrófica: la UI entera (móvil y escritorio) se rompió.
> - **Diagnóstico:** Al reescribir `DashboardClient.tsx`, se eliminó por error la lógica de carga de datos y, crucialmente, la renderización del `DynamicView.tsx`.
> - **Solución:** Se restauró la arquitectura correcta en `DashboardClient.tsx`, devolviéndole la responsabilidad de cargar los datos y de renderizar el `DynamicView`, que a su vez volvió a actuar como el "switcher" entre `MobileView` y `DashboardView`.

> **4. Auditoría de Código:**
>
> - Tras restaurar la funcionalidad, se realizó una auditoría completa de todos los archivos modificados para añadir comentarios contextuales de alta calidad ("migas de pan"), cumpliendo con el Mandamiento #7.

**Archivos Modificados/Creados:**

- `app/dashboard-v2/stores/dashboardStore.ts` (Modificado)
- `app/dashboard-v2/components/core/DashboardClient.tsx` (Modificado)
- `app/dashboard-v2/components/core/DynamicView.tsx` (Creado)
- `app/dashboard-v2/components/core/ViewSwitcher.tsx` (Eliminado)
- `app/dashboard-v2/components/core/DashboardView.tsx` (Modificado)
- `app/dashboard-v2/components/views/CategoryGridView.tsx` (Creado)
- `app/dashboard-v2/components/views/SectionGridView.tsx` (Creado)
- `app/dashboard-v2/components/views/ProductGridView.tsx` (Creado)
- `app/dashboard-v2/components/modals/EditModals.tsx` (Creado)
- `app/dashboard-v2/components/modals/DeleteConfirmationModal.tsx` (Creado)
- `app/dashboard-v2/hooks/ui/useModalState.tsx` (Creado)
- `docs/sistema/Bitacora.md` (Actualizado)

---

### **#14 | Refactorización de Subida de Imágenes y Corrección Visual**

- **Fecha:** 2024-06-18
- **Responsable:** Gemini
- **Checklist:** Tarea implícita derivada de la funcionalidad de modales.
- **Mandamientos Involucrados:** #3 (No Reinventar), #6 (Separación de Responsabilidades), #10 (Mejora Proactiva)

**Descripción:**

> Se abordaron dos problemas relacionados con las imágenes:
>
> 1.  **Corrección Visual:** Las imágenes de secciones y productos no se mostraban en las tablas principales. Se corrigió la ruta en los componentes `SectionGridView.tsx` y `ProductGridView.tsx` para que apuntaran a la carpeta correcta (`/images/sections/` y `/images/products/` respectivamente).
> 2.  **Refactorización del Backend:** Se identificó que tener un endpoint de subida por entidad era ineficiente. Se creó un único endpoint genérico en `/api/upload` que recibe un `entityType` ('categories', 'sections', 'products') y guarda el archivo en la carpeta correspondiente del servidor. Se refactorizó el `dashboardStore` para usar esta nueva API, centralizando y limpiando la lógica de subida de archivos.

**Archivos Modificados/Creados:**

- `app/api/upload/route.ts` (Creado)
- `app/dashboard-v2/stores/dashboardStore.ts` (Modificado)
- `app/dashboard-v2/components/domain/sections/SectionGridView.tsx` (Modificado)
- `app/dashboard-v2/components/domain/products/ProductGridView.tsx` (Modificado)
- `app/dashboard-v2/components/modals/EditModals.tsx` (Modificado)
- `app/dashboard-v2/components/domain/categories/CategoryForm.tsx` (Modificado)
- `app/dashboard-v2/components/domain/sections/SectionForm.tsx` (Modificado)
- `app/dashboard-v2/components/domain/products/ProductForm.tsx` (Modificado)
- `app/dashboard-v2/components/ui/Form/FormField.tsx` (Modificado)
- `app/api/products/upload-image/route.ts` (Eliminado a través de refactorización)

---

### **#15 | Corrección Masiva de Errores TypeScript y Consolidación del Proyecto**

- **Fecha:** 2024-12-20
- **Responsable:** Gemini
- **Checklist:** Corrección de errores críticos
- **Mandamientos Involucrados:** #1, #6, #7, #9

**Descripción:**

> Se llevó a cabo una corrección sistemática de una cascada de errores TypeScript que habían quedado tras las refactorizaciones previas. Esta tarea fue crucial para restaurar la estabilidad del proyecto y eliminar todos los errores de compilación que impedían el desarrollo fluido.

> **Errores Corregidos:**
>
> 1. **Modelo de Notificaciones:** Corregido el error en `/api/notifications/route.ts` donde la función `createNotification` no incluía los campos requeridos `id` y `updatedAt` según el schema de Prisma.
>
> 2. **DashboardView.tsx:** Corregido el error en `useModalState()` que intentaba pasar argumentos cuando la función no los requiere.
>
> 3. **DashboardStore.ts:** Corregidas las funciones `fetchSectionsByCategory` y `fetchProductsBySection` que tenían expresiones `await` dentro de funciones `set()` que no eran async.
>
> 4. **DashboardClient.tsx:** Eliminada la dependencia de la prop `clientId` que no se estaba pasando desde `page.tsx`, ya que el `clientId` se obtiene internamente de la sesión.
>
> 5. **Navegación Móvil:** Agregadas las funciones faltantes `handleCategorySelect`, `handleSectionSelect` y `handleBack` al store para la navegación móvil.
>
> 6. **MobileView.tsx:** Corregidas las llamadas a funciones de toggle de visibilidad para que pasen solo 2 argumentos en lugar de 3, y adaptadas las funciones de selección para pasar IDs en lugar de objetos completos.
>
> 7. **Declaraciones de Módulo:** Limpiada la duplicación de declaraciones de tipos en `lib/auth.ts`.

> **Arquitectura Consolidada:**
> La corrección de estos errores consolida la arquitectura híbrida del proyecto:
>
> - Vista de escritorio con arquitectura "Master-Detail" usando `DashboardView` → `CategoryGridView` → `SectionGridView` → `ProductGridView`
> - Vista móvil con navegación "Drill-Down" usando `MobileView` con estados `categories` → `sections` → `products`
> - Store unificado `dashboardStore` que maneja ambas vistas sin conflictos

**Archivos Modificados/Creados:**

- `app/api/notifications/route.ts` (Modificado)
- `app/dashboard-v2/components/core/DashboardView.tsx` (Modificado)
- `app/dashboard-v2/components/core/DashboardClient.tsx` (Modificado)
- `app/dashboard-v2/stores/dashboardStore.ts` (Modificado)
- `app/dashboard-v2/views/MobileView.tsx` (Modificado)
- `lib/auth.ts` (Modificado)
- `docs/sistema/Bitacora.md` (Actualizado)

---

### **#16 | Implementación Completa de Funciones CRUD para Secciones y Productos**

- **Fecha:** 2024-12-23
- **Responsable:** Claude (Asistente IA)
- **Checklist:** #T21, #T27, #T28
- **Mandamientos Involucrados:** #4 (Correcciones directas), #6 (Separación de responsabilidades), #7 (Código documentado), #10 (Mejora proactiva)

**Descripción:**

> Se ha completado la implementación de todas las funciones CRUD faltantes en el `dashboardStore.ts` que estaban causando errores "Función no implementada" en la aplicación. Se han implementado las operaciones de Crear, Actualizar y Eliminar para categorías, secciones y productos, siguiendo el patrón arquitectónico establecido y añadiendo comentarios contextuales como "migas de pan" para facilitar el mantenimiento futuro.

**Funciones Implementadas:**

- `updateCategory()`: Actualización de categorías existentes usando FormData y endpoint PUT
- `deleteCategory()`: Eliminación de categorías con reseteo inteligente de selecciones
- `toggleCategoryVisibility()`: Alternado de visibilidad usando endpoint PATCH
- `createSection()`: Creación de secciones con asociación automática a categoría
- `updateSection()`: Actualización de secciones existentes
- `deleteSection()`: Eliminación de secciones con gestión de estado limpia
- `createProduct()`: Creación de productos con asociación a sección
- `updateProduct()`: Actualización de productos existentes
- `deleteProduct()`: Eliminación de productos

**Problemas Técnicos Resueltos:**

1. **Tipos de Datos**: Se corrigió el manejo de `price` en `ProductForm.tsx` para usar string en lugar de number, alineándose con Prisma.Decimal
2. **Compatibilidad de Props**: Se ajustaron las funciones en `DashboardView.tsx` para coincidir con las interfaces esperadas por `SectionGridView` y `ProductGridView`
3. **Gestión de Estado**: Todas las funciones incluyen recarga automática de datos después de operaciones exitosas
4. **Feedback Visual**: Implementación de toasts informativos durante las operaciones CRUD

**Archivos Modificados/Creados:**

- `app/dashboard-v2/stores/dashboardStore.ts` (Implementación completa de funciones CRUD)
- `app/dashboard-v2/components/domain/products/ProductForm.tsx` (Corrección de tipos price)
- `app/dashboard-v2/components/core/DashboardView.tsx` (Ajuste de compatibilidad de props)

**Arquitectura Consolidada:**

- **Patrón Unificado**: Todas las operaciones CRUD siguen el mismo patrón: FormData → API → Toast → Recarga de datos
- **Separación de Responsabilidades**: El store maneja toda la lógica de API, los componentes solo renderizan y delegan
- **Comentarios Contextuales**: Cada función incluye "migas de pan" que explican su conexión con otros componentes del sistema
- **Gestión de Errores**: Manejo consistente de errores con mensajes informativos al usuario

---

### **#17 | Corrección de Funciones de Edición CRUD - Incompatibilidad de Endpoints**

- **Fecha:** 2024-12-23
- **Responsable:** Claude (Asistente IA)
- **Checklist:** #T29 (corregida y completada)
- **Mandamientos Involucrados:** #4 (Correcciones directas), #7 (Código documentado), #10 (Mejora proactiva)

**Descripción:**

> Se identificó y corrigió la causa raíz de por qué las funciones de edición no funcionaban: **incompatibilidad entre los campos que enviaba el store y los campos que esperaban los endpoints PUT**. Los endpoints de las APIs tenían diferentes convenciones de nomenclatura que no coincidían con mi implementación inicial.

**Problemas Identificados y Corregidos:**

1. **Secciones**:

   - ❌ Store enviaba: `section_id`
   - ✅ Endpoint esperaba: `id`
   - **Corregido**: `updateSection()` ahora envía el campo correcto

2. **Productos**:

   - ❌ Store enviaba solo: `product_id`
   - ✅ Endpoint requería: `product_id`, `section_id`, `client_id` (campos obligatorios)
   - **Corregido**: `updateProduct()` ahora incluye todos los campos requeridos

3. **Categorías**:
   - ✅ Ya funcionaba correctamente (enviaba `category_id` como esperaba el endpoint)

**Mejoras Implementadas:**

- **Manejo de Errores Mejorado**: Se actualizaron los mensajes de error para capturar tanto `errorData.message` como `errorData.error`
- **Documentación Contextual**: Se añadieron comentarios específicos sobre los campos requeridos por cada endpoint
- **Validación de Campos**: Se añadió lógica para obtener automáticamente `section_id` y `client_id` del estado del store

**Archivos Modificados:**

- `app/dashboard-v2/stores/dashboardStore.ts`
  - `updateSection()`: Corregido para usar campo `id`
  - `updateProduct()`: Añadidos campos requeridos `section_id` y `client_id`
  - Comentarios actualizados con información específica de cada endpoint

**Validación:**

- ✅ Compilación exitosa sin errores TypeScript
- ✅ Eliminación funciona correctamente (confirmado por usuario)
- ✅ Edición corregida y lista para pruebas

---

### **#18 | Corrección Integral de UX - Toasts, Contadores, Modal y Propuesta de Jerarquía Flexible**

- **Fecha:** 2024-12-24
- **Responsable:** Claude (Asistente IA)
- **Checklist:** #T27 (completada), correcciones críticas de UX
- **Mandamientos Involucrados:** #1 (Contexto), #4 (Correcciones directas), #6 (Separación responsabilidades), #7 (Código documentado), #10 (Mejora proactiva)

**Descripción:**

> Sesión integral de corrección de múltiples problemas críticos de UX identificados tras la implementación de la nueva arquitectura Master-Detail. Se solucionaron problemas de feedback visual, diseño de modales y se estableció una propuesta estratégica para jerarquía flexible del sistema.

**Problemas Identificados y Solucionados:**

1. **Toasts Duplicados** ❌→✅:

   - **Causa**: Dos componentes `<Toaster />` activos simultáneamente
   - **Ubicaciones**: `app/layout.tsx` (top-right) + `DashboardClient.tsx` (bottom-right)
   - **Solución**: Eliminado el toaster del layout raíz, manteniendo solo el de DashboardClient
   - **Resultado**: Un solo toast por acción en posición bottom-right

2. **Contadores de Visibilidad Faltantes** ❌→✅:

   - **Problema**: Solo ProductGridView tenía contador "X / Y productos visibles"
   - **Implementado**: Contadores dinámicos para CategoryGridView y SectionGridView
   - **Patrón**: `{visibleItems.filter(item => item.status).length} / {totalItems.length} [tipo] visibles`
   - **Corrección**: Eliminada duplicación accidental en CategoryGridView

3. **Función toggleProductVisibility Defectuosa** ❌→✅:

   - **Causa**: Lógica compleja de recarga que priorizaba `activeSectionId` (móvil) sobre `selectedSectionId` (escritorio)
   - **Solución**: Simplificada a `selectedSectionId || activeSectionId` para priorizar escritorio
   - **Resultado**: Contador de productos se actualiza correctamente tras cambios de visibilidad

4. **Imágenes No Cargaban en Modales de Edición** ❌→✅:

   - **Causa**: `ImageUploader` recibía solo nombre de archivo (`"bowls.jpg"`) en lugar de ruta completa
   - **Archivos corregidos**:
     - `SectionForm.tsx`: `section?.image ? \`/images/sections/${section.image}\` : null`
     - `ProductForm.tsx`: `product?.image ? \`/images/products/${product.image}\` : null`
     - `CategoryForm.tsx`: Ya tenía la corrección implementada
   - **Resultado**: Preview de imágenes funciona correctamente en edición

5. **Modal de Pantalla Completa** ❌→✅:
   - **Causa**: Clases CSS `sm:w-full w-full` forzaban ancho completo
   - **Solución**: Reemplazado por `sm:max-w-lg` con diseño responsivo centrado
   - **Mejora**: Modal ahora tiene tamaño apropiado y se centra correctamente

**Arquitectura y Patrones Consolidados:**

- **Contadores Reactivos**: Patrón unificado `filter(item => item.status).length` aplicado a todas las vistas
- **Gestión de Estado**: Diferenciación clara entre variables móvil (`active*Id`) y escritorio (`selected*Id`)
- **Rutas de Imágenes**: Patrón `/images/[entityType]/[filename]` implementado consistentemente
- **Modal Responsivo**: Diseño adaptativo que funciona bien en móvil y escritorio

**Propuesta Estratégica - Jerarquía Flexible:**

> Se desarrolló propuesta "Smart Sections" para manejar diferentes casos de uso de clientes:
>
> - **90% clientes**: Categorías → Secciones → Productos (sin cambios)
> - **10% clientes**: Categorías → Productos (secciones auto-creadas invisibles)
> - **Personalización**: Nombres customizables ("Categorías" → "Tipos", etc.)
>
> **Ventajas**: Zero breaking changes, DB schema intacta, APIs inalteradas, UX escalable
> **Implementación**: Campo `client_settings.ui_mode` + secciones con flag `is_auto`

**Archivos Modificados:**

- `app/layout.tsx` (Eliminado Toaster duplicado)
- `app/dashboard-v2/components/domain/categories/CategoryGridView.tsx` (Contador + corrección duplicación)
- `app/dashboard-v2/components/domain/sections/SectionGridView.tsx` (Contador agregado)
- `app/dashboard-v2/components/domain/sections/SectionForm.tsx` (Ruta imagen corregida)
- `app/dashboard-v2/components/domain/products/ProductForm.tsx` (Ruta imagen corregida)
- `app/dashboard-v2/stores/dashboardStore.ts` (toggleProductVisibility simplificado)
- `app/dashboard-v2/components/ui/Modal/BaseModal.tsx` (Diseño responsivo)

**Estado Actual del Proyecto:**

- ✅ **Visibilidad Móvil**: Funcional en todas las entidades
- ✅ **Visibilidad Escritorio**: Funcional con contadores actualizados
- ✅ **Modales**: Diseño apropiado con imágenes funcionando
- ✅ **Toasts**: Sistema unificado sin duplicaciones
- ✅ **Arquitectura Master-Detail**: Consolidada y estable
- 🔄 **Jerarquía Flexible**: Propuesta desarrollada, pendiente implementación

---

### **#19 | Planificación Estratégica - Jerarquía Flexible y Features Gastronómicos Críticos**

- **Fecha:** 2024-12-24
- **Responsable:** Claude (Asistente IA)
- **Checklist:** #T32-T35 (planificación estratégica)
- **Mandamientos Involucrados:** #1 (Contexto), #4 (Sugerencias), #10 (Mejora proactiva)

**Descripción:**

> Sesión de análisis profundo y planificación estratégica basada en casos de uso reales del usuario. Se ha refinado completamente la propuesta de jerarquía flexible y se han identificado features críticos obligatorios para restaurantes profesionales que actualmente faltan en v2.

**Decisiones Estratégicas Clave:**

1. **Jerarquía Híbrida por Categoría (Actualización de Propuesta):**

   - **Descubrimiento**: Casos reales como Palm Beach necesitan AMBAS jerarquías EN EL MISMO MENÚ
   - **Ejemplo Real**:
     - "SNACKS" → Productos directos (Sopas, Sándwiches, Papas Fritas)
     - "HAMBURGUESAS" → Secciones → Productos (Sencilla, Con Queso, Doble)
   - **Solución**: Campo `hierarchy_mode` en tabla `categories` ("simple" | "sections")
   - **Ventaja**: Flexibilidad total sin complejidad para el usuario

2. **Alcance de Alergenos Ampliado:**

   - **Decisión**: Obligatorio para TODOS los negocios gastronómicos (no solo restaurantes)
   - **Justificación**: "Todo lo que tenga que ver con gastronomía en general lleva alergenos incluso un café con leche que tiene lactosa"
   - **Implementación**: Basado en `business_type` (Restaurante, Bar, Cafetería, etc.)

3. **Migración de Precios Múltiples:**

   - **Problema Identificado**: Campo `multiple_prices` usa "S"/"N" (VARCHAR) en lugar de boolean estándar
   - **Solución**: Migración a BOOLEAN siguiendo estándares del proyecto
   - **Casos de Uso**: Bocadillo Grande/Mediano/Pequeño con hasta 4 variantes de precio

4. **Sistema Multiidioma con Auto-Traducción:**
   - **Enfoque**: Fase 1 manual → Fase 2 auto-traducción cuando haya presupuesto
   - **Costo Estimado**: $2-5 USD una sola vez por restaurante promedio
   - **Prioridad**: Override manual más importante que auto-traducción

**Contexto del Proyecto:**

- **Sin Clientes en Producción**: Libertad total para cambios de schema sin riesgo
- **Data de Prueba Abundante**: Múltiples clientes legacy disponibles para testing
- **Base Sólida**: Arquitectura Master-Detail consolidada, lista para extensión

**Plan de Implementación Acordado:**

1. **#T32 - Jerarquía Híbrida** (Base fundamental)
2. **#T34 - Precios Múltiples** (Crítico para restaurantes)
3. **#T33 - Alergenos** (Obligatorio legal)
4. **#T35 - Multiidioma** (Expansión internacional)

**Archivos de Documentación Actualizados:**

- `docs/sistema/EstructuraRokaMenu.md`: Añadida arquitectura de jerarquía flexible y features gastronómicos
- `docs/sistema/Checklist.md`: Nueva Fase 6 con tareas T32-T35 detalladas
- `docs/sistema/Bitacora.md`: Esta entrada

**Commit Realizado:**

- Estado actual guardado con mensaje descriptivo completo
- 49 archivos modificados con correcciones UX integrales
- Reorganización de iconos de alergenos a ubicación estándar

**Próximos Pasos Inmediatos:**

1. Iniciar implementación T32.1: Extensión schema categories con hierarchy_mode
2. Crear migración SQL para campo nuevo con default 'sections'
3. Actualizar Prisma schema con enum categories_hierarchy_mode
4. Implementar lógica adaptativa en DashboardStore

---

### **#20 | Decisión Estratégica: Auto-Detección Inteligente para Jerarquía Flexible**

- **Fecha:** 2024-12-24
- **Responsable:** Claude (Asistente IA)
- **Checklist:** #T32.1 (decisión de implementación)
- **Mandamientos Involucrados:** #3 (No Reinventar), #6 (Separación Responsabilidades), #10 (Mejora Proactiva)

**Descripción:**

> Sesión de análisis final donde se tomó la decisión definitiva sobre la implementación de jerarquía flexible. Tras revisar capturas de la aplicación antigua y analizar la estructura existente de la DB, se optó por la **auto-detección inteligente** como la solución más elegante y práctica.

**Análisis de la Aplicación Antigua:**

- **Estructura Observada**: La app legacy ya implementaba jerarquía Categorías → Secciones → Productos de forma consistente
- **Casos de Uso Reales**: Se confirmó que clientes como "piscis" necesitan flexibilidad (algunas categorías con pocas secciones, otras con muchas)
- **Features Existentes**: Alergenos con iconos, configuración de colores, modal de productos - todo ya funcionaba correctamente

**Decisión Final: Auto-Detección vs Campo Manual**

```typescript
// OPCIÓN ELEGIDA: Auto-detección inteligente
const getCategoryDisplayMode = (categoryId: number) => {
  const sections = getSectionsByCategory(categoryId);
  return sections.length === 1 ? "simple" : "sections";
};
```

**Razones de la Decisión:**

1. **Complejidad Menor**: 20 líneas de código vs 200+ con migración DB
2. **Elegancia Arquitectónica**: La data define el comportamiento (principio DRY)
3. **Migración Inmediata**: Funciona instantáneamente con toda la data legacy existente
4. **Cero Configuración**: No hay UI que el usuario pueda configurar incorrectamente
5. **Mantenimiento Simplificado**: Se auto-adapta cuando se añaden/quitan secciones

**Plan de Implementación T32.1:**

1. **Función de Auto-Detección**: `getCategoryDisplayMode(categoryId)` en utils
2. **Integración en Store**: Modificar `fetchDataForCategory` para usar auto-detección
3. **UI Condicional**: Renderizar `ProductGridView` O `SectionGridView` según resultado
4. **Mobile Adaptation**: Adaptar navegación móvil para saltar secciones en modo simple

**Preparativos Completados:**

- ✅ **Checklist actualizado** con tareas T32.1-T32.4 refinadas según auto-detección
- ✅ **Commit previo** con estado estable antes de iniciar implementación
- ✅ **Documentación actualizada** en EstructuraRokaMenu.md

**Siguiente Paso Inmediato:**

Iniciar implementación de T32.1 siguiendo los Mandamientos, especialmente #5 (Mobile-First) y #7 (Código documentado con "migas de pan" contextuales).

---

```

```
