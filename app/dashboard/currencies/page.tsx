"use client"

import { useState, useEffect } from 'react'
import { CurrencyDollarIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'

interface Moneda {
  id: number;
  descripcion: string;
  simbolo: string;
  codigo_stripe: string;
}

// Función para obtener monedas
async function fetchMonedas() {
  try {
    const response = await fetch('/api/monedas');
    if (!response.ok) {
      throw new Error('Error al cargar monedas');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al cargar monedas:", error);
    return [];
  }
}

export default function MonedasPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [monedas, setMonedas] = useState<Moneda[]>([]);
  
  // Cargar datos al inicio
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const monedasData = await fetchMonedas();
        if (monedasData) {
          setMonedas(monedasData);
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
        <h2 className="text-2xl font-bold text-gray-900">Monedas</h2>
        <button className="bg-indigo-600 text-white rounded-md px-4 py-2 text-sm hover:bg-indigo-700 flex items-center space-x-1">
          <PlusIcon className="h-4 w-4" />
          <span>Nueva Moneda</span>
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Encabezado de la tabla */}
        <div className="grid grid-cols-12 bg-gray-50 py-3 px-4 text-sm font-medium text-gray-500 border-b">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-6">NOMBRE</div>
          <div className="col-span-2 text-center">SÍMBOLO</div>
          <div className="col-span-2 text-center">CÓDIGO STRIPE</div>
          <div className="col-span-1 text-center">ACCIONES</div>
        </div>

        {/* Filas de monedas */}
        <div className="divide-y divide-gray-200">
          {monedas.length > 0 ? (
            monedas.map((moneda) => (
              <div key={moneda.id} className="grid grid-cols-12 py-4 px-4 text-sm text-gray-900 items-center hover:bg-gray-50">
                <div className="col-span-1 text-center">{moneda.id}</div>
                <div className="col-span-6 flex items-center">
                  <CurrencyDollarIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <span>{moneda.descripcion}</span>
                </div>
                <div className="col-span-2 text-center font-medium">{moneda.simbolo}</div>
                <div className="col-span-2 text-center text-gray-500">{moneda.codigo_stripe}</div>
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
              <p>No hay monedas disponibles</p>
              <p className="mt-2 text-xs">Añade una moneda para empezar</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-6 text-sm text-gray-500">
        <p>Esta sección permite gestionar las monedas que puedes utilizar en tu menú digital.</p>
        <p>El símbolo se mostrará junto a los precios en el menú, y el código Stripe es necesario para procesar pagos.</p>
      </div>
    </div>
  );
} 