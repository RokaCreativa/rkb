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
  - [x] **#T30 - Corrección Integral de UX - Sistema de Toasts, Contadores y Modal:** Se solucionaron problemas críticos de user experience: eliminación de toasts duplicados, implementación de contadores de visibilidad en todas las vistas, corrección de función toggleProductVisibility, imágenes funcionando en modales de edición y diseño responsivo de modales. (Completado el 24/12).
  - [x] **#T31 - Correcciones Críticas de UX - Secciones, Errores 500 y Navegación:** Se corrigieron problemas críticos reportados por usuario: secciones creadas deshabilitadas en móvil, error 500 editando secciones, y categorías vacías que no mostraban vista de secciones. Incluye corrección de campos FormData, lógica de auto-detección y radio buttons de visibilidad. (Completado el 26/12).
  - [x] **#T32 - Correcciones Avanzadas de UX - Delays, Navegación y Carga de Imágenes:** Se eliminaron delays innecesarios en modales de eliminación (2.3s → <100ms), se corrigió navegación tras eliminar secciones en móvil con callback específico, y se solucionó carga de imágenes en EditCategoryModal. Incluye eliminación de window.location.reload() y mejora de callbacks contextuales. (Completado el 26/12).
  - [x] **#T33 - Correcciones Críticas de Navegación y Visualización de Secciones:** Se corrigieron problemas críticos reportados por usuario: modal nueva categoría con radio buttons en lugar de combo, verificación de carga de imágenes en edición, y el problema más grave - secciones que no aparecían después de ser creadas en categorías vacías. Incluye corrección de handleModalSuccess para refrescar datos completos y actualizar modo de visualización dinámicamente. (Completado el 26/12).

### **Fase 5: Arquitectura Flexible y Personalización Avanzada**

- **Objetivo:** Permitir diferentes tipos de jerarquía de menú según las necesidades del cliente manteniendo la arquitectura actual.
- **Tareas:**
  - [ ] **#T31 - Implementación de Jerarquía Flexible "Smart Sections":**
    - **Objetivo:** Permitir a los clientes elegir entre estructura completa (Categorías → Secciones → Productos) o simplificada (Categorías → Productos) sin cambios en DB o APIs.
    - **Propuesta:** Sistema "Smart Sections" con secciones auto-creadas invisibles al usuario en modo simple.
    - **Justificación:** 90% de clientes usan estructura completa, pero 10% necesita simplicidad. No podemos joder al 90% por el 10%.
    - **Tareas Detalladas:**
      - [ ] **#T31.1 - Extender Schema de Cliente:** Añadir `client_settings.ui_mode` ("full" | "simple") y `custom_names` para personalización de labels.
      - [ ] **#T31.2 - Sistema de Secciones Auto:** Implementar flag `is_auto` en secciones para auto-crear secciones invisibles en modo simple.
      - [ ] **#T31.3 - Adaptar DashboardStore:** Modificar lógica de fetching para manejar ambos modos transparentemente.
      - [ ] **#T31.4 - UI Condicional:** Adaptar vistas para mostrar/ocultar secciones según ui_mode.
      - [ ] **#T31.5 - Nombres Personalizables:** Implementar sistema para que clientes personalicen labels ("Categorías" → "Tipos", etc.).
      - [ ] **#T31.6 - Configuración de Cliente:** Crear interfaz para que clientes cambien entre modos y personalicen nombres.

### **Fase 6: Features Críticos del Sistema de Menús**

- **Objetivo:** Implementar funcionalidades obligatorias para restaurantes profesionales que actualmente faltan en v2.
- **Tareas:**

  - [x] **#T32 - Jerarquía Híbrida por Categoría:**

    - **Objetivo:** Permitir que EN EL MISMO MENÚ, algunas categorías vayan directo a productos (ej: "SNACKS") y otras usen secciones (ej: "HAMBURGUESAS" → "Tipos" → Productos).
    - **Estrategia Decidida:** Auto-detección inteligente basada en la estructura existente, sin necesidad de campos adicionales en la DB.
    - **Justificación:** Casos reales como Palm Beach necesitan ambos modos en el mismo menú. La auto-detección es más elegante y funciona inmediatamente con data legacy.
    - **✅ COMPLETADO:** T32.1-T32.4 implementados exitosamente. Sistema híbrido funcionando en escritorio y móvil.
    - **Tareas Detalladas:**
      - [x] **#T32.1 - Implementar Auto-Detección Inteligente:** Crear función que detecte automáticamente si una categoría debe usar modo "simple" (1 sección) o "sections" (múltiples secciones) basado en la estructura existente.
      - [x] **#T32.2 - UI Adaptativa en DashboardView:** Renderizar `ProductGridView` O `SectionGridView` condicionalmente según el resultado de la auto-detección en vista de escritorio.
      - [x] **#T32.3 - Actualizar MobileView:** Integrar la auto-detección en MobileView para unificar el comportamiento entre escritorio y móvil.
      - [x] **#T32.4 - Navegación Móvil Adaptativa:** Adaptar `MobileView` para manejar categorías simples saltando la vista de secciones automáticamente.

  - [ ] **#T33 - Sistema de Alergenos (OBLIGATORIO para Restaurantes):**

    - **Objetivo:** Implementar gestión completa de alergenos con iconos visuales según normativas europeas.
    - **Justificación:** Es obligatorio por ley en establecimientos de restauración mostrar alergenos.
    - **Ubicación Iconos:** `public/images/allergensIcons/`
    - **Tareas Detalladas:**
      - [ ] **#T33.1 - Auditar Tablas Existentes:** Revisar y limpiar tablas `allergens` y `allergens_product` en el schema.
      - [ ] **#T33.2 - Componente Selector de Alergenos:** Crear selector visual con iconos para formularios de productos.
      - [ ] **#T33.3 - Display de Alergenos:** Mostrar iconos de alergenos en las vistas de productos (móvil y escritorio).
      - [ ] **#T33.4 - Gestión de Alergenos:** CRUD completo para gestionar lista de alergenos disponibles.
      - [ ] **#T33.5 - Integración con Menú Público:** Asegurar que alergenos se muestren correctamente en el menú del cliente final.

  - [ ] **#T34 - Precios Múltiples por Producto:**

    - **Objetivo:** Permitir productos con múltiples variantes de precio (ej: Bocadillo Grande/Mediano/Pequeño).
    - **Problema Actual:** Campo `multiple_prices` usa "S"/"N" en lugar de boolean estándar.
    - **Justificación:** Muchos productos necesitan variantes de tamaño/precio.
    - **Tareas Detalladas:**
      - [ ] **#T34.1 - Estandarizar Campo Boolean:** Migrar `multiple_prices` de VARCHAR("S"/"N") a BOOLEAN(true/false).
      - [ ] **#T34.2 - Componente Precios Múltiples:** Crear formulario para gestionar hasta 4 precios con labels personalizables.
      - [ ] **#T34.3 - Display Precios Múltiples:** Mostrar variantes de precio en vistas de productos y menú público.
      - [ ] **#T34.4 - Validación de Precios:** Asegurar que al menos price1 esté definido cuando multiple_prices es true.

  - [ ] **#T35 - Sistema Multiidioma Avanzado:**
    - **Objetivo:** Implementar sistema completo de traducciones con capacidad de auto-traducción y override manual.
    - **Justificación:** Clientes internacionales necesitan menús en múltiples idiomas.
    - **Tablas Existentes:** `languages`, `translations`, `client_languages`
    - **Tareas Detalladas:**
      - [ ] **#T35.1 - Auditar Sistema Actual:** Revisar y documentar funcionamiento de tablas de traducción existentes.
      - [ ] **#T35.2 - Auto-Traducción:** Integrar servicio de traducción automática (Google Translate API o similar).
      - [ ] **#T35.3 - Override Manual:** Permitir que clientes modifiquen traducciones automáticas específicas.
      - [ ] **#T35.4 - UI de Gestión:** Crear interfaz para gestionar idiomas activos y traducciones por cliente.
      - [ ] **#T35.5 - Selector de Idioma:** Implementar selector en menú público para cambiar idioma dinámicamente.
      - [ ] **#T35.6 - Fallback Inteligente:** Si traducción no existe, mostrar idioma principal del cliente.

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
