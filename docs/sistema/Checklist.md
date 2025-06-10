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

### **Fase 1: Experiencia Móvil Superior**

- **Objetivo:** Asegurar que el Dashboard de gestión sea impecable en dispositivos móviles, usando un modelo de navegación "Drill-Down".
- **Tareas:**
  - [x] **#T6 - Auditoría UI/UX Móvil y Definición de Estrategia:** Se completó la auditoría inicial y se definió la estrategia de "View Switcher" y "Drill-Down".
  - [x] **#T6.1 - Crear `useIsMobile` hook:** Creado para detectar el dispositivo.
  - [x] **#T6.2 - Implementar `ViewSwitcher`:** Creado e implementado en `page.tsx` para separar la vista móvil de la de escritorio.
  - [x] **#T6.3 - Vista de Categorías Móvil:** Implementada la vista inicial en `MobileView.tsx` que carga y muestra la lista de categorías.
  - [x] **#T6.4 - Vista de Secciones Móvil:** Implementar la lógica para mostrar las secciones de una categoría seleccionada.
  - [x] **#T6.5 - Vista de Productos Móvil:** Implementar la lógica para mostrar los productos de una sección seleccionada.
  - [x] **#T7 - Rediseño de Acciones en Móvil:** Adaptar los botones de añadir/editar/eliminar a una interfaz táctil.
  - [ ] **#T8 - Componentes Responsivos:** Revisar y refactorizar componentes clave (`Modal`, `Form`) para garantizar su perfecta funcionalidad en pantallas pequeñas.
  - [ ] **#T9 - Modo de Ordenación Móvil:** Implementar una interfaz para reordenar categorías, secciones y productos en la vista móvil.

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
  - [ ] **#T15 - Revisión de `//TODO`:** Buscar en todo el código comentarios `//TODO` o `FIXME` y abordarlos.
  - [ ] **#T16 - Optimización de Hooks:** Revisar los hooks de `useQuery` y `useMutation` para asegurar que las `queryKeys` sean consistentes y el cache se invalide correctamente.
  - [ ] **#T17 - Consolidación de Tipos:** Auditar la carpeta `types` para eliminar duplicados y asegurar una única fuente de verdad para los modelos de datos.
  - [ ] **#T18 - Visualizador de Imágenes (Lightbox):** Implementar un modal para ampliar las imágenes de categorías, secciones y productos al hacer clic sobre ellas. Debe funcionar en escritorio y móvil.
  - [ ] **#T19 - Optimización de Subida de Imágenes:**
    - [ ] **#T19.1 - Compresión en Cliente:** Integrar una librería para comprimir las imágenes en el navegador antes de enviarlas al servidor.
    - [ ] **#T19.2 - Validación de Tamaño:** Añadir un límite de 2MB en el cliente para los archivos de imagen antes de iniciar la subida.
