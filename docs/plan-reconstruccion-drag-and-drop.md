# 📝 Plan de Reconstrucción: Sistema de Drag and Drop

## 📋 Resumen Ejecutivo

**Objetivo**: Reconstruir completamente el sistema de drag and drop en el dashboard-v2, implementando un enfoque modular y progresivo para cada nivel jerárquico (categorías → secciones → productos).

**Contexto**: Actualmente existen problemas con la implementación del drag and drop, con múltiples hooks, implementaciones inconsistentes y conflictos de tipos que han causado bugs difíciles de resolver.

**Enfoque**: Eliminar todos los hooks de drag and drop existentes y crear una implementación limpia y simple, siguiendo estrictamente los mandamientos del proyecto y respetando la estructura DDD existente.

## 🧐 Análisis de la Situación Actual

### Problemas Identificados

1. **Duplicidad de implementación**:

   - `hooks/core/useDragAndDrop.ts` - Versión más antigua (última actualización 2024-04-21)
   - `hooks/ui/useDragAndDrop.ts` - Versión más reciente (última actualización 2024-06-20)

2. **Implementación fragmentada**: Código disperso en múltiples componentes con enfoques inconsistentes.

3. **Manipulación inconsistente de eventos**: Diferentes aproximaciones para `stopPropagation`, `preventDefault`, etc.

4. **Complejidad en adaptación de tipos**: Múltiples conversiones entre sistemas de tipos (Menu vs Domain).

5. **Estados redundantes**: Uso de múltiples estados para el mismo propósito (`isReorderModeActive`, `isDragging`).

### Análisis de Dependencias

**Importaciones y Uso Actual**:

- DashboardView.tsx importa desde `hooks/ui/useDragAndDrop.ts` (el correcto según mandamientos)
- La importación se utiliza en línea 696-704:

```typescript
const {
  isReorderModeActive,
  setIsReorderModeActive,
  isDragging,
  setIsDragging,
  handleGlobalDragEnd,
  handleReorderCategories,
  handleReorderSections,
  handleReorderProducts
} = useDragAndDrop(...)
```

- DragDropContext está envolviendo el contenido principal en línea 780:

```typescript
<DragDropContext onDragEnd={handleGlobalDragEnd}>
  <div className="container mx-auto px-4 py-6 flex-1">{/* Contenido */}</div>
</DragDropContext>
```

- TopNavbar recibe `isReorderModeActive` y una función para toggle en línea 742-745:

```typescript
<TopNavbar
  clientLogo={client?.main_logo || null}
  clientName={client?.name || "Dashboard"}
  isReorderModeActive={isReorderModeActive}
  onToggleReorderMode={() => setIsReorderModeActive((prev) => !prev)}
/>
```

### Archivos Principales Involucrados

| Archivo           | Ubicación                     | Función                                                       |
| ----------------- | ----------------------------- | ------------------------------------------------------------- |
| useDragAndDrop.ts | hooks/ui/                     | Hook principal para la funcionalidad drag and drop (CORRECTO) |
| useDragAndDrop.ts | hooks/core/                   | Hook alternativo/duplicado (RENOMBRADO A .old.ts)             |
| DashboardView.tsx | components/core/              | Implementación de DragDropContext                             |
| CategoryTable.tsx | components/domain/categories/ | Implementación Draggable para categorías                      |
| SectionList.tsx   | components/domain/sections/   | Implementación Draggable para secciones                       |
| ProductList.tsx   | components/domain/products/   | Implementación Draggable para productos                       |

## 🚀 Plan de Reconstrucción

### Fase 1: Limpieza y Preparación

1. **Documentar la Implementación Actual**

   - [x] Analizar los hooks de drag and drop existentes
   - [x] Mapear cómo se utilizan en componentes
   - [x] Identificar dependencias y puntos de integración

2. **Eliminar Implementación Duplicada**
   - [x] Eliminar o renombrar `hooks/core/useDragAndDrop.ts` para evitar confusiones
   - [x] Verificar que no haya otros componentes usando la versión incorrecta del hook
   - [x] Limpiar cualquier referencia restante al hook eliminado

### Fase 2: Reconstrucción para Categorías

1. **Implementar Hook Base**

   - [x] Limpiar `hooks/ui/useDragAndDrop.ts` de código innecesario
   - [x] Implementar función para reordenar categorías
   - [x] Simplificar la detección del tipo de arrastre
   - [x] Asegurar compatibilidad de tipos sin usar "as any"

2. **Actualizar CategoryTable**
   - [x] Simplificar implementación de Draggable
   - [x] Asegurar manejo correcto de eventos
   - [x] Verificar integración con estilos visuales
   - [ ] Probar exhaustivamente

### Fase 3: Reconstrucción para Secciones

1. **Extender Hook Básico**

   - [x] Agregar función para reordenar secciones
   - [x] Manejar correctamente IDs de categoría en droppableId

2. **Actualizar SectionList**
   - [x] Simplificar implementación de Draggable
   - [x] Estandarizar formato de droppableId ("category-{id}")
   - [x] Verificar integración con el sistema visual
   - [ ] Probar exhaustivamente

### Fase 4: Reconstrucción para Productos

1. **Completar Hook**

   - [x] Agregar función para reordenar productos
   - [x] Manejar correctamente IDs de sección en droppableId

2. **Actualizar ProductList**
   - [x] Simplificar implementación de Draggable
   - [x] Estandarizar formato de droppableId ("section-{id}")
   - [x] Verificar integración con el sistema visual
   - [ ] Probar exhaustivamente

### Fase 5: Integración y Pruebas

1. **Integración Global**

   - [x] Validar funcionamiento de DragDropContext en DashboardView
   - [ ] Verificar interacción entre todos los niveles

2. **Optimizaciones**

   - [x] Implementar feedback visual mejorado durante el arrastre
   - [x] Añadir mensajes informativos sobre el modo de reordenación

3. **Pruebas de regresión**
   - [ ] Verificar que no se han introducido nuevos bugs
   - [ ] Comprobar rendimiento
   - [ ] Validar experiencia de usuario

## 🧩 Principios de Implementación

Siguiendo estrictamente los mandamientos del proyecto:

1. **No crear nada nuevo si ya existe**

   - Reutilizar tipos, componentes y utilidades existentes
   - No duplicar funcionalidad

2. **Separar función de estética**

   - El hook debe gestionar solo la lógica de reordenamiento
   - Los componentes se encargan de la representación visual

3. **Respetar la estructura DDD**

   - hooks/ui/ para la interacción drag and drop (es UI, no lógica de negocio)
   - Componentes en sus respectivas carpetas de dominio

4. **Adaptadores de tipos controlados**
   - Usar los type-adapters existentes para conversiones entre sistemas de tipos
   - No introducir conversiones de tipos adicionales directamente en componentes

## 📊 Estado de Progreso

| Fase | Componente  | Estado         | Observaciones                                                 |
| ---- | ----------- | -------------- | ------------------------------------------------------------- |
| 1    | Limpieza    | ✅ Completado  | Hook duplicado renombrado y verificado que no hay referencias |
| 2    | Categorías  | ✅ Completado  | Hook y componente CategoryTable reconstruidos                 |
| 3    | Secciones   | ✅ Completado  | Componente SectionList reconstruido con formato estandarizado |
| 4    | Productos   | ✅ Completado  | Componente ProductList actualizado con patrón consistente     |
| 5    | Integración | 🟡 En progreso | Validado Context en DashboardView. Pendientes: pruebas        |

## 📚 Referencias

- Biblioteca: `@hello-pangea/dnd`
- [Documentación oficial de hello-pangea/dnd](https://github.com/hello-pangea/dnd)
- [Mandamientos del proyecto](dashboard-v2-estructura-y-mandamientos.md)

## 🔍 Consideraciones Especiales

1. **Rendimiento**: Minimizar re-renderizados usando React.memo y useCallback.
2. **Accesibilidad**: Mantener atributos aria-\* para elementos arrastables.
3. **Feedback visual**: Asegurar que los usuarios entiendan cuando el modo reordenamiento está activo.
4. **Manejo de errores**: Implementar recuperación elegante ante fallos en la reordenación.

## 📝 Cambios Realizados

### Fase 1: Limpieza

- ✅ Documentado el estado actual y las dependencias
- ✅ Renombrado useDragAndDrop.ts en hooks/core/ a useDragAndDrop.old.ts
- ✅ Verificado que no hay componentes utilizando el hook incorrecto

### Fase 2: Reconstrucción para Categorías

- ✅ Simplificado el hook useDragAndDrop.ts en hooks/ui/
- ✅ Mejorada la tipificación para evitar el uso de "as any"
- ✅ Implementadas funciones de reordenamiento para categorías
- ✅ Actualizado CategoryTable con mejor integración de Draggable
- ✅ Estandarizado formato de IDs (category-{id})
- ✅ Mejorado feedback visual durante arrastre en modo reordenamiento
- ✅ Ajustada interacción para prevenir conflictos (click vs. drag)

### Fase 3: Reconstrucción para Secciones

- ✅ Implementada funcionalidad de reordenamiento de secciones en el hook
- ✅ Estandarizado el formato de IDs (section-{id}) en SectionList
- ✅ Simplificado el componente SectionList eliminando código complejo
- ✅ Mejorado manejo de eventos para prevenir conflictos
- ✅ Unificado el estilo visual con el resto de la aplicación

### Fase 4: Reconstrucción para Productos

- ✅ Implementada funcionalidad de reordenamiento de productos en el hook
- ✅ Corregido el manejo de tipos en precio de productos (string vs number)
- ✅ Actualizado ProductList y ProductListItem con implementación simplificada
- ✅ Estandarizado formato de IDs (product-{id})
- ✅ Eliminados logs de depuración y código innecesario
- ✅ Mejorado feedback visual para productos durante arrastre

### Fase 5: Integración y Pruebas

- ✅ Validado el DragDropContext global en DashboardView
- ✅ Asegurada la coherencia en tipos (CATEGORY, SECTION, PRODUCT)
- ✅ Mejorada la visualización de elementos ocultos (secciones/productos)
- ⏳ Pendientes pruebas y validación de experiencia de usuario

---

**IMPORTANTE**:

- Seguir rigurosamente el patrón DDD y la estructura existente.
- No crear nuevos componentes o hooks si ya existen.
- Documentar cada cambio en este archivo.
- Probar exhaustivamente cada fase antes de pasar a la siguiente.
