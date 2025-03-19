"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

/**
 * @fileoverview Página para gestionar categorías del menú
 * @author Desarrollador de Rokamenu
 * @version 1.0.0
 */

// Tipos y interfaces
interface Category {
  id: number;
  name: string;
  image: string | null;
  status: string | number; // Puede ser 'A'/'I' (string) o 1/0 (number)
  display_order: number;
  client_id: number;
  products: number;
}

interface VisibilityState {
  [key: number]: boolean;
}

/**
 * Componente de página de categorías
 * Muestra las categorías del cliente con opciones para gestionar su visibilidad
 * 
 * @returns {JSX.Element} Componente de página de categorías
 */
export default function CategoriesPage() {
  // Estados del componente
  const [loading, setLoading] = useState<boolean>(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [client, setClient] = useState<any>(null);
  const [visibilityStates, setVisibilityStates] = useState<VisibilityState>({});
  const [error, setError] = useState<string | null>(null);
  const [debugMode, setDebugMode] = useState<boolean>(true);
  const [imageErrors, setImageErrors] = useState<{[key: number]: boolean}>({});

  /**
   * Efecto para cargar los datos iniciales
   * Realiza llamadas a la API para obtener datos del cliente y categorías
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 1. Obtener datos del cliente
        const clientRes = await fetch('/api/client');
        if (!clientRes.ok) {
          throw new Error('Error al cargar datos del cliente');
        }
        const clientData = await clientRes.json();
        setClient(clientData);
        
        // 2. Obtener categorías
        const catRes = await fetch('/api/categories');
        if (!catRes.ok) {
          throw new Error('Error al cargar categorías');
        }
        
        const categoriesData = await catRes.json();
        console.log("Categorías cargadas:", categoriesData);
        
        // 3. Procesar los datos recibidos
        if (Array.isArray(categoriesData)) {
          // Procesar cada categoría y asegurarse de que tenga la ruta de imagen correcta
          const processedCategories = categoriesData.map(cat => ({
            ...cat,
            // Si la imagen existe, construir la ruta correcta
            image: cat.image ? `/images/categories/${cat.image}` : null
          }));
          
          console.log("Categorías procesadas:", processedCategories);
          setCategories(processedCategories);
          
          // 4. Inicializar estados de visibilidad basados en el campo status
          const initialStates: VisibilityState = {};
          processedCategories.forEach((cat: Category) => {
            // Manejar tanto formato 'A'/'I' (string) como 1/0 (number)
            if (typeof cat.status === 'string') {
              initialStates[cat.id] = cat.status === 'A';
            } else if (typeof cat.status === 'number') {
              initialStates[cat.id] = cat.status === 1;
            } else if (typeof cat.status === 'boolean') {
              initialStates[cat.id] = cat.status;
            } else {
              // Valor por defecto si no se reconoce el formato
              initialStates[cat.id] = false;
              console.warn(`Formato no reconocido para status de categoría ${cat.id}: ${cat.status}`);
            }
            
            // Registro para depuración
            console.log(`Categoría ${cat.id} (${cat.name}): status=${cat.status}, isVisible=${initialStates[cat.id]}, image=${cat.image || 'No image'}`);
          });
          
          console.log("Estados de visibilidad iniciales:", initialStates);
          setVisibilityStates(initialStates);
        } else {
          console.error("El formato de datos recibido no es un array:", categoriesData);
          setError("Error en el formato de datos recibidos");
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setError(`Error: ${error instanceof Error ? error.message : 'Desconocido'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /**
   * Función para cambiar la visibilidad de una categoría
   * Implementa actualización optimista y manejo de errores
   * 
   * @param {number} categoryId - ID de la categoría a modificar
   */
  const toggleCategoryVisibility = async (categoryId: number) => {
    try {
      // 1. Obtener estado actual
      const currentVisibility = visibilityStates[categoryId];
      const newVisibility = !currentVisibility;
      console.log(`Cambiando visibilidad de categoría ${categoryId}: ${currentVisibility ? 'Visible' : 'No visible'} => ${newVisibility ? 'Visible' : 'No visible'}`);
      
      // 2. Actualización optimista
      setVisibilityStates(prev => ({
        ...prev,
        [categoryId]: newVisibility
      }));
      
      // 3. Actualizar estado en categorías también para actualizar la UI
      setCategories(prev => 
        prev.map(cat => 
          cat.id === categoryId 
            ? { ...cat, status: newVisibility ? 'A' : 'I' } 
            : cat
        )
      );
      
      // 4. Enviar cambio al servidor
      const response = await fetch('/api/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: categoryId, 
          status: newVisibility ? 'A' : 'I' 
        })
      });
      
      // 5. Verificar respuesta
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      // 6. Procesar respuesta exitosa
      const updatedCategory = await response.json();
      console.log('Categoría actualizada:', updatedCategory);
      
    } catch (error) {
      console.error('Error al cambiar visibilidad:', error);
      
      // 7. Revertir cambio en caso de error (rollback)
      setVisibilityStates(prev => ({
        ...prev,
        [categoryId]: !prev[categoryId]
      }));
      
      // 8. Revertir cambio en las categorías también
      setCategories(prev => 
        prev.map(cat => 
          cat.id === categoryId 
            ? { ...cat, status: visibilityStates[categoryId] ? 'A' : 'I' } 
            : cat
        )
      );
      
      // 9. Mostrar error al usuario
      setError(`Error al cambiar visibilidad: ${error instanceof Error ? error.message : 'Desconocido'}`);
    }
  };

  /**
   * Función para manejar errores de carga de imágenes
   * Guarda un registro de qué imágenes fallaron para mostrar un placeholder
   */
  const handleImageError = (categoryId: number) => {
    console.warn(`Error al cargar la imagen para categoría ${categoryId}`);
    setImageErrors(prev => ({
      ...prev,
      [categoryId]: true
    }));
  };

  /**
   * Función para renderizar la imagen de la categoría
   * Asegura que la ruta de la imagen sea correcta
   * 
   * @param {string | null} imagePath - Ruta de la imagen de la categoría
   * @param {string} alt - Texto alternativo para la imagen
   * @param {Function} onError - Función para manejar errores de carga
   */
  const CategoryImage = ({ imagePath, alt, onError }: { 
    imagePath: string | null, 
    alt: string, 
    onError: () => void 
  }) => {
    if (!imagePath) return null;
    
    // La imagen ya debe tener la ruta correcta, así que la usamos directamente
    console.log(`Renderizando imagen: ${imagePath}`);
    
    return (
      <div className="relative h-10 w-10 rounded-md overflow-hidden">
        <Image
          src={imagePath}
          alt={alt}
          fill
          className="object-cover"
          onError={onError}
        />
      </div>
    );
  };

  // Renderizado del componente durante la carga
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Renderizado cuando hay un error
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p>{error}</p>
        </div>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Reintentar
        </button>
      </div>
    );
  }

  // Renderizado principal
  return (
    <div className="space-y-6 p-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categorías</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
          Añadir Categoría
        </button>
      </div>

      {/* Debug Panel para el desarrollador */}
      {debugMode && (
        <div className="bg-yellow-100 p-4 rounded-md mb-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-bold">Estado de visibilidad (Debug):</h2>
            <button 
              onClick={() => setDebugMode(false)} 
              className="text-xs bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
            >
              Ocultar
            </button>
          </div>
          <pre className="text-xs overflow-auto max-h-40">
            {JSON.stringify(
              categories.map(category => ({
                id: category.id,
                name: category.name,
                status: category.status,
                isVisible: visibilityStates[category.id],
                image: category.image,
                hasImageError: imageErrors[category.id] || false
              })),
              null,
              2
            )}
          </pre>
        </div>
      )}

      {/* Contenido principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Panel de categorías */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6">
            <div className="space-y-4">
              {/* Cabecera del panel */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Lista de Categorías</h2>
                <div className="flex items-center space-x-2">
                  <select className="border rounded-md px-3 py-2">
                    <option value="all">Todas</option>
                    <option value="active">Activas</option>
                    <option value="inactive">Inactivas</option>
                  </select>
                </div>
              </div>

              {/* Tabla de categorías */}
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[50px]">ID</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[80px]">Orden</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[100px]">Foto</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[100px]">Visibilidad</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[100px]">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {categories.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-4">
                          No hay categorías disponibles
                        </td>
                      </tr>
                    ) : (
                      categories.map((category) => {
                        // Usar el estado de visibilidad para determinar si está activo
                        const isActive = visibilityStates[category.id];
                        const hasImageError = imageErrors[category.id];
                        
                        return (
                          <tr key={category.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 whitespace-nowrap">{category.id}</td>
                            <td className="px-4 py-2 whitespace-nowrap font-medium">{category.name}</td>
                            <td className="px-4 py-2 whitespace-nowrap">{category.display_order}</td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              <CategoryImage 
                                imagePath={category.image} 
                                alt={category.name} 
                                onError={() => handleImageError(category.id)} 
                              />
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                {/* Switch con estado basado en visibilityStates */}
                                <button
                                  onClick={() => toggleCategoryVisibility(category.id)}
                                  className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    isActive ? "bg-blue-600" : "bg-gray-200"
                                  }`}
                                  aria-label={`Cambiar visibilidad de ${category.name}`}
                                >
                                  <span
                                    className={`inline-block w-5 h-5 transform bg-white rounded-full transition-transform ${
                                      isActive ? "translate-x-6" : "translate-x-1"
                                    }`}
                                  />
                                </button>
                                <span className="text-xs font-medium">
                                  {isActive ? "Visible" : "No visible"}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              <div className="flex space-x-2">
                                <button 
                                  className="text-blue-600 hover:text-blue-800 p-1 border rounded transition-colors"
                                  aria-label={`Editar categoría ${category.name}`}
                                >
                                  Editar
                                </button>
                                <button 
                                  className="text-red-600 hover:text-red-800 p-1 border rounded transition-colors"
                                  aria-label={`Eliminar categoría ${category.name}`}
                                >
                                  Borrar
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Panel de vista previa */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Vista Previa Móvil</h2>
              <div className="border rounded-lg p-4 bg-gray-50 max-w-xs mx-auto">
                {/* Simulación de dispositivo móvil */}
                <div className="rounded-t-lg bg-gray-200 h-6 flex items-center justify-center">
                  <div className="w-20 h-1 bg-gray-400 rounded-full" />
                </div>
                <div className="bg-white border-x border-gray-200 p-4">
                  {/* Encabezado de cliente */}
                  {client && (
                    <div className="flex flex-col items-center mb-4">
                      {client.logoMain && (
                        <div className="relative h-20 w-20 mb-2">
                          <Image
                            src={client.logoMain.startsWith('/images/') ? client.logoMain : `/logos/${client.logoMain}`}
                            alt={client.name || 'Logo'}
                            fill
                            className="object-contain"
                            onError={() => console.warn('Error al cargar logo de cliente')}
                          />
                        </div>
                      )}
                      <h3 className="font-bold text-center">{client.name}</h3>
                    </div>
                  )}
                  {/* Grid de categorías visibles - Mostrar todas las categorías visibles */}
                  <div className="grid grid-cols-2 gap-2">
                    {categories
                      .filter(cat => visibilityStates[cat.id])
                      .map((category) => {
                        const hasImageError = imageErrors[category.id];
                        
                        return (
                          <div
                            key={category.id}
                            className="bg-gray-100 rounded p-2 flex flex-col items-center"
                          >
                            <div className="relative h-16 w-16 mb-2">
                              <CategoryImage 
                                imagePath={category.image} 
                                alt={category.name} 
                                onError={() => handleImageError(category.id)} 
                              />
                            </div>
                            <span className="text-xs text-center">{category.name}</span>
                          </div>
                        );
                      })
                    }
                    {/* Mensaje cuando no hay categorías visibles */}
                    {categories.filter(cat => visibilityStates[cat.id]).length === 0 && (
                      <div className="col-span-2 text-center text-gray-500 text-sm py-3">
                        No hay categorías visibles
                      </div>
                    )}
                  </div>
                </div>
                <div className="rounded-b-lg bg-gray-200 h-6" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 