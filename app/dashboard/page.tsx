"use client";

import { useState, useEffect } from 'react';
import { EyeIcon, PlusIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';

// Interfaces ajustadas a la estructura actualizada
interface Category {
  id: number;
  name: string;
  image: string | null;
  status: number; // Solo 1 o 0
  display_order: number;
  client_id: number;
  products: number;
}

interface Client {
  id: number;
  name: string;
  logo: string | null;
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

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [client, setClient] = useState<Client | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

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
      } catch (err: any) {
        setError(err.message || 'Error desconocido al cargar datos');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (status === 'authenticated') loadData();
  }, [status]);

  // Manejo cuando el usuario no está autenticado
  if (status === 'unauthenticated') {
    return (
      <div className="p-4 bg-red-50 text-red-700 border-l-4 border-red-400">
        Debes iniciar sesión para ver esta información.
      </div>
    );
  }

  // Mostrar carga
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
    );
  }

  // Mostrar error
  if (error) {
    return (
      <div className="p-8 bg-red-50 border-l-4 border-red-500 text-red-700">
        <h2 className="text-xl font-bold">Error al cargar datos</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Reintentar
        </button>
      </div>
    );
  }

  // Ruta correcta de imágenes
  const verifyImagePath = (imagePath: string | null): string => {
    if (!imagePath) return '/images/placeholder.png';
    return imagePath.startsWith('/images/categories/') 
      ? imagePath 
      : `/images/categories/${imagePath}`;
  };

  return (
    <div className="flex flex-col space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
    <div className="flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-6">
      <div className="flex-1">
          <h2 className="text-2xl font-bold mb-4">Categorías</h2>

          <div className="mb-4 flex justify-between">
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md bg-white">
              <EyeIcon className="h-4 w-4 mr-2" /> Ver categoría
            </button>

            <div className="flex space-x-2">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md bg-white">
                Acciones <ChevronDownIcon className="ml-2 h-4 w-4" />
              </button>

              <Link href="/dashboard/categories/new" className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md bg-indigo-600 text-white">
                <PlusIcon className="h-4 w-4 mr-2" /> Nueva categoría
              </Link>
                        </div>
                      </div>
                      
          <div className="overflow-hidden bg-white shadow rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase">NOMBRE</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase">ORDEN</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase">FOTO</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase">VISIBILIDAD</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(category => (
                  <tr key={category.id} onClick={() => setSelectedCategory(category)} className="cursor-pointer hover:bg-gray-50">
                    <td className="px-6 py-4">{category.name}</td>
                    <td className="px-6 py-4">{category.display_order}</td>
                    <td className="px-6 py-4">
                                        <Image
                        src={verifyImagePath(category.image)}
                        alt={category.name}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block w-10 h-5 rounded-full ${category.status === 1 ? 'bg-indigo-400' : 'bg-gray-200'}`}>
                        <span className={`block w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200 ${category.status === 1 ? 'translate-x-5' : 'translate-x-0'}`}/>
                      </span>
                    </td>
                  </tr>
                ))}
                {categories.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-4">No se encontraron categorías.</td>
                  </tr>
                )}
              </tbody>
            </table>
        </div>
      </div>
      
        {/* Vista previa simplificada */}
        <div className="w-full lg:w-96 bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Previsualización Móvil</h3>
          {selectedCategory ? (
            <>
              <h4 className="font-bold text-center">{selectedCategory.name}</h4>
              {selectedCategory.image && (
                <Image
                  src={verifyImagePath(selectedCategory.image)}
                  alt={selectedCategory.name}
                  width={320}
                  height={160}
                  className="rounded"
                />
              )}
            </>
          ) : (
            <p className="text-gray-500 text-center">Selecciona una categoría para previsualizar</p>
          )}
        </div>
      </div>
    </div>
  );
}
