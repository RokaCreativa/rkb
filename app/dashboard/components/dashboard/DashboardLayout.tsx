import React from 'react';
import { Category, Section } from '@/app/types/menu';
import { ArrowLeftIcon, ArrowsUpDownIcon, XMarkIcon, PlusIcon, PhoneIcon } from '@heroicons/react/24/outline';

/**
 * Props para el componente BreadcrumbItem
 */
interface BreadcrumbItem {
  /**
   * Identificador único del elemento
   */
  id: string;
  
  /**
   * Nombre a mostrar
   */
  name: string;
  
  /**
   * Función que se ejecuta al hacer clic en el elemento
   */
  onClick?: () => void;
  
  /**
   * Indica si el elemento está activo
   */
  current: boolean;
}

/**
 * Props para el componente DashboardLayout
 */
interface DashboardLayoutProps {
  /**
   * Elementos para mostrar en la navegación de migas de pan
   */
  breadcrumbItems: BreadcrumbItem[];
  
  /**
   * Vista actualmente seleccionada
   */
  currentView: 'categories' | 'sections' | 'products';
  
  /**
   * Categoría seleccionada actualmente
   */
  selectedCategory: Category | null;
  
  /**
   * Sección seleccionada actualmente
   */
  selectedSection: Section | null;
  
  /**
   * Indica si el modo de reordenación está activo
   */
  isReorderModeActive: boolean;
  
  /**
   * Función que se ejecuta al activar/desactivar el modo de reordenación
   */
  onToggleReorderMode: () => void;
  
  /**
   * Función que se ejecuta para crear una nueva categoría
   */
  onNewCategory: () => void;
  
  /**
   * Función que se ejecuta para crear una nueva sección
   */
  onNewSection: () => void;
  
  /**
   * Función que se ejecuta para crear un nuevo producto
   */
  onNewProduct: () => void;
  
  /**
   * Función que se ejecuta para activar la vista previa
   */
  onTogglePreview: () => void;
  
  /**
   * Indica si se están cargando datos
   */
  isLoading: boolean;
  
  /**
   * Mensaje de error a mostrar
   */
  error: string | null;
  
  /**
   * Mensaje informativo a mostrar
   */
  message: string | null;
  
  /**
   * Función que se ejecuta para eliminar un mensaje de error
   */
  onDismissError: () => void;
  
  /**
   * Función que se ejecuta para eliminar un mensaje informativo
   */
  onDismissMessage: () => void;
  
  /**
   * Contenido principal del dashboard
   */
  children: React.ReactNode;
}

/**
 * Componente que proporciona la estructura principal del dashboard
 * Incluye navegación, controles y manejo de mensajes/errores
 */
const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  breadcrumbItems,
  currentView,
  selectedCategory,
  selectedSection,
  isReorderModeActive,
  onToggleReorderMode,
  onNewCategory,
  onNewSection,
  onNewProduct,
  onTogglePreview,
  isLoading,
  error,
  message,
  onDismissError,
  onDismissMessage,
  children
}) => {
  /**
   * Renderiza el botón de acción principal según la vista actual
   */
  const renderActionButton = () => {
    if (currentView === 'categories') {
      return (
        <button
          type="button"
          onClick={onNewCategory}
          className="inline-flex items-center gap-x-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <PlusIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
          Nueva Categoría
        </button>
      );
    } else if (currentView === 'sections' && selectedCategory) {
      return (
        <button
          type="button"
          onClick={onNewSection}
          className="inline-flex items-center gap-x-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <PlusIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
          Nueva Sección
        </button>
      );
    } else if (currentView === 'products' && selectedSection) {
      return (
        <button
          type="button"
          onClick={onNewProduct}
          className="inline-flex items-center gap-x-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <PlusIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
          Nuevo Producto
        </button>
      );
    }
    
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Barra superior */}
      <div className="mb-6 bg-white shadow rounded-lg p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
          {/* Navegación de migas de pan */}
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              {breadcrumbItems.map((item, index) => (
                <li key={item.id} className="flex items-center">
                  {index > 0 && (
                    <span className="mx-2 text-gray-400">/</span>
                  )}
                  
                  <button
                    onClick={item.onClick}
                    className={`text-sm font-medium ${
                      item.current
                        ? 'text-blue-600'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                    disabled={!item.onClick}
                  >
                    {item.name}
                  </button>
                </li>
              ))}
            </ol>
          </nav>
          
          {/* Botones de acción */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onToggleReorderMode}
              className={`inline-flex items-center gap-x-1.5 rounded-md px-3 py-2 text-sm font-medium ${
                isReorderModeActive
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              <ArrowsUpDownIcon className="h-5 w-5" aria-hidden="true" />
              {isReorderModeActive ? 'Cancelar' : 'Reordenar'}
            </button>
            
            <button
              type="button"
              onClick={onTogglePreview}
              className="inline-flex items-center gap-x-1.5 rounded-md bg-indigo-100 px-3 py-2 text-sm font-medium text-indigo-800 hover:bg-indigo-200"
            >
              <PhoneIcon className="h-5 w-5" aria-hidden="true" />
              Vista previa
            </button>
          </div>
        </div>
      </div>
      
      {/* Mensajes y alertas */}
      {isLoading && (
        <div className="mb-4 p-4 bg-white shadow rounded-lg flex items-center justify-center">
          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-600 mr-2"></div>
          <span className="text-gray-700">Cargando datos...</span>
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg flex justify-between items-center">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
          <button onClick={onDismissError} className="text-red-700 hover:text-red-900">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      )}
      
      {message && (
        <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-lg flex justify-between items-center">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{message}</span>
          </div>
          <button onClick={onDismissMessage} className="text-green-700 hover:text-green-900">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      )}
      
      {/* Contenido principal */}
      <div className="container mx-auto my-4">
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout; 