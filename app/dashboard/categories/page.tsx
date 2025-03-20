"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { PhonePreview } from '@/components/PhonePreview';

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

  /**
   * Carga inicial de categorías desde la API.
   */
  useEffect(() => {
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
    } catch (error) {
      console.error("Error al cambiar visibilidad:", error);

      // Revertir cambio en caso de error
      setVisibilityStates((prev) => ({
        ...prev,
        [categoryId]: !prev[categoryId],
      }));
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
        <table className="min-w-full">
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
              categories.map((category) => (
                <tr key={category.id} className="border-b hover:bg-indigo-50 transition-colors">
                  <td className="px-4 py-2 text-black font-semibold">{category.name}</td>
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
              ))
            )}
          </tbody>
        </table>
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
    </div>
  );
}
