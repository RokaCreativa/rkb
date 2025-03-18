"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { CameraIcon, ArrowUpOnSquareIcon } from '@heroicons/react/24/outline'

interface Cliente {
  id?: number;
  nombre: string;
  logo?: string;
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

export default function LogoPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [cliente, setCliente] = useState<Cliente>({
    nombre: "Cargando datos...",
    logo: ""
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Cargar datos al inicio
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const clienteData = await fetchClientData();
        if (clienteData) {
          setCliente(clienteData);
          if (clienteData.logo) {
            // Establecer la URL completa para la previsualización
            setPreviewUrl(`/images/imagenes_estructura_antigua/products/${clienteData.logo}`);
          }
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Handler para seleccionar archivo
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      setMessage({
        type: 'error',
        text: 'El archivo debe ser una imagen (PNG, JPG, GIF)'
      });
      return;
    }
    
    // Validar tamaño (máx 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setMessage({
        type: 'error',
        text: 'El tamaño máximo permitido es 2MB'
      });
      return;
    }
    
    setSelectedFile(file);
    
    // Crear URL de previsualización
    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreviewUrl(fileReader.result as string);
    };
    fileReader.readAsDataURL(file);
    
    // Limpiar mensaje anterior
    setMessage(null);
  };

  // Handler para subir archivo
  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    setMessage(null);
    
    try {
      const formData = new FormData();
      formData.append('logo', selectedFile);
      
      // Endpoint para subir logo (debe implementarse)
      const response = await fetch('/api/cliente/logo', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al subir logo');
      }
      
      // Actualizar cliente con nuevo logo
      setCliente({
        ...cliente,
        logo: data.logo
      });
      
      setMessage({
        type: 'success',
        text: 'Logo actualizado correctamente'
      });
      
      // Limpiar selección
      setSelectedFile(null);
    } catch (error) {
      console.error('Error al subir logo:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Error al subir logo'
      });
    } finally {
      setIsUploading(false);
    }
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
        <h2 className="text-2xl font-bold text-gray-900">Logo del Cliente</h2>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Logo actual */}
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-4">Logo Actual</h3>
              <div className="border border-gray-200 rounded-lg p-4 flex items-center justify-center h-64 bg-gray-50">
                {previewUrl ? (
                  <img 
                    src={previewUrl} 
                    alt="Logo actual" 
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="text-center text-gray-500">
                    <CameraIcon className="h-12 w-12 mx-auto mb-2" />
                    <p>No hay logo disponible</p>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Este es el logo que aparecerá en su menú digital y página web.
              </p>
            </div>
            
            {/* Subir nuevo logo */}
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-4">Subir Nuevo Logo</h3>
              <div className="border border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center h-64 bg-gray-50 hover:bg-gray-100 transition-colors">
                <input
                  type="file"
                  id="logo-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileSelect}
                />
                <label htmlFor="logo-upload" className="cursor-pointer text-center">
                  <ArrowUpOnSquareIcon className="h-10 w-10 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-700 font-medium">Haz clic para seleccionar un archivo</p>
                  <p className="text-sm text-gray-500 mt-1">o arrastra y suelta aquí</p>
                  <p className="text-xs text-gray-500 mt-4">PNG, JPG o GIF • Máximo 2MB</p>
                </label>
              </div>
              
              {/* Botón de subida */}
              <div className="mt-4">
                <button
                  onClick={handleUpload}
                  disabled={!selectedFile || isUploading}
                  className={`w-full py-2 px-4 rounded-md ${
                    !selectedFile || isUploading 
                      ? 'bg-gray-300 cursor-not-allowed' 
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  } text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                >
                  {isUploading ? 'Subiendo...' : 'Subir Nuevo Logo'}
                </button>
              </div>
              
              {/* Mensaje de éxito/error */}
              {message && (
                <div className={`mt-4 p-3 rounded-md ${
                  message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                }`}>
                  {message.text}
                </div>
              )}
            </div>
          </div>
          
          {/* Instrucciones */}
          <div className="mt-8 border-t border-gray-200 pt-6">
            <h4 className="text-lg font-medium text-gray-700 mb-2">Recomendaciones para el Logo</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Use un fondo transparente para mejor integración en el diseño.</li>
              <li>Dimensiones recomendadas: 500x500 píxeles.</li>
              <li>Formatos recomendados: PNG para mejor calidad.</li>
              <li>Tamaño máximo: 2MB.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 