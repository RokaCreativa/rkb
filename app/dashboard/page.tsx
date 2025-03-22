"use client";

import { useState, useEffect, Fragment, useRef } from 'react';
import { EyeIcon, PlusIcon, ChevronDownIcon, PencilIcon, XMarkIcon, TrashIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { PhonePreview } from '@/components/PhonePreview';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Dialog, Transition } from '@headlessui/react';
import { toast } from 'react-hot-toast';
import { getImagePath, handleImageError } from '@/lib/imageUtils';
import MenuSectionProducts from '@/components/MenuSectionProducts';
import ContentPanel from '@/components/ContentPanel';
import CollapsiblePreview from '@/components/CollapsiblePreview';
import CategoryTable from '@/components/CategoryTable';
import SectionTable from '@/components/SectionTable';
import ProductTable from '@/components/ProductTable';
import Breadcrumbs from '@/components/Breadcrumbs';
import TopNavbar from '@/components/layout/TopNavbar';

// Interfaces ajustadas a la estructura actualizada
interface Category {
  category_id: number;
  name: string;
  image: string | null;
  status: number; // 1 (activo) o 0 (inactivo)
  display_order: number;
  client_id: number;
}

interface Section {
  section_id: number;
  name: string;
  image: string | null;
  status: number; // 1 (activo) o 0 (inactivo)
  display_order: number;
  client_id: number;
  category_id: number;
  products_count: number;
}

interface Product {
  product_id: number;
  name: string;
  image: string | null;
  status: number; // 1 (activo) o 0 (inactivo)
  display_order: number;
  client_id: number;
  price: number;
  description: string | null;
  sections: {
    section_id: number;
    name: string;
  }[];
}

interface Client {
  id: number;
  name: string;
  logo: string | null;
  main_logo: string | null;
}

// Obtener datos del cliente autenticado
async function fetchClientData() {
  const response = await fetch('/api/client');
  if (!response.ok) throw new Error('Error al cargar datos del cliente');
  return await response.json();
}

// Obtener categorías del cliente autenticado
async function fetchCategories() {
  const response = await fetch('/api/categories');
  if (!response.ok) throw new Error('Error al cargar categorías');
  return await response.json();
}

// Obtener secciones para una categoría específica
async function fetchSections(categoryId: number) {
  const response = await fetch(`/api/sections?category_id=${categoryId}`);
  if (!response.ok) throw new Error('Error al cargar secciones');
  return await response.json();
}

// Obtener productos para una sección específica
async function fetchProducts(sectionId: number) {
  const response = await fetch(`/api/products?section_id=${sectionId}`);
  if (!response.ok) throw new Error('Error al cargar productos');
  return await response.json();
}

// Actualizar el orden de una categoría
async function updateCategoryOrder(categoryId: number, newDisplayOrder: number) {
  try {
    const response = await fetch(`/api/categories/${categoryId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ display_order: newDisplayOrder }),
    });
    
    if (!response.ok) {
      throw new Error('Error al actualizar el orden');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error al actualizar el orden de la categoría:', error);
    throw error;
  }
}

// Actualizar la visibilidad de una categoría
async function updateCategoryVisibility(categoryId: number, newStatus: number) {
  try {
    console.log(`DEBUG: Actualizando visibilidad de categoría ${categoryId} a ${newStatus}`);
    
    // Cambiar para usar el endpoint principal con método PUT en lugar de la URL con ID
    const response = await fetch('/api/categories', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        category_id: categoryId,
        status: newStatus
      }),
    });
    
    console.log('DEBUG: Respuesta recibida, status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('DEBUG: Error en respuesta:', errorData);
      throw new Error('Error al actualizar la visibilidad');
    }
    
    const data = await response.json();
    console.log('DEBUG: Datos recibidos:', data);
    return data;
  } catch (error) {
    console.error('Error al actualizar la visibilidad de la categoría:', error);
    throw error;
  }
}

// Eliminar una categoría
async function deleteCategory(categoryId: number) {
  try {
    const response = await fetch(`/api/categories/${categoryId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Error al eliminar la categoría');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error al eliminar la categoría:', error);
    throw error;
  }
}

// Función para crear un nuevo cliente
async function createClient(clientData: FormData) {
  const response = await fetch('/api/client', {
    method: 'POST',
    body: clientData
  });
  if (!response.ok) throw new Error('Error al crear cliente');
  return await response.json();
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [client, setClient] = useState<Client | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sections, setSections] = useState<Record<number, Section[]>>({});
  const [products, setProducts] = useState<Record<number, Product[]>>({});
  const [expandedCategories, setExpandedCategories] = useState<Record<number, boolean>>({});
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({});
  const [loadingSections, setLoadingSections] = useState<Record<number, boolean>>({});
  const [loadingProducts, setLoadingProducts] = useState<Record<number, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false);
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState<number | null>(null);
  const [editingCategory, setEditingCategory] = useState<{ id: number, name: string } | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeletingCategory, setIsDeletingCategory] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isNewCategoryModalOpen, setIsNewCategoryModalOpen] = useState(false);
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [editCategoryImage, setEditCategoryImage] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'categories' | 'sections' | 'products'>('categories');
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);
  const [isDeleteProductModalOpen, setIsDeleteProductModalOpen] = useState(false);
  const [isReorderModeActive, setIsReorderModeActive] = useState(false);
  
  // Referencias para el scroll automático
  const sectionListRef = useRef<HTMLDivElement>(null);
  const productListRef = useRef<HTMLDivElement>(null);

  // Función para reordenar categorías (drag and drop)
  const handleReorderCategory = async (sourceIndex: number, destinationIndex: number) => {
    if (sourceIndex === destinationIndex) return;
    
    try {
      setIsLoading(true);
      
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
      
      // Actualizar el estado local inmediatamente para mejor UX
      setCategories(reorderedCategories);
      
      // Enviar los cambios al servidor
      const updatePromises = reorderedCategories.map(category => 
        fetch(`/api/categories/${category.category_id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            display_order: category.display_order,
            // Incluir otros campos necesarios para la API
            name: category.name,
            client_id: category.client_id,
            image: category.image || null,
            status: category.status
          }),
        })
      );
      
      await Promise.all(updatePromises);
      toast.success('Orden de categorías actualizado');
    } catch (error) {
      console.error('Error al reordenar categorías:', error);
      toast.error('Error al actualizar el orden de las categorías');
      
      // Volver a cargar las categorías en caso de error
      const loadCategories = async () => {
        try {
        const categoriesData = await fetchCategories();
        setCategories(categoriesData);
        } catch (err) {
          console.error('Error al recargar categorías:', err);
        }
      };
      
      loadCategories();
      } finally {
        setIsLoading(false);
      }
    };
    
  // Función para reordenar secciones (drag and drop)
  const handleReorderSection = async (sourceIndex: number, destinationIndex: number) => {
    if (sourceIndex === destinationIndex || !selectedCategory) return;
    
    try {
      setIsLoading(true);
      
      // Crear una copia del array de secciones
      const currentSections = sections[selectedCategory.category_id] || [];
      const updatedSections = [...currentSections];
      
      // Obtener la sección que se está moviendo
      const [movedSection] = updatedSections.splice(sourceIndex, 1);
      
      // Insertar la sección en la nueva posición
      updatedSections.splice(destinationIndex, 0, movedSection);
      
      // Actualizar los display_order de todas las secciones reordenadas
      const reorderedSections = updatedSections.map((section, index) => ({
        ...section,
        display_order: index + 1,
      }));
      
      // Actualizar el estado local inmediatamente para mejor UX
      setSections(prev => ({
        ...prev,
        [selectedCategory.category_id]: reorderedSections
      }));
      
      // Enviar los cambios al servidor
      const updatePromises = reorderedSections.map(section => 
        fetch(`/api/sections/${section.section_id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            display_order: section.display_order,
            // Incluir otros campos necesarios para la API
            name: section.name,
            category_id: section.category_id,
            client_id: section.client_id,
            image: section.image || null,
            status: section.status
          }),
        })
      );
      
      await Promise.all(updatePromises);
      toast.success('Orden de secciones actualizado');
    } catch (error) {
      console.error('Error al reordenar secciones:', error);
      toast.error('Error al actualizar el orden de las secciones');
      
      // Volver a cargar las secciones en caso de error
      if (selectedCategory) {
        const loadSections = async (categoryId: number) => {
          try {
            const sectionsData = await fetchSections(categoryId);
            setSections(prev => ({
              ...prev,
              [categoryId]: sectionsData
            }));
          } catch (err) {
            console.error('Error al recargar secciones:', err);
          }
        };
        
        loadSections(selectedCategory.category_id);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Función para reordenar productos (drag and drop)
  const handleReorderProduct = async (sourceIndex: number, destinationIndex: number) => {
    if (sourceIndex === destinationIndex || !selectedSection) return;
    
    try {
      setIsLoading(true);
      
      // Crear una copia del array de productos
      const currentProducts = products[selectedSection.section_id] || [];
      const updatedProducts = [...currentProducts];
      
      // Obtener el producto que se está moviendo
      const [movedProduct] = updatedProducts.splice(sourceIndex, 1);
      
      // Insertar el producto en la nueva posición
      updatedProducts.splice(destinationIndex, 0, movedProduct);
      
      // Actualizar los display_order de todos los productos reordenados
      const reorderedProducts = updatedProducts.map((product, index) => ({
        ...product,
        display_order: index + 1,
      }));
      
      // Actualizar el estado local inmediatamente para mejor UX
      setProducts(prev => ({
        ...prev,
        [selectedSection.section_id]: reorderedProducts
      }));
      
      // Enviar los cambios al servidor
      const updatePromises = reorderedProducts.map(product => 
        fetch(`/api/products/${product.product_id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            display_order: product.display_order,
            // Incluir otros campos necesarios para la API
            name: product.name,
            section_id: product.section_id,
            client_id: product.client_id,
            image: product.image || null,
            status: product.status,
            price: product.price,
            description: product.description || null
          }),
        })
      );
      
      await Promise.all(updatePromises);
      toast.success('Orden de productos actualizado');
    } catch (error) {
      console.error('Error al reordenar productos:', error);
      toast.error('Error al actualizar el orden de los productos');
      
      // Volver a cargar los productos en caso de error
      if (selectedSection) {
        const loadProducts = async (sectionId: number) => {
          try {
            const productsData = await fetchProducts(sectionId);
            setProducts(prev => ({
              ...prev,
              [sectionId]: productsData
            }));
          } catch (err) {
            console.error('Error al recargar productos:', err);
          }
        };
        
        loadProducts(selectedSection.section_id);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Efecto para cargar datos iniciales al autenticarse
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const clientData = await fetchClientData();
        const categoriesData = await fetchCategories();

        setClient(clientData);
        setCategories(categoriesData);
        setSelectedCategory(categoriesData[0] || null);
        
        console.log("Datos del cliente:", clientData);
        console.log("Logo principal:", clientData.main_logo);
        console.log("Logo URL completa:", `/images/main_logo/${clientData.main_logo}`);
        
      } catch (err: any) {
        setError(err.message || 'Error desconocido al cargar datos');
    } finally {
      setIsLoading(false);
    }
  };

    if (status === 'authenticated') loadData();
  }, [status]);

  // Función para manejar el click en una categoría
  const handleCategoryClick = async (categoryId: number) => {
    const isExpanded = expandedCategories[categoryId];
    
    // Actualizar el estado de expansión
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !isExpanded
    }));
    
    // Si estamos expandiendo y no tenemos las secciones cargadas, cargarlas
    if (!isExpanded && !sections[categoryId]) {
      // Marcar como cargando
      setLoadingSections(prev => ({
        ...prev,
        [categoryId]: true
      }));
      
      try {
        const sectionsData = await fetchSections(categoryId);
        
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
    
    // Hacer scroll automático a la sección expandida después de un breve retraso
    setTimeout(() => {
      if (!isExpanded) {
        const element = document.getElementById(`category-${categoryId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }, 100);
  };

  // Función para manejar el click en una sección
  const handleSectionClick = async (sectionId: number) => {
    const isExpanded = expandedSections[sectionId];
    
    // Actualizar el estado de expansión
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !isExpanded
    }));
    
    // Si estamos expandiendo y no tenemos los productos cargados, cargarlos
    if (!isExpanded && !products[sectionId]) {
      // Marcar como cargando
      setLoadingProducts(prev => ({
        ...prev,
        [sectionId]: true
      }));
      
      try {
        const productsData = await fetchProducts(sectionId);
        
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
    
    // Hacer scroll automático a la sección expandida después de un breve retraso
    setTimeout(() => {
      if (!isExpanded) {
        const element = document.getElementById(`section-${sectionId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }, 100);
  };

  // Funciones para la navegación entre vistas
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
  
  const navigateBack = () => {
    if (currentView === 'products') {
      setCurrentView('sections');
      setSelectedProduct(null);
    } else if (currentView === 'sections') {
      setCurrentView('categories');
      setSelectedSection(null);
    }
  };

  // Función para actualizar la visibilidad de una categoría
  const toggleCategoryVisibility = async (categoryId: number, currentStatus: number) => {
    setIsUpdatingVisibility(categoryId);
    try {
      // Llamar a la API para actualizar el estado
      await updateCategoryVisibility(categoryId, currentStatus === 1 ? 0 : 1);
      
      // Actualizar estado local
      setCategories(prev => 
        prev.map(cat => 
          cat.category_id === categoryId 
            ? { ...cat, status: currentStatus === 1 ? 0 : 1 } 
            : cat
        )
      );
      
      toast.success('Estado actualizado correctamente');
      } catch (error) {
      console.error('Error al actualizar visibilidad:', error);
      toast.error('Error al actualizar el estado');
      } finally {
      setIsUpdatingVisibility(null);
    }
  };

  // Función para editar una categoría
  const handleEditCategory = (category: Category) => {
    setEditingCategory({
      id: category.category_id,
      name: category.name
    });
    setEditCategoryName(category.name);
    setEditImagePreview(category.image ? getImagePath(category.image, 'categories') : null);
    setIsEditModalOpen(true);
  };

  // Función para eliminar una categoría
  const handleDeleteCategory = (categoryId: number) => {
    setCategoryToDelete(categoryId);
    setIsDeleteModalOpen(true);
  };
  
  // Generar items para el componente de breadcrumbs
  const getBreadcrumbItems = () => {
    const items = [
      { 
        id: null, 
        name: 'Categorías', 
        onClick: () => setCurrentView('categories'), 
        current: currentView === 'categories' 
      }
    ];
    
    if (currentView === 'sections' && selectedCategory) {
      items.push({ 
        id: selectedCategory.category_id, 
        name: selectedCategory.name, 
        onClick: () => {}, 
        current: true 
      });
    }
    
    if (currentView === 'products' && selectedCategory && selectedSection) {
      items.push({ 
        id: selectedCategory.category_id, 
        name: selectedCategory.name, 
        onClick: () => navigateBack(), 
        current: false 
      });
      
      items.push({ 
        id: selectedSection.section_id, 
        name: selectedSection.name, 
        onClick: () => {}, 
        current: true 
      });
    }
    
    return items;
  };

  // Función para alternar el modo de reordenamiento
  const toggleReorderMode = () => {
    setIsReorderModeActive(prev => !prev);
  };

  // Mostrar indicador de carga mientras se cargan los datos
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
    )
  }

  // Mostrar mensaje de error si hay alguno
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    )
  }

  return (
    <>
      <TopNavbar 
        isReorderModeActive={isReorderModeActive}
        onToggleReorderMode={toggleReorderMode}
      />
      <div className="max-w-6xl mx-auto pt-2">
        {/* Breadcrumbs y botón de acción */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 px-4">
          {/* Breadcrumbs */}
          <div>
            <Breadcrumbs items={getBreadcrumbItems()} />
          </div>
              
          {/* Botón de acción según la vista */}
          <div>
            {currentView === 'categories' && (
              <button
                onClick={() => setIsNewCategoryModalOpen(true)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Nueva Categoría
              </button>
            )}
            
            {currentView === 'sections' && selectedCategory && (
            <button
                onClick={() => console.log('Abrir modal de nueva sección')}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                <PlusIcon className="h-4 w-4 mr-1" />
                Nueva Sección
            </button>
            )}
            
            {currentView === 'products' && selectedSection && (
                            <button
                onClick={() => console.log('Abrir modal de nuevo producto')}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Nuevo Producto
                            </button>
                )}
                        </div>
                          </div>
          
        {/* Contenido principal según la vista */}
        <div className="space-y-3" ref={sectionListRef}>
          {currentView === 'categories' && (
            <CategoryTable 
              categories={categories}
              expandedCategories={expandedCategories}
              onCategoryClick={handleCategoryClick}
              onEditCategory={handleEditCategory}
              onDeleteCategory={handleDeleteCategory}
              onToggleVisibility={toggleCategoryVisibility}
              isUpdatingVisibility={isUpdatingVisibility}
              onReorderCategory={handleReorderCategory}
            />
          )}
          
          {currentView === 'sections' && selectedCategory && (
            <div className="space-y-4">
              <SectionTable 
                sections={sections[selectedCategory.category_id] || []}
                expandedSections={expandedSections}
                onSectionClick={handleSectionClick}
                onBackClick={navigateBack}
                categoryName={selectedCategory.name}
                onToggleVisibility={(sectionId, status) => console.log('Toggle visibility', sectionId, status)}
              />
                          </div>
          )}
          
          {currentView === 'products' && selectedSection && (
            <div className="space-y-4" ref={productListRef}>
              <ProductTable 
                products={products[selectedSection.section_id] || []}
                onBackClick={navigateBack}
                sectionName={selectedSection.name}
                onToggleVisibility={(productId, status) => console.log('Toggle visibility', productId, status)}
                                                  />
            </div>
                      )}
      </div>
      
        {/* Secciones expandidas para categorías */}
        {currentView === 'categories' && categories.map(category => {
          if (!expandedCategories[category.category_id]) return null;
          
          return (
            <div 
              key={`category-${category.category_id}`}
              id={`category-${category.category_id}`}
              className="mt-4 pl-4 border-l-2 border-indigo-100"
            >
              <SectionTable 
                sections={sections[category.category_id] || []}
                expandedSections={expandedSections}
                onSectionClick={handleSectionClick}
                categoryName={category.name}
                onToggleVisibility={(sectionId, status) => console.log('Toggle visibility', sectionId, status)}
              />
              
              {/* Productos expandidos para secciones */}
              {sections[category.category_id]?.map(section => {
                if (!expandedSections[section.section_id]) return null;
                
                return (
                  <div 
                    key={`section-${section.section_id}`}
                    id={`section-${section.section_id}`}
                    className="mt-4 pl-4 border-l-2 border-indigo-100"
                  >
                    <ProductTable 
                      products={products[section.section_id] || []}
                      sectionName={section.name}
                      onToggleVisibility={(productId, status) => console.log('Toggle visibility', productId, status)}
          />
        </div>
                );
              })}
                    </div>
          );
        })}
        
        {/* Modal para nueva categoría */}
        <Transition appear show={isNewCategoryModalOpen} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={() => setIsNewCategoryModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                  <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900"
                    >
                      Nueva Categoría
                  </Dialog.Title>
                    <div className="mt-4">
                      <form>
                        <div className="mb-4">
                          <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700">
                            Nombre
                          </label>
                          <input
                            type="text"
                            id="categoryName"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="Nombre de la categoría"
                          />
                        </div>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700">
                            Imagen
                          </label>
                          <div className="mt-1 flex items-center space-x-4">
                            <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-100 border border-gray-300">
                              {imagePreview ? (
                                <img src={imagePreview} alt="Vista previa" className="h-full w-full object-cover" />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-gray-400">
                                  <ArrowUpTrayIcon className="h-6 w-6" />
                                </div>
                              )}
                            </div>
                            <div>
                              <input
                                type="file"
                                id="categoryImage"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    setSelectedImage(file);
                                    const reader = new FileReader();
                                    reader.onload = (e) => {
                                      setImagePreview(e.target?.result as string);
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                              <label
                                htmlFor="categoryImage"
                                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              >
                                Seleccionar imagen
                              </label>
                            </div>
                          </div>
                        </div>
                      </form>
              </div>
              
                    <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                        className="inline-flex justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        onClick={() => {
                          setIsNewCategoryModalOpen(false);
                          setNewCategoryName('');
                          setSelectedImage(null);
                          setImagePreview(null);
                        }}
                >
                      Cancelar
                </button>
                <button
                  type="button"
                        className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        onClick={() => console.log('Crear categoría')}
                        disabled={isCreatingCategory || !newCategoryName.trim()}
                      >
                        {isCreatingCategory ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Creando...
                        </>
                      ) : (
                          'Crear Categoría'
                      )}
                </button>
              </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

        {/* Modal para editar categoría */}
        {/* Transición y diálogo similar al de nueva categoría */}
        
        {/* Modal para eliminar categoría */}
        {/* Transición y diálogo para confirmar eliminación */}
            </div>
    </>
  );
}
