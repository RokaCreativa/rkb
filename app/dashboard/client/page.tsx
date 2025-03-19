"use client"

import { useState, useEffect } from 'react'
import { prisma } from '@/lib/prisma'
import { UserIcon, AtSymbolIcon, PhoneIcon, MapPinIcon, CurrencyDollarIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline'

interface Cliente {
  id?: number;
  cliente?: number;
  nombre?: string;
  email?: string;
  telefono?: string;
  comp_direccion?: string;
  instagram?: string;
  numero_ws?: string;
  moneda?: number;
  tipo?: number;
}

interface Moneda {
  id: number;
  nombre: string;
  simbolo: string;
}

interface TipoNegocio {
  id: number;
  descripcion: string;
}

// Función para obtener datos del cliente
async function fetchClientData() {
  try {
    const response = await fetch('/api/cliente');
    if (!response.ok) {
      throw new Error('Error al cargar datos del cliente');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al cargar datos del cliente:", error);
    return null;
  }
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

export default function ClientePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [cliente, setCliente] = useState<Cliente>({});
  const [monedas, setMonedas] = useState<Moneda[]>([]);
  const [tiposNegocio, setTiposNegocio] = useState<TipoNegocio[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Cliente>({});
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Cargar datos al inicio
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [clienteData, monedasData, tiposNegocioData] = await Promise.all([
          fetchClientData(),
          fetchMonedas(),
          fetchTiposNegocio()
        ]);
        
        if (clienteData) {
          setCliente(clienteData);
          setFormData(clienteData);
        }
        
        if (monedasData) {
          setMonedas(monedasData);
        }
        
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

  // Handler para cambios en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handler para iniciar edición
  const handleEditClick = () => {
    setIsEditing(true);
    setFormData(cliente);
    setMessage(null);
  };

  // Handler para cancelar edición
  const handleCancelClick = () => {
    setIsEditing(false);
    setFormData(cliente);
    setMessage(null);
  };

  // Handler para guardar cambios
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setMessage(null);
      
      const response = await fetch('/api/cliente', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al guardar los datos');
      }
      
      // Actualizar datos del cliente
      setCliente(data);
      setIsEditing(false);
      
      setMessage({
        type: 'success',
        text: 'Datos guardados correctamente'
      });
    } catch (error) {
      console.error('Error al guardar:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Error al guardar los datos'
      });
    }
  };

  // Obtener nombre de la moneda actual
  const getCurrentMoneda = () => {
    if (!cliente.moneda || monedas.length === 0) return 'No especificada';
    const moneda = monedas.find(m => m.id === cliente.moneda);
    return moneda ? `${moneda.nombre} (${moneda.simbolo})` : 'No especificada';
  };

  // Obtener nombre del tipo de negocio actual
  const getCurrentTipoNegocio = () => {
    if (!cliente.tipo || tiposNegocio.length === 0) return 'No especificado';
    const tipo = tiposNegocio.find(t => t.id === cliente.tipo);
    return tipo ? tipo.descripcion : 'No especificado';
  };

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
        <h2 className="text-2xl font-bold text-gray-900">Datos del Cliente</h2>
        {!isEditing && (
          <button
            onClick={handleEditClick}
            className="bg-indigo-600 text-white rounded-md px-4 py-2 text-sm hover:bg-indigo-700"
          >
            Editar Información
          </button>
        )}
      </div>
      
      {message && (
        <div className={`mb-6 p-4 rounded-md ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message.text}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isEditing ? (
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                  Nombre de la empresa
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="nombre"
                    id="nombre"
                    value={formData.nombre || ''}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Correo electrónico
                </label>
                <div className="mt-1">
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email || ''}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">
                  Teléfono
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="telefono"
                    id="telefono"
                    value={formData.telefono || ''}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="instagram" className="block text-sm font-medium text-gray-700">
                  Instagram
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="instagram"
                    id="instagram"
                    value={formData.instagram || ''}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="numero_ws" className="block text-sm font-medium text-gray-700">
                  WhatsApp
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="numero_ws"
                    id="numero_ws"
                    value={formData.numero_ws || ''}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="moneda" className="block text-sm font-medium text-gray-700">
                  Moneda
                </label>
                <div className="mt-1">
                  <select
                    name="moneda"
                    id="moneda"
                    value={formData.moneda || ''}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="">Seleccione una moneda</option>
                    {monedas.map((moneda) => (
                      <option key={moneda.id} value={moneda.id}>
                        {moneda.nombre} ({moneda.simbolo})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="tipo" className="block text-sm font-medium text-gray-700">
                  Tipo de Negocio
                </label>
                <div className="mt-1">
                  <select
                    name="tipo"
                    id="tipo"
                    value={formData.tipo || ''}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="">Seleccione un tipo</option>
                    {tiposNegocio.map((tipo) => (
                      <option key={tipo.id} value={tipo.id}>
                        {tipo.descripcion}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="comp_direccion" className="block text-sm font-medium text-gray-700">
                  Dirección
                </label>
                <div className="mt-1">
                  <textarea
                    name="comp_direccion"
                    id="comp_direccion"
                    rows={3}
                    value={formData.comp_direccion || ''}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>

            <div className="pt-5 flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancelClick}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Guardar
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                  Nombre
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{cliente.nombre || 'No especificado'}</dd>
              </div>
              
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <AtSymbolIcon className="h-5 w-5 text-gray-400 mr-2" />
                  Correo electrónico
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{cliente.email || 'No especificado'}</dd>
              </div>
              
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <PhoneIcon className="h-5 w-5 text-gray-400 mr-2" />
                  Teléfono
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{cliente.telefono || 'No especificado'}</dd>
              </div>
              
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M12 4.5c-2.52 0-4.5 1.98-4.5 4.5 0 2.52 2.25 4.5 4.5 4.5s4.5-1.98 4.5-4.5c0-2.52-2.25-4.5-4.5-4.5z" />
                    <path d="M19.5 16.5c0 .53-.21 1.04-.59 1.41-.37.38-.88.59-1.41.59H6.5c-.53 0-1.04-.21-1.41-.59-.38-.38-.59-.88-.59-1.41 0-2.49 2.01-4.5 4.5-4.5h6c2.49 0 4.5 2.01 4.5 4.5z" />
                  </svg>
                  Instagram
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{cliente.instagram || 'No especificado'}</dd>
              </div>
              
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M18 8L22 12L18 16M6 16L2 12L6 8M14 4L10 20" />
                  </svg>
                  WhatsApp
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{cliente.numero_ws || 'No especificado'}</dd>
              </div>
              
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <CurrencyDollarIcon className="h-5 w-5 text-gray-400 mr-2" />
                  Moneda
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{getCurrentMoneda()}</dd>
              </div>
              
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <BuildingStorefrontIcon className="h-5 w-5 text-gray-400 mr-2" />
                  Tipo de Negocio
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{getCurrentTipoNegocio()}</dd>
              </div>
              
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <MapPinIcon className="h-5 w-5 text-gray-400 mr-2" />
                  Dirección
                </dt>
                <dd className="mt-1 text-sm text-gray-900 whitespace-pre-line">{cliente.comp_direccion || 'No especificada'}</dd>
              </div>
            </dl>
          </div>
        )}
      </div>
    </div>
  );
} 