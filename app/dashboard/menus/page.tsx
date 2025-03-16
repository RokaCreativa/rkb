"use client";

import { useState, useEffect } from "react";
import { Category } from "@prisma/client";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function MenusPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/categories");
      if (!response.ok) throw new Error("Error al obtener categorías");
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCategory = async (id: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta categoría?")) return;

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Error al eliminar categoría");
      await fetchCategories();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Categorías</h1>
          <p className="text-sm text-gray-500">Cargando categorías...</p>
        </div>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="mb-4 animate-pulse rounded-lg border bg-white p-4"
          >
            <div className="h-4 w-3/4 rounded bg-gray-200" />
            <div className="mt-2 h-3 w-1/4 rounded bg-gray-200" />
          </div>
        ))}
      </div>
    );
  }

  const activeCategories = categories.filter(cat => cat.deleted === "N" && cat.status === "A");

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categorías</h1>
          <p className="text-sm text-gray-500">
            {activeCategories.length} {activeCategories.length === 1 ? "categoría" : "categorías"} activas
          </p>
        </div>
        <Link
          href="/dashboard/menus/nueva"
          className="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          <span>Nueva Categoría</span>
        </Link>
      </div>

      {activeCategories.length === 0 ? (
        <div className="rounded-lg border bg-white p-8 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-blue-100 p-2 text-blue-600">
            <Plus className="h-8 w-8" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No hay categorías
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Comienza creando tu primera categoría
          </p>
          <Link
            href="/dashboard/menus/nueva"
            className="mt-4 inline-flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            <span>Nueva Categoría</span>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activeCategories.map((category) => (
            <div
              key={category.id}
              className="rounded-lg border bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              {category.photo && (
                <div className="mb-4 h-40 w-full overflow-hidden rounded-lg">
                  <img
                    src={category.photo}
                    alt={category.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {category.name}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Orden: {category.order}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <Link
                    href={`/dashboard/menus/${category.id}`}
                    className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    title="Ver categoría"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                  <Link
                    href={`/dashboard/menus/${category.id}/editar`}
                    className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    title="Editar categoría"
                  >
                    <Edit className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => deleteCategory(category.id)}
                    className="rounded p-1 text-gray-400 hover:bg-red-100 hover:text-red-600"
                    title="Eliminar categoría"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 