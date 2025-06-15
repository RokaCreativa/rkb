# Estándares y Plan de Refactorización

Este documento unifica los estándares y planes para la refactorización del proyecto RokaMenu, centrándose en la mejora de la estructura del código y la separación de responsabilidades.

## 📊 Diagnóstico

El archivo `app/dashboard/page.tsx` actual tiene más de 2000 líneas de código y múltiples responsabilidades:

1. Gestión de estado para categorías, secciones y productos
2. Llamadas a APIs y manejo de datos
3. Lógica de navegación entre vistas 
4. Implementación de interacciones de usuario (reordenamiento, edición, eliminación)
5. Lógica de renderizado de componentes y UI
6. Demasiados hooks (más de 88)
7. Duplicación de código (funciones redundantes)

## 🧭 Estrategia General

Refactorizar el código gradualmente, manteniendo la compatibilidad y funcionalidad existente en cada paso:

1. **Extracción de lógica**: Separar la lógica de negocio y las llamadas a API
2. **Modularización**: Dividir el componente principal en subcomponentes manejables
3. **Gestión de estado**: Implementar un sistema centralizado para gestión de estado
4. **Optimización**: Mejorar el rendimiento y la experiencia de usuario

## 📑 Plan de Refactorización en Fases

### Fase 1: Extracción de Controladores de Eventos ✅ (Completado: 29/03/2024)

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

### Fase 2: Optimización de Carga Inicial de Datos ✅ (Completado: 29/03/2024)

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

### Fase 3: Separación de Lógica (En Progreso)

Objetivo: Separar la lógica de negocio y llamadas a API del componente DashboardPage

#### 3.1 Completar el Servicio de API

Revisar `DashboardService` y completar todas las funciones de API necesarias:
- Gestión de categorías
- Gestión de secciones 
- Gestión de productos
- Gestión de clientes

#### 3.2 Separar la Lógica en Hooks Específicos

Crear los siguientes hooks personalizados:

- **useCategoryManagement.ts**: Gestión del estado de categorías
- **useSectionManagement.ts**: Gestión del estado de secciones por categoría
- **useProductManagement.ts**: Gestión del estado de productos por sección
- **useDashboardState.ts**: Gestión de la UI del dashboard (vistas, selecciones, modales)

### Fase 4: Separación de Componentes de Vistas (Pendiente)

- [ ] Crear directorio `app/dashboard/views/`
- [ ] Extraer vista de categorías en `CategoriesView.tsx`
- [ ] Extraer vista de secciones en `SectionsView.tsx`
- [ ] Extraer vista de productos en `ProductsView.tsx`
- [ ] Convertir `page.tsx` en un orquestador simple de estas vistas

División adicional en subcomponentes:
- `CategorySection`: Todo lo relacionado con categorías
- `SectionDisplay`: Todo lo relacionado con secciones
- `ProductDisplay`: Todo lo relacionado con productos
- `DashboardHeader`: Encabezado y navegación
- `DashboardModals`: Modales de edición/creación

### Fase 5: Implementar Enrutamiento Interno (Pendiente)

- [ ] Crear sistema de enrutamiento entre vistas con estados
- [ ] Actualizar la navegación entre vistas
- [ ] Refactorizar breadcrumbs para usar este sistema

### Fase 6: Implementar Gestión de Estado Global (Pendiente)

- [ ] Evaluar necesidades de estado global vs. local
- [ ] Implementar un sistema basado en Context API para estados compartidos
- [ ] Migrar estados relevantes al nuevo sistema

### Fase 7: Implementar Estrategia de Caché (Pendiente)

- [ ] Implementar un sistema de caché para datos ya cargados
- [ ] Agregar indicadores visuales de carga para mejorar UX
- [ ] Optimizar refrescos de datos para minimizar peticiones

## 📏 Estándares de Implementación

### Organización de Carpetas y Archivos

- Mantener una clara separación entre componentes, hooks y servicios
- Agrupar archivos relacionados en carpetas dedicadas
- Limitar el tamaño de archivos a un máximo de 300 líneas cuando sea posible

### Estilo de Código

- Seguir el principio de responsabilidad única
- Nombrar funciones y variables de manera descriptiva
- Documentar código complejo con comentarios explicativos
- Usar TypeScript para tipado estricto

### Patrones a Seguir

1. **Patrón Adaptador**: Para convertir entre formatos de datos incompatibles
   ```typescript
   // Ejemplo: Adaptador para convertir tipos de categoría
   export function adaptHookCategoryToDashboard(category: HookCategory): DashboardCategory {
     return {
       ...category,
       status: category.status ? 1 : 0
     };
   }
   ```

2. **Patrón Repositorio**: Para abstraer el acceso a datos
   ```typescript
   // Ejemplo: Servicio para operaciones CRUD en categorías
   export class CategoryService {
     async getAll(): Promise<Category[]> { /* ... */ }
     async getById(id: number): Promise<Category> { /* ... */ }
     async create(data: CategoryInput): Promise<Category> { /* ... */ }
     async update(id: number, data: CategoryInput): Promise<Category> { /* ... */ }
     async delete(id: number): Promise<void> { /* ... */ }
   }
   ```

3. **Composición de Hooks**: Para separar lógica reutilizable
   ```typescript
   // Ejemplo: Hook compuesto para gestión de categorías
   export function useCategoryManagement() {
     const { data, isLoading, error, mutate } = useSWR('/api/categories', fetcher);
     const { showModal, hideModal } = useModalState();
     
     // Lógica específica para categorías...
     
     return { categories, isLoading, error, addCategory, updateCategory, deleteCategory };
   }
   ```

## 📈 Impacto de las Mejoras Implementadas

### Rendimiento

- **Tiempo de Carga**:
  - Antes: 20+ segundos para menús grandes
  - Ahora: Menos de 2 segundos para la carga inicial

### Experiencia de Usuario

- **Responsividad**: Interfaz disponible inmediatamente
- **Interactividad**: Carga progresiva de datos durante la interacción

### Calidad del Código

- **Mantenibilidad**: Mejor organización y separación de responsabilidades
- **Reutilización**: Componentes y lógica disponibles para uso en múltiples contextos
- **Testabilidad**: Funciones aisladas más fáciles de probar

## ✅ Consejos para Implementación

1. **Enfoque Incremental**: Realizar cambios pequeños y graduales
2. **Pruebas Continuas**: Verificar que cada cambio mantiene la funcionalidad existente
3. **Documentación**: Actualizar la documentación después de cada fase importante
4. **Consistencia**: Mantener los mismos patrones en todo el código nuevo

## 🛠️ Herramientas Recomendadas

- **ESLint**: Para mantener la calidad del código
- **Prettier**: Para formato consistente
- **React DevTools**: Para depurar componentes y profiling
- **SWR DevTools**: Para depurar peticiones y caché

---

Este documento se actualizará a medida que la refactorización avance. Por favor, consulta también los documentos relacionados como `plan-implementacion.md` y `estandares-tipos.md` para detalles específicos sobre otras áreas del proyecto. 