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

### Fase 1: Extraer Controladores de Eventos ✅ (Completado: 29/03/2024)

- [x] Crear directorio `lib/handlers/` para controladores
- [x] Extraer controladores para categorías en `categoryEventHandlers.ts`
- [x] Extraer controladores para secciones en `sectionEventHandlers.ts`
- [x] Extraer controladores para productos en `productEventHandlers.ts`
- [x] Actualizar el archivo principal para importar y usar estos controladores

**Beneficios conseguidos**:
- Reducción significativa del tamaño del archivo principal
- Agrupación de lógica relacionada por tipo de entidad
- Mejor reutilización de código
- Mayor claridad y mantenibilidad

### Fase 2: Optimizar Carga Inicial de Datos ✅ (Completado: 29/03/2024)

- [x] Eliminar precarga agresiva de todos los datos
- [x] Implementar carga bajo demanda para secciones y productos
- [x] Cargar solo las categorías inicialmente
- [x] Cargar secciones solo cuando se expande una categoría
- [x] Cargar productos solo cuando se expande una sección

**Beneficios conseguidos**:
- Reducción dramática del tiempo de carga inicial (de 20+ segundos a menos de 2 segundos)
- Menor consumo de recursos del servidor
- Interfaz más responsiva desde el primer momento
- Mejor experiencia de usuario

### Fase 3: Separar Componentes de Vistas (Pendiente)

- [ ] Crear directorio `app/dashboard/views/`
- [ ] Extraer vista de categorías en `CategoriesView.tsx`
- [ ] Extraer vista de secciones en `SectionsView.tsx`
- [ ] Extraer vista de productos en `ProductsView.tsx`
- [ ] Convertir `page.tsx` en un orquestador simple de estas vistas

**Beneficios esperados**:
- Separación de la lógica de renderizado por contexto
- Facilitar el mantenimiento de cada vista individual
- Mejorar la claridad del código

### Fase 4: Implementar Enrutamiento Interno (Pendiente)

- [ ] Crear sistema de enrutamiento entre vistas con estados
- [ ] Actualizar la navegación entre vistas
- [ ] Refactorizar breadcrumbs para usar este sistema

**Beneficios esperados**:
- Estructura más clara y mantenible
- Mejor manejo de la navegación
- Mayor alineamiento con patrones de React

### Fase 5: Extraer Lógica de Datos (Pendiente)

- [ ] Crear servicios específicos para cada entidad (expandir servicios existentes)
- [ ] Implementar hooks personalizados para cada vista
- [ ] Centralizar manejo de errores y estados de carga

**Beneficios esperados**:
- Separación clara entre lógica de datos y UI
- Mejor reutilización de código
- Facilita pruebas unitarias

### Fase 6: Implementar Gestión de Estado Global (Pendiente)

- [ ] Evaluar necesidades de estado global vs. local
- [ ] Implementar un sistema basado en Context API para estados compartidos
- [ ] Migrar estados relevantes al nuevo sistema

**Beneficios esperados**:
- Reduce prop drilling
- Facilita compartir datos entre componentes
- Mejora rendimiento al evitar re-renders innecesarios

### Fase 7: Implementar Estrategia de Caché (Pendiente)

- [ ] Implementar un sistema de caché para datos ya cargados
- [ ] Agregar indicadores visuales de carga para mejorar UX
- [ ] Optimizar refrescos de datos para minimizar peticiones

**Beneficios esperados**:
- Menor número de peticiones al servidor
- Experiencia más fluida para el usuario
- Mayor eficiencia en uso de recursos

## Progreso Actual

- **Completado**: 
  - ✅ Mejora de documentación del código
  - ✅ Extracción de interfaces de tipos a `lib/types/index.ts`
  - ✅ Extracción de controladores de eventos para categorías
  - ✅ Extracción de controladores de eventos para secciones
  - ✅ Extracción de controladores de eventos para productos
  - ✅ Actualización de `page.tsx` para usar controladores externos
  - ✅ Eliminación de la precarga agresiva de datos
  - ✅ Implementación de carga bajo demanda para secciones y productos

- **Próximos pasos**:
  - Comenzar la separación de componentes de vistas
  - Desarrollar sistema de enrutamiento interno
  - Expandir la paginación a secciones y productos

## Consideraciones

1. **Enfoque gradual**: Realizar cambios incrementales para facilitar pruebas y revisión.
2. **Compatibilidad**: Mantener la funcionalidad existente en cada paso.
3. **Pruebas**: Verificar manualmente cada cambio para asegurar que no rompe la experiencia actual.
4. **Documentación**: Actualizar la documentación con cada fase completada.

Este plan está alineado con las mejoras de paginación y otras optimizaciones ya implementadas, complementándolas para crear una base de código más mantenible y escalable.

## Impacto de las Mejoras Implementadas

### Tiempo de Carga
- **Antes**: 20+ segundos para menús grandes (carga completa de todas las categorías, secciones y productos)
- **Ahora**: Menos de 2 segundos para la carga inicial (solo categorías)

### Responsividad de la Interfaz
- **Antes**: Interfaz bloqueada durante la precarga completa
- **Ahora**: Interfaz disponible inmediatamente, datos adicionales cargados según demanda

### Mantenibilidad del Código
- **Antes**: Archivo principal monolítico con más de 1800 líneas
- **Ahora**: Lógica de eventos extraída a módulos especializados, reduciendo complejidad

### Experiencia de Usuario
- **Antes**: Espera inicial larga antes de poder interactuar
- **Ahora**: Interacción inmediata, con carga progresiva de datos

Estas mejoras demuestran el valor del enfoque gradual adoptado, permitiendo obtener beneficios tangibles en cada fase mientras mantenemos la compatibilidad con el código existente. 