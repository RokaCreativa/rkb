# ✅ Checklist de Desarrollo - RokaMenu

> Este documento es nuestro plan de acción. Aquí definimos y rastreamos las tareas pendientes para llevar a RokaMenu al siguiente nivel.

---

## 🗺️ Roadmap General

- [ ] **Fase 1: Personalización Avanzada del Menú**
- [ ] **Fase 2: Experiencia Móvil Superior**
- [ ] **Fase 3: Migración de Base de Datos (CANCELADA)**
- [ ] **Fase 4: Refactorización y Deuda Técnica Continua**
- [ ] **Fase 5: Arquitectura Flexible y Personalización Avanzada**
- [ ] **Fase 6: Features Críticos del Sistema de Menús**
- [ ] **Fase 7: Refactorización de Modales y Unificación de Componentes**

---

## 📝 Tareas Detalladas

### **Fase 1: Personalización Avanzada del Menú (Live Preview v2)**

- **Objetivo:** Dar a los clientes un control visual total sobre la apariencia de su menú digital.
- **Tareas:**
  - [ ] **#T1 - Paleta de Colores:** Implementar un selector de colores para que el cliente pueda definir los colores primarios, secundarios, de fondo y de texto de su menú.
  - [ ] **#T2 - Imágenes de Fondo:** Permitir subir y gestionar una imagen de fondo para el menú. Incluir opciones de opacidad y ajuste.
  - [ ] **#T3 - Tipografía:** Añadir una selección de fuentes (curadas por nosotros) para los títulos y el cuerpo del menú.
  - [ ] **#T4 - Temas Predefinidos:** Crear 3-5 temas visuales (ej: "Moderno", "Clásico", "Minimalista") que el cliente pueda aplicar con un solo clic.
  - [ ] **#T5 - Guardado y Aplicación:** Diseñar la API y la lógica del frontend para guardar estas preferencias de personalización por cliente y aplicarlas al menú público.

### **Fase 2: Experiencia Móvil Superior**

- **Objetivo:** Asegurar que el Dashboard de gestión sea impecable en dispositivos móviles, usando un modelo de navegación "Drill-Down".
- **Tareas:**
  - [x] **#T6 - Auditoría UI/UX Móvil y Definición de Estrategia:** Se completó la auditoría inicial y se definió la estrategia de "View Switcher" y "Drill-Down".
  - [x] **#T6.1 - Crear `useIsMobile` hook:** Creado para detectar el dispositivo.
  - [x] **#T6.2 - Implementar `ViewSwitcher`:** Creado e implementado en `page.tsx` para separar la vista móvil de la de escritorio.
  - [x] **#T6.3 - Vista de Categorías Móvil:** Implementada la vista inicial en `MobileView.tsx` que carga y muestra la lista de categorías.
  - [x] **#T6.4 - Vista de Secciones Móvil:** Implementar la lógica para mostrar las secciones de una categoría seleccionada.
  - [x] **#T6.5 - Vista de Productos Móvil:** Implementar la lógica para mostrar los productos de una sección seleccionada.
  - [x] **#T7 - Rediseño de Acciones en Móvil:** Adaptar los botones de añadir/editar/eliminar a una interfaz táctil.
  - [x] **#T7.1 - Completar Flujo CRUD Móvil:** Asegurar que los modales y formularios para crear y editar categorías, secciones y productos sean 100% funcionales y responsivos en móvil. (Completado con la migración a Zustand)
  - [ ] **#T8 - Componentes Responsivos:** Revisar y refactorizar componentes clave (`Modal`, `Form`) para garantizar su perfecta funcionalidad en pantallas pequeñas.
  - [ ] **#T9 - Modo de Ordenación Móvil:** Implementar una interfaz para reordenar categorías, secciones y productos en la vista móvil.
  - [ ] **#T25 - Reemplazo de Drag & Drop por Flechitas de Ordenamiento:**
    - **Objetivo:** Reemplazar el sistema de drag & drop por flechitas de subir/bajar más intuitivas y compatibles con móvil.
    - **Justificación:** Las flechitas son más simples, accesibles, compatibles con todos los dispositivos y siguen el principio Mobile-First.
    - **Tareas Detalladas:**
      - [ ] **#T25.1 - Eliminar Drag & Drop:** Remover todas las dependencias y código relacionado con `@hello-pangea/dnd`.
      - [ ] **#T25.2 - Implementar Flechitas en Móvil:** Crear componente de flechitas para `MobileView.tsx`.
      - [ ] **#T25.3 - Implementar Flechitas en Escritorio:** Adaptar las flechitas para `DashboardView.tsx`.
      - [ ] **#T25.4 - APIs de Reordenamiento:** Asegurar que las APIs `reorder` funcionen correctamente.
      - [ ] **#T25.5 - Limpiar Código Legacy:** Eliminar componentes, hooks y utilidades de drag & drop obsoletos.

### **Fase 3: Migración de Base de Datos (CANCELADA)**

- **Objetivo:** Mover la infraestructura de datos a una solución más robusta y escalable.
- **Decisión (2024-06-14):** Se cancela la migración a PostgreSQL. Se ha determinado que MySQL es una tecnología más que suficiente para las necesidades actuales y futuras del proyecto. Esta decisión permite enfocar los recursos en el desarrollo de funcionalidades de cara al usuario.
- **Tareas:**
  - [ ] ~~**#T10 - Análisis del Esquema:** Mapear el esquema actual de Prisma (MySQL) a su equivalente en PostgreSQL. Identificar posibles conflictos.~~
  - [ ] ~~**#T11 - Plan de Migración de Datos:** Definir la estrategia para exportar los datos existentes (clientes, menús, etc.) de forma segura.~~
  - [ ] ~~**#T12 - Creación de Script de Migración:** Desarrollar un script (usando `pg-promise`, `node-postgres` o similar) para importar los datos a la nueva base de datos PostgreSQL.~~
  - [ ] ~~**#T13 - Adaptación del Código:** Modificar el `schema.prisma` para usar el provider de PostgreSQL.~~
  - [ ] ~~**#T14 - Pruebas Exhaustivas:** Realizar pruebas completas en un entorno de staging para verificar la integridad de los datos y la funcionalidad de la aplicación antes de pasar a producción.~~

### **Fase 4: Refactorización y Deuda Técnica Continua**

- **Objetivo:** Mantener el código sano y manetenible a largo plazo.
- **Tareas:**
  - [x] **#T27 - Refactorización de Vista de Escritorio a "Master-Detail":**
    - **Objetivo:** Reemplazar el "componente Dios" `DashboardView` por una arquitectura limpia, mantenible y escalable de 3 vistas (o columnas) separadas.
    - **Justificación:** La complejidad actual de `DashboardView` dificulta el mantenimiento, introduce riesgos de regresión y va en contra del Mandamiento #6 (Separación de Responsabilidades). Esta nueva arquitectura mejorará drásticamente la mantenibilidad y la experiencia de usuario en escritorio.
    - **Tareas Detalladas:**
      - [x] **#T27.1 - Crear `CategoryGridView.tsx`:** Un componente aislado y reutilizable que solo se encarga de mostrar la tabla de categorías.
      - [x] **#T27.2 - Crear `SectionGridView.tsx`:** Un componente que muestra la tabla de secciones de una categoría seleccionada.
      - [x] **#T27.3 - Crear `ProductGridView.tsx`:** Un componente que muestra la tabla de productos de una sección seleccionada.
      - [x] **#T27.4 - Orquestar las Vistas:** Modificar `DashboardView` (o un nuevo contenedor) para que actúe como un "director de orquesta", mostrando el grid correcto (`Category`, `Section`, o `Product`) basado en el estado de selección del usuario, gestionado centralmente en Zustand.
      - [x] **#T27.5 - Unificar Estado de Navegación:** Adaptar el `dashboardStore` para que maneje el estado de navegación del escritorio (`selectedCategoryId`, `selectedSectionId`) de una forma similar a como ya lo hace para la vista móvil, unificando la lógica.
  - [x] **#T26 - Corrección de Errores Críticos (Visibilidad e Hidratación):**
    - [x] **#T26.1 - Reparar API de Visibilidad:** Se alineó el `dashboardStore` para enviar `boolean` en lugar de `number` al backend, solucionando el error 400.
    - [x] **#T26.2 - Solucionar Error de Hidratación:** Se reemplazó `ViewSwitcher` por una importación dinámica con SSR deshabilitado para `DynamicView`, eliminando el desajuste de renderizado.
  - [x] **#T21 - Refactorización de Vista de Escritorio a Zustand:**
    - **Objetivo:** Unificar la gestión de estado de toda la aplicación, eliminando la arquitectura legada de `DashboardView.tsx` y `useDashboardState.ts` para que utilice el store central `useDashboardStore`.
    - **Tareas Detalladas:**
      - [x] **#T21.1 - Limpieza de Dependencias:** Eliminar la librería obsoleta `react-beautiful-dnd` y sus tipos.
      - [x] **#T21.2 - Extender `useDashboardStore`:** Añadir al store los estados y acciones necesarios para la vista de escritorio que actualmente faltan (ej: `selectedCategory`, `selectedSection`, `expandedCategories`, modo de reordenación, etc.).
      - [x] **#T21.3 - Refactorizar `DashboardView.tsx` (Incremental):**
        - [x] Conectar el componente al `useDashboardStore`.
      - [x] **#T21.4 - Eliminar `useDashboardState.ts`:** Una vez que `DashboardView.tsx` y sus hijos ya no lo utilicen, eliminar el hook obsoleto.
      - [x] **#T21.5 - Refactorizar Hijos:** Evaluar si los componentes hijos (`CategoryView`, `SectionView`) pueden consumir directamente del store en lugar de recibir todas las props desde `DashboardView`.
  - [ ] **#T15 - Revisión de `//TODO`:** Buscar en todo el código comentarios `//TODO` o `FIXME` y abordarlos.
  - [ ] **#T16 - Optimización de Hooks:** Revisar los hooks existentes para asegurar que las `queryKeys` sean consistentes y el cache se invalide correctamente.
  - [x] **#T17 - Consolidación de Tipos:** Auditar la carpeta `types` para eliminar duplicados y asegurar una única fuente de verdad para los modelos de datos. (Completado durante la auditoría de API del 18/06).
  - [ ] **#T18 - Visualizador de Imágenes (Lightbox):** Implementar un modal para ampliar las imágenes de categorías, secciones y productos al hacer clic sobre ellas. Debe funcionar en escritorio y móvil.
  - [ ] **#T19 - Optimización de Subida de Imágenes:**
    - [ ] **#T19.1 - Compresión en Cliente:** Integrar una librería para comprimir las imágenes en el navegador antes de enviarlas al servidor.
    - [ ] **#T19.2 - Validación de Tamaño:** Añadir un límite de 2MB en el cliente para los archivos de imagen antes de iniciar la subida.
  - [x] **#T20 - Migración de Estado a Zustand:** Se migró la lógica de estado de la **vista móvil** a un store central de Zustand para resolver bucles de renderizado y simplificar la arquitectura. (Completado el 18/06).
  - [x] **#T28 - Corrección Masiva de Errores TypeScript:** Se corrigieron sistemáticamente todos los errores de compilación TypeScript que quedaron tras las refactorizaciones, incluyendo problemas en APIs, tipos de funciones, navegación móvil y declaraciones de módulos. (Completado el 20/12).
  - [x] **#T29 - Implementación Completa de Funciones CRUD:** Se implementaron todas las funciones CRUD faltantes (crear, actualizar, eliminar) para categorías, secciones y productos en el `dashboardStore`, eliminando los errores "Función no implementada" y completando la funcionalidad del sistema de gestión. (Completado el 23/12).

### **Fase 5: Arquitectura Flexible y Personalización Avanzada**

- **Objetivo:** Permitir diferentes tipos de jerarquía de menú según las necesidades del cliente manteniendo la arquitectura actual.
- **Tareas:**
  - [x] **#T31 - Productos Directos en Categorías + Categorías Virtuales (COMPLETADO):**
    - **Objetivo:** Permitir crear productos directamente en categorías sin secciones intermedias usando "relaciones opcionales" + Sistema de categorías virtuales para marketing.
    - **Propuesta:** Implementar `category_id` opcional en productos para jerarquía flexible (Categoría → Producto directo) + Solución v0.dev de categorías virtuales.
    - **Justificación:** Categorías simples como "BEBIDAS" no necesitan secciones intermedias, pero debe coexistir con modo tradicional. Las categorías virtuales resuelven el problema de "productos huérfanos" con arquitectura dual.
    - **✅ COMPLETADO (15/01/2025):** Backend + Frontend implementado exitosamente. Solución v0.dev aplicada completamente.
    - **Tareas Detalladas:**
      - [x] **#T31.1 - Modificar Schema:** Añadido `category_id` opcional a products + `is_virtual_category` a categories.
      - [x] **#T31.2 - Migración de BD:** Aplicada migración `20250614015912_add_products_direct_to_categories_t31`.
      - [x] **#T31.3 - APIs Híbridas:** Modificadas para soportar productos tradicionales + directos simultáneamente.
      - [x] **#T31.4 - Extender Store:** Añadida función `createProductDirect()` al dashboardStore.
      - [x] **#T31.5 - UI CategoryGridView:** Badge VIRTUAL, botón "Producto Directo", contadores actualizados.
      - [x] **#T31.6 - CategoryForm:** Checkbox "Categoría Virtual" con tooltip explicativo.
      - [x] **#T31.7 - Arquitectura Dual:** Admin ve organización interna, cliente ve productos elevados.
      - [x] **#T31.8 - Documentación:** Migas de pan contextuales aplicadas a todos los archivos.

### **Fase 6: Features Críticos del Sistema de Menús**

- **Objetivo:** Implementar funcionalidades obligatorias para restaurantes profesionales que actualmente faltan en v2.
- **Tareas:**

  - [ ] **#T32 - Sistema de Alergenos (OBLIGATORIO para Restaurantes):**

    - **Objetivo:** Implementar gestión completa de alergenos con iconos visuales según normativas europeas.
    - **Justificación:** Es obligatorio por ley en establecimientos de restauración mostrar alergenos.
    - **Ubicación Iconos:** `public/images/allergensIcons/`
    - **Tareas Detalladas:**
      - [ ] **#T32.1 - Auditar Tablas Existentes:** Revisar y limpiar tablas `allergens` y `allergens_product` en el schema.
      - [ ] **#T32.2 - Componente Selector de Alergenos:** Crear selector visual con iconos para formularios de productos.
      - [ ] **#T32.3 - Display de Alergenos:** Mostrar iconos de alergenos en las vistas de productos (móvil y escritorio).
      - [ ] **#T32.4 - Gestión de Alergenos:** CRUD completo para gestionar lista de alergenos disponibles.
      - [ ] **#T32.5 - Integración con Menú Público:** Asegurar que alergenos se muestren correctamente en el menú del cliente final.

  - [ ] **#T33 - Precios Múltiples por Producto:**

    - **Objetivo:** Permitir productos con múltiples variantes de precio (ej: Bocadillo Grande/Mediano/Pequeño).
    - **Problema Actual:** Campo `multiple_prices` usa "S"/"N" en lugar de boolean estándar.
    - **Justificación:** Muchos productos necesitan variantes de tamaño/precio.
    - **Tareas Detalladas:**
      - [ ] **#T33.1 - Estandarizar Campo Boolean:** Migrar `multiple_prices` de VARCHAR("S"/"N") a BOOLEAN(true/false).
      - [ ] **#T33.2 - Componente Precios Múltiples:** Crear formulario para gestionar hasta 4 precios con labels personalizables.
      - [ ] **#T33.3 - Display Precios Múltiples:** Mostrar variantes de precio en vistas de productos y menú público.
      - [ ] **#T33.4 - Validación de Precios:** Asegurar que al menos price1 esté definido cuando multiple_prices es true.

  - [ ] **#T34 - Sistema Multiidioma Avanzado:**
    - **Objetivo:** Implementar sistema completo de traducciones con capacidad de auto-traducción y override manual.
    - **Justificación:** Clientes internacionales necesitan menús en múltiples idiomas.
    - **Tablas Existentes:** `languages`, `translations`, `client_languages`
    - **Tareas Detalladas:**
      - [ ] **#T34.1 - Auditar Sistema Actual:** Revisar y documentar funcionamiento de tablas de traducción existentes.
      - [ ] **#T34.2 - Auto-Traducción:** Integrar servicio de traducción automática (Google Translate API o similar).
      - [ ] **#T34.3 - Override Manual:** Permitir que clientes modifiquen traducciones automáticas específicas.
      - [ ] **#T34.4 - UI de Gestión:** Crear interfaz para gestionar idiomas activos y traducciones por cliente.
      - [ ] **#T34.5 - Selector de Idioma:** Implementar selector en menú público para cambiar idioma dinámicamente.
      - [ ] **#T34.6 - Fallback Inteligente:** Si traducción no existe, mostrar idioma principal del cliente.

### **Fase 7: Refactorización de Modales y Unificación de Componentes**

- **Objetivo:** Eliminar duplicación, mejorar mantenibilidad y resolver inconsistencias en la arquitectura del sistema de modales.
- **Justificación:** El análisis en EstructuraRokaMenu.md reveló múltiples implementaciones duplicadas de modales, creando bugs como el de EditProductModal y dificultando el mantenimiento.
- **Tareas:**

  - [x] **#T36 - Refactorización de Modales y Unificación de Componentes:**

    - **Objetivo:** Eliminar duplicación de código en modales y crear un sistema unificado que sea más mantenible y consistente.
    - **Justificación:** Actualmente cada entidad (Category, Section, Product) tiene sus propios modales con lógica duplicada. Un sistema unificado reduce bugs, mejora mantenibilidad y asegura consistencia UX.
    - **✅ COMPLETADO:** Sistema unificado implementado, BaseModal consolidado, ModalManager recreado, duplicaciones críticas eliminadas
    - **Tareas Detalladas:**
      - [x] **#T36.1 - Crear Sistema Unificado:** Desarrollar `EditModals.tsx` con componentes genéricos reutilizables para todos los tipos de entidades.
      - [x] **#T36.2 - Actualizar ModalManager:** Migrar `ModalManager.tsx` para usar el sistema unificado en lugar de modales individuales.
      - [x] **#T36.3 - Eliminar Duplicaciones Críticas:** Eliminados BaseModal duplicado y ModalManager duplicados. Sistema híbrido estable.
      - [x] **#T36.4 - Consolidar Gestión de Estado:** useModalStore validado como estándar. Deuda técnica en CategoryView.tsx identificada y documentada.
      - [x] **#T36.5 - Aplicar Comentarios Contextuales:** Sistema de "migas de pan" aplicado sistemáticamente para mantener contexto vivo en el código.

  - [ ] **#T37 - Estandarización de Formularios:**
    - **Objetivo:** Asegurar que todos los formularios sigan el patrón `forwardRef` con `getFormData()`.
    - **⚠️ PENDIENTE:** Requiere análisis detallado de formularios existentes
    - **Tareas Detalladas:**
      - [ ] **#T37.1 - Evaluar Formularios Existentes:** Verificar que `CategoryForm.tsx`, `SectionForm.tsx` y `ProductForm.tsx` implementen correctamente el patrón.
      - [ ] **#T37.2 - Extender Formularios:** Añadir validación, manejo de errores y feedback visual consistente a todos los formularios.
      - [ ] **#T37.3 - Centralizar Manejo de Imágenes:** Asegurar que todos los formularios utilicen `ImageUploader.tsx` de manera consistente.
  - [ ] **#T38 - Refactorización de Modales de Creación:**
    - **Objetivo:** Unificar NewCategoryModal, NewSectionModal, NewProductModal en sistema centralizado.
    - **⚠️ DEUDA TÉCNICA:** Modales legacy funcionales pero candidatos para unificación
    - **Tareas Detalladas:**
      - [ ] **#T38.1 - Crear Sistema de Creación Unificado:** Desarrollar componente genérico para creación de entidades.
      - [ ] **#T38.2 - Migrar Modales Legacy:** Reemplazar modales individuales por sistema unificado.
      - [ ] **#T38.3 - Actualizar CategoryView.tsx:** Migrar useState múltiples a useModalStore.
  - [ ] **#T39 - Documentación del Nuevo Sistema:**
    - **Objetivo:** Crear documentación clara para el nuevo sistema de modales.
    - **Tareas Detalladas:**
      - [ ] **#T39.1 - Diagrama del Sistema:** Crear un diagrama visual del flujo de datos en el sistema de modales.
      - [ ] **#T39.2 - Ejemplos de Uso:** Documentar ejemplos de cómo utilizar el nuevo sistema para futuros desarrolladores.
      - [ ] **#T39.3 - Actualizar EstructuraRokaMenu.md:** Reflejar los cambios arquitectónicos en la documentación central.

---

## 🕒 FASE FUTURA: TEMPORIZADOR AUTOMÁTICO DE CATEGORÍAS

### **Funcionalidad Propuesta por el Usuario (Idea Brillante):**

> **Concepto:** Categorías con horarios programados que se activan/desactivan automáticamente
>
> **Casos de Uso Reales:**
>
> - **"Happy Hour"** → Viernes 17:00-22:00
> - **"Desayunos"** → Lunes-Viernes 07:00-11:00
> - **"Menú Nocturno"** → Sábados 22:00-02:00
> - **"Promociones Semanales"** → Lunes, Miércoles, Viernes

### **Tareas:**

- [ ] **#T40 - Sistema de Temporizador Automático:**
  - **Objetivo:** Implementar horarios programados para categorías que se activen/desactiven automáticamente.
  - **Valor de Negocio:** 🟢 **MUY ALTO** (Automatización de marketing, mejor UX cliente)
  - **Complejidad:** 🔴 **ALTA** (Requiere cron jobs, timezone handling, real-time updates)
  - **Prioridad:** 🟡 **MEDIA** (Después de completar interfaz jerárquica principal)
  - **Tareas Detalladas:**
    - [ ] **#T40.1 - Schema Extensions:** Crear tabla `category_schedules` con horarios por día de semana + campo `has_schedule` en categories.
    - [ ] **#T40.2 - Backend Implementation:** API `/api/categories/[id]/schedule` + Cron Job para verificar horarios + función `updateCategoryVisibilityBySchedule()`.
    - [ ] **#T40.3 - Frontend Implementation:** ScheduleForm Component + Badge "🕒 PROGRAMADA" + Real-time updates + Schedule Preview.
    - [ ] **#T40.4 - UX Enhancements:** Visual Timeline + Quick Templates ("Happy Hour", "Desayunos") + Bulk Schedule + Manual Override.
    - [ ] **#T40.5 - Advanced Features:** Date Ranges + Holiday Support + Seasonal Menus + A/B Testing + Analytics Integration.
    - [ ] **#T40.6 - Integration with Virtual Categories:** Scheduled Virtual Categories + Dynamic Promotions + Marketing Automation + Customer Notifications.

### **Integración Perfecta con Categorías Virtuales:**

Esta funcionalidad se combina perfectamente con las categorías virtuales implementadas en T31:

1. **Promociones Automáticas:** Categorías virtuales que aparecen solo en horarios específicos
2. **Marketing Dinámico:** "Especial del Día" que se activa automáticamente
3. **UX Optimizada:** Cliente ve promociones relevantes según la hora
4. **Revenue Optimization:** Análisis de horarios más rentables
