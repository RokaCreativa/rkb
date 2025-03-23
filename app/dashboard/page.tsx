"use client";

import { useState, useEffect, Fragment, useRef } from 'react';
import { EyeIcon, PlusIcon, ChevronDownIcon, PencilIcon, XMarkIcon, TrashIcon, ArrowUpTrayIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { PhonePreview } from '@/components/PhonePreview';
import FloatingPhonePreview from '@/components/FloatingPhonePreview';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Dialog, Transition, Disclosure } from '@headlessui/react';
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
  price: string;
  description: string | null;
  section_id: number;
  sections: {
    section_id: number;
    name: string;
  }[];
}

// Interfaz para FloatingPhonePreview
interface FloatingPhoneCategory {
  id: number;
  category_id?: number;
  name: string;
  image?: string;
  sections?: FloatingPhoneSection[];
}

interface FloatingPhoneSection {
  id: number;
  name: string;
  image?: string;
  products?: FloatingPhoneProduct[];
}

interface FloatingPhoneProduct {
  id: number;
  name: string;
  price: string | number;
  description?: string;
  image?: string;
}

interface Client {
  id: number;
  client_id: number;
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

// Actualizar la visibilidad de una sección
async function updateSectionVisibility(sectionId: number, newStatus: number) {
  try {
    console.log(`DEBUG: Actualizando visibilidad de sección ${sectionId} a ${newStatus}`);
    
    const response = await fetch('/api/sections', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        section_id: sectionId,
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
    console.error('Error al actualizar la visibilidad de la sección:', error);
    throw error;
  }
}

// Actualizar la visibilidad de un producto
async function updateProductVisibility(productId: number, newStatus: number) {
  try {
    console.log(`DEBUG: Actualizando visibilidad de producto ${productId} a ${newStatus}`);
    
    const response = await fetch('/api/products', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product_id: productId,
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
    console.error('Error al actualizar la visibilidad del producto:', error);
    throw error;
  }
}

// Eliminar una sección
async function deleteSection(sectionId: number) {
  try {
    const response = await fetch(`/api/sections/${sectionId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Error al eliminar la sección');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error al eliminar la sección:', error);
    throw error;
  }
}

// Eliminar un producto
async function deleteProduct(productId: number) {
  try {
    const response = await fetch(`/api/products/${productId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Error al eliminar el producto');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error al eliminar el producto:', error);
    throw error;
  }
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
  const [isNewSectionModalOpen, setIsNewSectionModalOpen] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  const [newSectionImage, setNewSectionImage] = useState<File | null>(null);
  const [newSectionImagePreview, setNewSectionImagePreview] = useState<string | null>(null);
  const [isCreatingSection, setIsCreatingSection] = useState(false);
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductDescription, setNewProductDescription] = useState('');
  const [newProductImage, setNewProductImage] = useState<File | null>(null);
  const [newProductImagePreview, setNewProductImagePreview] = useState<string | null>(null);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [isDeleteSectionModalOpen, setIsDeleteSectionModalOpen] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState<number | null>(null);
  const [isDeletingSection, setIsDeletingSection] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);
  
  // Estados para edición de sección
  const [isEditSectionModalOpen, setIsEditSectionModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<{ id: number; name: string } | null>(null);
  const [editSectionName, setEditSectionName] = useState('');
  const [editSectionImage, setEditSectionImage] = useState<File | null>(null);
  const [editSectionImagePreview, setEditSectionImagePreview] = useState<string | null>(null);
  const [isUpdatingSectionName, setIsUpdatingSectionName] = useState(false);
  
  // Estados para edición de producto
  const [editingProduct, setEditingProduct] = useState<{ id: number; name: string } | null>(null);
  const [editProductName, setEditProductName] = useState('');
  const [editProductPrice, setEditProductPrice] = useState('');
  const [editProductDescription, setEditProductDescription] = useState('');
  const [editProductImage, setEditProductImage] = useState<File | null>(null);
  const [editProductImagePreview, setEditProductImagePreview] = useState<string | null>(null);
  const [isUpdatingProductName, setIsUpdatingProductName] = useState(false);
  
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
            section_id: selectedSection.section_id,
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

  // Precargar datos cuando se carga el dashboard
  useEffect(() => {
    if (categories.length > 0 && !isLoading) {
      console.log("Iniciando precarga de datos para todas las categorías...");
      const preloadAllData = async () => {
        const activeCategories = categories.filter(cat => cat.status === 1);
        console.log(`Precargando datos para ${activeCategories.length} categorías activas`);
        
        // Precargar todas las secciones primero
        for (const category of activeCategories) {
          if (!sections[category.category_id]) {
            try {
              console.log(`Precargando secciones para categoría ${category.name}`);
              const sectionsData = await fetchSections(category.category_id);
              
              setSections(prev => ({
                ...prev,
                [category.category_id]: sectionsData
              }));
              
              // Precargar productos para cada sección
              const activeSections = sectionsData.filter((sec: Section) => sec.status === 1);
              for (const section of activeSections) {
                if (!products[section.section_id]) {
                  console.log(`Precargando productos para sección ${section.name}`);
                  try {
                    const productsData = await fetchProducts(section.section_id);
                    setProducts(prev => ({
                      ...prev,
                      [section.section_id]: productsData
                    }));
                  } catch (error) {
                    console.error(`Error al precargar productos para sección ${section.name}:`, error);
                  }
                }
              }
            } catch (err) {
              console.error(`Error al precargar secciones para categoría ${category.name}:`, err);
            }
          }
        }
        console.log("Precarga de datos completada.");
      };
      
      preloadAllData();
    }
  }, [categories, isLoading]);

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

  // Función para actualizar la visibilidad de una sección
  const toggleSectionVisibility = async (sectionId: number, currentStatus: number) => {
    setIsUpdatingVisibility(sectionId);
    try {
      // Llamar a la API para actualizar el estado
      await updateSectionVisibility(sectionId, currentStatus === 1 ? 0 : 1);
      
      // Actualizar estado local
      setSections(prev => {
        const updated = {...prev};
        
        // Actualizar todas las secciones que coincidan con sectionId
        Object.keys(updated).forEach(categoryId => {
          if (updated[Number(categoryId)]) {
            updated[Number(categoryId)] = updated[Number(categoryId)].map(section => 
              section.section_id === sectionId 
                ? { ...section, status: currentStatus === 1 ? 0 : 1 } 
                : section
            );
          }
        });
        
        return updated;
      });
      
      toast.success('Estado actualizado correctamente');
    } catch (error) {
      console.error('Error al actualizar visibilidad:', error);
      toast.error('Error al actualizar el estado');
    } finally {
      setIsUpdatingVisibility(null);
    }
  };

  // Función para actualizar la visibilidad de un producto
  const toggleProductVisibility = async (productId: number, currentStatus: number) => {
    setIsUpdatingVisibility(productId);
    try {
      // Llamar a la API para actualizar el estado
      await updateProductVisibility(productId, currentStatus === 1 ? 0 : 1);
      
      // Actualizar estado local
      setProducts(prev => {
        const updated = {...prev};
        
        // Actualizar todos los productos que coincidan con productId
        Object.keys(updated).forEach(sectionId => {
          if (updated[Number(sectionId)]) {
            updated[Number(sectionId)] = updated[Number(sectionId)].map(product => 
              product.product_id === productId 
                ? { ...product, status: currentStatus === 1 ? 0 : 1 } 
                : product
            );
          }
        });
        
        return updated;
      });
      
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
        id: 'categories', 
        name: 'Categorías', 
        onClick: () => setCurrentView('categories'), 
        current: currentView === 'categories' 
      }
    ];
    
    if (currentView === 'sections' && selectedCategory) {
      items.push({ 
        id: `category-${selectedCategory.category_id}`, 
        name: selectedCategory.name, 
        onClick: () => {}, 
        current: true 
      });
    }
    
    if (currentView === 'products' && selectedCategory && selectedSection) {
      items.push({ 
        id: `category-${selectedCategory.category_id}`, 
        name: selectedCategory.name, 
        onClick: () => navigateBack(), 
        current: false 
      });
      
      items.push({ 
        id: `section-${selectedSection.section_id}`, 
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

  // Función para crear una nueva sección
  const handleCreateSection = async () => {
    if (!selectedCategory || !client) return;
    
    setIsCreatingSection(true);
    
    try {
      console.log("Creando sección para categoría:", selectedCategory);
      
      // Crear FormData para enviar la información
      const formData = new FormData();
      formData.append('name', newSectionName);
      formData.append('category_id', selectedCategory.category_id.toString());
      formData.append('client_id', client.id.toString());
      formData.append('status', '1'); // Estado activo por defecto
      
      if (newSectionImage) {
        formData.append('image', newSectionImage);
      }
      
      // Realizar la petición para crear la sección
      const response = await fetch('/api/sections', {
        method: 'POST',
        body: formData,
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        console.error("Error al crear sección:", responseData);
        throw new Error(responseData.error || 'Error al crear la sección');
      }
      
      console.log("Sección creada:", responseData);
      const newSection = responseData;
      
      // Actualizar el estado local para incluir la nueva sección
      setSections(prev => ({
        ...prev,
        [selectedCategory.category_id]: [
          ...(prev[selectedCategory.category_id] || []),
          newSection
        ]
      }));
      
      // Si es la primera sección, establecerla como seleccionada
      if ((sections[selectedCategory.category_id] || []).length === 0) {
        setSelectedSection(newSection);
        await fetchProducts(newSection.section_id);
      }
      
      // Cerrar el modal y limpiar el formulario
      setIsNewSectionModalOpen(false);
      setNewSectionName('');
      setNewSectionImage(null);
      setNewSectionImagePreview(null);
      
      // Mostrar mensaje de éxito
      toast.success('Sección creada con éxito');
    } catch (error) {
      console.error('Error al crear la sección:', error);
      toast.error('Error al crear la sección');
    } finally {
      setIsCreatingSection(false);
    }
  };
  
  // Manejador para el cambio de imagen de una nueva sección
  const handleNewSectionImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewSectionImage(file);
      
      // Crear una URL para previsualizar la imagen
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewSectionImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Manejador para la creación de un nuevo producto
  const handleCreateProduct = async () => {
    if (!selectedSection || !client) return;
    
    setIsCreatingProduct(true);
    
    try {
      // Crear FormData para enviar la información
      const formData = new FormData();
      formData.append('name', newProductName);
      formData.append('price', newProductPrice);
      formData.append('section_id', selectedSection.section_id.toString());
      formData.append('client_id', client.id.toString());
      
      if (newProductDescription) {
        formData.append('description', newProductDescription);
      }
      
      if (newProductImage) {
        formData.append('image', newProductImage);
      }
      
      // Realizar la petición para crear el producto
      const response = await fetch('/api/products', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Error al crear el producto');
      }
      
      const newProduct = await response.json();
      
      // Actualizar el estado local para incluir el nuevo producto
      setProducts(prev => ({
        ...prev,
        [selectedSection.section_id]: [
          ...(prev[selectedSection.section_id] || []),
          newProduct
        ]
      }));
      
      // Cerrar el modal y limpiar el formulario
      setIsNewProductModalOpen(false);
      setNewProductName('');
      setNewProductPrice('');
      setNewProductDescription('');
      setNewProductImage(null);
      setNewProductImagePreview(null);
      
      // Mostrar mensaje de éxito
      toast.success('Producto creado con éxito');
    } catch (error) {
      console.error('Error al crear el producto:', error);
      toast.error('Error al crear el producto');
      } finally {
      setIsCreatingProduct(false);
    }
  };
  
  // Manejador para el cambio de imagen de un nuevo producto
  const handleNewProductImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewProductImage(file);
      
      // Crear una URL para previsualizar la imagen
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProductImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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

  // Función para editar una sección
  const handleEditSection = (section: Section) => {
    setEditingSection({
      id: section.section_id,
      name: section.name
    });
    setEditSectionName(section.name);
    setEditSectionImagePreview(section.image ? getImagePath(section.image, 'sections') : null);
    setIsEditSectionModalOpen(true);
  };

  // Función para eliminar una sección
  const handleDeleteSection = (sectionId: number) => {
    setSectionToDelete(sectionId);
    setIsDeleteSectionModalOpen(true);
  };
  
  // Función para editar un producto
  const handleEditProduct = (product: Product) => {
    setEditingProduct({
      id: product.product_id,
      name: product.name
    });
    setEditProductName(product.name);
    setEditProductPrice(product.price);
    setEditProductDescription(product.description || '');
    setEditProductImagePreview(product.image ? getImagePath(product.image, 'products') : null);
    setIsEditProductModalOpen(true);
  };

  // Función para eliminar un producto
  const handleDeleteProduct = (productId: number) => {
    setProductToDelete(productId);
    setIsDeleteProductModalOpen(true);
  };

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
            <div className="flex items-center">
              <button
                onClick={() => {
                  // Activar la vista previa (esta función activa el FloatingPhonePreview)
                  const event = new CustomEvent('toggle-preview');
                  window.dispatchEvent(event);
                }}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <DevicePhoneMobileIcon className="h-4 w-4 mr-1" />
                Live Preview
              </button>
            </div>
            )}
            
            {currentView === 'sections' && selectedCategory && (
            <button
                onClick={() => setIsNewSectionModalOpen(true)}
                className="inline-flex items-center px-3 py-2 border border-indigo-300 text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm"
            >
                <PlusIcon className="h-4 w-4 mr-1" />
                Nueva Sección
            </button>
            )}
            
            {currentView === 'products' && selectedSection && (
                            <button
                onClick={() => setIsNewProductModalOpen(true)}
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
            <div className="w-full px-4">
              <div className="mb-4">
                <button
                  onClick={() => setIsNewCategoryModalOpen(true)}
                  className="w-full flex items-center justify-center px-4 py-2 border border-indigo-300 text-sm font-medium rounded-md text-indigo-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Nueva Categoría
                </button>
              </div>
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
            </div>
          )}
          
          {currentView === 'sections' && selectedCategory && (
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 px-4">
              <div className="w-full md:w-2/3">
                <div className="mb-4">
                  <button
                    onClick={() => setIsNewSectionModalOpen(true)}
                    className="w-full flex items-center justify-center px-4 py-2 border border-indigo-300 text-sm font-medium rounded-md text-indigo-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm"
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Añadir nueva sección a {selectedCategory.name}
                  </button>
                </div>
                {sections[selectedCategory.category_id] ? (
                  <SectionTable 
                    sections={sections[selectedCategory.category_id]}
                    expandedSections={expandedSections}
                    onSectionClick={handleSectionClick}
                    onBackClick={navigateBack}
                    categoryName={selectedCategory.name}
                    onEditSection={(sectionToEdit) => {
                      // Asegurar compatibilidad de tipos
                      const section: Section = {
                        ...sectionToEdit,
                        products_count: sectionToEdit.products_count || 0
                      };
                      handleEditSection(section);
                    }}
                    onDeleteSection={handleDeleteSection}
                    onToggleVisibility={toggleSectionVisibility}
                    isUpdatingVisibility={isUpdatingVisibility}
                    onReorderSection={(sourceIndex, destinationIndex) => {
                      // Implementar reordenamiento de secciones
                      console.log('Reordenar secciones', sourceIndex, destinationIndex);
                    }}
                  />
                ) : (
                  <div className="flex justify-center items-center h-40 bg-white rounded-lg border border-gray-200">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
                  </div>
                )}
              </div>
              <div className="w-full md:w-1/3">
                <FloatingPhonePreview 
                  clientName={client?.name || "Mi Restaurante"}
                  clientMainLogo={client?.main_logo || undefined}
                  categories={[{
                    id: selectedCategory.category_id,
                    name: selectedCategory.name,
                    image: selectedCategory.image || undefined,
                    sections: sections[selectedCategory.category_id]
                      ?.filter(sec => sec.status === 1)
                      .map(sec => ({
                        id: sec.section_id,
                        name: sec.name,
                        image: sec.image || undefined
                      }))
                  }]}
                />
              </div>
            </div>
          )}
          
          {currentView === 'products' && selectedCategory && selectedSection && (
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 px-4">
              <div className="w-full md:w-2/3">
                <div className="mb-4">
                  <button
                    onClick={() => setIsNewProductModalOpen(true)}
                    className="w-full flex items-center justify-center px-4 py-2 border border-indigo-300 text-sm font-medium rounded-md text-indigo-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm"
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Añadir nuevo producto a {selectedSection.name}
                  </button>
                </div>
                {products[selectedSection.section_id] ? (
                  <ProductTable 
                    products={products[selectedSection.section_id]}
                    onBackClick={navigateBack}
                    sectionName={selectedSection.name}
                    onEditProduct={(productToEdit) => {
                      // Asegurar compatibilidad de tipos agregando propiedades faltantes
                      const product: Product = {
                        ...productToEdit,
                        // Acceder a description de manera segura, verificando que exista en productToEdit
                        description: 'description' in productToEdit ? productToEdit.description as string | null : null,
                        sections: [] // Asumiendo que esta propiedad es necesaria según la definición de Product
                      };
                      handleEditProduct(product);
                    }}
                    onDeleteProduct={handleDeleteProduct}
                    onToggleVisibility={toggleProductVisibility}
                    isUpdatingVisibility={isUpdatingVisibility}
                    onReorderProduct={(sourceIndex, destinationIndex) => {
                      // Implementar reordenamiento de productos
                      console.log('Reordenar productos', sourceIndex, destinationIndex);
                    }}
                  />
                ) : (
                  <div className="flex justify-center items-center h-40 bg-white rounded-lg border border-gray-200">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
                  </div>
                )}
              </div>
              <div className="w-full md:w-1/3">
                <FloatingPhonePreview 
                  clientName={client?.name || "Mi Restaurante"}
                  clientMainLogo={client?.main_logo || undefined}
                  categories={[{
                    id: selectedCategory.category_id,
                    name: selectedCategory.name,
                    image: selectedCategory.image || undefined,
                    sections: [{
                      id: selectedSection.section_id,
                      name: selectedSection.name,
                      image: selectedSection.image || undefined,
                      products: products[selectedSection.section_id]
                        ?.filter(prod => prod.status === 1)
                        .map(prod => ({
                          id: prod.product_id,
                          name: prod.name,
                          image: prod.image || undefined,
                          price: prod.price,
                          description: prod.description || undefined
                        }))
                    }]
                  }]}
                />
              </div>
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
              className="mt-4 pl-4 pr-4 border-l-2 border-indigo-100 max-w-[95%] mx-auto"
            >
              <div className="mb-4">
                <button
                  onClick={() => {
                    setSelectedCategory(category);
                    setIsNewSectionModalOpen(true);
                  }}
                  className="w-full flex items-center justify-center px-4 py-2 border border-teal-300 text-sm font-medium rounded-md text-teal-700 bg-teal-50 hover:bg-teal-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 shadow-sm"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Nueva Sección
                </button>
              </div>
              <SectionTable 
                sections={sections[category.category_id] || []}
                expandedSections={expandedSections}
                onSectionClick={handleSectionClick}
                categoryName={category.name}
                onToggleVisibility={toggleSectionVisibility}
                isUpdatingVisibility={isUpdatingVisibility}
                onEditSection={(section) => handleEditSection(section as unknown as Section)}
                onDeleteSection={handleDeleteSection}
              />
              
              {/* Productos expandidos para secciones */}
              {sections[category.category_id]?.map(section => {
                if (!expandedSections[section.section_id]) return null;
                
                return (
                  <div 
                    key={`section-${section.section_id}`}
                    id={`section-${section.section_id}`}
                    className="mt-4 pl-4 pr-4 border-l-2 border-teal-100 max-w-[90%] mx-auto"
                  >
                    <div className="mb-4">
                      <button
                        onClick={() => {
                          setSelectedSection(section);
                          setIsNewProductModalOpen(true);
                        }}
                        className="w-full flex items-center justify-center px-4 py-2 border border-amber-300 text-sm font-medium rounded-md text-amber-700 bg-amber-50 hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 shadow-sm"
                      >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Nuevo Producto
                      </button>
                    </div>
                    <ProductTable 
                      products={products[section.section_id] || []}
                      sectionName={section.name}
                      onToggleVisibility={toggleProductVisibility}
                      isUpdatingVisibility={isUpdatingVisibility}
                      onEditProduct={(product) => handleEditProduct(product as unknown as Product)}
                      onDeleteProduct={handleDeleteProduct}
                    />
                  </div>
                );
              })}
                    </div>
          );
        })}
        
        {/* Modal para nueva categoría */}
        <Transition.Root show={isNewCategoryModalOpen} as={Fragment}>
          <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" onClose={setIsNewCategoryModalOpen}>
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
              </Transition.Child>

              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                  <div>
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100">
                      <PlusIcon className="h-6 w-6 text-indigo-600" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:mt-5">
                      <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                        Nueva categoría
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Por favor, introduce el nombre e imagen para la nueva categoría.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-6">
                    <div className="mb-4">
                      <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700">
                        Nombre de la categoría
            </label>
            <input
              type="text"
                        name="categoryName"
                        id="categoryName"
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-400 rounded-md"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
            />
                </div>
                    <div className="mb-4">
                      <label htmlFor="categoryImage" className="block text-sm font-medium text-gray-700">
                        Imagen de la categoría
            </label>
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-400 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                {imagePreview ? (
                            <div className="relative mx-auto w-24 h-24 mb-2">
                  <Image
                    src={imagePreview}
                    alt="Vista previa"
                    fill
                                className="object-cover rounded-full"
                              />
                              <button
                                type="button"
                                className="absolute -top-2 -right-2 bg-red-100 rounded-full p-1 text-red-600 hover:bg-red-200"
                                onClick={() => {
                                  setSelectedImage(null);
                                  setImagePreview(null);
                                }}
                              >
                                <XMarkIcon className="h-4 w-4" aria-hidden="true" />
                              </button>
                            </div>
                          ) : (
                            <svg
                              className="mx-auto h-12 w-12 text-gray-400"
                              stroke="currentColor"
                              fill="none"
                              viewBox="0 0 48 48"
                              aria-hidden="true"
                            >
                              <path
                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                  </svg>
                )}
                          <div className="flex text-sm text-gray-600">
                            <label
                              htmlFor="category-image-upload"
                              className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                            >
                              <span>Subir imagen</span>
                <input
                                id="category-image-upload" 
                                name="category-image-upload" 
                  type="file"
                                className="sr-only" 
                  accept="image/*"
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
                            </label>
                            <p className="pl-1">o arrastra y suelta</p>
            </div>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF hasta 10MB</p>
                </div>
                </div>
                    </div>
                    <div className="flex justify-between">
            <button
                        type="button"
                        className="inline-flex justify-center w-full sm:w-auto rounded-md border border-transparent shadow-sm px-4 py-2 bg-gray-200 text-base font-medium text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:text-sm sm:mr-2"
              onClick={() => setIsNewCategoryModalOpen(false)}
            >
              Cancelar
            </button>
            <button
                        type="button"
                        className={`inline-flex justify-center w-full sm:w-auto rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm ${
                          isCreatingCategory ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        onClick={() => {
                          if (!client) return;
                          
                          setIsCreatingCategory(true);
                          
                          const formData = new FormData();
                          formData.append('name', newCategoryName);
                          formData.append('client_id', client.id.toString());
                          formData.append('status', '1'); // Añadimos status explícitamente
                          
                          if (selectedImage) {
                            formData.append('image', selectedImage);
                          }
                          
                          fetch('/api/categories', {
                            method: 'POST',
                            body: formData
                          })
                          .then(async response => {
                            const data = await response.json();
                            if (!response.ok) {
                              console.error('Error API:', data);
                              throw new Error(data.error || 'Error al crear la categoría');
                            }
                            return data;
                          })
                          .then(newCategory => {
                            // Actualizar el estado local con la nueva categoría
                            setCategories(prev => [...prev, newCategory]);
                            
                            // Limpiar el formulario y cerrar el modal
                            setNewCategoryName('');
                            setSelectedImage(null);
                            setImagePreview(null);
                            setIsNewCategoryModalOpen(false);
                            
                            toast.success('Categoría creada correctamente');
                          })
                          .catch(error => {
                            console.error('Error al crear categoría:', error);
                            toast.error('Error al crear la categoría');
                          })
                          .finally(() => {
                            setIsCreatingCategory(false);
                          });
                        }}
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
              ) : 'Crear Categoría'}
            </button>
            </div>
                </div>
                </div>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>

        {/* Modal para crear nueva sección */}
        <Transition.Root show={isNewSectionModalOpen} as={Fragment}>
          <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" onClose={setIsNewSectionModalOpen}>
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
              </Transition.Child>

              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                  <div>
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100">
                      <PlusIcon className="h-6 w-6 text-indigo-600" aria-hidden="true" />
          </div>
                    <div className="mt-3 text-center sm:mt-5">
                      <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                        Nueva sección
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Por favor, introduce el nombre e imagen para la nueva sección.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-6">
                    <div className="mb-4">
                      <label htmlFor="sectionName" className="block text-sm font-medium text-gray-700">
                        Nombre de la sección
            </label>
            <input
              type="text"
                        name="sectionName"
                        id="sectionName"
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-400 rounded-md"
                        value={newSectionName}
                        onChange={(e) => setNewSectionName(e.target.value)}
            />
            </div>
                    <div className="mb-4">
                      <label htmlFor="sectionImage" className="block text-sm font-medium text-gray-700">
                        Imagen de la sección
            </label>
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-400 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                          {newSectionImagePreview ? (
                            <div className="relative mx-auto w-24 h-24 mb-2">
                  <Image
                                src={newSectionImagePreview} 
                    alt="Vista previa"
                    fill
                                className="object-cover rounded-full"
                              />
                              <button
                                type="button"
                                className="absolute -top-2 -right-2 bg-red-100 rounded-full p-1 text-red-600 hover:bg-red-200"
                                onClick={() => {
                                  setNewSectionImage(null);
                                  setNewSectionImagePreview(null);
                                }}
                              >
                                <XMarkIcon className="h-4 w-4" aria-hidden="true" />
                              </button>
                            </div>
                          ) : (
                            <svg
                              className="mx-auto h-12 w-12 text-gray-400"
                              stroke="currentColor"
                              fill="none"
                              viewBox="0 0 48 48"
                              aria-hidden="true"
                            >
                              <path
                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                  </svg>
                )}
                          <div className="flex text-sm text-gray-600">
                            <label
                              htmlFor="section-image-upload"
                              className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                            >
                              <span>Subir imagen</span>
                <input
                                id="section-image-upload" 
                                name="section-image-upload" 
                  type="file"
                                className="sr-only" 
                  accept="image/*"
                                onChange={handleNewSectionImageChange}
                              />
                            </label>
                            <p className="pl-1">o arrastra y suelta</p>
                          </div>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF hasta 10MB</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between">
                            <button
                  type="button"
                        className="inline-flex justify-center w-full sm:w-auto rounded-md border border-transparent shadow-sm px-4 py-2 bg-gray-200 text-base font-medium text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:text-sm sm:mr-2"
                        onClick={() => setIsNewSectionModalOpen(false)}
                            >
                        Cancelar
                            </button>
                            <button
                    type="button"
                        className={`inline-flex justify-center w-full sm:w-auto rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm ${
                          isCreatingSection ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        onClick={handleCreateSection}
                        disabled={isCreatingSection || !newSectionName.trim()}
                      >
                        {isCreatingSection ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Creando...
                          </>
                        ) : 'Crear sección'}
                            </button>
                          </div>
                        </div>
                          </div>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>

        {/* Modal para crear nuevo producto */}
        <Transition.Root show={isNewProductModalOpen} as={Fragment}>
          <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" onClose={setIsNewProductModalOpen}>
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
              </Transition.Child>

              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                  <div>
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100">
                      <PlusIcon className="h-6 w-6 text-indigo-600" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:mt-5">
                      <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                        Nuevo producto
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Por favor, introduce los detalles para el nuevo producto.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-6">
                    <div className="mb-4">
                      <label htmlFor="productName" className="block text-sm font-medium text-gray-700">
                        Nombre del producto
                      </label>
                      <input
                        type="text"
                        name="productName"
                        id="productName"
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-400 rounded-md"
                        value={newProductName}
                        onChange={(e) => setNewProductName(e.target.value)}
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="productPrice" className="block text-sm font-medium text-gray-700">
                        Precio
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">€</span>
                        </div>
                        <input
                          type="text"
                          name="productPrice"
                          id="productPrice"
                          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-400 rounded-md"
                          placeholder="0.00"
                          value={newProductPrice}
                          onChange={(e) => setNewProductPrice(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="mb-4">
                      <label htmlFor="productDescription" className="block text-sm font-medium text-gray-700">
                        Descripción
                      </label>
                      <textarea
                        id="productDescription"
                        name="productDescription"
                        rows={3}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
                        placeholder="Descripción del producto"
                        value={newProductDescription}
                        onChange={(e) => setNewProductDescription(e.target.value)}
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="productImage" className="block text-sm font-medium text-gray-700">
                        Imagen del producto
                      </label>
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-400 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                          {newProductImagePreview ? (
                            <div className="relative mx-auto w-24 h-24 mb-2">
                              <Image 
                                src={newProductImagePreview} 
                                alt="Vista previa" 
                                fill
                                className="object-cover rounded-md"
                              />
                            <button
                                type="button"
                                className="absolute -top-2 -right-2 bg-red-100 rounded-full p-1 text-red-600 hover:bg-red-200"
                                onClick={() => {
                                  setNewProductImage(null);
                                  setNewProductImagePreview(null);
                                }}
                              >
                                <XMarkIcon className="h-4 w-4" aria-hidden="true" />
                              </button>
                            </div>
                          ) : (
                            <svg
                              className="mx-auto h-12 w-12 text-gray-400"
                              stroke="currentColor"
                              fill="none"
                              viewBox="0 0 48 48"
                              aria-hidden="true"
                            >
                              <path
                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                          <div className="flex text-sm text-gray-600">
                            <label
                              htmlFor="product-image-upload"
                              className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                            >
                              <span>Subir imagen</span>
                              <input 
                                id="product-image-upload" 
                                name="product-image-upload" 
                                type="file" 
                                className="sr-only" 
                                accept="image/*"
                                onChange={handleNewProductImageChange}
                              />
                            </label>
                            <p className="pl-1">o arrastra y suelta</p>
                          </div>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF hasta 10MB</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <button
                        type="button"
                        className="inline-flex justify-center w-full sm:w-auto rounded-md border border-transparent shadow-sm px-4 py-2 bg-gray-200 text-base font-medium text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:text-sm sm:mr-2"
                        onClick={() => setIsNewProductModalOpen(false)}
                            >
              Cancelar
                            </button>
                            <button
                        type="button"
                        className={`inline-flex justify-center w-full sm:w-auto rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm ${
                          isCreatingProduct ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        onClick={handleCreateProduct}
                        disabled={isCreatingProduct || !newProductName.trim() || !newProductPrice.trim()}
                      >
                        {isCreatingProduct ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                            Creando...
                          </>
                        ) : 'Crear producto'}
                            </button>
                          </div>
                        </div>
                      </div>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>

        {/* Modal para editar categoría */}
        <Transition.Root show={isEditModalOpen} as={Fragment}>
          <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" onClose={setIsEditModalOpen}>
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
              </Transition.Child>

              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                  <div>
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100">
                      <PencilIcon className="h-6 w-6 text-indigo-600" aria-hidden="true" />
                                      </div>
                    <div className="mt-3 text-center sm:mt-5">
                      <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                        Editar categoría
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Modifica los detalles de la categoría
                        </p>
                                    </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-6">
                    <div className="mb-4">
                      <label htmlFor="editCategoryName" className="block text-sm font-medium text-gray-700">
                        Nombre de la categoría
                      </label>
                      <input
                        type="text"
                        name="editCategoryName"
                        id="editCategoryName"
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-400 rounded-md"
                        value={editCategoryName}
                        onChange={(e) => setEditCategoryName(e.target.value)}
                      />
                                  </div>
                    <div className="mb-4">
                      <label htmlFor="categoryImage" className="block text-sm font-medium text-gray-700">
                        Imagen de la categoría
                      </label>
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-400 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                          {editImagePreview ? (
                            <div className="relative mx-auto w-24 h-24 mb-2">
                              <Image 
                                src={editImagePreview} 
                                alt="Vista previa" 
                                fill
                                className="object-cover rounded-full"
                              />
                                    <button 
                                type="button"
                                className="absolute -top-2 -right-2 bg-red-100 rounded-full p-1 text-red-600 hover:bg-red-200"
                                onClick={() => {
                                  setEditCategoryImage(null);
                                  setEditImagePreview(null);
                                }}
                              >
                                <XMarkIcon className="h-4 w-4" aria-hidden="true" />
                                    </button>
                            </div>
                          ) : (
                            <svg
                              className="mx-auto h-12 w-12 text-gray-400"
                              stroke="currentColor"
                              fill="none"
                              viewBox="0 0 48 48"
                              aria-hidden="true"
                            >
                              <path
                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                          <div className="flex text-sm text-gray-600">
                            <label
                              htmlFor="edit-category-image-upload"
                              className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                            >
                              <span>Subir imagen</span>
                              <input 
                                id="edit-category-image-upload" 
                                name="edit-category-image-upload" 
                                type="file" 
                                className="sr-only" 
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    setEditCategoryImage(file);
                                    
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      setEditImagePreview(reader.result as string);
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </label>
                            <p className="pl-1">o arrastra y suelta</p>
                                  </div>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF hasta 10MB</p>
                          </div>
                        </div>
                    </div>
                    <div className="flex justify-between">
                                  <button 
                        type="button"
                        className="inline-flex justify-center w-full sm:w-auto rounded-md border border-transparent shadow-sm px-4 py-2 bg-gray-200 text-base font-medium text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:text-sm sm:mr-2"
                        onClick={() => setIsEditModalOpen(false)}
                                  >
                        Cancelar
                                  </button>
                                          <button 
                        type="button"
                        className="inline-flex justify-center w-full sm:w-auto rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                        onClick={() => {
                          if (!editingCategory || !client) return;
                          
                          setIsUpdatingName(true);
                          
                          const formData = new FormData();
                          formData.append('name', editCategoryName);
                          formData.append('client_id', client.id.toString());
                          
                          if (editCategoryImage) {
                            formData.append('image', editCategoryImage);
                          }
                          
                          fetch(`/api/categories/${editingCategory.id}`, {
                            method: 'PUT',
                            body: formData
                          })
                          .then(response => {
                            if (!response.ok) {
                              throw new Error('Error al actualizar la categoría');
                            }
                            return response.json();
                          })
                          .then(updatedCategory => {
                            // Actualizar estado local
                            setCategories(prev => 
                              prev.map(cat => 
                                cat.category_id === editingCategory.id 
                                  ? updatedCategory 
                                  : cat
                              )
                            );
                            
                            // Limpiar formulario y cerrar modal
                            setIsEditModalOpen(false);
                            setEditCategoryName('');
                            setEditCategoryImage(null);
                            setEditImagePreview(null);
                            setEditingCategory(null);
                            
                            toast.success('Categoría actualizada correctamente');
                          })
                          .catch(error => {
                            console.error('Error al actualizar la categoría:', error);
                            toast.error('Error al actualizar la categoría');
                          })
                          .finally(() => {
                            setIsUpdatingName(false);
                          });
                        }}
                      >
                        Guardar Cambios
                                          </button>
                          </div>
                        </div>
                                        </div>
              </Transition.Child>
                                        </div>
          </Dialog>
        </Transition.Root>
        
        {/* Modal para eliminar categoría */}
        <Transition.Root show={isDeleteModalOpen} as={Fragment}>
          <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" onClose={setIsDeleteModalOpen}>
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
              </Transition.Child>

              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                  <div>
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100">
                      <TrashIcon className="h-6 w-6 text-indigo-600" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:mt-5">
                      <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                        Eliminar categoría
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          ¿Estás seguro de que deseas eliminar esta categoría?
                          Esta acción no se puede deshacer.
                        </p>
                    </div>
            </div>
          </div>
                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                    <button
                      type="button"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:col-start-2 sm:text-sm"
                      onClick={() => {
                        if (!categoryToDelete) return;
                        
                        setIsDeletingCategory(true);
                        
                        fetch(`/api/categories/${categoryToDelete}`, {
                          method: 'DELETE'
                        })
                        .then(response => {
                          if (!response.ok) {
                            throw new Error('Error al eliminar la categoría');
                          }
                          return response.json();
                        })
                        .then(() => {
                          // Actualizar estado local
                          setCategories(prev => 
                            prev.filter(cat => cat.category_id !== categoryToDelete)
                          );
                          
                          // Cerrar modal
                          setIsDeleteModalOpen(false);
                          setCategoryToDelete(null);
                          
                          toast.success('Categoría eliminada correctamente');
                        })
                        .catch(error => {
                          console.error('Error al eliminar la categoría:', error);
                          toast.error('Error al eliminar la categoría');
                        })
                        .finally(() => {
                          setIsDeletingCategory(false);
                        });
                      }}
                      disabled={isDeletingCategory}
                    >
                      {isDeletingCategory ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Eliminando...
                        </>
                      ) : 'Eliminar'}
                                                  </button>
                    <button
                      type="button"
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                      onClick={() => {
                        setIsDeleteModalOpen(false);
                        setCategoryToDelete(null);
                      }}
                      disabled={isDeletingCategory}
                    >
                      Cancelar
                                                  </button>
        </div>
                        </div>
              </Transition.Child>
      </div>
          </Dialog>
        </Transition.Root>
        
        {/* Modal para editar sección */}
        <Transition.Root show={isEditSectionModalOpen} as={Fragment}>
          <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" onClose={setIsEditSectionModalOpen}>
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
              </Transition.Child>

              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                        Editar sección
                      </Dialog.Title>
                      <div className="mt-2">
                        <div className="mb-4">
                          <label htmlFor="sectionName" className="block text-sm font-medium text-gray-700">
                            Nombre de la sección
                          </label>
                          <input
                            type="text"
                            name="sectionName"
                            id="sectionName"
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-400 rounded-md"
                            value={editSectionName}
                            onChange={(e) => setEditSectionName(e.target.value)}
                            placeholder="Nombre de la sección"
                          />
                        </div>
                        <div className="mb-4">
                          <label htmlFor="sectionImage" className="block text-sm font-medium text-gray-700">
                            Imagen de la sección
                          </label>
                          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-400 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                              {editSectionImagePreview ? (
                                <div className="relative mx-auto w-24 h-24 mb-2">
                        <Image
                                    src={editSectionImagePreview} 
                                    alt="Vista previa" 
                                    fill
                                    className="object-cover rounded-full"
                                  />
                                  <button
                                    type="button"
                                    className="absolute -top-2 -right-2 bg-red-100 rounded-full p-1 text-red-600 hover:bg-red-200"
                                    onClick={() => {
                                      setEditSectionImage(null);
                                      setEditSectionImagePreview(null);
                                    }}
                                  >
                                    <XMarkIcon className="h-4 w-4" aria-hidden="true" />
                                  </button>
                                </div>
                              ) : (
                                <svg
                                  className="mx-auto h-12 w-12 text-gray-400"
                                  stroke="currentColor"
                                  fill="none"
                                  viewBox="0 0 48 48"
                                  aria-hidden="true"
                                >
                                  <path
                                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              )}
                              <div className="flex text-sm text-gray-600">
                                <label
                                  htmlFor="edit-section-image-upload"
                                  className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                                >
                                  <span>Subir imagen</span>
                                  <input 
                                    id="edit-section-image-upload" 
                                    name="edit-section-image-upload" 
                                    type="file" 
                                    className="sr-only" 
                                    accept="image/*"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        setEditSectionImage(file);
                                        
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                          setEditSectionImagePreview(reader.result as string);
                                        };
                                        reader.readAsDataURL(file);
                                      }
                                    }}
                                  />
                                </label>
                                <p className="pl-1">o arrastra y suelta</p>
      </div>
                              <p className="text-xs text-gray-500">PNG, JPG, GIF hasta 10MB</p>
                    </div>
                  </div>
                </div>
                        <div className="flex justify-between">
                <button
                            type="button"
                            className="inline-flex justify-center w-full sm:w-auto rounded-md border border-transparent shadow-sm px-4 py-2 bg-gray-200 text-base font-medium text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:text-sm sm:mr-2"
                            onClick={() => setIsEditSectionModalOpen(false)}
                >
                            Cancelar
                </button>
                          <button
                            type="button"
                            className="inline-flex justify-center w-full sm:w-auto rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                            onClick={() => {
                              if (!editingSection || !client) return;
                              
                              setIsUpdatingSectionName(true);
                              
                              const formData = new FormData();
                              formData.append('name', editSectionName);
                              formData.append('client_id', client.id.toString());
                              
                              if (editSectionImage) {
                                formData.append('image', editSectionImage);
                              }
                              
                              fetch(`/api/sections/${editingSection.id}`, {
                                method: 'PUT',
                                body: formData
                              })
                              .then(response => {
                                if (!response.ok) {
                                  throw new Error('Error al actualizar la sección');
                                }
                                return response.json();
                              })
                              .then(updatedSection => {
                                // Actualizar estado local
                                setSections(prev => {
                                  const updated = {...prev};
                                  Object.keys(updated).forEach(categoryId => {
                                    if (updated[Number(categoryId)]) {
                                      updated[Number(categoryId)] = updated[Number(categoryId)].map(section => 
                                        section.section_id === editingSection.id 
                                          ? updatedSection 
                                          : section
                                      );
                                    }
                                  });
                                  return updated;
                                });
                                
                                // Limpiar formulario y cerrar modal
                                setIsEditSectionModalOpen(false);
                                setEditSectionName('');
                                setEditSectionImage(null);
                                setEditSectionImagePreview(null);
                                setEditingSection(null);
                                
                                toast.success('Sección actualizada correctamente');
                              })
                              .catch(error => {
                                console.error('Error al actualizar la sección:', error);
                                toast.error('Error al actualizar la sección');
                              })
                              .finally(() => {
                                setIsUpdatingSectionName(false);
                              });
                            }}
                          >
                            Guardar Cambios
                          </button>
              </div>
                    </div>
        </div>
                    </div>
        </div>
              </Transition.Child>
                    </div>
          </Dialog>
        </Transition.Root>
        
        {/* Modal para eliminar sección */}
        <Transition.Root show={isDeleteSectionModalOpen} as={Fragment}>
          <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" onClose={setIsDeleteSectionModalOpen}>
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                  <div>
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100">
                      <TrashIcon className="h-6 w-6 text-indigo-600" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:mt-5">
                      <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                        Eliminar sección
                  </Dialog.Title>
                  <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          ¿Estás seguro de que deseas eliminar esta sección?
                          Esta acción no se puede deshacer.
                    </p>
              </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                    <button
                      type="button"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:col-start-2 sm:text-sm"
                      onClick={() => {
                        if (!sectionToDelete) return;
                        
                        setIsDeletingSection(true);
                        
                        deleteSection(sectionToDelete)
                          .then(() => {
                            // Actualizar estado local
                            if (selectedCategory) {
                              setSections(prev => {
                                const updated = {...prev};
                                if (updated[selectedCategory.category_id]) {
                                  updated[selectedCategory.category_id] = updated[selectedCategory.category_id].filter(
                                    section => section.section_id !== sectionToDelete
                                  );
                                }
                                return updated;
                              });
                            }
                            
                            // Cerrar modal
                            setIsDeleteSectionModalOpen(false);
                            setSectionToDelete(null);
                            
                            toast.success('Sección eliminada correctamente');
                          })
                          .catch(error => {
                            console.error('Error al eliminar la sección:', error);
                            toast.error('Error al eliminar la sección');
                          })
                          .finally(() => {
                            setIsDeletingSection(false);
                          });
                      }}
                      disabled={isDeletingSection}
                    >
                      {isDeletingSection ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Eliminando...
                        </>
                      ) : 'Eliminar'}
                    </button>
                <button
                  type="button"
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                      onClick={() => {
                        setIsDeleteSectionModalOpen(false);
                        setSectionToDelete(null);
                      }}
                      disabled={isDeletingSection}
                >
                      Cancelar
                </button>
                  </div>
                </div>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>
        
        {/* Modal para eliminar producto */}
        <Transition.Root show={isDeleteProductModalOpen} as={Fragment}>
          <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" onClose={setIsDeleteProductModalOpen}>
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
              </Transition.Child>

              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                  <div>
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100">
                      <TrashIcon className="h-6 w-6 text-indigo-600" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:mt-5">
                      <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                        Eliminar producto
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          ¿Estás seguro de que deseas eliminar este producto?
                          Esta acción no se puede deshacer.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:col-start-2 sm:text-sm"
                      onClick={() => {
                        if (!productToDelete) return;
                        
                        setIsDeletingProduct(true);
                        
                        deleteProduct(productToDelete)
                          .then(() => {
                            // Actualizar estado local
                            if (selectedSection) {
                              setProducts(prev => {
                                const updated = {...prev};
                                if (updated[selectedSection.section_id]) {
                                  updated[selectedSection.section_id] = updated[selectedSection.section_id].filter(
                                    product => product.product_id !== productToDelete
                                  );
                                }
                                return updated;
                              });
                            }
                            
                            // Cerrar modal
                            setIsDeleteProductModalOpen(false);
                            setProductToDelete(null);
                            
                            toast.success('Producto eliminado correctamente');
                          })
                          .catch(error => {
                            console.error('Error al eliminar el producto:', error);
                            toast.error('Error al eliminar el producto');
                          })
                          .finally(() => {
                            setIsDeletingProduct(false);
                          });
                      }}
                      disabled={isDeletingProduct}
                    >
                      {isDeletingProduct ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Eliminando...
                        </>
                      ) : 'Eliminar'}
                    </button>
                    <button
                      type="button"
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                      onClick={() => {
                        setIsDeleteProductModalOpen(false);
                        setProductToDelete(null);
                      }}
                      disabled={isDeletingProduct}
                    >
                      Cancelar
                </button>
              </div>
                </div>
              </Transition.Child>
          </div>
        </Dialog>
        </Transition.Root>
        
        {/* Modal para editar producto */}
        <Transition.Root show={isEditProductModalOpen} as={Fragment}>
          <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" onClose={setIsEditProductModalOpen}>
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
              </Transition.Child>

              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                        Editar producto
                      </Dialog.Title>
                      <div className="mt-2">
                        <div className="mb-4">
                          <label htmlFor="productName" className="block text-sm font-medium text-gray-700">
                            Nombre del producto
                          </label>
                          <input
                            type="text"
                            name="productName"
                            id="productName"
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-400 rounded-md"
                            value={editProductName}
                            onChange={(e) => setEditProductName(e.target.value)}
                            placeholder="Nombre del producto"
                          />
                        </div>
                        <div className="mb-4">
                          <label htmlFor="productPrice" className="block text-sm font-medium text-gray-700">
                            Precio (€)
                          </label>
                          <input
                            type="text"
                            name="productPrice"
                            id="productPrice"
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-400 rounded-md"
                            value={editProductPrice}
                            onChange={(e) => setEditProductPrice(e.target.value)}
                            placeholder="Precio en euros"
                          />
                        </div>
                        <div className="mb-4">
                          <label htmlFor="productDescription" className="block text-sm font-medium text-gray-700">
                            Descripción
                          </label>
                          <textarea
                            name="productDescription"
                            id="productDescription"
                            rows={3}
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            value={editProductDescription}
                            onChange={(e) => setEditProductDescription(e.target.value)}
                            placeholder="Descripción del producto"
                          />
                        </div>
                        <div className="mb-4">
                          <label htmlFor="productImage" className="block text-sm font-medium text-gray-700">
                            Imagen del producto
                          </label>
                          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-400 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                              {editProductImagePreview ? (
                                <div className="relative mx-auto w-24 h-24 mb-2">
                                  <Image 
                                    src={editProductImagePreview} 
                                    alt="Vista previa" 
                                    fill
                                    className="object-cover rounded-full"
                                  />
            <button 
                                    type="button"
                                    className="absolute -top-2 -right-2 bg-red-100 rounded-full p-1 text-red-600 hover:bg-red-200"
                                    onClick={() => {
                                      setEditProductImage(null);
                                      setEditProductImagePreview(null);
                                    }}
                                  >
                                    <XMarkIcon className="h-4 w-4" aria-hidden="true" />
            </button>
                                </div>
                              ) : (
                                <svg
                                  className="mx-auto h-12 w-12 text-gray-400"
                                  stroke="currentColor"
                                  fill="none"
                                  viewBox="0 0 48 48"
                                  aria-hidden="true"
                                >
                                  <path
                                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              )}
                              <div className="flex text-sm text-gray-600">
                                <label
                                  htmlFor="edit-product-image-upload"
                                  className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                                >
                                  <span>Subir imagen</span>
                                  <input 
                                    id="edit-product-image-upload" 
                                    name="edit-product-image-upload" 
                                    type="file" 
                                    className="sr-only" 
                                    accept="image/*"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        setEditProductImage(file);
                                        
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                          setEditProductImagePreview(reader.result as string);
                                        };
                                        reader.readAsDataURL(file);
                                      }
                                    }}
                                  />
                                </label>
                                <p className="pl-1">o arrastra y suelta</p>
            </div>
                              <p className="text-xs text-gray-500">PNG, JPG, GIF hasta 10MB</p>
          </div>
        </div>
    </div>
                        <div className="flex justify-between">
                          <button
                            type="button"
                            className="inline-flex justify-center w-full sm:w-auto rounded-md border border-transparent shadow-sm px-4 py-2 bg-gray-200 text-base font-medium text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:text-sm sm:mr-2"
                            onClick={() => setIsEditProductModalOpen(false)}
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            className="inline-flex justify-center w-full sm:w-auto rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                            onClick={() => {
                              if (!editingProduct || !client) return;
                              
                              setIsUpdatingProductName(true);
                              
                              const formData = new FormData();
                              formData.append('name', editProductName);
                              formData.append('price', editProductPrice);
                              formData.append('client_id', client.id.toString());
                              
                              if (editProductDescription) {
                                formData.append('description', editProductDescription);
                              }
                              
                              if (editProductImage) {
                                formData.append('image', editProductImage);
                              }
                              
                              fetch(`/api/products/${editingProduct.id}`, {
                                method: 'PUT',
                                body: formData
                              })
                              .then(response => {
                                if (!response.ok) {
                                  throw new Error('Error al actualizar el producto');
                                }
                                return response.json();
                              })
                              .then(updatedProduct => {
                                // Actualizar estado local
                                setProducts(prev => {
                                  const updated = {...prev};
                                  Object.keys(updated).forEach(sectionId => {
                                    if (updated[Number(sectionId)]) {
                                      updated[Number(sectionId)] = updated[Number(sectionId)].map(product => 
                                        product.product_id === editingProduct.id 
                                          ? updatedProduct 
                                          : product
                                      );
                                    }
                                  });
                                  return updated;
                                });
                                
                                // Limpiar formulario y cerrar modal
                                setIsEditProductModalOpen(false);
                                setEditProductName('');
                                setEditProductPrice('');
                                setEditProductDescription('');
                                setEditProductImage(null);
                                setEditProductImagePreview(null);
                                setEditingProduct(null);
                                
                                toast.success('Producto actualizado correctamente');
                              })
                              .catch(error => {
                                console.error('Error al actualizar el producto:', error);
                                toast.error('Error al actualizar el producto');
                              })
                              .finally(() => {
                                setIsUpdatingProductName(false);
                              });
                            }}
                          >
                            Guardar Cambios
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>
      </div>
      
      {/* Componente de vista previa móvil flotante */}
      <FloatingPhonePreview 
        clientName={client?.name} 
        clientLogo={client?.logo ? `/images/clients/${client.logo}` : undefined}
        clientMainLogo={client?.main_logo ? `/images/main_logo/${client.main_logo}` : undefined}
        categories={categories
          .filter(cat => cat.status === 1) // Solo categorías activas
          .map(cat => ({
            id: cat.category_id,
            category_id: cat.category_id,
            name: cat.name,
            image: cat.image ? getImagePath(cat.image, 'categories') : undefined,
            sections: sections[cat.category_id]?.filter(sec => sec.status === 1).map(sec => ({
              id: sec.section_id,
              name: sec.name,
              image: sec.image ? getImagePath(sec.image, 'sections') : undefined,
              products: products[sec.section_id]?.filter(prod => prod.status === 1).map(prod => ({
                id: prod.product_id,
                name: prod.name,
                price: prod.price,
                description: prod.description ?? undefined,
                image: prod.image ? getImagePath(prod.image, 'products') : undefined
              })) || []
            })) || []
          })) as FloatingPhoneCategory[]}
        selectedCategory={selectedCategory ? {
          id: selectedCategory.category_id,
          name: selectedCategory.name,
          image: selectedCategory.image ? getImagePath(selectedCategory.image, 'categories') : undefined
        } : null}
        selectedSection={selectedSection ? {
          id: selectedSection.section_id,
          name: selectedSection.name,
          image: selectedSection.image ? getImagePath(selectedSection.image, 'sections') : undefined
        } : null}
      />
    </>
  );
}
