# 🔧 Errores y Soluciones en RokaMenu

Este documento registra errores comunes, sus causas y soluciones implementadas en el proyecto RokaMenu. Sirve como referencia para resolver problemas recurrentes y evitar repetir errores.

## 🔄 Problemas de Tipos y Conversiones

### Error: Inconsistencia de Tipos Booleanos vs. Numéricos

**Descripción**: 
Los campos de estado como `status` y `deleted` se manejan de manera inconsistente en diferentes partes de la aplicación:
- En la base de datos: como `BOOLEAN` o `TINYINT(1)`
- En la API: a veces como booleanos, a veces como números
- En el frontend: esperados como 0/1 (numéricos)

**Causa**:
Falta de estandarización en el manejo de tipos y conversiones entre frontend y backend.

**Solución**:
1. Estandarizar el uso de tipos según documentación en `estandares-tipos.md`
2. En endpoints de API, convertir explícitamente:
   ```typescript
   // Convertir booleano de BD a numérico para frontend
   return {
     ...entity,
     status: entity.status ? 1 : 0
   };
   ```
3. Implementar adaptadores para conversiones sistemáticas:
   ```typescript
   // lib/adapters/category-adapter.ts
   export function adaptHookCategoryToDashboard(category: HookCategory): DashboardCategory {
     return {
       ...category,
       status: category.status ? 1 : 0
     };
   }
   ```

## 🗄️ Problemas con Operaciones CRUD

### Error: No se puede editar productos después de cambios de tipo

**Descripción**:
Después de refactorizar los tipos, las operaciones de edición de productos dejaron de funcionar.

**Síntomas**:
- El endpoint `/api/products/[id]` devuelve error 500
- Mensaje de error: "Cannot read properties of undefined (reading 'status')"

**Causa**:
El campo `deleted` se trataba incorrectamente como numérico en lugar de booleano en el endpoint de productos:

```typescript
// Código incorrecto en route.ts
deleted: 0 as any
```

**Solución**:
Cambiar para usar el tipo correcto:

```typescript
// Código corregido
deleted: false
```

### Error: Elementos no se muestran después de cambiar el estado

**Descripción**:
Al cambiar la visibilidad de categorías, secciones o productos, a veces los cambios no se reflejan inmediatamente en la UI.

**Causa**:
Actualización optimista de la UI sin confirmar cambios con el servidor.

**Solución**:
1. Implementar patrón de actualización optimista con rollback:
   ```typescript
   const toggleVisibility = async (id, currentStatus) => {
     // 1. Guardar estado anterior
     const previousData = [...currentData];
     
     // 2. Actualizar UI optimistamente
     setCurrentData(data => data.map(item => 
       item.id === id ? {...item, status: currentStatus === 1 ? 0 : 1} : item
     ));
     
     try {
       // 3. Enviar cambio al servidor
       await api.updateStatus(id, currentStatus === 1 ? 0 : 1);
     } catch (error) {
       // 4. Si falla, revertir al estado anterior
       setCurrentData(previousData);
       showErrorMessage("No se pudo actualizar el estado");
     }
   };
   ```

## 🌐 Problemas de Carga de Datos

### Error: Tiempo de carga excesivo del dashboard

**Descripción**:
El dashboard tardaba más de 20 segundos en cargar para menús con muchas categorías, secciones y productos.

**Causa**:
Precarga agresiva de todos los datos al iniciar, incluyendo:
- Todas las categorías
- Todas las secciones de todas las categorías
- Todos los productos de todas las secciones

**Solución**:
1. Implementar carga bajo demanda:
   - Cargar inicialmente solo categorías
   - Cargar secciones cuando se expande una categoría
   - Cargar productos cuando se expande una sección

2. Implementar paginación:
   ```typescript
   // API con paginación
   export async function getCategories(page = 1, limit = 10) {
     const skip = (page - 1) * limit;
     const [data, total] = await Promise.all([
       prisma.categories.findMany({
         where: { deleted: 0 },
         skip,
         take: limit,
         orderBy: { display_order: 'asc' }
       }),
       prisma.categories.count({ where: { deleted: 0 } })
     ]);
     
     return {
       data,
       pagination: {
         total,
         pages: Math.ceil(total / limit),
         current: page
       }
     };
   }
   ```

**Resultados**:
- Tiempo de carga inicial reducido a menos de 2 segundos
- Experiencia de usuario más fluida
- Menor carga en el servidor

## 🧩 Problemas con Componentes

### Error: Errores de renderizado por componentes duplicados

**Descripción**:
Errores de React relacionados con la renderización de componentes, especialmente con modales.

**Síntomas**:
- Warnings en consola sobre prop drilling
- Problemas al abrir/cerrar modales
- Comportamiento impredecible en formularios

**Causa**:
Múltiples implementaciones de los mismos componentes con ligeras variaciones.

**Solución**:
1. Consolidar componentes duplicados:
   - Crear componentes base reutilizables (`BaseModal`, `FormModal`, etc.)
   - Extender funcionalidad mediante composición en lugar de duplicación

2. Implementar sistema unificado de modales:
   ```typescript
   // Uso del sistema unificado
   const { showModal, hideModal } = useModalState();
   
   // Para mostrar un modal
   showModal('deleteCategory', { categoryId: 123 });
   
   // En el componente orquestador
   const modalConfig = {
     deleteCategory: {
       component: DeleteCategoryModal,
       title: "Eliminar Categoría"
     },
     // Otros modales...
   };
   ```

## 🔄 Problemas con Refactorización

### Error: Funcionalidad rota después de extraer lógica

**Descripción**:
Al mover código a nuevos servicios o hooks, algunas funcionalidades dejaron de funcionar.

**Síntomas**:
- Eventos que no se disparan
- Datos que no se actualizan
- Referencias indefinidas

**Causas**:
1. Referencias perdidas a variables de estado o funciones
2. Ciclo de vida de hooks no respetado
3. Contexto (`this`) perdido en funciones

**Solución**:
1. Implementar refactorización gradual con enfoque en compatibilidad:
   ```typescript
   // En el componente original
   const oldFunction = useCallback(() => {
     // Llamar a la nueva implementación mientras mantenemos la interfaz antigua
     return newService.newFunction(...args);
   }, [newService]);
   ```

2. Usar adaptadores para mantener compatibilidad:
   ```typescript
   // lib/adapters/category-functions-adapter.ts
   export function adaptToggleCategoryVisibility(
     hookToggleVisibility: (id: number, currentStatus: boolean) => Promise<void>
   ) {
     return async (
       categoryId: number, 
       currentStatus: number, 
       categories: Category[], 
       setCategories: (categories: Category[]) => void
     ) => {
       // Lógica de adaptación
       await hookToggleVisibility(categoryId, currentStatus === 1);
     };
   }
   ```

## 📋 Problemas Específicos de Entidades

### Error: No se pueden eliminar categorías con secciones

**Descripción**:
Al intentar eliminar una categoría que contiene secciones, la operación falla.

**Causa**:
Falta de manejo de eliminación en cascada o validación apropiada.

**Solución**:
1. Implementar eliminación en cascada en la base de datos:
   ```prisma
   model sections {
     // Otros campos...
     categories categories? @relation(fields: [category_id], references: [category_id], onDelete: Cascade)
   }
   ```

2. Si no es posible la eliminación en cascada, implementar validación:
   ```typescript
   async function deleteCategory(id) {
     // Verificar si tiene secciones
     const sectionsCount = await prisma.sections.count({
       where: { category_id: id }
     });
     
     if (sectionsCount > 0) {
       throw new Error("No se puede eliminar una categoría con secciones. Elimine primero las secciones.");
     }
     
     // Continuar con la eliminación
   }
   ```

## 📱 Problemas de Experiencia de Usuario

### Error: Interfaz bloqueada durante carga de datos

**Descripción**:
La interfaz se bloquea durante la carga inicial, mostrando una pantalla en blanco o un spinner.

**Causa**:
Carga síncrona de datos grandes que bloquea el hilo principal.

**Solución**:
1. Implementar carga progresiva y componentes de skeleton:
   ```tsx
   function ProductList() {
     const { products, isLoading } = useProducts();
     
     return (
       <div>
         {isLoading ? (
           // Mostrar esqueletos mientras se carga
           Array.from({ length: 5 }).map((_, index) => (
             <ProductSkeleton key={index} />
           ))
         ) : (
           products.map(product => (
             <ProductItem key={product.id} product={product} />
           ))
         )}
       </div>
     );
   }
   ```

2. Implementar indicadores de carga para acciones individuales:
   ```tsx
   function DeleteButton({ onDelete, itemId }) {
     const [isDeleting, setIsDeleting] = useState(false);
     
     const handleDelete = async () => {
       setIsDeleting(true);
       try {
         await onDelete(itemId);
       } finally {
         setIsDeleting(false);
       }
     };
     
     return (
       <button 
         onClick={handleDelete} 
         disabled={isDeleting}
       >
         {isDeleting ? "Eliminando..." : "Eliminar"}
       </button>
     );
   }
   ```

## 📚 Registro de Errores Recientes

### Abril 2024: Corrección de Tipos en Endpoint de Productos

**Problema**: La edición de productos fallaba con error 500.

**Análisis**: El campo `deleted` se trataba incorrectamente como numérico (`deleted: 0 as any`) cuando debía ser booleano (`deleted: false`).

**Solución implementada**: Corregido el tipo en `app/api/products/[id]/route.ts` para usar el tipo booleano correcto para el campo `deleted`.

**Estado**: ✅ Resuelto

### Marzo 2024: Optimización de Carga Inicial

**Problema**: Tiempos de carga excesivos (20+ segundos) para el dashboard.

**Análisis**: Precarga agresiva de todos los datos, incluyendo categorías, secciones y productos.

**Solución implementada**: 
1. Implementación de carga bajo demanda
2. Cargar secciones y productos solo cuando se necesitan

**Estado**: ✅ Resuelto

## 🔄 Problemas de Sincronización de Estado

### Error: Discrepancia entre Estado Global y Local

**Descripción**:
Las secciones cargadas para categorías expandidas no se mostraban correctamente debido a discrepancias entre el estado global (almacenado en hooks centrales) y el estado local del componente.

**Síntomas**:
- Secciones que no aparecen después de expandir una categoría, a pesar de que los datos se cargan correctamente
- Logs muestran que los datos existen en la API pero no se renderizan en la UI
- Carga repetida de los mismos datos

**Causa**:
1. Dependencia exclusiva del estado global que puede actualizarse de forma asíncrona
2. Falta de un estado local dedicado para almacenar datos de uso inmediato
3. Uso de referencias no normalizadas a los datos entre componentes

**Solución**:
1. Implementar un estado local dedicado para mantener los datos accesibles inmediatamente:
   ```typescript
   // Crear un estado local específico para secciones expandidas
   const [expandedCategorySections, setExpandedCategorySections] = useState<{ [key: number]: Section[] }>({});
   ```

2. Priorizar el estado local sobre el global para renderizado inmediato:
   ```typescript
   // Usar primero el estado local, luego el global como respaldo
   const sectionsList = expandedCategorySections[categoryId] || sections[categoryId] || [];
   ```

3. Actualizar ambos estados al cargar datos, pero usar el local para la UI:
   ```typescript
   // Al cargar secciones, actualizar ambos estados
   try {
     const data = await fetch(`/api/sections?category_id=${categoryId}`).then(r => r.json());
     
     // Actualizar estado GLOBAL (para coordinar con otros componentes)
     setSections(prev => ({
       ...prev,
       [categoryId]: processedSections
     }));
     
     // CRUCIAL: También guardar en estado local para renderizado inmediato
     setExpandedCategorySections(prev => ({
       ...prev,
       [categoryId]: processedSections
     }));
   } catch (error) {
     console.error('Error loading sections', error);
   }
   ```

4. Implementar verificación visible para depuración:
   ```tsx
   {DEBUG && (
     <div className="bg-yellow-50 border border-yellow-200 rounded-md p-2 mb-3 text-xs">
       <p>Debug: Categoría {category.category_id} tiene {sectionsList.length} secciones</p>
       <p>Secciones: {sectionsList.map((s: Section) => s.name).join(', ')}</p>
       <p>Fuente: {expandedCategorySections[categoryId] ? 'Estado local' : 'Estado global'}</p>
     </div>
   )}
   ```

**Resultados**:
- Renderizado inmediato de secciones expandidas
- Eliminación de la percepción de latencia
- Mayor robustez ante condiciones de red variables
- Información de depuración clara para diagnosticar problemas de origen de datos

**Estado**: ✅ Resuelto

## 🏭 Problemas con la Carga de Datos

### Error: Carga Redundante de Datos

**Descripción**:
El dashboard cargaba repetidamente los mismos datos debido a efectos múltiples y condiciones de recarga no controladas.

**Síntomas**:
- Múltiples llamadas API para el mismo recurso
- Logs de consola mostrando recargas innecesarias
- Parpadeo de componentes durante recargas
- Rendimiento reducido en la interfaz de usuario

**Causa**:
1. Efectos con dependencias incorrectas o faltantes
2. Ausencia de verificación de datos ya cargados
3. Recarga de datos en cada renderización de componente

**Solución**:
1. Implementar verificación de cache antes de cargar:
   ```typescript
   // Evitar cargar datos si ya existen
   if (categories.length > 0) {
     console.log('✅ Ya hay categorías cargadas, evitando recarga');
     setIsLoading(false);
     return;
   }
   ```

2. Verificar datos específicos para cargas condicionadas:
   ```typescript
   // Para categorías expandidas, verificar cache específica
   useEffect(() => {
     expandedCategoryIds.forEach(categoryId => {
       if (!sections[categoryId] || sections[categoryId].length === 0) {
         console.log(`Cargando secciones para categoría expandida ${categoryId}`);
         fetchSectionsByCategory(categoryId);
       }
     });
   }, [expandedCategories, sections, fetchSectionsByCategory]);
   ```

3. Incorporar indicadores visuales de carga específicos:
   ```jsx
   {loadingSections[category.category_id] ? (
     <div className="flex justify-center items-center py-8">
       <svg className="animate-spin h-10 w-10 text-indigo-600">...</svg>
     </div>
   ) : (
     // renderizado de contenido...
   )}
   ```

**Resultados**:
- Reducción de llamadas API redundantes
- Mejora significativa en el rendimiento percibido
- Experiencia de usuario más fluida
- Facilitación de diagnóstico a través de mensajes de depuración específicos

**Estado**: ✅ Resuelto

## 💡 Mejores Prácticas para Evitar Errores

1. **Validar datos** antes de enviarlos a la API
2. **Estandarizar tipos** según la documentación
3. **Usar interfaces** TypeScript para definir claramente contratos
4. **Implementar manejo de errores** en todas las operaciones asíncronas
5. **Evitar duplicación de código** mediante componentes y hooks reutilizables
6. **Utilizar comentarios explicativos** para código complejo
7. **Seguir patrones establecidos** en el proyecto
8. **Realizar pruebas manuales** después de cada cambio significativo

---

Este documento se actualizará continuamente a medida que se identifiquen y resuelvan nuevos problemas. Si encuentras un error no documentado, por favor añádelo siguiendo el formato establecido. 