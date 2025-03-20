"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ChevronLeft, Search, Utensils } from 'lucide-react'

interface PhonePreviewProps {
  clientName?: string;
  categories?: Array<{
    id: number;
    name: string;
    image?: string;
  }>;
  clientLogo?: string;
}

export function PhonePreview({ clientName = "Roka", clientLogo, categories = [] }: PhonePreviewProps) {
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({})
  const [headerImage, setHeaderImage] = useState<string>("/images/restaurant-header.jpg")
  const [logoError, setLogoError] = useState<boolean>(false)

  // Usar las categorías pasadas como prop o un conjunto de ejemplo si no hay datos
  const defaultCategories = [
    { id: 1, name: 'PASTAS', image: '1597307591_0da6af4d97d6a07721d3.jpg' },
    { id: 2, name: 'Menu solo postres', image: '1599057482_3d2f44d30cf4cb1e4e6f.jpg' },
    { id: 3, name: 'Carnes foryou', image: '1598359527_b5a3ce64b4b71068695b.jpg' },
  ]

  const displayCategories = categories.length > 0 ? categories : defaultCategories

  // Usar el logo del cliente para la cabecera si está disponible
  useEffect(() => {
    if (clientLogo) {
      setLogoError(false)
    }
  }, [clientLogo]);

  const handleImageError = (categoryId: number) => {
    setImageErrors(prev => ({
      ...prev,
      [categoryId]: true
    }))
  }

  const handleLogoError = () => {
    setLogoError(true)
    setHeaderImage("/images/restaurant-header.jpg")
  }

  return (
    <div className="relative mx-auto" style={{ width: '320px', height: '600px' }}>
      {/* Phone Frame - Color exactamente igual al botón Nueva categoría */}
      <div className="absolute inset-0 border-[10px] border-indigo-600 rounded-[40px] shadow-xl overflow-hidden bg-white">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/3 h-[30px] bg-indigo-600 rounded-b-xl z-10"></div>
        
        {/* Status Bar */}
        <div className="absolute top-0 inset-x-0 h-7 flex items-center justify-between px-6 bg-transparent z-5 text-white">
          <div className="text-xs">17:14</div>
          <div className="flex items-center space-x-1">
            <div className="h-3 flex items-center">
              <span className="text-[10px] mr-1">••••</span>
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 100-16 8 8 0 000 16z"/>
              </svg>
            </div>
          </div>
        </div>

        {/* App Content */}
        <div className="absolute inset-0 pt-7 overflow-y-auto scrollbar-hide">
          {/* Header Image o Logo */}
          <div className="relative h-40 w-full">
            {clientLogo && !logoError ? (
              <Image
                src={clientLogo}
                alt="Logo del cliente"
                fill
                className="object-contain bg-gray-100 p-2"
                onError={handleLogoError}
              />
            ) : (
              <Image
                src={headerImage}
                alt="Restaurant"
                fill
                className="object-cover"
                onError={() => setHeaderImage("/images/restaurant-header.jpg")}
              />
            )}
            
            {/* Header Overlay with search and language */}
            <div className="absolute top-0 inset-x-0 flex items-center justify-between p-3">
              <div className="bg-gray-900 bg-opacity-50 rounded-md px-3 py-1 text-white flex items-center">
                <span className="text-sm">Español</span>
                <ChevronLeft className="w-4 h-4 ml-1 transform rotate-90" />
              </div>
              <div className="bg-gray-900 bg-opacity-50 rounded-full p-2 text-white">
                <Search className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Restaurant Info */}
          <div className="p-5 bg-white">
            <h1 className="text-2xl font-bold mb-4">{clientName}</h1>

            {/* Categories */}
            <div className="space-y-3 mt-4">
              {displayCategories.map(category => (
                <div 
                  key={category.id}
                  className="flex items-center p-3 bg-white rounded-lg border border-gray-200"
                >
                  <Utensils className="w-5 h-5 text-gray-500 mr-3" />
                  <span className="font-medium">{category.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 