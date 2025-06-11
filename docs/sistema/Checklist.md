# ✅ Checklist de Desarrollo - RokaMenu

> Este documento es nuestro plan de acción. Aquí definimos y rastreamos las tareas pendientes para llevar a RokaMenu al siguiente nivel.

---

## 🗺️ Roadmap General

- [ ] **Fase 1: Personalización Avanzada del Menú**
- [ ] **Fase 2: Experiencia Móvil Superior**
- [ ] **Fase 3: Migración de Base de Datos (CANCELADA)**
- [ ] **Fase 4: Refactorización y Deuda Técnica Continua**

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
  - [x] **#T26 - Corrección de Errores Críticos (Visibilidad e Hidratación):**
    - [x] **#T26.1 - Reparar API de Visibilidad:** Se alineó el `dashboardStore` para enviar `boolean` en lugar de `number` al backend, solucionando el error 400.
    - [x] **#T26.2 - Solucionar Error de Hidratación:** Se reemplazó `ViewSwitcher` por una importación dinámica con SSR deshabilitado para `DynamicView`, eliminando el desajuste de renderizado.
  - [ ] **#T21 - Refactorización de Vista de Escritorio a Zustand:**
    - **Objetivo:** Unificar la gestión de estado de toda la aplicación, eliminando la arquitectura legada de `DashboardView.tsx` y `useDashboardState.ts` para que utilice el store central `useDashboardStore`.
    - **Tareas Detalladas:**
      - [x] **#T21.1 - Limpieza de Dependencias:** Eliminar la librería obsoleta `react-beautiful-dnd` y sus tipos.
      - [x] **#T21.2 - Extender `useDashboardStore`:** Añadir al store los estados y acciones necesarios para la vista de escritorio que actualmente faltan (ej: `selectedCategory`, `selectedSection`, `expandedCategories`, modo de reordenación, etc.).
      - [x] **#T21.3 - Refactorizar `DashboardView.tsx` (Incremental):**
        - [x] Conectar el componente al `useDashboardStore`.
      - [ ] **#T21.4 - Eliminar `useDashboardState.ts`:** Una vez que `DashboardView.tsx` y sus hijos ya no lo utilicen, eliminar el hook obsoleto.
      - [ ] **#T21.5 - Refactorizar Hijos:** Evaluar si los componentes hijos (`CategoryView`, `SectionView`) pueden consumir directamente del store en lugar de recibir todas las props desde `DashboardView`.
  - [ ] **#T15 - Revisión de `//TODO`:** Buscar en todo el código comentarios `//TODO` o `FIXME` y abordarlos.
  - [ ] **#T16 - Optimización de Hooks:** Revisar los hooks existentes para asegurar que las `queryKeys` sean consistentes y el cache se invalide correctamente.
  - [x] **#T17 - Consolidación de Tipos:** Auditar la carpeta `types` para eliminar duplicados y asegurar una única fuente de verdad para los modelos de datos. (Completado durante la auditoría de API del 18/06).
  - [ ] **#T18 - Visualizador de Imágenes (Lightbox):** Implementar un modal para ampliar las imágenes de categorías, secciones y productos al hacer clic sobre ellas. Debe funcionar en escritorio y móvil.
  - [ ] **#T19 - Optimización de Subida de Imágenes:**
    - [ ] **#T19.1 - Compresión en Cliente:** Integrar una librería para comprimir las imágenes en el navegador antes de enviarlas al servidor.
    - [ ] **#T19.2 - Validación de Tamaño:** Añadir un límite de 2MB en el cliente para los archivos de imagen antes de iniciar la subida.
  - [x] **#T20 - Migración de Estado a Zustand:** Se migró la lógica de estado de la **vista móvil** a un store central de Zustand para resolver bucles de renderizado y simplificar la arquitectura. (Completado el 18/06).
