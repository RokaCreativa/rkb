import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { Category, Section, Product, Client } from '@/app/types/menu';
import { PrismaClient } from '@prisma/client';
import useSections from '@/app/hooks/useSections';
import useProducts from '@/app/hooks/useProducts';

// Importar los componentes refactorizados
import {
  DashboardLayout,
  CategoriesView,
  SectionsView,
  ProductsView
} from './components/dashboard';

// Importar componentes de modales
import DeleteCategoryModal from './components/DeleteCategoryModal';
import EditCategoryModal from './components/EditCategoryModal';
import NewCategoryModal from './components/NewCategoryModal';
import DeleteSectionModal from './components/DeleteSectionModal';
import EditSectionModal from './components/EditSectionModal';
import NewSectionModal from './components/NewSectionModal';
import DeleteProductModal from './components/DeleteProductModal';
import EditProductModal from './components/EditProductModal';
import NewProductModal from './components/NewProductModal';

// Extender la interfaz Client para incluir la propiedad id
interface DashboardClient extends Client {
  id: number;
  logo?: string | null;
  name: string;
  main_logo: string | null;
}

/**
 * Página principal del dashboard
 * Gestiona la visualización y edición de categorías, secciones y productos
 * Versión refactorizada para mejorar la mantenibilidad del código
 * 
 * @returns {JSX.Element} Componente de página del dashboard
 */
export default function DashboardPage() {
  // Estado de sesión y cliente
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [client, setClient] = useState<DashboardClient | null>(null);
  
  // Estados principales de datos
  const [categories, setCategories] = useState<Category[]>([]);
  const [sections, setSections] = useState<Record<string, Section[]>>({});
  const [products, setProducts] = useState<Record<string, Product[]>>({});
  
  // Estados de UI
  const [expandedCategories, setExpandedCategories] = useState<Record<number, boolean>>({});
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({});
  const [loadingSections, setLoadingSections] = useState<Record<number, boolean>>({});
  const [loadingProducts, setLoadingProducts] = useState<Record<number, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'categories' | 'sections' | 'products'>('categories');
  const [isReorderModeActive, setIsReorderModeActive] = useState(false);
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState<number | null>(null);
  
  // Estados de selección
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  
  // Estados para modales - Categorías
  const [isNewCategoryModalOpen, setIsNewCategoryModalOpen] = useState(false);
  const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);
  const [isDeleteCategoryModalOpen, setIsDeleteCategoryModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
  const [isDeletingCategory, setIsDeletingCategory] = useState(false);
  
  // Estados para modales - Secciones
  const [isNewSectionModalOpen, setIsNewSectionModalOpen] = useState(false);
  const [isEditSectionModalOpen, setIsEditSectionModalOpen] = useState(false);
  const [isDeleteSectionModalOpen, setIsDeleteSectionModalOpen] = useState(false);
  const [sectionToEdit, setSectionToEdit] = useState<Section | null>(null);
  const [sectionToDelete, setSectionToDelete] = useState<number | null>(null);
  const [isDeletingSection, setIsDeletingSection] = useState(false);
  
  // Estados para modales - Productos
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
  const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);
  const [isDeleteProductModalOpen, setIsDeleteProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);

  // Referencias para el scroll automático
  const sectionListRef = useRef<HTMLDivElement>(null);
  
  // Cargar datos iniciales
  useEffect(() => {
    if (status === 'authenticated') {
      loadInitialData();
    }
  }, [status]);
  
  /**
   * Carga los datos iniciales del dashboard
   */
  const loadInitialData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Obtener datos del cliente
      const clientData = await fetch('/api/client').then(res => {
        if (!res.ok) throw new Error('Error al cargar datos del cliente');
        return res.json();
      });
      
      setClient(clientData);
      
      // Obtener categorías
      const categoriesData = await fetch('/api/categories').then(res => {
        if (!res.ok) throw new Error('Error al cargar categorías');
        return res.json();
      });
      
      setCategories(categoriesData);
    } catch (err: any) {
      console.error('Error al cargar datos iniciales:', err);
      setError(err.message || 'Error al cargar los datos del dashboard');
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Función para manejar la navegación entre vistas
   */
  const getBreadcrumbItems = () => {
    const items = [
      {
        id: 'home',
        name: 'Dashboard',
        onClick: () => {
          setCurrentView('categories');
          setSelectedCategory(null);
          setSelectedSection(null);
        },
        current: currentView === 'categories'
      }
    ];
    
    if (currentView === 'sections' && selectedCategory) {
      items.push({
        id: `category-${selectedCategory.category_id}`,
        name: selectedCategory.name,
        onClick: () => {
          // No hacer nada, ya estamos en esta vista
        },
        current: true
      });
    }
    
    if (currentView === 'products' && selectedCategory && selectedSection) {
      items.push({
        id: `category-${selectedCategory.category_id}`,
        name: selectedCategory.name,
        onClick: () => {
          setCurrentView('sections');
          setSelectedSection(null);
        },
        current: false
      });
      
      items.push({
        id: `section-${selectedSection.section_id}`,
        name: selectedSection.name,
        onClick: () => {
          // No hacer nada, ya estamos en esta vista
        },
        current: true
      });
    }
    
    return items;
  };
  
  /**
   * Manejador para el click en una categoría
   */
  const handleCategoryClick = async (categoryId: number) => {
    // Lógica para expandir/contraer categoría y cargar secciones
    const isExpanded = expandedCategories[categoryId];
    
    // Actualizar el estado de expansión
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !isExpanded
    }));
    
    // Si estamos expandiendo y no tenemos las secciones cargadas, cargarlas
    if (!isExpanded && !sections[categoryId]) {
      setLoadingSections(prev => ({
        ...prev,
        [categoryId]: true
      }));
      
      try {
        const sectionsData = await fetch(`/api/sections?category_id=${categoryId}`).then(res => {
          if (!res.ok) throw new Error('Error al cargar secciones');
          return res.json();
        });
        
        // Actualizar las secciones
        setSections(prev => ({
          ...prev,
          [categoryId]: sectionsData
        }));
      } catch (error) {
        console.error('Error al cargar secciones:', error);
        toast.error('Error al cargar las secciones');
      } finally {
        setLoadingSections(prev => ({
          ...prev,
          [categoryId]: false
        }));
      }
    }
  };
  
  /**
   * Manejador para la navegación a una categoría
   */
  const navigateToCategory = (categoryId: number) => {
    const category = categories.find(c => c.category_id === categoryId);
    if (category) {
      setSelectedCategory(category);
      setCurrentView('sections');
      
      // Cargar secciones si no están cargadas
      if (!sections[categoryId]) {
        handleCategoryClick(categoryId);
      }
    }
  };
  
  /**
   * Manejador para el click en una sección
   */
  const handleSectionClick = async (sectionId: number) => {
    // Lógica para expandir/contraer sección y cargar productos
    const isExpanded = expandedSections[sectionId];
    
    // Actualizar el estado de expansión
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !isExpanded
    }));
    
    // Si estamos expandiendo y no tenemos los productos cargados, cargarlos
    if (!isExpanded && !products[sectionId]) {
      setLoadingProducts(prev => ({
        ...prev,
        [sectionId]: true
      }));
      
      try {
        const productsData = await fetch(`/api/products?section_id=${sectionId}`).then(res => {
          if (!res.ok) throw new Error('Error al cargar productos');
          return res.json();
        });
        
        // Actualizar los productos
        setProducts(prev => ({
          ...prev,
          [sectionId]: productsData
        }));
      } catch (error) {
        console.error('Error al cargar productos:', error);
        toast.error('Error al cargar los productos');
      } finally {
        setLoadingProducts(prev => ({
          ...prev,
          [sectionId]: false
        }));
      }
    }
  };
  
  /**
   * Manejador para la navegación a una sección
   */
  const navigateToSection = (sectionId: number) => {
    if (!selectedCategory) return;
    
    const section = sections[selectedCategory.category_id]?.find(s => s.section_id === sectionId);
    if (section) {
      setSelectedSection(section);
      setCurrentView('products');
      
      // Cargar productos si no están cargados
      if (!products[sectionId]) {
        handleSectionClick(sectionId);
      }
    }
  };
  
  /**
   * Manejador para volver a la vista anterior
   */
  const navigateBack = () => {
    if (currentView === 'products') {
      setCurrentView('sections');
      setSelectedSection(null);
    } else if (currentView === 'sections') {
      setCurrentView('categories');
      setSelectedCategory(null);
    }
  };
  
  /**
   * Manejador para activar/desactivar modo de reordenación
   */
  const toggleReorderMode = () => {
    setIsReorderModeActive(!isReorderModeActive);
  };
  
  /**
   * Manejador para activar la vista previa en modo flotante
   */
  const togglePreview = () => {
    // Activar la vista previa (esta función activa el FloatingPhonePreview)
    const event = new CustomEvent('toggle-preview');
    window.dispatchEvent(event);
  };
  
  /**
   * Implementación local de deleteSection
   */
  const deleteSection = async (sectionId: number): Promise<boolean> => {
    if (!client?.id) return false;
    
    try {
      // Usar el hook useSections para eliminar la sección
      const { deleteSection } = useSections(client.id);
      
      // Buscar la categoría a la que pertenece esta sección
      let categoryId: number | null = null;
      for (const [catId, sectionList] of Object.entries(sections)) {
        if (sectionList.some(s => s.section_id === sectionId)) {
          categoryId = parseInt(catId);
          break;
        }
      }
      
      if (!categoryId) {
        console.error('No se encontró categoría para la sección', sectionId);
        return false;
      }
      
      const result = await deleteSection(categoryId, sectionId);
      return result;
    } catch (error) {
      console.error('Error en deleteSection:', error);
      return false;
    }
  };
  
  /**
   * Implementación local de deleteProduct
   */
  const deleteProduct = async (productId: number): Promise<boolean> => {
    try {
      // Usar el hook useProducts para eliminar el producto
      const { deleteProduct } = useProducts();
      await deleteProduct(productId);
      return true;
    } catch (error) {
      console.error('Error en deleteProduct:', error);
      return false;
    }
  };

  // Renderizar el dashboard según la vista actual
  return (
    <DashboardLayout
      isReorderModeActive={isReorderModeActive}
      onToggleReorderMode={toggleReorderMode}
      breadcrumbItems={getBreadcrumbItems()}
      currentView={currentView}
      selectedCategory={selectedCategory}
      selectedSection={selectedSection}
      onNewCategory={() => setIsNewCategoryModalOpen(true)}
      onNewSection={() => setIsNewSectionModalOpen(true)}
      onNewProduct={() => setIsNewProductModalOpen(true)}
      onTogglePreview={togglePreview}
      isLoading={isLoading}
      error={error}
      message={message}
      onDismissError={() => setError(null)}
      onDismissMessage={() => setMessage(null)}
    >
      {/* Vista de categorías */}
      {currentView === 'categories' && (
        <CategoriesView
          categories={categories}
          expandedCategories={expandedCategories}
          onCategoryClick={categoryId => {
            // Si estamos en modo de categorías, expandir/contraer
            // Si estamos en modo de navegación, navegar a la categoría
            if (isReorderModeActive) {
              handleCategoryClick(categoryId);
            } else {
              navigateToCategory(categoryId);
            }
          }}
          onNewCategory={() => setIsNewCategoryModalOpen(true)}
          onEditCategory={category => {
            setCategoryToEdit(category);
            setIsEditCategoryModalOpen(true);
          }}
          onDeleteCategory={categoryId => {
            setCategoryToDelete(categoryId);
            setIsDeleteCategoryModalOpen(true);
          }}
          onToggleVisibility={async (categoryId) => {
            setIsUpdatingVisibility(categoryId);
            try {
              // Lógica para cambiar visibilidad
              const category = categories.find(c => c.category_id === categoryId);
              if (!category) return;
              
              const newStatus = category.status === 1 ? 0 : 1;
              await fetch(`/api/categories/${categoryId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
              });
              
              // Actualizar localmente
              setCategories(prev => prev.map(c => 
                c.category_id === categoryId 
                ? { ...c, status: newStatus } 
                : c
              ));
              
              setMessage(`Categoría ${newStatus === 1 ? 'visible' : 'oculta'} correctamente`);
            } catch (error) {
              setError('Error al cambiar la visibilidad de la categoría');
            } finally {
              setIsUpdatingVisibility(null);
            }
          }}
          isUpdatingVisibility={isUpdatingVisibility}
          onReorderCategory={(sourceIndex, destinationIndex) => {
            // Lógica para reordenar categorías
            if (sourceIndex === destinationIndex) return;
            
            // Crear una copia del array de categorías
            const updatedCategories = [...categories];
            
            // Obtener la categoría que se está moviendo
            const [movedCategory] = updatedCategories.splice(sourceIndex, 1);
            
            // Insertar la categoría en la nueva posición
            updatedCategories.splice(destinationIndex, 0, movedCategory);
            
            // Actualizar los display_order de todas las categorías reordenadas
            const reorderedCategories = updatedCategories.map((category, index) => ({
              ...category,
              display_order: index + 1,
            }));
            
            // Actualizar el estado local
            setCategories(reorderedCategories);
            
            // Enviar cambios al servidor (implementar en segundo plano)
            // Esta parte podría extraerse a una función separada
          }}
        />
      )}

      {/* Vista de secciones */}
      {currentView === 'sections' && selectedCategory && (
        <SectionsView
          selectedCategory={selectedCategory}
          sections={sections[selectedCategory.category_id] || []}
          expandedSections={expandedSections}
          onSectionClick={sectionId => {
            // Similar a categorías, navegar o expandir/contraer
            if (isReorderModeActive) {
              handleSectionClick(sectionId);
            } else {
              navigateToSection(sectionId);
            }
          }}
          onNewSection={() => setIsNewSectionModalOpen(true)}
          onEditSection={section => {
            setSectionToEdit(section);
            setIsEditSectionModalOpen(true);
          }}
          onDeleteSection={sectionId => {
            setSectionToDelete(sectionId);
            setIsDeleteSectionModalOpen(true);
          }}
          onToggleVisibility={async (sectionId) => {
            // Lógica similar a categorías pero para secciones
            setIsUpdatingVisibility(sectionId);
            try {
              // Implementar cambio de visibilidad
            } finally {
              setIsUpdatingVisibility(null);
            }
          }}
          isUpdatingVisibility={isUpdatingVisibility}
          onReorderSection={(sourceIndex, destinationIndex) => {
            // Lógica para reordenar secciones
          }}
          onBackClick={navigateBack}
          allCategories={categories}
          allSections={sections}
          client={client}
        />
      )}

      {/* Vista de productos */}
      {currentView === 'products' && selectedCategory && selectedSection && (
        <ProductsView
          selectedCategory={selectedCategory}
          selectedSection={selectedSection}
          products={products[selectedSection.section_id] || []}
          onNewProduct={() => setIsNewProductModalOpen(true)}
          onEditProduct={product => {
            setProductToEdit(product);
            setIsEditProductModalOpen(true);
          }}
          onDeleteProduct={productId => {
            setProductToDelete(productId);
            setIsDeleteProductModalOpen(true);
          }}
          onToggleVisibility={async (productId) => {
            // Lógica similar a categorías pero para productos
            setIsUpdatingVisibility(productId);
            try {
              // Implementar cambio de visibilidad
            } finally {
              setIsUpdatingVisibility(null);
            }
          }}
          isUpdatingVisibility={isUpdatingVisibility}
          onReorderProduct={(sourceIndex, destinationIndex) => {
            // Lógica para reordenar productos
          }}
          onBackClick={navigateBack}
          allCategories={categories}
          allSections={sections}
          allProducts={products}
          client={client}
        />
      )}
      
      {/* Modales para categorías */}
      <NewCategoryModal
        isOpen={isNewCategoryModalOpen}
        onClose={() => setIsNewCategoryModalOpen(false)}
        client={client as any}
        setCategories={setCategories}
      />
      
      <EditCategoryModal
        isOpen={isEditCategoryModalOpen}
        onClose={() => {
          setIsEditCategoryModalOpen(false);
          setCategoryToEdit(null);
        }}
        categoryToEdit={categoryToEdit}
        client={client as any}
        setCategories={setCategories}
      />
      
      <DeleteCategoryModal
        isOpen={isDeleteCategoryModalOpen}
        onClose={() => {
          setIsDeleteCategoryModalOpen(false);
          setCategoryToDelete(null);
        }}
        categoryToDelete={categoryToDelete}
        deleteCategory={async (categoryId) => {
          // Implementar eliminación de categoría
          return true;
        }}
        isDeletingCategory={isDeletingCategory}
        setCategories={setCategories}
      />
      
      {/* Modales para secciones */}
      <NewSectionModal
        isOpen={isNewSectionModalOpen}
        onClose={() => setIsNewSectionModalOpen(false)}
        client={client as any}
        selectedCategory={selectedCategory}
        setSections={setSections}
      />
      
      <EditSectionModal
        isOpen={isEditSectionModalOpen}
        onClose={() => {
          setIsEditSectionModalOpen(false);
          setSectionToEdit(null);
        }}
        sectionToEdit={sectionToEdit}
        client={client as any}
        selectedCategory={selectedCategory}
        setSections={setSections}
      />
      
      <DeleteSectionModal
        isOpen={isDeleteSectionModalOpen}
        onClose={() => setIsDeleteSectionModalOpen(false)}
        sectionToDelete={sectionToDelete}
        deleteSection={deleteSection}
        isDeletingSection={isDeletingSection}
        selectedCategory={selectedCategory}
        setSections={setSections}
      />
      
      {/* Modales para productos */}
      <NewProductModal
        isOpen={isNewProductModalOpen}
        onClose={() => setIsNewProductModalOpen(false)}
        client={client as any}
        selectedSection={selectedSection}
        setProducts={setProducts}
      />
      
      <EditProductModal
        isOpen={isEditProductModalOpen}
        onClose={() => {
          setIsEditProductModalOpen(false);
          setProductToEdit(null);
        }}
        productToEdit={productToEdit}
        client={client as any}
        selectedSection={selectedSection}
        setProducts={setProducts}
      />
      
      <DeleteProductModal
        isOpen={isDeleteProductModalOpen}
        onClose={() => setIsDeleteProductModalOpen(false)}
        productToDelete={productToDelete}
        deleteProduct={deleteProduct}
        isDeletingProduct={isDeletingProduct}
        selectedSection={selectedSection}
        setProducts={setProducts}
      />
    </DashboardLayout>
  );
} 