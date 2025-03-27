# Plan de Refactorización del Dashboard

## Diagnóstico

El archivo `app/dashboard/page.tsx` actual tiene más de 1800 líneas de código y múltiples responsabilidades:

1. Gestión de estado para categorías, secciones y productos
2. Llamadas a APIs y manejo de datos
3. Lógica de navegación entre vistas 
4. Implementación de interacciones de usuario (reordenamiento, edición, eliminación)
5. Lógica de renderizado de componentes y UI

Este nivel de complejidad hace que el código sea difícil de mantener, propenso a errores y menos eficiente.

## Estrategia General

Refactorizar el código gradualmente, manteniendo la compatibilidad y funcionalidad existente en cada paso.

## Plan en Fases

### Fase 1: Extraer Controladores de Eventos ✅

- [x] Crear directorio `lib/handlers/` para controladores
- [x] Extraer controladores para categorías en `categoryEventHandlers.ts`
- [x] Extraer controladores para secciones en `sectionEventHandlers.ts`
- [x] Extraer controladores para productos en `productEventHandlers.ts`
- [ ] Actualizar el archivo principal para importar y usar estos controladores

**Beneficios**:
- Reduce inmediatamente el tamaño del archivo principal
- Agrupa lógica relacionada
- Mejora la reutilización de código

### Fase 2: Separar Componentes de Vistas

- [ ] Crear directorio `app/dashboard/views/`
- [ ] Extraer vista de categorías en `CategoriesView.tsx`
- [ ] Extraer vista de secciones en `SectionsView.tsx`
- [ ] Extraer vista de productos en `ProductsView.tsx`
- [ ] Convertir `page.tsx` en un orquestador simple de estas vistas

**Beneficios**:
- Separa la lógica de renderizado por contexto
- Facilita el mantenimiento de cada vista individual
- Mejora la claridad del código

### Fase 3: Implementar Enrutamiento Interno

- [ ] Crear sistema de enrutamiento entre vistas con estados
- [ ] Actualizar la navegación entre vistas
- [ ] Refactorizar breadcrumbs para usar este sistema

**Beneficios**:
- Estructura más clara y mantenible
- Mejor manejo de la navegación
- Mayor alineamiento con patrones de React

### Fase 4: Extraer Lógica de Datos

- [ ] Crear servicios específicos para cada entidad (expandir servicios existentes)
- [ ] Implementar hooks personalizados para cada vista
- [ ] Centralizar manejo de errores y estados de carga

**Beneficios**:
- Separación clara entre lógica de datos y UI
- Mejor reutilización de código
- Facilita pruebas unitarias

### Fase 5: Implementar Gestión de Estado Global

- [ ] Evaluar necesidades de estado global vs. local
- [ ] Implementar un sistema basado en Context API para estados compartidos
- [ ] Migrar estados relevantes al nuevo sistema

**Beneficios**:
- Reduce prop drilling
- Facilita compartir datos entre componentes
- Mejora rendimiento al evitar re-renders innecesarios

### Fase 6: Optimizar la Carga Inicial de Datos

- [ ] Implementar estrategia de carga perezosa (lazy loading)
- [ ] Cargar solo las categorías inicialmente (con paginación)
- [ ] Cargar secciones solo cuando se expande una categoría
- [ ] Cargar productos solo cuando se expande una sección
- [ ] Implementar un sistema de caché para datos ya cargados
- [ ] Agregar indicadores visuales de carga para mejorar UX

**Beneficios**:
- Reducción dramática del tiempo de carga inicial
- Menor consumo de recursos del servidor
- Mejor experiencia de usuario con feedback visual
- Mayor escalabilidad para clientes con muchos productos

## Progreso Actual

- **Completado**: 
  - Mejora de documentación del código
  - Extracción de interfaces de tipos a `lib/types/index.ts`
  - Extracción de controladores de eventos para categorías
  - Extracción de controladores de eventos para secciones
  - Extracción de controladores de eventos para productos

- **Próximos pasos**:
  - Actualizar `page.tsx` para usar controladores externos
  - Comenzar separación de componentes de vistas

## Consideraciones

1. **Enfoque gradual**: Realizar cambios incrementales para facilitar pruebas y revisión.
2. **Compatibilidad**: Mantener la funcionalidad existente en cada paso.
3. **Pruebas**: Verificar manualmente cada cambio para asegurar que no rompe la experiencia actual.
4. **Documentación**: Actualizar la documentación con cada fase completada.

Este plan está alineado con las mejoras de paginación y otras optimizaciones ya en progreso, complementándolas para crear una base de código más mantenible y escalable. 