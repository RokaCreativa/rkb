"use client"

import { useState, useEffect } from 'react'
import { BuildingStorefrontIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'

interface TipoNegocio {
  id: number;
  descripcion: string;
}

// Función para obtener tipos de negocio
async function fetchTiposNegocio() {
  try {
    const response = await fetch('/api/tipos-negocio');
    if (!response.ok) {
      throw new Error('Error al cargar tipos de negocio');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al cargar tipos de negocio:", error);
    return [];
  }
}

export default function TiposNegocioPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [tiposNegocio, setTiposNegocio] = useState<TipoNegocio[]>([]);
  
  // Cargar datos al inicio
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const tiposNegocioData = await fetchTiposNegocio();
        if (tiposNegocioData) {
          setTiposNegocio(tiposNegocioData);
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Mostrar mensaje de carga si es necesario
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="pb-5 border-b border-gray-200 mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Tipos de Negocio</h2>
        <button className="bg-indigo-600 text-white rounded-md px-4 py-2 text-sm hover:bg-indigo-700 flex items-center space-x-1">
          <PlusIcon className="h-4 w-4" />
          <span>Nuevo Tipo</span>
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Encabezado de la tabla */}
        <div className="grid grid-cols-12 bg-gray-50 py-3 px-4 text-sm font-medium text-gray-500 border-b">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-10">DESCRIPCIÓN</div>
          <div className="col-span-1 text-center">ACCIONES</div>
        </div>

        {/* Filas de tipos de negocio */}
        <div className="divide-y divide-gray-200">
          {tiposNegocio.length > 0 ? (
            tiposNegocio.map((tipo) => (
              <div key={tipo.id} className="grid grid-cols-12 py-4 px-4 text-sm text-gray-900 items-center hover:bg-gray-50">
                <div className="col-span-1 text-center">{tipo.id}</div>
                <div className="col-span-10 flex items-center">
                  <BuildingStorefrontIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <span>{tipo.descripcion}</span>
                </div>
                <div className="col-span-1 flex justify-center space-x-2">
                  <button className="text-gray-600 hover:text-gray-900">
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button className="text-gray-600 hover:text-red-600">
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-sm text-gray-500">
              <p>No hay tipos de negocio disponibles</p>
              <p className="mt-2 text-xs">Añade un tipo para empezar</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-6 text-sm text-gray-500">
        <p>Esta sección permite gestionar los tipos de negocio que puedes asignar a tu establecimiento.</p>
        <p>El tipo de negocio ayuda a organizar y categorizar tu establecimiento en el sistema.</p>
      </div>
    </div>
  );
} 