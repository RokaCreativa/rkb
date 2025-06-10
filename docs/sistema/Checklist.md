# ✅ Checklist de Desarrollo - RokaMenu

> Este documento es nuestro plan de acción. Aquí definimos y rastreamos las tareas pendientes para llevar a RokaMenu al siguiente nivel.

---

## 🗺️ Roadmap General

- [ ] **Fase 1: Personalización Avanzada del Menú**
- [ ] **Fase 2: Experiencia Móvil Superior**
- [ ] **Fase 3: Migración de Base de Datos (MySQL a PostgreSQL)**
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

- **Objetivo:** Asegurar que tanto el Dashboard de gestión como el Menú público sean impecables en dispositivos móviles.
- **Tareas:**
  - [ ] **#T6 - Auditoría UI/UX Móvil:** Realizar una revisión completa del dashboard en vistas móviles para identificar puntos de fricción.
  - [ ] **#T7 - Rediseño de Live Preview Móvil:** Asegurar que la previsualización en vivo dentro del dashboard sea 100% fiel a cómo se verá en un teléfono real.
  - [ ] **#T8 - Componentes Responsivos:** Revisar y refactorizar componentes clave (`Table`, `Modal`, `Form`) para garantizar su perfecta funcionalidad en pantallas pequeñas.
  - [ ] **#T9 - Gestos Táctiles:** Explorar la mejora del drag-and-drop en móvil con mejor respuesta táctil.

### **Fase 3: Migración de Base de Datos (MySQL a PostgreSQL)**

- **Objetivo:** Mover la infraestructura de datos a una solución más robusta y escalable.
- **Tareas:**
  - [ ] **#T10 - Análisis del Esquema:** Mapear el esquema actual de Prisma (MySQL) a su equivalente en PostgreSQL. Identificar posibles conflictos. **(EN CURSO)**
  - [ ] **#T11 - Plan de Migración de Datos:** Definir la estrategia para exportar los datos existentes (clientes, menús, etc.) de forma segura.
  - [ ] **#T12 - Creación de Script de Migración:** Desarrollar un script (usando `pg-promise`, `node-postgres` o similar) para importar los datos a la nueva base de datos PostgreSQL.
  - [ ] **#T13 - Adaptación del Código:** Modificar el `schema.prisma` para usar el provider de PostgreSQL.
  - [ ] **#T14 - Pruebas Exhaustivas:** Realizar pruebas completas en un entorno de staging para verificar la integridad de los datos y la funcionalidad de la aplicación antes de pasar a producción.

### **Fase 4: Refactorización y Deuda Técnica Continua**

- **Objetivo:** Mantener el código sano y manetenible a largo plazo.
- **Tareas:**
  - [ ] **#T15 - Revisión de `//TODO`:** Buscar en todo el código comentarios `//TODO` o `FIXME` y abordarlos.
  - [ ] **#T16 - Optimización de Hooks:** Revisar los hooks de `useQuery` y `useMutation` para asegurar que las `queryKeys` sean consistentes y el cache se invalide correctamente.
  - [ ] **#T17 - Consolidación de Tipos:** Auditar la carpeta `types` para eliminar duplicados y asegurar una única fuente de verdad para los modelos de datos.
