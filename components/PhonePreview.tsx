"use client"

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { ChevronLeft, Search, X, Globe, ChevronDown } from 'lucide-react'

/**
 * Interface para las propiedades del componente PhonePreview
 */
interface PhonePreviewProps {
  /** Nombre del cliente o negocio a mostrar */
  clientName?: string;
  /** Lista de categorías para mostrar en la vista previa */
  categories?: Array<{
    id: number;
    name: string;
    image?: string;
  }>;
  /** URL del logo del cliente */
  clientLogo?: string;
  /** Idioma actual seleccionado */
  language?: string;
}

/**
 * Componente que muestra una vista previa móvil del menú digital
 * 
 * Simula cómo se vería el menú en un dispositivo móvil, mostrando 
 * categorías, imágenes y permitiendo interacción básica para dar
 * al usuario una experiencia visual del resultado final.
 */
export function PhonePreview({ 
  clientName = "Mi Restaurante", 
  clientLogo, 
  categories = [],
  language = "Español"
}: PhonePreviewProps) {
  // Estado para manejar errores de carga de imágenes
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({})
  const [headerImage, setHeaderImage] = useState<string>("/images/restaurant-header.jpg")
  const [logoError, setLogoError] = useState<boolean>(false)
  const [expandedImage, setExpandedImage] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState<string>("")

  // Categorías por defecto para mostrar cuando no hay datos
  const defaultCategories = [
    { id: 1, name: 'Platos principales', image: '/images/categories/default-main.jpg' },
    { id: 2, name: 'Postres', image: '/images/categories/default-desserts.jpg' },
    { id: 3, name: 'Bebidas', image: '/images/categories/default-drinks.jpg' },
    { id: 4, name: 'Entrantes', image: '/images/categories/default-starters.jpg' },
    { id: 5, name: 'Especialidades', image: '/images/categories/default-specials.jpg' },
    { id: 6, name: 'Menú infantil', image: '/images/categories/default-kids.jpg' },
  ]

  // Determinar qué categorías mostrar
  const displayCategories = categories.length > 0 ? categories : defaultCategories

  // Actualizar la hora actual cada minuto
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }))
    }
    
    updateTime()
    const interval = setInterval(updateTime, 60000)
    
    return () => clearInterval(interval)
  }, [])

  // Manejar errores de carga de imágenes de categorías
  const handleImageError = useCallback((categoryId: number) => {
    setImageErrors(prev => ({
      ...prev,
      [categoryId]: true
    }))
  }, [])

  // Manejar errores de carga del logo
  const handleLogoError = useCallback(() => {
    setLogoError(true)
    setHeaderImage("/images/restaurant-header.jpg")
  }, [])

  // Expandir una imagen al hacer clic
  const handleImageClick = useCallback((image: string) => {
    if (image && !image.includes('placeholder')) {
      setExpandedImage(image)
    }
  }, [])

  return (
    <div className="relative w-full md:w-[375px] h-[670px] mx-auto">
      {/* Frame del teléfono */}
      <div className="absolute inset-0 border-[14px] border-indigo-600 rounded-[40px] shadow-xl overflow-hidden bg-white">
        {/* Notch superior */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/3 h-[30px] bg-indigo-600 rounded-b-xl z-10"></div>
        
        {/* Barra de estado */}
        <div className="absolute top-0 inset-x-0 h-8 flex items-center justify-between px-6 bg-transparent z-5 text-white">
          <div className="text-xs font-medium">{currentTime}</div>
          <div className="flex items-center space-x-1">
            <div className="h-3 flex items-center">
              <span className="text-[10px] mr-1">••••</span>
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 100-16 8 8 0 000 16z"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Contenido de la app */}
        <div className="absolute inset-0 pt-8 overflow-y-auto scrollbar-hide">
          {/* Imagen de cabecera o logo */}
          <div className="relative h-40 w-full">
            {clientLogo && !logoError ? (
              <Image
                src={clientLogo}
                alt={`Logo de ${clientName}`}
                fill
                className="object-contain bg-gray-100 p-2"
                onError={handleLogoError}
                sizes="100%"
              />
            ) : (
              <Image
                src={headerImage}
                alt="Imagen de cabecera"
                fill
                className="object-cover"
                onError={() => setHeaderImage("/images/restaurant-header.jpg")}
                sizes="100%"
              />
            )}
            
            {/* Overlay de cabecera con buscador e idioma */}
            <div className="absolute top-0 inset-x-0 flex items-center justify-between p-3">
              <div className="bg-gray-900 bg-opacity-50 rounded-md px-3 py-1 text-white flex items-center">
                <Globe className="w-4 h-4 mr-1" />
                <span className="text-sm">{language}</span>
                <ChevronDown className="w-3 h-3 ml-1" />
              </div>
              <div className="bg-gray-900 bg-opacity-50 rounded-full p-2 text-white">
                <Search className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Información del restaurante */}
          <div className="p-5 bg-white">
            <h1 className="text-2xl font-bold mb-1">{clientName}</h1>
            <p className="text-sm text-gray-500 mb-4">
              Menú digital
            </p>

            {/* Categorías */}
            <div className="grid grid-cols-3 gap-3 p-2 pb-16 mt-3 overflow-y-auto max-h-[520px]">
              {displayCategories.map((category, index) => (
                <div 
                  key={category.id?.toString() || `phone-category-${index}`} 
                  className="flex flex-col items-center"
                >
                  <div 
                    className="relative h-20 w-20 rounded-full overflow-hidden mb-2 border border-gray-200 shadow-sm cursor-pointer"
                    onClick={() => category.image && handleImageClick(category.image)}
                  >
                    <Image 
                      src={category.image || '/images/placeholder.png'} 
                      alt={category.name || ''} 
                      fill 
                      className="object-cover" 
                      sizes="80px"
                      onError={() => handleImageError(category.id)}
                    />
                  </div>
                  <span className="text-xs font-medium text-center w-full truncate px-1">
                    {category.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal para imagen ampliada */}
      {expandedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
          onClick={() => setExpandedImage(null)}
        >
          <div className="relative max-w-2xl max-h-[80vh] w-full">
            <button 
              className="absolute top-2 right-2 bg-white rounded-full p-1 z-10"
              onClick={(e) => {
                e.stopPropagation()
                setExpandedImage(null)
              }}
            >
              <X className="w-6 h-6" />
            </button>
            <div className="relative w-full h-[60vh]">
              <Image
                src={expandedImage}
                alt="Imagen ampliada"
                fill
                className="object-contain"
                onError={() => setExpandedImage(null)}
                sizes="100vw"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 