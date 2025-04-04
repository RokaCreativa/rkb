# Guía de Refactorización del Dashboard v2

## Introducción

Este documento es una guía detallada sobre la refactorización del Dashboard v2 de RokaMenu. Su propósito es servir como referencia para continuar el trabajo de migración y mejora del dashboard original. Contiene información sobre patrones de diseño, errores comunes, soluciones implementadas y tareas pendientes.

## Estado Actual de la Refactorización

La refactorización del Dashboard v2 ha avanzado significativamente. Hemos logrado:

1. **Migración de componentes clave**: 
   - CategoryTable
   - SectionTable
   - ProductTable
   - Modales de edición y creación

2. **Solución de problemas de TypeScript**:
   - Corrección de errores de tipo en interfaces
   - Implementación de verificaciones null/undefined
   - Manejo adecuado de tipos para las operaciones CRUD

3. **Mejora de la arquitectura**:
   - Implementación de hooks personalizados para gestión de estado
   - Separación de lógica de negocio y UI
   - Mejor manejo de efectos secundarios con useEffect y useCallback

## Arquitectura del Dashboard v2

### Estructura de Carpetas

```
app/
├── dashboard-v2/
│   ├── components/           # Componentes de UI
│   │   ├── CategoryTable.tsx    
│   │   ├── SectionTable.tsx
│   │   ├── ProductTable.tsx
│   │   ├── EditSectionModal.tsx
│   │   └── ...
│   ├── hooks/                # Hooks personalizados
│   │   ├── useDataState.tsx  # Estado general del dashboard
│   │   └── ...
│   ├── types/                # Definición de tipos
│   ├── utils/                # Utilidades
│   ├── page.tsx              # Página principal
│   └── layout.tsx            # Layout de la sección
├── hooks/                    # Hooks globales
│   ├── useSections.tsx
│   ├── useProducts.tsx
│   └── ...
└── types/
    └── menu.ts               # Tipos compartidos
```

### Gestión de Estado

El Dashboard v2 utiliza un modelo de gestión de estado basado en:

1. **Estado global mediante hooks personalizados**: 
   - `useDataState` - Gestiona el estado principal del dashboard (categorías, secciones, productos)
   - `useSections` - Operaciones CRUD para secciones
   - `useProducts` - Operaciones CRUD para productos

2. **Estado local en componentes**: 
   - Estado UI como modales, selecciones, expansiones
   - Estados de carga y errores específicos de componentes

## Problemas Resueltos

### 1. Tipos TypeScript

El problema más común fue la falta de definiciones de tipo adecuadas y verificaciones de nulos:

```typescript
// Problema: error al llamar a updateSection
// Error: Argument of type 'FormData' is not assignable to parameter of type 'number'
const handleSubmit = async () => {
  // ...
  const success = await updateSection(formData);
  // ...
}

// Solución: actualizar la firma de la función para aceptar FormData
const updateSection = useCallback(async (
  formData: FormData | Partial<SectionWithFileUpload>, 
  sectionId?: number, 
  categoryId?: number
) => {
  // Implementación que maneja ambos casos
});
```

### 2. Manejo de Referencias Nulas

Otro problema frecuente fue no verificar la existencia de objetos antes de acceder a sus propiedades:

```typescript
// Problema: objeto posiblemente nulo
setSections(prevSections => ({
  ...prevSections,
  [selectedCategory.category_id]: [...prevSections[selectedCategory.category_id], newSection]
}));

// Solución: verificar existencia y proporcionar valores predeterminados
if (setSections && selectedCategory) {
  setSections(prevSections => ({
    ...prevSections,
    [selectedCategory.category_id]: [...(prevSections[selectedCategory.category_id] || []), newSection]
  }));
}
```

### 3. Problemas de Tipado en Componentes

La falta de definiciones claras de interfaz para props de componentes causó problemas:

```typescript
// Problema: tipos incompatibles en props
interface EditProductModalProps {
  setProducts: React.Dispatch<React.SetStateAction<Record<string, Product[]>>>;
}

// En el componente padre:
<EditProductModal
  // Error: Type 'Dispatch<SetStateAction<any[]>>' is not assignable...
  setProducts={setProducts}
/>

// Solución: hacer la interfaz más flexible
interface EditProductModalProps {
  setProducts: React.Dispatch<React.SetStateAction<Record<string, Product[]> | any[]>>;
}

// O usar type assertion cuando sea necesario:
<EditProductModal
  setProducts={setProducts as any}
/>
```

## Mejores Prácticas Implementadas

### 1. Verificaciones de Nulos

```typescript
const handleSubmit = async () => {
  // Verificación temprana
  if (!sectionName.trim()) {
    toast.error('El nombre de la sección es obligatorio');
    return;
  }

  // Verificación de APIs y hooks
  if (setProducts) {
    setProducts(prev => ({ /* ... */ }));
  }
  
  // Verificación de datos anidados
  if (selectedCategory) {
    eventBus.emit(Events.SECTION_CREATED, {
      section: newSection,
      categoryId: selectedCategory.category_id
    });
  } else {
    eventBus.emit(Events.SECTION_CREATED, {
      section: newSection,
      categoryId: categoryId
    });
  }
};
```

### 2. Uso de useCallback para Funciones

```typescript
const toggleSectionVisibility = useCallback(async (sectionId: number, currentStatus: number) => {
  if (!client?.id) return;
  
  setIsUpdatingVisibility(sectionId);
  const newStatus = currentStatus === 1 ? 0 : 1;
  
  try {
    // Implementación
  } catch (error) {
    // Manejo de errores
  } finally {
    setIsUpdatingVisibility(null);
  }
}, [client?.id]);
```

### 3. Control de Estado de Carga y Errores

```typescript
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

// En la UI:
if (isLoading || isDataLoading) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );
}

if (error || dataError) {
  return (
    <div className="flex items-center justify-center min-h-screen text-red-600">
      <p>Error: {error || dataError}</p>
    </div>
  );
}
```

## Tareas Pendientes

### 1. Completar la migración de componentes

- [ ] Revisar y unificar los componentes de vista previa
- [ ] Implementar completamente el manejo de productos
- [ ] Migrar la funcionalidad de reordenamiento de categorías/secciones/productos

### 2. Mejorar el manejo de estado

- [ ] Considerar el uso de React Query o SWR para cacheo y revalidación de datos
- [ ] Refinar la estructura de `useDataState` para mejor separación de intereses
- [ ] Implementar una estrategia de revalidación después de CRUD sin depender de la recarga de página

### 3. Optimización de rendimiento

- [ ] Implementar carga bajo demanda (lazy loading) de secciones y productos
- [ ] Reducir renders innecesarios con memo, useMemo y useCallback
- [ ] Implementar paginación para listas largas

### 4. Mejorar la experiencia del usuario

- [ ] Añadir animaciones para transiciones entre vistas
- [ ] Mejorar el sistema de notificaciones
- [ ] Implementar confirmaciones para acciones destructivas

### 5. Pruebas y calidad

- [ ] Crear pruebas unitarias para hooks
- [ ] Implementar pruebas de integración para flujos críticos
- [ ] Configurar validación de tipos en tiempo de compilación

## Componentes y APIs Clave

### Hooks Principales

#### useDataState

Este hook es el centro de la gestión de estado del dashboard v2. Proporciona:

- Estado para categorías, secciones, productos
- Funciones para cargar datos
- Operaciones CRUD básicas

```typescript
const {
  client,
  categories,
  sections,
  isLoading,
  isUpdatingVisibility,
  error,
  setCategories,
  setSections,
  toggleSectionVisibility,
  fetchSectionsByCategory
} = useDataState();
```

#### useSections

Hook especializado para operaciones con secciones:

```typescript
const { 
  updateSection, 
  toggleSectionVisibility, 
  createSection, 
  deleteSection 
} = useSections(clientId);
```

La función `updateSection` permite actualizar una sección existente y acepta varios formatos:

```typescript
// Actualizar con FormData (para imágenes)
const formData = new FormData();
formData.append('name', editSectionName);
formData.append('section_id', section.section_id.toString());
if (editSectionImage) {
  formData.append('image', editSectionImage);
}
await updateSection(formData, section.section_id, section.category_id);

// O actualizar con objeto simple
await updateSection(
  { name: 'Nueva Sección', status: 1 },
  sectionId,
  categoryId
);
```

#### useProducts

Similar a `useSections` pero para productos:

```typescript
const { 
  updateProduct, 
  createProduct, 
  deleteProduct, 
  toggleProductVisibility 
} = useProducts();
```

### Componentes de Creación/Edición

#### NewSectionModal

```tsx
<NewSectionModal 
  isOpen={showNewSectionModal}
  onClose={() => setShowNewSectionModal(false)} 
  categoryId={selectedCategory.category_id}
/>
```

#### EditSectionModal

```tsx
<EditSectionModal 
  isOpen={showEditSectionModal}
  onClose={() => {
    setShowEditSectionModal(false);
    setSectionToEdit(null);
  }} 
  section={sectionToEdit}
/>
```

#### NewProductModal

```tsx
<NewProductModal 
  isOpen={showNewProductModal}
  onClose={() => setShowNewProductModal(false)} 
  sectionId={selectedSection.section_id}
/>
```

#### EditProductModal

```tsx
<EditProductModal
  isOpen={showEditProductModal}
  onClose={() => {
    setShowEditProductModal(false);
    setProductToEdit(null);
  }} 
  product={productToEdit}
  client={client as any}
  selectedSection={selectedSection}
  setProducts={setProducts as any}
/>
```

## Errores Comunes y Cómo Evitarlos

### 1. Problemas de Tipo TypeScript

**Error**: "Cannot invoke an object which is possibly 'undefined'"

**Solución**: Verificar siempre la existencia antes de llamar a funciones:

```typescript
// Incorrecto
createSection(formData);

// Correcto
if (createSection) {
  createSection(formData);
}
```

**Error**: "Type 'X' is not assignable to type 'Y'"

**Solución**: Usar interfaces más flexibles o type assertions cuando sea necesario:

```typescript
// Incorrecto
<Component prop={valueOfIncompatibleType} />

// Correcto
<Component prop={value as CompatibleType} />

// Mejor: Hacer la interfaz más flexible
interface Props {
  value: CompatibleType | OtherType;
}
```

### 2. Estado que no se actualiza

**Error**: Los cambios en el estado no se reflejan inmediatamente

**Solución**: Recordar que las actualizaciones de estado son asíncronas:

```typescript
// Incorrecto
setCategories(newCategories);
console.log(categories); // Muestra el valor ANTERIOR

// Correcto
setCategories(newCategories);
// Usar useEffect para reaccionar al cambio
useEffect(() => {
  console.log(categories); // Muestra el valor ACTUALIZADO
}, [categories]);
```

### 3. Efectos infinitos

**Error**: El componente se renderiza en bucle

**Solución**: Asegurar que la lista de dependencias de useEffect/useCallback es correcta:

```typescript
// Incorrecto - se ejecuta en cada render si sections cambia
useEffect(() => {
  fetchSections(); // Actualiza sections, causando un nuevo render
}, [sections]); // 🚫 Dependencia incorrecta

// Correcto
useEffect(() => {
  fetchSections();
}, [fetchSections]); // ✅ fetchSections está memoizado con useCallback
```

## Consejos para Continuar la Refactorización

1. **Empezar con los tipos**: Define bien las interfaces antes de implementar la lógica.

2. **Divide y vencerás**: Refactoriza un componente o funcionalidad a la vez.

3. **Prioriza por impacto**: Comienza con los componentes más utilizados o críticos.

4. **Manten la compatibilidad**: Asegúrate de que los componentes refactorizados funcionen con la API existente.

5. **Prueba continuamente**: Verifica que cada cambio funcione antes de pasar al siguiente.

6. **Usa los hooks personalizados**: Reutiliza los hooks ya implementados (useDataState, useSections, etc.).

7. **Estandariza patrones**: Mantén consistencia en la estructura de componentes y hooks.

8. **Documenta**: Añade comentarios para explicar decisiones no obvias.

## Archivos Clave a Revisar

Para continuar el trabajo, estos son los archivos principales que debes entender:

1. `app/dashboard-v2/page.tsx` - Punto de entrada principal
2. `app/dashboard-v2/hooks/useDataState.tsx` - Gestión de estado central
3. `app/hooks/useSections.tsx` - Operaciones CRUD para secciones
4. `app/hooks/useProducts.tsx` - Operaciones CRUD para productos
5. `app/dashboard-v2/components/SectionTable.tsx` - Tabla de secciones
6. `app/dashboard-v2/components/EditSectionModal.tsx` - Modal de edición de secciones

## Conclusión

La refactorización del Dashboard v2 ha avanzado significativamente, estableciendo patrones y soluciones para los problemas más comunes. Para continuar el trabajo, céntrate en:

1. Completar la migración de componentes restantes
2. Mejorar la gestión de estado para evitar recargas de página
3. Optimizar el rendimiento
4. Mejorar la experiencia del usuario
5. Implementar pruebas

Siguiendo las mejores prácticas establecidas y prestando atención a los errores comunes, podrás completar la refactorización con éxito. 