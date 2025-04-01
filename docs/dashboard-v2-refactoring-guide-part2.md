# Guía de Refactorización del Dashboard v2 - Parte 2: Implementación Detallada

## Implementación de Componentes Clave

### Estructura de Datos

La estructura de datos central del dashboard se basa en estas interfaces principales:

```typescript
// Categoría
interface Category {
  category_id: number;
  name: string;
  image?: string;
  status: number;
  display_order: number;
  sections_count?: number;
  visible_sections_count?: number;
}

// Sección
interface Section {
  section_id: number;
  name: string;
  image?: string;
  display_order: number;
  status: number;
  category_id: number;
  client_id: number;
}

// Para componentes v2 se usa una interfaz extendida
interface DashboardSection extends Section {
  id?: number;  // Para compatibilidad
  visible?: boolean;  // Alternativa a status
}

// Producto
interface Product {
  product_id: number;
  name: string;
  price: number;
  description?: string;
  image?: string;
  display_order: number;
  status: number;
  section_id: number;
}
```

### Implementación del Hook useSections

Este hook es crucial para operaciones CRUD en secciones:

```typescript
export default function useSections(clientId: number | null) {
  const [sections, setSections] = useState<Record<number, Section[]>>({});
  const [isLoadingSections, setIsLoadingSections] = useState<Record<number, boolean>>({});
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({});
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState<number | null>(null);

  // Cargar secciones para una categoría específica
  const fetchSections = useCallback(async (categoryId: number) => {
    if (!clientId) return;
    
    setIsLoadingSections(prev => ({ ...prev, [categoryId]: true }));
    
    try {
      const response = await axios.get(`/api/clients/${clientId}/categories/${categoryId}/sections`);
      setSections(prev => ({ ...prev, [categoryId]: response.data }));
    } catch (error) {
      console.error('Error al cargar las secciones:', error);
      toast.error('No se pudieron cargar las secciones');
    } finally {
      setIsLoadingSections(prev => ({ ...prev, [categoryId]: false }));
    }
  }, [clientId]);

  // Alternar visibilidad de una sección
  const toggleSectionVisibility = useCallback(async (sectionId: number, currentStatus: number) => {
    if (!clientId) return;
    
    setIsUpdatingVisibility(sectionId);
    const newStatus = currentStatus === 1 ? 0 : 1;
    
    try {
      await axios.patch(`/api/clients/${clientId}/sections/${sectionId}`, {
        status: newStatus
      });
      
      // Actualizar el estado local
      setSections(prev => {
        const updatedSections = { ...prev };
        
        // Buscar la sección en todas las categorías y actualizarla
        Object.keys(updatedSections).forEach(categoryId => {
          updatedSections[Number(categoryId)] = updatedSections[Number(categoryId)].map(sec => 
            sec.section_id === sectionId ? { ...sec, status: newStatus } : sec
          );
        });
        
        return updatedSections;
      });
      
      toast.success(newStatus === 1 ? 'Sección visible' : 'Sección oculta');
    } catch (error) {
      console.error('Error al cambiar la visibilidad:', error);
      toast.error('No se pudo cambiar la visibilidad');
    } finally {
      setIsUpdatingVisibility(null);
    }
  }, [clientId]);

  // Resto de la implementación...

  return {
    sections,
    isLoadingSections,
    expandedSections,
    setExpandedSections,
    isUpdatingVisibility,
    fetchSections,
    toggleSectionVisibility,
    createSection,
    updateSection,
    deleteSection,
    reorderSection
  };
}
```

### Implementación del Hook useDataState

Este hook centraliza la gestión de estado del dashboard:

```typescript
// En dashboard-v2/hooks/useDataState.tsx
export default function useDataState() {
  // Estados principales
  const [client, setClient] = useState<Client | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sections, setSections] = useState<Record<string, Section[]>>({});
  const [products, setProducts] = useState<Record<string, Product[]>>({});
  
  // Estados de UI
  const [isLoading, setIsLoading] = useState(false);
  const [isSectionsLoading, setIsSectionsLoading] = useState(false);
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState<number | null>(null);
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Funciones de carga de datos
  const fetchClientData = useCallback(async () => {
    // Implementación...
  }, []);
  
  const fetchCategories = useCallback(async () => {
    // Implementación...
  }, [client?.id]);
  
  const fetchSectionsByCategory = useCallback(async (categoryId: number) => {
    // Implementación...
  }, [setIsSectionsLoading, setError, setSections, setCategories, sections]);
  
  // Funciones de actualización
  const toggleSectionVisibility = useCallback(async (sectionId: number, currentStatus: number) => {
    if (!client?.id) return;
    
    setIsUpdatingVisibility(sectionId);
    const newStatus = currentStatus === 1 ? 0 : 1;
    
    try {
      // Implementación...
    } catch (error) {
      // Manejo de errores...
    } finally {
      setIsUpdatingVisibility(null);
    }
  }, [client?.id]);
  
  // Más funciones...
  
  // Efecto inicial
  useEffect(() => {
    if (clientId) {
      fetchClientData();
    }
  }, [clientId, fetchClientData]);
  
  return {
    // Estados
    client,
    categories,
    sections,
    products,
    isLoading,
    isSectionsLoading,
    isUpdatingVisibility,
    isUpdatingOrder,
    error,
    
    // Acciones
    setClient,
    setCategories,
    setSections,
    setProducts,
    setIsLoading,
    setIsSectionsLoading,
    setIsUpdatingVisibility,
    setIsUpdatingOrder,
    setError,
    
    // Funciones de carga de datos
    fetchClientData,
    fetchCategories,
    fetchSectionsByCategory,
    fetchProductsBySection,
    
    // Funciones de actualización
    toggleCategoryVisibility,
    toggleSectionVisibility,
    deleteCategory,
    reorderCategory,
    deleteSection,
    updateSection,
    toggleProductVisibility,
    deleteProduct,
    updateProduct
  };
}
```

## Implementación de Modales

### EditSectionModal

Este componente permite editar una sección existente:

```tsx
const EditSectionModal: React.FC<EditSectionModalProps> = ({
  isOpen,
  onClose,
  section
}) => {
  // Estados
  const [editSectionName, setEditSectionName] = useState('');
  const [editSectionImage, setEditSectionImage] = useState<File | null>(null);
  const [editSectionImagePreview, setEditSectionImagePreview] = useState<string | null>(null);
  const [isUpdatingSectionName, setIsUpdatingSectionName] = useState(false);
  
  // Hook de secciones
  const { updateSection } = useSections(section?.client_id || 0);

  // Cargar datos iniciales
  useEffect(() => {
    if (isOpen && section) {
      setEditSectionName(section.name || '');
      setEditSectionImagePreview(section.image ? getImagePath(section.image, 'sections') : null);
    }
  }, [isOpen, section]);

  // Envío del formulario
  const handleSubmit = async () => {
    if (!editSectionName.trim()) {
      toast.error('El nombre de la sección es obligatorio');
      return;
    }

    if (!section) {
      toast.error('No se ha seleccionado ninguna sección para editar');
      return;
    }

    setIsUpdatingSectionName(true);

    const formData = new FormData();
    formData.append('name', editSectionName);
    formData.append('section_id', section.section_id.toString());
    if (editSectionImage) {
      formData.append('image', editSectionImage);
    }

    try {
      const success = await updateSection(formData, section.section_id, section.category_id);
      
      if (success) {
        toast.success('Sección actualizada correctamente');
        onClose();
        
        // Recarga para actualizar UI
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      console.error("Error al actualizar sección:", error);
      toast.error('Error al actualizar la sección');
    } finally {
      setIsUpdatingSectionName(false);
    }
  };

  // Resto de la implementación (UI, etc.)...
};
```

## Implementación Detallada de la Página Principal

La página principal (`dashboard-v2/page.tsx`) integra todos los componentes y hooks:

```tsx
export default function DashboardPage() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  
  // Estados locales
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estado global mediante useDataState
  const {
    client,
    categories,
    sections,
    isLoading: isDataLoading,
    isUpdatingVisibility,
    error: dataError,
    setCategories,
    setSections,
    toggleSectionVisibility,
    fetchSectionsByCategory
  } = useDataState();
  
  // Estados UI
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSection, setSelectedSection] = useState<DashboardSection | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<{ [key: number]: boolean }>({});
  const [currentView, setCurrentView] = useState<'categories' | 'sections' | 'products'>('categories');
  
  // Estados modales
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [showNewSectionModal, setShowNewSectionModal] = useState(false);
  const [showNewProductModal, setShowNewProductModal] = useState(false);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [showEditSectionModal, setShowEditSectionModal] = useState(false);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [sectionToEdit, setSectionToEdit] = useState<DashboardSection | null>(null);
  const [productToEdit, setProductToEdit] = useState<any | null>(null);
  
  // Event handlers
  const handleCategoryClick = async (category: Category) => {
    // Expandir/contraer
    setExpandedCategories(prev => ({
      ...prev,
      [category.category_id]: !prev[category.category_id]
    }));
    
    // Actualizar selección
    setSelectedCategory(category);
    setSelectedSection(null);
    setCurrentView('sections');
    
    // Cargar secciones si es necesario
    if (!sections[category.category_id] || sections[category.category_id].length === 0) {
      await fetchSectionsByCategory(category.category_id);
    }
  };
  
  const handleSectionClick = (section: DashboardSection) => {
    setSelectedSection(section);
    setCurrentView('products');
    // Cargar productos...
  };
  
  // Resto de handlers y renderizado...
  
  // Mostrar estados de carga/error
  if (isLoading || isDataLoading) {
    return <LoadingSpinner />;
  }
  
  if (error || dataError) {
    return <ErrorMessage message={error || dataError} />;
  }
  
  // Renderizado principal
  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavbar />
      
      <main className="container mx-auto py-6 px-4">
        {/* Navegación (breadcrumbs) */}
        <Breadcrumbs items={breadcrumbs} />
        
        {/* Contenido según la vista actual */}
        {currentView === 'categories' && (
          <CategoryTable
            categories={categories}
            expandedCategories={expandedCategories}
            onCategoryClick={handleCategoryClick}
            onEditCategory={handleEditCategory}
            onDeleteCategory={handleDeleteCategory}
            onToggleVisibility={toggleCategoryVisibility}
            isUpdatingVisibility={isUpdatingVisibility}
          />
        )}
        
        {currentView === 'sections' && selectedCategory && (
          <SectionTable 
            sections={sections[selectedCategory.category_id] || []}
            onEditSection={handleEditSection}
            onDeleteSection={handleDeleteSection}
            onToggleSectionVisibility={toggleSectionVisibility}
            categoryId={selectedCategory.category_id}
            isUpdatingVisibility={isUpdatingVisibility}
          />
        )}
        
        {currentView === 'products' && selectedSection && (
          <ProductTable 
            products={products[selectedSection.section_id] || []}
            onEditProduct={handleEditProduct}
            onDeleteProduct={handleDeleteProduct}
            onToggleVisibility={toggleProductVisibility}
            isUpdatingVisibility={isUpdatingVisibility}
          />
        )}
      </main>
      
      {/* Modales */}
      {showNewCategoryModal && (
        <NewCategoryModal
          isOpen={true}
          onClose={() => setShowNewCategoryModal(false)}
          client={client as any}
          setCategories={setCategories}
        />
      )}
      
      {/* Resto de modales... */}
    </div>
  );
}
```

## Lista de Tareas Detalladas Pendientes

### 1. Completar la funcionalidad de productos

- [ ] Terminar la implementación del hook `useProducts`
- [ ] Completar `ProductTable.tsx` con todas las opciones necesarias
- [ ] Implementar el filtrado y búsqueda de productos
- [ ] Añadir funcionalidad para cambiar un producto de sección

### 2. Optimizar la carga de datos

- [ ] Implementar un sistema de caché para datos frecuentemente usados
- [ ] Añadir revalidación automática después de operaciones CRUD
- [ ] Reducir el número de peticiones a la API agrupando datos relacionados

### 3. Mejorar la navegación

- [ ] Implementar rutas dinámicas basadas en categorías/secciones
- [ ] Añadir historial de navegación y capacidad de "volver atrás"
- [ ] Conservar el estado de expansión y selección entre navegaciones

### 4. Mejorar la accesibilidad

- [ ] Añadir etiquetas ARIA a componentes interactivos
- [ ] Implementar navegación por teclado
- [ ] Asegurar suficiente contraste de colores

### 5. Implementar búsqueda global

- [ ] Crear un componente de búsqueda en la barra superior
- [ ] Implementar búsqueda a través de categorías, secciones y productos
- [ ] Mostrar resultados con resaltado de coincidencias

## Lecciones Aprendidas y Mejores Prácticas

### 1. Estructuración de Proyectos React

- Organizar por características (feature-based) en lugar de por tipos
- Agrupar componentes relacionados en carpetas con un índice
- Separar componentes grandes en subcomponentes más manejables

### 2. TypeScript Efectivo

- Definir interfaces explícitamente, no confiar en tipos inferidos
- Usar tipos genéricos para funciones reutilizables
- Proporcionar valores predeterminados seguros para propiedades opcionales

### 3. Optimización de Rendimiento

- Usar React.memo para componentes que renderizan frecuentemente
- Implementar virtualizacíon para listas largas
- Evitar cálculos costosos en cada renderizado con useMemo

### 4. Manejo de Estado

- Usar la menor cantidad de estado posible
- Derivar valores de estado existente en lugar de crear nuevo estado
- Mantener el estado lo más local posible

### 5. Manejo de Efectos Secundarios

- Limitar los efectos secundarios a lo estrictamente necesario
- Siempre proporcionar funciones de limpieza en useEffect
- Usar abortControllers para cancelar peticiones

## Conclusión de Implementación

El trabajo de refactorización del Dashboard v2 ha establecido una base sólida con patrones robustos y soluciones a problemas comunes. Continuar este trabajo requiere atención a los detalles, consistencia en la implementación y un enfoque metódico para completar las tareas pendientes.

Con esta guía detallada, deberías tener toda la información necesaria para continuar el desarrollo y terminar la refactorización con éxito, obteniendo un dashboard más mantenible, eficiente y fácil de usar. 