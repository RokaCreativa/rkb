# TRANSFERENCIA DE CONOCIMIENTO: PROYECTO ROKAMENU

## 1. CONTEXTO GENERAL DEL PROYECTO

### 1.1 Descripción del Proyecto

RokaMenu es una plataforma web desarrollada con Next.js que permite a restaurantes y otros negocios crear y gestionar menús digitales accesibles mediante códigos QR. La plataforma permite a los clientes:

- Crear y gestionar menús digitales organizados en categorías y secciones
- Gestionar productos con información detallada (nombre, descripción, precio, imágenes)
- Configurar opciones de visualización y personalización
- Obtener códigos QR para acceso directo a los menús
- Visualizar datos de uso y acceso a los menús

La arquitectura principal se basa en:
- **Frontend**: Next.js 13+, React 18+, TailwindCSS
- **Backend**: API Routes de Next.js
- **Base de datos**: MySQL con Prisma ORM
- **Estado**: Combinación de React Context, useState y custom hooks

### 1.2 Estado Actual del Proyecto

El proyecto ha pasado por varias fases de refactorización:

1. **Fase inicial**: El proyecto tenía una estructura monolítica con componentes grandes y acoplados
2. **Mejoras parciales**: Se han implementado algunas optimizaciones (paginación, carga diferida)
3. **Refactorización en progreso**: Estamos migrando hacia una arquitectura más modular

Actualmente nos enfocamos en resolver la **integración del hook useCategories** para centralizar la lógica de gestión de categorías y reducir la complejidad del dashboard principal.

## 2. ESTRUCTURA TÉCNICA RELEVANTE

### 2.1 Componentes Principales

- `app/dashboard/page.tsx`: Componente principal del dashboard (>1800 líneas)
- `app/hooks/useCategories.tsx`: Hook personalizado para la gestión de categorías
- `components/CategoryTable.tsx`: Tabla para visualizar y gestionar categorías
- `app/dashboard/components/modals`: Modales para crear/editar/eliminar elementos
- `lib/handlers`: Controladores de eventos extraídos del dashboard principal

### 2.2 Flujo de Datos

1. El dashboard (`page.tsx`) carga datos de categorías desde la API
2. Las acciones del usuario (crear, editar, eliminar, reordenar) se gestionan en controladores
3. Los controladores llaman a servicios que interactúan con la API
4. La API actualiza la base de datos y devuelve resultados
5. El estado del dashboard se actualiza para reflejar los cambios

### 2.3 Estado Global vs Local

Actualmente hay una mezcla de:
- **Estado local**: Manejado con useState en el dashboard
- **Hooks personalizados**: Como useCategories, que encapsulan lógica específica
- **Estado compartido**: Algunos componentes utilizan contextos para compartir datos

## 3. PROBLEMAS IDENTIFICADOS CON EL HOOK USECATEGORIES

### 3.1 Problema Principal

Al intentar integrar el hook useCategories en el dashboard, encontramos inconsistencias en:

1. **Tipos incompatibles**: Los tipos de Category entre lib/types y app/types no son compatibles
2. **Referencias cruzadas**: El hook espera un formato diferente para algunas funciones
3. **Manejo de estado**: El dashboard utiliza un enfoque distinto para gestionar el estado

### 3.2 Conflictos Específicos

- **Tipos de datos**: 
  - En `useCategories`, se maneja `status` como boolean
  - En el dashboard, se maneja `status` como número (0/1)
  - Similar conflicto con el campo `deleted`

- **Estados compartidos**:
  - `expandedCategories` se maneja diferente en ambos lugares
  - El hook usa su propio sistema de carga (`isLoadingCategories`)
  - El dashboard tiene sistemas propios de carga y actualización

- **Referencias a componentes**:
  - Algunos componentes como `EditCategoryModal` están acoplados al estado actual

### 3.3 Soluciones Implementadas

- **Adaptadores de Funciones**:
  - Se implementó exitosamente `adaptReorderCategory` para reordenar categorías
  - Se implementó exitosamente `adaptToggleCategoryVisibility` para cambiar la visibilidad
  - Los adaptadores gestionan correctamente las diferencias de tipos y parámetros

- **Corrección de Rutas API**:
  - Se corrigió la ruta utilizada en `toggleCategoryVisibility` (de `/api/clients/${clientId}/categories/${categoryId}` a `/api/categories/${categoryId}`)
  - Se corrigió la ruta utilizada en `fetchCategories` (de `/api/clients/${clientId}/categories` a `/api/categories`)
  - Estas correcciones resolvieron errores HTTP 405 (Method Not Allowed) y 404 (Not Found)

- **Actualización en Tiempo Real**:
  - Se mejoró el adaptador `adaptToggleCategoryVisibility` para actualizar explícitamente el estado del dashboard
  - Esta mejora evita la necesidad de recargar la página para ver los cambios de visibilidad

## 4. PLAN DE INTEGRACIÓN DETALLADO

### Fase 1: Preparación y Análisis

#### 1.1 Unificar tipos
1. **Realizar análisis detallado de tipos**: Comparar las interfaces de `Category` en `lib/types` y `app/types`
   - Verificar campos obligatorios
   - Identificar discrepancias en tipos de campos
   - Documentar diferencias para transformación

2. **Crear tipos intermedios adaptadores**: 
   ```typescript
   // lib/adapters/category-adapter.ts
   export function adaptApiCategoryToDashboard(category: ApiCategory): DashboardCategory {
     return {
       // Mappings específicos
       category_id: category.category_id,
       name: category.name,
       // Conversión de tipos
       status: category.status ? 1 : 0,
       // ...otros campos
     };
   }
   
   export function adaptDashboardCategoryToApi(category: DashboardCategory): ApiCategory {
     return {
       // Mappings inversos
       category_id: category.category_id,
       name: category.name,
       // Conversión de tipos
       status: category.status === 1,
       // ...otros campos
     };
   }
   ```

3. **Documentar el modelo de datos**:
   - Actualizar `estandares-tipos.md` con las nuevas conversiones
   - Especificar claramente qué tipo se usa en cada capa de la aplicación

#### 1.2 Crear Adaptadores de Funciones

1. **Analizar las firmas de funciones**:
   - Comparar firmas de funciones entre el dashboard y el hook
   - Identificar parámetros incompatibles
   - Documentar expectativas de cada función

2. **Crear wrappers de adaptación**:
   ```typescript
   // lib/adapters/category-functions-adapter.ts
   export function adaptToggleCategoryVisibility(
     toggleFromHook: (id: number, status: boolean) => Promise<void>,
   ) {
     return async (id: number, status: number) => {
       // Convertir de numérico a booleano para el hook
       return toggleFromHook(id, status === 1);
     };
   }
   ```

3. **Validar comportamiento**:
   - Verificar que las funciones adaptadas producen el mismo resultado
   - Documentar diferencias de comportamiento

### Fase 2: Integración Parcial

#### 2.1 Integrar solo lectura primero

1. **Añadir hook manteniendo estado local**:
   ```typescript
   // En app/dashboard/page.tsx
   
   // Estado local existente
   const [categories, setCategories] = useState<Category[]>([]);
   
   // Añadir hook pero no usar su estado directamente
   const {
     categories: hookCategories,
     isLoadingCategories,
     fetchCategories: fetchCategoriesFromHook,
     // Otras funciones...
   } = useCategories(client?.id || null);
   
   // Sincronizar estados con useEffect
   useEffect(() => {
     if (hookCategories && hookCategories.length > 0) {
       // Usar el adaptador para convertir tipos
       const adaptedCategories = hookCategories.map(adaptApiCategoryToDashboard);
       setCategories(adaptedCategories);
     }
   }, [hookCategories]);
   ```

2. **Integrar indicadores de carga**:
   ```typescript
   // Combinar indicadores de carga
   const isLoadingCategoriesAny = isLoading || isLoadingCategories;
   
   // Usar en la UI
   {isLoadingCategoriesAny && <LoadingSpinner />}
   ```

3. **Verificar visualización correcta**:
   - Comprobar que las categorías se muestran correctamente
   - Validar que los contadores y metadatos funcionan
   - Asegurar que la expansión/colapso funciona adecuadamente

#### 2.2 Reemplazar funciones una por una

1. **Sustituir fetchCategories primero**:
   ```typescript
   // Cambiar la implementación de fetchCategories
   const fetchCategories = async (paginationOptions = null) => {
     try {
       setIsLoading(true);
       
       // Usar la función del hook
       await fetchCategoriesFromHook(paginationOptions);
       
       // El efecto anterior actualizará el estado local
       
       setIsLoading(false);
     } catch (error) {
       console.error('Error al cargar categorías:', error);
       toast.error('No se pudieron cargar las categorías');
       setIsLoading(false);
     }
   };
   ```

2. **Reemplazar toggleCategoryVisibility**:
   - Adaptar y probar la función 
   - Actualizar referencias en el código
   - Verificar funcionamiento correcto

3. **Continuar con reorderCategory**:
   - Adaptar lógica de reordenamiento
   - Probar con interacciones de drag and drop
   - Verificar el orden correcto en la UI

4. **Finalmente integrar deleteCategory**:
   - Esta es la más compleja por la gestión de modales
   - Adaptar cuidadosamente preservando la UX
   - Verificar mensajes de confirmación y éxito

### Fase 3: Migración Completa

#### 3.1 Eliminar Estados Duplicados

1. **Transición gradual a estados del hook**:
   ```typescript
   // Eliminar estado local de categories
   // const [categories, setCategories] = useState<Category[]>([]);
   
   // Usar directamente el estado del hook
   const {
     categories,
     isLoadingCategories,
     expandedCategories,
     isUpdatingVisibility,
     // Otras propiedades y funciones...
   } = useCategories(client?.id || null);
   
   // Adaptar referencias en el código
   ```

2. **Refactorizar expandedCategories**:
   - Migrar la lógica de expandir/colapsar categorías
   - Actualizar interacciones de usuario
   - Verificar comportamiento de carga bajo demanda

3. **Unificar indicadores de carga**:
   - Eliminar estados duplicados de carga
   - Usar consistentemente los indicadores del hook
   - Actualizar visualización de estados de carga

#### 3.2 Adaptar Componentes Secundarios

1. **Modificar EditCategoryModal**:
   ```typescript
   <EditCategoryModal
     isOpen={isEditModalOpen}
     onClose={() => setIsEditModalOpen(false)}
     categoryToEdit={editingCategory}
     client={client}
     // En lugar de setCategories, usar updateCategory del hook
     onSuccess={() => {
       // Usar la función del hook para recargar
       fetchCategoriesFromHook(categoryPagination);
     }}
   />
   ```

2. **Adaptar DeleteCategoryConfirmation**:
   - Actualizar para usar la función deleteCategory del hook
   - Verificar comportamiento de confirmación
   - Validar la actualización correcta de la UI

## 5. CONSIDERACIONES IMPORTANTES

### 5.1 Manejo de Errores

- Preservar el manejo de errores existente
- Implementar tratamiento consistente de errores
- Asegurar que los errores se muestran correctamente al usuario

### 5.2 Mantenimiento de Referencias

- Algunas partes del código dependen de la estructura actual
- Actualizar todas las referencias a `categories` y funciones relacionadas
- Revisar efectos secundarios que dependen del estado de categorías

### 5.3 Rendimiento

- Evitar llamadas API duplicadas durante la transición
- Mantener el soporte de paginación
- Preservar las optimizaciones existentes

### 5.4 UX Durante la Transición

- Mantener consistencia en la experiencia de usuario
- Preservar estados de expansión/colapso
- Asegurar que la carga de datos es eficiente

## 6. PRUEBAS Y VALIDACIÓN

### 6.1 Pruebas Manuales

- **Creación de categorías**: Verificar que se crean correctamente y aparecen en la UI
- **Edición de categorías**: Comprobar que los cambios se guardan y reflejan
- **Eliminación de categorías**: Validar eliminación y actualización de la UI
- **Reordenamiento**: Asegurar que el drag & drop funciona según lo esperado
- **Visibilidad**: Comprobar que los toggles de visibilidad funcionan correctamente
- **Cargas iniciales**: Verificar que las categorías se cargan inicialmente
- **Paginación**: Asegurar que la paginación funciona con el nuevo enfoque

### 6.2 Casos Borde

- **Categorías vacías**: Verificar comportamiento cuando no hay categorías
- **Errores de API**: Comprobar manejo de errores en llamadas API
- **Límites de paginación**: Probar con diferentes tamaños de página
- **Categorías muy extensas**: Verificar rendimiento con muchas categorías
- **Nombres largos**: Comprobar visualización con nombres extensos

## 7. DOCUMENTACIÓN NECESARIA

### 7.1 Actualizar estandares-tipos.md

Añadir una sección específica sobre la integración del hook useCategories:

```markdown
## Integración del hook useCategories

El hook useCategories (ubicado en app/hooks/useCategories.tsx) provee una gestión centralizada de las categorías del cliente. Al integrarlo con el dashboard, se deben tener en cuenta las siguientes consideraciones:

### Tipos de datos

| Campo | En hook useCategories | En dashboard | Conversión necesaria |
|-------|----------------------|--------------|----------------------|
| status | boolean (true/false) | number (1/0) | status ? 1 : 0 (hook → dashboard) <br> status === 1 (dashboard → hook) |
| deleted | boolean (true/false) | number (1/0) | deleted ? 1 : 0 (hook → dashboard) <br> deleted === 1 (dashboard → hook) |

### Funciones principales

- `fetchCategories`: Carga categorías desde la API
- `toggleCategoryVisibility`: Actualiza visibilidad de una categoría
- `reorderCategory`: Reordena categorías mediante drag & drop
- `deleteCategory`: Elimina una categoría
- `toggleCategoryExpansion`: Expande/colapsa una categoría en la UI

### Proceso de integración

Se recomienda un enfoque gradual:
1. Añadir el hook manteniendo el estado local
2. Sincronizar estados con useEffect
3. Reemplazar funciones una por una
4. Eliminar estados duplicados gradualmente
5. Adaptar componentes secundarios al nuevo flujo
```

### 7.2 Actualizar plan-implementacion.md

Añadir una sección sobre la integración del hook:

```markdown
## Integración del hook useCategories

### Fase 1: Preparación ✅
- [x] Unificar tipos entre lib/types y app/types
- [x] Crear adaptadores para conversión de tipos
- [x] Desarrollar adaptadores para funciones

### Fase 2: Integración parcial 🟡
- [x] Añadir hook manteniendo estados locales
- [x] Sincronizar estados con useEffect
- [x] Reemplazar fetchCategories
- [x] Reemplazar toggleCategoryVisibility
- [x] Reemplazar reorderCategory
- [ ] Reemplazar deleteCategory

### Fase 3: Migración completa ⬜
- [ ] Eliminar estado local de categories
- [ ] Refactorizar expandedCategories
- [ ] Unificar indicadores de carga
- [ ] Adaptar EditCategoryModal
- [ ] Adaptar DeleteCategoryConfirmation
```

## 8. ERRORES COMUNES A EVITAR

1. **No usar TypeScript correctamente**:
   - Evita `as any` a menos que sea absolutamente necesario
   - Define interfaces claras para todos los tipos
   - Usa tipos específicos en lugar de genéricos cuando sea posible

2. **Romper la paginación**:
   - La paginación es crítica para el rendimiento
   - Asegúrate de que el hook soporte los mismos parámetros de paginación
   - Preserva los controles de paginación en la UI

3. **Estados de carga incorrectos**:
   - Mantén indicadores de carga visibles durante operaciones
   - No bloquees la UI innecesariamente
   - Proporciona feedback adecuado al usuario

4. **Inconsistencias en manejo de errores**:
   - Usa toast para notificaciones de error
   - Asegúrate de manejar todos los errores de API
   - Proporciona mensajes claros al usuario

5. **Duplicar código**:
   - Reutiliza las funciones del hook, no las dupliques
   - Crea adaptadores si es necesario, pero no reimplementes lógica
   - Utiliza helpers existentes para tareas comunes

## 9. CONSEJOS PARA FACILITAR LA INTEGRACIÓN

1. **Trabaja en una rama separada**:
   - Crea una rama específica para la integración del hook
   - Haz commits pequeños y frecuentes
   - Documenta cada cambio significativo

2. **Adopta un enfoque incremental**:
   - Implementa y prueba un cambio a la vez
   - No intentes migrar todo de una vez
   - Verifica la funcionalidad después de cada cambio

3. **Mantén el código existente**:
   - No elimines funciones hasta asegurarte que su reemplazo funciona
   - Usa técnicas de feature flag si es necesario
   - Mantén rutas de retorno si algo no funciona

4. **Usa el patrón adaptador**:
   - Crea adaptadores para manejar diferencias de tipos
   - Implementa wrappers para funciones incompatibles
   - Documenta claramente la conversión de datos

5. **Prioriza la experiencia de usuario**:
   - Asegúrate de que la UI responde adecuadamente
   - Mantén los indicadores de carga
   - Preserva la navegación y experiencia existente

## 10. RECURSOS ADICIONALES

### 10.1 Archivos a Consultar

- `docs/MASTER_PLAN.md`: Plan maestro del proyecto
- `docs/estandares-tipos.md`: Estándares de tipos en el proyecto
- `docs/componentes-analisis.md`: Análisis de componentes duplicados
- `docs/optimizacion-carga-dashboard.md`: Estrategias de optimización
- `docs/REFACTOR_PLAN.md`: Plan detallado de refactorización

### 10.2 Hooks y Funciones Relevantes

- `app/hooks/useCategories.tsx`: Hook principal a integrar
- `lib/handlers/categoryEventHandlers.ts`: Controladores extraídos
- `app/dashboard/services/dashboardService.ts`: Servicios de API

### 10.3 Componentes a Modificar

- `app/dashboard/page.tsx`: Componente principal
- `components/CategoryTable.tsx`: Tabla de categorías
- `app/dashboard/components/modals/EditCategoryModal.tsx`: Modal de edición
- `app/dashboard/components/modals/DeleteCategoryConfirmation.tsx`: Modal de eliminación

## 11. CONCLUSIÓN

La integración del hook useCategories representa un paso importante hacia la modularidad del proyecto RokaMenu. Siguiendo este plan detallado, podemos lograr una integración exitosa que mejore la mantenibilidad y rendimiento de la aplicación.

Recuerda que el enfoque debe ser gradual, priorizando la estabilidad y experiencia del usuario en todo momento. Con cada paso, nos acercamos a una arquitectura más robusta y sostenible para el proyecto.

## 12. LECCIONES APRENDIDAS

Durante el proceso de integración del hook useCategories, hemos identificado varias lecciones importantes:

### 12.1 Importancia de Probar Durante el Desarrollo

- **Pruebas Incrementales**: Probar cada funcionalidad inmediatamente después de implementarla fue crucial para detectar errores temprano
- **Verificación Visual**: Confirmar que los cambios de UI funcionan correctamente desde la perspectiva del usuario
- **Revisión de Consola**: Monitorear errores en la consola del navegador para identificar problemas no visibles en la UI

### 12.2 Patrones de Adaptación Efectivos

- **Adaptadores de Función**: El patrón adaptador demostró ser una solución elegante para manejar las diferencias de implementación
- **Actualización de Estado Explícita**: Es necesario actualizar explícitamente ambos estados (hook y dashboard) para evitar inconsistencias
- **Manejo de Errores con Fallback**: Implementar fallbacks para los casos donde los adaptadores fallen mejora la robustez

### 12.3 Rutas de API y Consistencia

- **Consistencia de Endpoints**: Identificamos inconsistencias en las rutas API que causaban errores 404 y 405
- **Documentación de Rutas**: La falta de documentación de las rutas API causó confusión durante la integración
- **Verificación de Respuestas**: Es crucial verificar las respuestas de la API para asegurar que los datos están en el formato esperado

Estas lecciones serán valiosas para futuras fases de integración y refactorización del proyecto RokaMenu.

---

**Este documento es parte de la documentación técnica del proyecto RokaMenu y debe actualizarse conforme avance la implementación.** 