# PLAN MAESTRO DE ROKAMENU

## Introducción

Este documento maestro sirve como centro de control y coordinación para todos los planes de implementación, optimización y refactorización del proyecto RokaMenu. Su propósito es proporcionar una visión unificada del progreso general y guiar a los desarrolladores hacia la documentación específica según sus necesidades.

## Estado Global del Proyecto (Actualizado: Abril 2024)

| Área | Progreso | Prioridad |
|------|----------|-----------|
| Corrección de Conversión de Tipos | ✅ 100% | Completado |
| Implementación de Paginación | ✅ 100% | Completado |
| Optimización de Carga Inicial | 🔄 30% | Alta |
| Limpieza de Componentes Duplicados | ✅ 90% | Completado |
| Extracción de Lógica del Dashboard | 🔄 40% | Alta |
| Reorganización de Modales | ⏳ 0% | Media |
| Optimización de Rendimiento | ⏳ 0% | Baja |
| Pruebas y Validación | ⏳ 0% | Baja |
| Corrección de Inconsistencias de Tipos en APIs | 🔄 50% | Alta |

## Documentación Principal

### 1. Planes de Implementación y Refactorización

| Documento | Propósito | Estado |
|-----------|-----------|--------|
| [`plan-implementacion.md`](plan-implementacion.md) | Plan detallado paso a paso con seguimiento de progreso | Actualizado |
| [`REFACTOR_PLAN.md`](REFACTOR_PLAN.md) | Plan específico para refactorizar el dashboard | Actualizado |
| [`optimizacion-carga-dashboard.md`](optimizacion-carga-dashboard.md) | Estrategias técnicas para optimizar el dashboard | Actualizado |

### 2. Análisis y Estructura del Proyecto

| Documento | Propósito | Estado |
|-----------|-----------|--------|
| [`componentes-analisis.md`](componentes-analisis.md) | Análisis detallado de componentes duplicados y oportunidades | Actualizado |
| [`PROJECT_STRUCTURE2.md`](PROJECT_STRUCTURE2.md) | Documentación base de la estructura del proyecto | Base |
| [`PROJECT_STRUCTURE2_ACTUALIZACION.md`](PROJECT_STRUCTURE2_ACTUALIZACION.md) | Actualización de la documentación de estructura | Actualizado |

### 3. Guías de Mejores Prácticas

| Documento | Propósito | Estado |
|-----------|-----------|--------|
| [`organizacion-hooks-librerias.md`](organizacion-hooks-librerias.md) | Guía para organizar hooks y librerías | Actualizado |
| [`docs/estandares-tipos.md`](../estandares-tipos.md) | Estándares para manejo de tipos en la aplicación | Nuevo |
| [`PARA_MI_OTRO_YO_ACTUALIZADO.md`](PARA_MI_OTRO_YO_ACTUALIZADO.md) | Contexto general y estado actual del proyecto | Actualizado |

## Documentación de Estructura del Proyecto

### PROJECT_STRUCTURE2.md - Mapa Completo del Proyecto

El documento [`PROJECT_STRUCTURE2.md`](PROJECT_STRUCTURE2.md) es el mapa definitivo del proyecto RokaMenu que incluye:

1. **Introducción para Principiantes**: Conceptos básicos de la aplicación y su arquitectura.
2. **Mapa Visual del Proyecto**: Diagrama jerárquico completo de carpetas y archivos.
3. **Explicación Detallada de Carpetas**: Descripción exhaustiva de cada directorio.
4. **Componentes del Dashboard**: Explicación de los componentes principales.
5. **Hooks Explicados**: Guía completa de hooks personalizados del proyecto.
6. **Servicios y Comunicación con API**: Detalle de cómo funciona la comunicación cliente-servidor.
7. **Contextos y Estado Global**: Explicación del sistema de estado global.
8. **Flujos de Trabajo Comunes**: Tutoriales paso a paso para tareas habituales.
9. **Guía de Solución de Problemas**: Soluciones a problemas comunes.
10. **Glosario de Términos**: Definiciones de conceptos técnicos.
11. **Detalles Técnicos**: Información sobre implementaciones específicas.
12. **Estructura de Base de Datos**: Descripción de tablas y relaciones.
13. **APIs y Endpoints**: Documentación completa de la API.
14. **Optimizaciones Implementadas y Planeadas**: Estado de las mejoras de rendimiento.

Este documento es **fundamental como punto de partida** para cualquier desarrollador que se incorpore al proyecto y debe consultarse antes de comenzar cualquier tarea significativa.

### PROJECT_STRUCTURE2_ACTUALIZACION.md - Cambios y Mejoras Recientes

Este documento complementa al anterior actualizando información sobre:

- Nuevos componentes añadidos al proyecto
- Refactorizaciones implementadas
- Optimizaciones y mejoras de rendimiento
- Nuevas características como la paginación implementada en marzo 2024
- Cambios en la estructura de API

Debe consultarse junto con `PROJECT_STRUCTURE2.md` para tener la visión más actualizada del proyecto.

## ¿Qué Documento Consultar?

### Si necesitas:

- **Entender el progreso general y próximos pasos**: 
  - Consulta este documento (`MASTER_PLAN.md`)
  - Revisa [`plan-implementacion.md`](plan-implementacion.md) para ver el seguimiento detallado

- **Trabajar en la refactorización del dashboard**:
  - Comienza con [`REFACTOR_PLAN.md`](REFACTOR_PLAN.md)
  - Complementa con [`optimizacion-carga-dashboard.md`](optimizacion-carga-dashboard.md)

- **Limpiar componentes duplicados o reorganizar módulos**:
  - Utiliza [`componentes-analisis.md`](componentes-analisis.md) como referencia
  - Sigue las tareas en [`plan-implementacion.md#fase-1`](plan-implementacion.md#fase-1-limpieza-de-componentes-duplicados)

- **Implementar nuevos hooks o funciones de utilidad**:
  - Sigue las mejores prácticas en [`organizacion-hooks-librerias.md`](organizacion-hooks-librerias.md)

- **Manejar tipos y conversiones**:
  - Consulta [`../estandares-tipos.md`](../estandares-tipos.md)

- **Entender la estructura general del proyecto**:
  - Comienza con [`PROJECT_STRUCTURE2.md`](PROJECT_STRUCTURE2.md) para la estructura base
  - Continúa con [`PROJECT_STRUCTURE2_ACTUALIZACION.md`](PROJECT_STRUCTURE2_ACTUALIZACION.md) para los cambios recientes

## Progreso Detallado por Áreas

### 1. Implementación de Paginación (✅ Completado)

- ✅ Componente de paginación reutilizable (`Pagination.tsx`)
- ✅ Estados de paginación en el dashboard para categorías, secciones y productos
- ✅ Endpoints de API con soporte de paginación
- ✅ Integración en tablas de secciones y productos

### 2. Corrección de Conversión de Tipos (✅ Completado)

- ✅ Conversión de tipos booleanos a numéricos para el campo `status` en productos
- ✅ Conversión de tipos booleanos a numéricos para el campo `status` en secciones
- ✅ Verificación de tipos para categorías (ya implementado correctamente)
- ✅ Documentación de estándares de tipos en `docs/estandares-tipos.md`

### 3. Corrección de Inconsistencias de Tipos en APIs (🔄 En progreso)

- ✅ Corrección de tipo para campo `deleted` en `app/api/products/[id]/route.ts`
- ✅ Actualización de consultas Prisma para manejar correctamente el tipo booleano de `deleted`
- ⏳ Revisar otros endpoints para detectar inconsistencias de tipos
- ⏳ Estandarizar todos los tipos utilizados en consultas Prisma
- ⏳ Documentar las correcciones para futuros desarrolladores

### 4. Optimización de Carga Inicial (🔄 En progreso)

- ✅ Eliminación de precarga agresiva de datos
- ✅ Implementación de carga bajo demanda para secciones y productos
- 🔄 Implementación de fragmentación de API para cargas parciales
- ⏳ Implementación de lazy loading para componentes pesados
- ⏳ Creación de componentes skeleton para mejorar UX

### 5. Limpieza de Componentes Duplicados (✅ 90%)

- ✅ Consolidación del componente `ProductTable.tsx`
- ✅ Eliminación de archivos de respaldo (.bak)
- ✅ Eliminación de archivo adicional `components/modals/DeleteConfirmationModal.tsx.bak`
- ✅ Eliminación de carpetas vacías (`components/previews`, `app/contexts`, `components/providers`)
- ✅ Consolidación de providers de sesión (`components/SessionProvider.tsx`)
- ✅ Consolidación del componente `CategoryForm` (`components/forms/CategoryForm.tsx`)
- ✅ Verificación de componentes de tablas (se usan las versiones en la raíz de components/)
- ✅ Decisión: Mantener componentes en `components/tables/` para futuras refactorizaciones
- ⏳ Actualización del archivo de índice de tablas (si es necesario)

### 6. Extracción de Lógica del Dashboard (🔄 40%)

- ✅ Extracción de controladores de eventos para categorías
- ✅ Extracción de controladores de eventos para secciones
- ✅ Extracción de controladores de eventos para productos
- ✅ Creación de custom hooks para gestión de estado (useCategories, useSections, useProducts)
- 🔄 Integración de hooks personalizados en el dashboard principal
- ⏳ Separación de componentes de vistas
- ⏳ Implementación de sistema de enrutamiento interno

### 7. Próximos Pasos Prioritarios

1. **Completar limpieza de componentes duplicados**:
   - ⏳ Verificar otras áreas potenciales para limpieza

2. **Continuar la extracción de lógica del dashboard (prioridad alta)**:
   - 🔄 Integrar hooks personalizados existentes (useCategories, useSections, useProducts) en el dashboard
   - ⏳ Crear componentes de vistas separados siguiendo el REFACTOR_PLAN
   - ⏳ Refactorizar página dashboard para usar los hooks y componentes nuevos

3. **Optimización de rendimiento básica**:
   - ⏳ Aplicar React.memo a componentes de tablas
   - ⏳ Implementar lazy loading para modales

## Notas de Implementación

1. **Enfoque incremental**: Implementar cambios gradualmente para minimizar riesgos.
2. **Pruebas continuas**: Verificar que cada cambio mantiene la funcionalidad existente.
3. **Actualización de documentación**: Mantener este documento y los relacionados actualizados.
4. **Control de versiones**: Crear ramas específicas para cada fase de implementación.

## Registro de Cambios Recientes

### Abril 2024
- Eliminación de 8 archivos de respaldo (.bak, .backup, etc.)
- Eliminación de carpetas vacías (`components/previews`, `app/contexts`, `components/providers`)
- Consolidación de providers de sesión (eliminado `session-provider.tsx` duplicado)
- Consolidación de CategoryForm (eliminada versión antigua en la raíz de components)
- Verificación y decisión sobre componentes de tablas (mantener las versiones en `components/tables/` por ahora)
- Verificación de funcionamiento de la aplicación después de los cambios
- Descubrimiento de hooks personalizados existentes pero no utilizados (useCategories, useSections, useProducts)
- Corrección de inconsistencias de tipos en el endpoint de productos (`app/api/products/[id]/route.ts`)
- Actualización del campo `deleted` para usar el tipo booleano correcto en consultas Prisma
- Documentación del problema y solución en `errores-soluciones.md`

---

**Nota**: Este plan maestro se actualizará regularmente para reflejar el progreso del proyecto. Los equipos de desarrollo deben consultarlo al inicio de cada sprint para alinearse con las prioridades actuales. 