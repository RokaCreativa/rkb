"use client"

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { ChevronLeft, Search, X, Globe, ChevronDown, Clock, Wifi, Battery } from 'lucide-react'
import { getImagePath, handleImageError } from '@/lib/imageUtils'

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
    sections?: Section[];
  }>;
  /** URL del logo del cliente */
  clientLogo?: string;
  /** URL del logo principal del cliente */
  clientMainLogo?: string;
  /** Idioma actual seleccionado */
  language?: string;
}

// Interfaces para representar datos
interface Product {
  id: number;
  name: string;
  price: string | number;
  description?: string;
  image?: string;
}

interface Section {
  id: number;
  name: string;
  image?: string;
  products?: Product[];
}

/**
 * Componente que muestra una vista previa móvil del menú digital
 * Actualizado: 29-05-2024 19:45 (GMT+0)
 */
export function PhonePreview({ 
  clientName = "Mi Restaurante", 
  clientLogo, 
  clientMainLogo,
  categories = [],
  language = "Español"
}: PhonePreviewProps) {
  // Estado para manejar errores de carga de imágenes
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({})
  const [headerImage, setHeaderImage] = useState<string>("/images/restaurant-header.jpg")
  const [logoError, setLogoError] = useState<boolean>(false)
  const [mainLogoError, setMainLogoError] = useState<boolean>(false)
  const [expandedImage, setExpandedImage] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState<string>("")
  
  // Estados para navegación
  const [currentScreen, setCurrentScreen] = useState<'home' | 'category' | 'section'>('home')
  const [selectedCategory, setSelectedCategory] = useState<{id: number, name: string, sections?: Section[]} | null>(null)
  const [selectedSection, setSelectedSection] = useState<{id: number, name: string, products?: Product[]} | null>(null)
  
  // Estados para almacenar datos
  const [sectionsToShow, setSectionsToShow] = useState<Section[]>([])
  const [productsToShow, setProductsToShow] = useState<Product[]>([])

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

  // Debugging: Verificar qué categorías y secciones llegan al componente
  useEffect(() => {
    console.log("PhonePreview - Categorías recibidas:", categories);
    categories.forEach(cat => {
      console.log(`Categoría: ${cat.name}, Tiene secciones: ${(cat.sections && cat.sections.length > 0) ? 'Sí' : 'No'}`);
      if (cat.sections) {
        console.log(`Total secciones para ${cat.name}: ${cat.sections.length}`);
      }
    });
  }, [categories]);

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
  const handleCategoryImageError = useCallback((categoryId: number) => {
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

  // Manejar errores de carga del logo principal
  const handleMainLogoError = useCallback(() => {
    setMainLogoError(true)
  }, [])

  // Expandir una imagen al hacer clic
  const handleImageClick = useCallback((image: string) => {
    if (image && !image.includes('placeholder')) {
      setExpandedImage(image)
    }
  }, [])

  // Manejar clic en categoría
  const handleCategoryClick = useCallback((category: {id: number, name: string, sections?: Section[]}) => {
    console.log("Clic en categoría:", category);
    setSelectedCategory(category)
    setCurrentScreen('category')
    
    // Mostrar información detallada de depuración
    if (category.sections) {
      console.log(`La categoría ${category.name} tiene ${category.sections.length} secciones.`)
      console.log("Secciones de la categoría:", JSON.stringify(category.sections, null, 2))
    } else {
      console.log(`La categoría ${category.name} no tiene la propiedad sections definida.`)
    }
    
    // Usar secciones de la categoría si existen
    if (category.sections && category.sections.length > 0) {
      console.log(`Cargando ${category.sections.length} secciones para la categoría ${category.name}:`, category.sections);
      setSectionsToShow(category.sections)
    } else {
      console.log(`La categoría ${category.name} (ID: ${category.id}) no tiene secciones definidas.`);
      // No mostrar secciones genéricas, mostrar mensaje de que no hay secciones
      setSectionsToShow([])
    }
  }, [])
  
  // Manejar clic en sección
  const handleSectionClick = useCallback((section: {id: number, name: string, products?: Product[]}) => {
    setSelectedSection(section)
    setCurrentScreen('section')
    
    // Usar productos de la sección si existen
    if (section.products && section.products.length > 0) {
      setProductsToShow(section.products)
      console.log('Productos encontrados para la sección:', section.products)
    } else {
      console.log('Sin productos para mostrar, mostrando mensaje')
      // No mostrar productos genéricos, mostrar mensaje de que no hay productos
      setProductsToShow([])
    }
  }, [])

  // Volver a la pantalla anterior
  const handleBackClick = useCallback(() => {
    if (currentScreen === 'section') {
      setCurrentScreen('category')
      setSelectedSection(null)
    } else if (currentScreen === 'category') {
      setCurrentScreen('home')
      setSelectedCategory(null)
    }
  }, [currentScreen])

  // Formatear precio para mostrar
  const formatPrice = useCallback((price: string | number): string => {
    if (typeof price === 'number') {
      return price.toFixed(2) + '€'
    }
    
    // Si ya es string, asegurarse de que tiene el símbolo de euro
    return price.includes('€') ? price : price + '€'
  }, [])

  return (
    <div className="relative w-full md:w-[240px] h-[450px] mx-auto">
      {/* Sombra exterior para efecto 3D */}
      <div className="absolute inset-0 bg-indigo-600 rounded-[30px] transform translate-y-1 translate-x-1 blur-md opacity-30"></div>
      
      {/* Frame del teléfono */}
      <div className="absolute inset-0 border-[8px] border-indigo-600 rounded-[30px] shadow-xl overflow-hidden bg-white z-10">
        {/* Notch superior */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/3 h-[18px] bg-black rounded-b-xl z-30 flex justify-center items-end pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-700"></div>
        </div>
        
        {/* Barra de estado */}
        <div className="absolute top-0 inset-x-0 h-7 flex items-center justify-between px-5 bg-transparent z-20 text-white">
          <div className="text-[10px] font-medium flex items-center">
            {currentTime}
          </div>
          <div className="flex items-center space-x-1">
            <div className="flex items-center space-x-0.5">
              <div className="h-1.5 w-1.5 rounded-full bg-white"></div>
              <div className="h-1.5 w-1.5 rounded-full bg-white"></div>
              <div className="h-1.5 w-1.5 rounded-full bg-white"></div>
              <div className="h-1.5 w-1.5 rounded-full bg-white"></div>
            </div>
            <Wifi className="w-2.5 h-2.5" />
            <div className="w-3 h-1.5 border border-white rounded-sm relative">
              <div className="absolute inset-0 bg-white m-0.5 rounded-sm w-2"></div>
            </div>
          </div>
        </div>

        {/* Contenido de la app */}
        <div className="absolute inset-0 mt-7 overflow-y-auto scrollbar-hide bg-gray-50">
          {currentScreen === 'home' ? (
            <>
              {/* Imagen de cabecera con logo principal */}
              <div className="relative h-28 w-full bg-white shadow-sm">
                {clientMainLogo && !mainLogoError ? (
                  <div className="absolute inset-0 bg-gradient-to-b from-gray-900/20 to-gray-900/5 flex items-center justify-center">
                    <Image
                      src={clientMainLogo}
                      alt={`Logo principal de ${clientName}`}
                      width={150}
                      height={80}
                      className="object-contain max-h-full"
                      onError={handleMainLogoError}
                      style={{ maxWidth: '80%', maxHeight: '80%' }}
                    />
                  </div>
                ) : clientLogo && !logoError ? (
                  <div className="absolute inset-0 bg-gradient-to-b from-gray-900/20 to-gray-900/5">
                    <Image
                      src={clientLogo}
                      alt={`Logo de ${clientName}`}
                      fill
                      className="object-contain p-3"
                      onError={handleLogoError}
                      sizes="100%"
                      priority
                    />
                  </div>
                ) : (
                  <div className="absolute inset-0">
                    <Image
                      src={headerImage}
                      alt="Imagen de cabecera"
                      fill
                      className="object-cover"
                      onError={() => setHeaderImage("/images/restaurant-header.jpg")}
                      sizes="100%"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-gray-900/40 to-gray-900/10"></div>
                  </div>
                )}
                
                {/* Overlay de cabecera con buscador e idioma */}
                <div className="absolute top-0 inset-x-0 flex items-center justify-between p-2">
                  <div className="backdrop-blur-sm bg-white/20 rounded-lg px-2 py-1 text-white flex items-center shadow-sm">
                    <Globe className="w-2.5 h-2.5 mr-1" />
                    <span className="text-[10px] font-medium">{language}</span>
                    <ChevronDown className="w-2.5 h-2.5 ml-0.5" />
                  </div>
                  <div className="flex space-x-1.5">
                    <div className="backdrop-blur-sm bg-white/20 rounded-full p-1 text-white shadow-sm">
                      <Search className="w-2.5 h-2.5" />
                    </div>
                    <div className="backdrop-blur-sm bg-white/20 rounded-full p-1 text-white shadow-sm">
                      <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Información del restaurante */}
              <div className="px-3 py-2 bg-white">
                <h1 className="text-base font-bold mb-0.5 text-gray-900">{clientName}</h1>
                <p className="text-[10px] text-gray-500 mb-0.5">
                  Menú digital
                </p>
              </div>

              {/* Categorías */}
              <div className="p-2 bg-gray-50">
                <h2 className="text-base font-bold text-gray-800 mb-3 text-center uppercase">MENÚ</h2>
                <div className="grid grid-cols-3 gap-2">
                  {displayCategories.map((category, index) => (
                    <div 
                      key={category.id?.toString() || `phone-category-${index}`} 
                      className="flex flex-col items-center"
                      onClick={() => handleCategoryClick({
                        id: category.id, 
                        name: category.name,
                        sections: 'sections' in category ? category.sections : undefined
                      })}
                    >
                      <div 
                        className="relative h-14 w-14 rounded-full overflow-hidden mb-1 border-2 border-white shadow-md"
                      >
                        <Image 
                          src={getImagePath(category.image || null, 'categories')} 
                          alt={category.name || ''} 
                          fill 
                          className="object-cover" 
                          sizes="56px"
                          style={{ objectFit: 'cover' }}
                          onError={(e) => {
                            handleImageError(e);
                            handleCategoryImageError(category.id);
                          }}
                        />
                      </div>
                      <span className="text-[9px] font-medium text-center w-full px-1 text-gray-700 line-clamp-2">
                        {category.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : currentScreen === 'category' ? (
            /* Vista de secciones dentro de una categoría */
            <>
              {/* Barra de navegación secundaria */}
              <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
                <div className="flex items-center px-3 py-2">
                  <button 
                    className="p-1 mr-2 rounded-full hover:bg-gray-100"
                    onClick={handleBackClick}
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                  </button>
                  <h2 className="text-sm font-semibold text-gray-800">{selectedCategory?.name}</h2>
                </div>
              </div>

              {/* Lista de secciones */}
              <div className="p-2 bg-gray-50">
                {sectionsToShow.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {sectionsToShow.map((section) => (
                      <div 
                        key={section.id}
                        className="flex flex-col items-center"
                        onClick={() => handleSectionClick({
                          id: section.id, 
                          name: section.name,
                          products: section.products
                        })}
                      >
                        <div 
                          className="relative h-16 w-16 rounded-full overflow-hidden mb-1 border-2 border-white shadow-md"
                        >
                          <Image 
                            src={getImagePath(section.image || null, 'sections')} 
                            alt={section.name || ''} 
                            fill 
                            className="object-cover" 
                            sizes="64px"
                            style={{ objectFit: 'cover' }}
                            onError={handleImageError}
                          />
                        </div>
                        <span className="text-[10px] font-medium text-center w-full px-1 text-gray-700 line-clamp-2">
                          {section.name}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="bg-gray-100 rounded-full p-3 mb-2">
                      <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-500 text-center">No hay secciones disponibles</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Vista de productos dentro de una sección */
            <>
              {/* Barra de navegación secundaria */}
              <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
                <div className="flex items-center px-3 py-2">
                  <button 
                    className="p-1 mr-2 rounded-full hover:bg-gray-100"
                    onClick={handleBackClick}
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                  </button>
                  <h2 className="text-sm font-semibold text-gray-800">{selectedSection?.name}</h2>
                </div>
              </div>

              {/* Lista de productos */}
              <div className="p-2 bg-gray-50">
                {productsToShow.length > 0 ? (
                  <div className="space-y-2">
                    {productsToShow.map((product) => (
                      <div 
                        key={product.id}
                        className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100"
                      >
                        {product.image && (
                          <div className="relative h-32 w-full">
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              className="object-cover"
                              onError={handleImageError}
                              sizes="100%"
                            />
                          </div>
                        )}
                        <div className="p-2">
                          <div className="flex justify-between items-start">
                            <h3 className="text-xs font-medium text-gray-800">{product.name}</h3>
                            <span className="text-xs font-bold text-indigo-600">{formatPrice(product.price)}</span>
                          </div>
                          {product.description && (
                            <p className="text-[9px] text-gray-500 mt-1">{product.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="bg-gray-100 rounded-full p-3 mb-2">
                      <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-500 text-center">No hay productos disponibles</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal para imagen ampliada */}
      {expandedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
          onClick={() => setExpandedImage(null)}
        >
          <div className="relative max-w-2xl max-h-[80vh] w-full">
            <button 
              className="absolute top-2 right-2 bg-white text-black rounded-full p-2 shadow-lg z-10"
              onClick={(e) => {
                e.stopPropagation()
                setExpandedImage(null)
              }}
            >
              <X className="w-5 h-5" />
            </button>
            <div className="relative w-full h-[60vh]">
              <Image
                src={expandedImage}
                alt="Imagen ampliada"
                fill
                className="object-contain"
                onError={handleImageError}
                sizes="100vw"
                priority
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 