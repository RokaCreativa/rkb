# Paso 1: Separación de Lógica

## Objetivo

Separar la lógica de negocio y llamadas a API del componente DashboardPage, creando o extendiendo servicios y hooks personalizados para reducir la complejidad del componente principal.

## Estado Actual

* `DashboardPage` tiene más de 2000 líneas y mezcla:
  * Funciones de API directas (fetchCategories, fetchSections, etc.)
  * Lógica de negocio (transformaciones, filtrados, etc.)
  * Manejo de estados y efectos
  * UI y renderizado

* Ya existen algunos servicios y hooks que podemos utilizar:
  * `DashboardService` en `lib/services/dashboardService.ts` 
  * `useDashboardService` en `lib/hooks/dashboard/useDashboardService.ts`

## Plan de Implementación

### 1. Completar el Servicio de API

Revisar `DashboardService` para asegurar que todas las funciones de API del dashboard estén implementadas:

* Gestión de categorías
* Gestión de secciones 
* Gestión de productos
* Gestión de clientes

### 2. Separar la Lógica en Hooks Específicos

Crear los siguientes hooks personalizados:

1. **useCategoryManagement.ts**
   * Gestión del estado de categorías
   * Funciones para crear, editar, eliminar, reordenar categorías
   * Manejo de visibilidad de categorías

2. **useSectionManagement.ts**
   * Gestión del estado de secciones por categoría
   * Funciones para crear, editar, eliminar, reordenar secciones
   * Manejo de visibilidad de secciones

3. **useProductManagement.ts**
   * Gestión del estado de productos por sección
   * Funciones para crear, editar, eliminar, reordenar productos
   * Manejo de visibilidad de productos

4. **useDashboardState.ts**
   * Gestión de la UI del dashboard (vistas, selecciones, modales)
   * Estado de navegación y breadcrumbs

### 3. Refactorizar DashboardPage

Modificar el componente DashboardPage para:

1. Eliminar funciones de API directas y usar DashboardService
2. Reemplazar lógica repetitiva con los hooks personalizados
3. Mantener solo el código específico para coordinación y UI

## Beneficios Inmediatos

* Reducción del tamaño del componente DashboardPage
* Mejor organización y mantenibilidad del código
* Prevención de duplicación y errores
* Base para futura extracción de componentes

## Próximos Pasos Después de Completar

Una vez separada la lógica, será más fácil:
* Extraer subcomponentes del DashboardPage
* Implementar un sistema de gestión de estado global si es necesario
* Agregar nuevas funcionalidades de forma aislada 