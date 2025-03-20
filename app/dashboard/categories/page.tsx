"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { PhonePreview } from '@/components/PhonePreview';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

/**
 * @file Página de gestión de categorías en el dashboard de RokaMenu.
 * @description Permite listar, activar/desactivar categorías, gestionar imágenes y mostrar vista previa.
 */

// Definición de interfaces
interface Category {
  id: number;
  name: string;
  image: string | null;
  status: number; // Se usa 1 (activo) o 0 (inactivo)
  display_order: number;
  client_id: number;
  products: number;
}

interface VisibilityState {
  [key: number]: boolean;
}

/**
 * Componente Switch personalizado para sustituir el checkbox estándar
 */
const VisibilitySwitch = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
        checked ? 'bg-indigo-600' : 'bg-gray-300'
      }`}
      role="switch"
      aria-checked={checked}
    >
      <span className="sr-only">Cambiar visibilidad</span>
      <span
        className={`${
          checked ? 'translate-x-6' : 'translate-x-1'
        } inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out`}
      />
    </button>
  );
};

/**
 * Página de administración de categorías.
 * @returns {JSX.Element} Página del dashboard para gestionar categorías.
 */
export default function CategoriesPage() {
  // Estados del componente
  const [loading, setLoading] = useState<boolean>(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [visibilityStates, setVisibilityStates] = useState<VisibilityState>({});
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<{ [key: number]: boolean }>({});
  const [client, setClient] = useState<any>(null);
  const [statusMessage, setStatusMessage] = useState<{text: string, type: 'success' | 'error' | 'info'} | null>(null);
  const [updatingOrder, setUpdatingOrder] = useState<boolean>(false);

  // Mostrar mensaje de estado y ocultarlo después de un tiempo
  const showStatusMessage = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setStatusMessage({text, type});
    setTimeout(() => {
      setStatusMessage(null);
    }, 3000);
  };

  /**
   * Carga inicial de categorías desde la API.
   */
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/categories");
      if (!response.ok) throw new Error("Error al obtener las categorías.");

      const data: Category[] = await response.json();
      console.log("Categorías cargadas:", data);

      // Procesar las categorías y sus imágenes
      const formattedCategories = data.map((cat) => ({
        ...cat,
        image: cat.image ? `/images/categories/${cat.image}` : null,
      }));

      setCategories(formattedCategories);

      // Inicializar estados de visibilidad basados en `status`
      const initialStates: VisibilityState = {};
      formattedCategories.forEach((cat) => {
        initialStates[cat.id] = cat.status === 1;
      });

      setVisibilityStates(initialStates);

      // Obtener información del cliente
      const clientResponse = await fetch("/api/client");
      if (!clientResponse.ok) throw new Error("Error al obtener información del cliente.");

      const clientData = await clientResponse.json();
      console.log("Información del cliente:", clientData);

      setClient(clientData);
    } catch (error) {
      console.error("Error al cargar categorías:", error);
      setError("Error al cargar categorías.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  /**
   * Cambia la visibilidad de una categoría.
   * @param {number} categoryId - ID de la categoría.
   */
  const toggleCategoryVisibility = async (categoryId: number) => {
    try {
      const currentVisibility = visibilityStates[categoryId];
      const newVisibility = !currentVisibility;

      // Actualización optimista
      setVisibilityStates((prev) => ({
        ...prev,
        [categoryId]: newVisibility,
      }));

      // Enviar cambio al backend
      const response = await fetch("/api/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: categoryId,
          status: newVisibility ? 1 : 0, // Enviar 1/0
        }),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar la categoría.");
      }

      console.log(`Categoría ${categoryId} actualizada correctamente.`);
      showStatusMessage("Categoría actualizada correctamente.");
    } catch (error) {
      console.error("Error al cambiar visibilidad:", error);

      // Revertir cambio en caso de error
      setVisibilityStates((prev) => ({
        ...prev,
        [categoryId]: !prev[categoryId],
      }));
      showStatusMessage("Error al actualizar la categoría.", 'error');
    }
  };

  /**
   * Maneja el final del arrastre para actualizar el orden de las categorías
   * @param {Object} result - Resultado del arrastre
   */
  const handleDragEnd = async (result: any) => {
    // Si no se soltó en un destino válido, no hacer nada
    if (!result.destination) return;
    
    // Si el origen y destino son iguales, no hacer nada
    if (result.destination.index === result.source.index) return;
    
    // Crear una copia de las categorías para modificarlas
    const items = Array.from(categories);
    // Eliminar el elemento arrastrado de su posición original
    const [reorderedItem] = items.splice(result.source.index, 1);
    // Insertar el elemento en la nueva posición
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Actualizar los display_order basados en la nueva posición
    const updatedItems = items.map((item, index) => ({
      ...item,
      display_order: index + 1
    }));
    
    // Actualizar el estado local inmediatamente para una UI responsiva
    setCategories(updatedItems);
    
    try {
      setUpdatingOrder(true);
      showStatusMessage("Actualizando orden...", 'info');
      
      // Actualizar en el servidor solo la categoría que se movió
      const movedCategory = updatedItems[result.destination.index];
      
      const response = await fetch(`/api/categories`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: movedCategory.id,
          display_order: movedCategory.display_order,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Error al actualizar el orden');
      }
      
      console.log(`Orden de categoría ${movedCategory.id} actualizado a ${movedCategory.display_order}`);
      showStatusMessage("Orden actualizado correctamente.", 'success');
    } catch (error) {
      console.error('Error al actualizar el orden:', error);
      // Revertir cambios en caso de error refrescando datos desde el servidor
      fetchCategories();
      showStatusMessage("Error al actualizar el orden.", 'error');
    } finally {
      setUpdatingOrder(false);
    }
  };

  /**
   * Maneja errores de carga de imágenes y reemplaza con un placeholder.
   * @param {number} categoryId - ID de la categoría.
   */
  const handleImageError = (categoryId: number) => {
    console.warn(`Error al cargar la imagen para categoría ${categoryId}`);
    setImageErrors((prev) => ({
      ...prev,
      [categoryId]: true,
    }));
  };

  /**
   * Renderiza la imagen de una categoría.
   * @param {string | null} imagePath - Ruta de la imagen.
   * @param {string} alt - Texto alternativo.
   */
  const CategoryImage = ({
    imagePath,
    alt,
  }: {
    imagePath: string | null;
    alt: string;
  }) => {
    if (!imagePath) return <span className="text-gray-500">Sin imagen</span>;

    return (
      <div className="relative h-10 w-10 rounded-md overflow-hidden border border-gray-200">
        <Image
          src={imagePath}
          alt={alt}
          fill
          className="object-cover"
          onError={() => handleImageError(0)}
        />
      </div>
    );
  };

  // Renderizar mientras se carga
  if (loading) {
    return <p className="text-center text-gray-500 p-8">Cargando categorías...</p>;
  }

  // Mostrar error si hay fallos en la carga
  if (error) {
    return <p className="text-center text-red-500 p-8">{error}</p>;
  }

  return (
    <div className="space-y-6 p-6">
      {/* Título y botón */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-black">Categorías</h1>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
          Añadir Categoría
        </button>
      </div>

      {/* Tabla de categorías */}
      <div className="overflow-x-auto bg-white shadow-md rounded-md p-4">
        {updatingOrder && (
          <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-10">
            <div className="flex items-center space-x-2">
              <svg className="animate-spin h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Actualizando orden...</span>
            </div>
          </div>
        )}
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="categoriesTable">
            {(provided) => (
              <table className="min-w-full" {...provided.droppableProps} ref={provided.innerRef}>
                <thead>
                  <tr className="bg-indigo-50">
                    <th className="px-4 py-2 text-left text-xs font-bold text-black uppercase tracking-wider">Nombre</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-black uppercase tracking-wider">Orden</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-black uppercase tracking-wider">Foto</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-black uppercase tracking-wider">Visibilidad</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-4 text-gray-500">
                        No hay categorías disponibles.
                      </td>
                    </tr>
                  ) : (
                    categories.map((category, index) => (
                      <Draggable 
                        key={category.id.toString()} 
                        draggableId={category.id.toString()} 
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <tr 
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`border-b transition-colors ${
                              snapshot.isDragging 
                                ? 'bg-indigo-100 shadow-lg' 
                                : 'hover:bg-indigo-50'
                            }`}
                          >
                            <td className="px-4 py-2 text-black font-semibold flex items-center">
                              <div 
                                {...provided.dragHandleProps} 
                                className={`mr-2 ${
                                  snapshot.isDragging ? 'cursor-grabbing' : 'cursor-grab'
                                }`}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <circle cx="9" cy="5" r="1"/>
                                  <circle cx="9" cy="12" r="1"/>
                                  <circle cx="9" cy="19" r="1"/>
                                  <circle cx="15" cy="5" r="1"/>
                                  <circle cx="15" cy="12" r="1"/>
                                  <circle cx="15" cy="19" r="1"/>
                                </svg>
                              </div>
                              {category.name}
                            </td>
                            <td className="px-4 py-2 text-black">{category.display_order}</td>
                            <td className="px-4 py-2">
                              <CategoryImage
                                imagePath={category.image}
                                alt={category.name}
                              />
                            </td>
                            <td className="px-4 py-2">
                              <div className="flex justify-center">
                                <VisibilitySwitch
                                  checked={visibilityStates[category.id] ?? false}
                                  onChange={() => toggleCategoryVisibility(category.id)}
                                />
                              </div>
                            </td>
                          </tr>
                        )}
                      </Draggable>
                    ))
                  )}
                  {provided.placeholder}
                </tbody>
              </table>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {/* Vista previa móvil */}
      <div className="mt-8 p-4 bg-white shadow-md rounded-md">
        <h2 className="text-lg font-bold text-black mb-4">Previsualización Móvil</h2>
        
        <div className="flex justify-center">
          {loading ? (
            <div className="flex items-center justify-center h-[300px]">
              <p>Cargando previsualización...</p>
            </div>
          ) : (
            <PhonePreview 
              clientName={client?.name || 'Roka'}
              clientLogo={client?.logoMain || ''}
              categories={categories
                .filter(cat => visibilityStates[cat.id])
                .map(cat => ({
                  id: cat.id,
                  name: cat.name,
                  // Extraer solo el nombre del archivo de la ruta completa y asegurar que no es null
                  image: cat.image ? cat.image.split('/').pop() || undefined : undefined
                }))
              }
            />
          )}
        </div>
      </div>

      {/* Mensaje de estado */}
      {statusMessage && (
        <div 
          className={`fixed bottom-5 right-5 py-2 px-4 rounded-md shadow-lg transition-opacity duration-300 ease-in-out ${
            statusMessage.type === 'success' ? 'bg-green-500 text-white' : 
            statusMessage.type === 'error' ? 'bg-red-500 text-white' : 
            'bg-blue-500 text-white'
          }`}
        >
          <div className="flex items-center space-x-2">
            {statusMessage.type === 'success' && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
            {statusMessage.type === 'error' && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            {statusMessage.type === 'info' && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
            <span>{statusMessage.text}</span>
          </div>
        </div>
      )}
    </div>
  );
}
