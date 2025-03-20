"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

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
      <div className="relative h-10 w-10 rounded-md overflow-hidden">
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
    return <p className="text-center text-gray-500">Cargando categorías...</p>;
  }

  // Mostrar error si hay fallos en la carga
  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  return (
    <div className="space-y-6 p-6">
      {/* Título y botón */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categorías</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          Añadir Categoría
        </button>
      </div>

      {/* Tabla de categorías */}
      <div className="overflow-x-auto bg-white shadow-md rounded-md p-4">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left text-xs font-medium">Nombre</th>
              <th className="px-4 py-2 text-left text-xs font-medium">Orden</th>
              <th className="px-4 py-2 text-left text-xs font-medium">Foto</th>
              <th className="px-4 py-2 text-left text-xs font-medium">Visibilidad</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-4">
                  No hay categorías disponibles.
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category.id} className="border-b">
                  <td className="px-4 py-2">{category.name}</td>
                  <td className="px-4 py-2">{category.display_order}</td>
                  <td className="px-4 py-2">
                    <CategoryImage
                      imagePath={category.image}
                      alt={category.name}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="checkbox"
                      checked={visibilityStates[category.id] ?? false}
                      onChange={() => toggleCategoryVisibility(category.id)}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
