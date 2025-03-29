# Plan de Refactorización del Componente Dashboard

## Problemas Identificados

1. **Componente demasiado grande**: El componente `DashboardPage` tiene más de 2000 líneas, lo que lo hace difícil de mantener.
2. **Demasiados hooks**: Contiene más de 88 hooks, lo que aumenta la complejidad y puede causar problemas con el orden de ejecución.
3. **Duplicación de código**: Se han encontrado funciones duplicadas que causan problemas de redeclaración.
4. **Mezcla de lógica de negocio y UI**: Las funciones de API, lógica de negocio y renderizado están todas en el mismo archivo.

## Propuesta de Refactorización

### 1. División en Subcomponentes

Dividir el `DashboardPage` en varios componentes más pequeños:

- `CategorySection`: Todo lo relacionado con categorías
- `SectionDisplay`: Todo lo relacionado con secciones
- `ProductDisplay`: Todo lo relacionado con productos
- `DashboardHeader`: Encabezado y navegación
- `DashboardModals`: Modales de edición/creación

### 2. Separación de Lógica

- Mover todas las funciones API a servicios dedicados
- Crear hooks personalizados para cada funcionalidad:
  - `useCategoryManagement`
  - `useSectionManagement`
  - `useProductManagement`

### 3. Gestión de Estado

- Considerar usar un gestor de estado global (Context API, Redux) para manejar el estado compartido entre componentes
- Reducir el número de estados locales

### 4. Manejo de Eventos

- Consolidar los manejadores de eventos para evitar duplicación
- Centralizar los adaptadores de funciones

## Plan de Implementación

1. **Fase 1**: Crear los hooks personalizados y mover la lógica de API
2. **Fase 2**: Extraer subcomponentes uno a uno sin cambiar funcionalidad
3. **Fase 3**: Implementar gestión de estado global
4. **Fase 4**: Limpieza y optimización final

## Consideraciones

- Mantener compatibilidad con APIs existentes
- Realizar pruebas después de cada cambio
- Actualizar gradualmente para evitar roturas

## Beneficios Esperados

- Mejor mantenibilidad
- Menor complejidad
- Prevención de errores relacionados con hooks
- Mayor facilidad para añadir nuevas funcionalidades 