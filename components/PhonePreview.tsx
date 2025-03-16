"use client"

import { useState } from 'react'
import { ChevronLeft } from 'lucide-react'

export function PhonePreview() {
  const [theme, setTheme] = useState({
    background: '#ffffff',
    text: '#000000',
    accent: '#0ea5e9',
    radius: '0.5rem'
  })

  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)

  const categories = [
    { id: 1, name: 'Entrantes', products: [1, 2, 3] },
    { id: 2, name: 'Platos Principales', products: [4, 5, 6] },
    { id: 3, name: 'Postres', products: [7, 8] },
    { id: 4, name: 'Bebidas', products: [9, 10] }
  ]

  return (
    <div className="relative mx-auto" style={{ width: '320px', height: '650px' }}>
      {/* Phone Frame */}
      <div 
        className="absolute inset-0 border-[14px] border-gray-900 rounded-[3rem] shadow-xl overflow-hidden"
        style={{ backgroundColor: theme.background }}
      >
        {/* Status Bar */}
        <div className="absolute top-0 inset-x-0 h-6 flex items-center justify-between px-8 bg-white z-30">
          <div className="text-xs">9:41</div>
          <div className="flex space-x-1">
            <div className="w-4 h-4">
              <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor">
                <path d="M12 20.5C7.58172 20.5 4 16.9183 4 12.5C4 8.08172 7.58172 4.5 12 4.5C16.4183 4.5 20 8.08172 20 12.5C20 16.9183 16.4183 20.5 12 20.5ZM12 19.5C15.866 19.5 19 16.366 19 12.5C19 8.63401 15.866 5.5 12 5.5C8.13401 5.5 5 8.63401 5 12.5C5 16.366 8.13401 19.5 12 19.5Z"/>
              </svg>
            </div>
            <div className="w-4 h-4">
              <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor">
                <path d="M15.5355 4.92894C17.4882 6.88155 17.4882 10.1184 15.5355 12.0711C13.5829 14.0237 10.3461 14.0237 8.39339 12.0711C6.44078 10.1184 6.44078 6.88155 8.39339 4.92894C10.3461 2.97633 13.5829 2.97633 15.5355 4.92894Z"/>
              </svg>
            </div>
            <div className="w-4 h-4">
              <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor">
                <path d="M2 19.5C2 18.1193 3.11929 17 4.5 17H19.5C20.8807 17 22 18.1193 22 19.5V22.5C22 23.8807 20.8807 25 19.5 25H4.5C3.11929 25 2 23.8807 2 22.5V19.5Z"/>
                <path d="M5.5 2C6.88071 2 8 3.11929 8 4.5V22.5C8 23.8807 6.88071 25 5.5 25H4.5C3.11929 25 2 23.8807 2 22.5V4.5C2 3.11929 3.11929 2 4.5 2H5.5Z"/>
                <path d="M12.5 7C13.8807 7 15 8.11929 15 9.5V22.5C15 23.8807 13.8807 25 12.5 25H11.5C10.1193 25 9 23.8807 9 22.5V9.5C9 8.11929 10.1193 7 11.5 7H12.5Z"/>
                <path d="M19.5 11C20.8807 11 22 12.1193 22 13.5V22.5C22 23.8807 20.8807 25 19.5 25H18.5C17.1193 25 16 23.8807 16 22.5V13.5C16 12.1193 17.1193 11 18.5 11H19.5Z"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-6 w-40 bg-black rounded-b-3xl z-40"></div>

        {/* Content */}
        <div className="absolute inset-0 pt-6">
          {/* Fixed Header */}
          <div className="sticky top-6 bg-white border-b border-gray-100 z-20">
            <div className="text-center py-4" style={{ color: theme.text }}>
              <h1 className="text-2xl font-bold">Mi Restaurante</h1>
              <p className="text-sm opacity-75">Las mejores comidas de la ciudad</p>
            </div>
          </div>

          <div className="h-full overflow-auto hide-scrollbar">
            {selectedCategory === null ? (
              <>
                {/* Categories Grid */}
                <div className="grid grid-cols-2 gap-4 p-4">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className="aspect-square rounded-lg flex items-center justify-center shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98]"
                      style={{ 
                        backgroundColor: theme.accent,
                        borderRadius: theme.radius,
                        color: '#ffffff'
                      }}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                {/* Category View */}
                <div className="flex flex-col h-full">
                  {/* Category Header */}
                  <div className="sticky top-0 bg-white border-b border-gray-100 z-10">
                    <div className="flex items-center p-4">
                      <button 
                        onClick={() => setSelectedCategory(null)}
                        className="p-1 -ml-1 rounded-full hover:bg-gray-100"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <h2 className="ml-2 font-medium">
                        {categories.find(c => c.id === selectedCategory)?.name}
                      </h2>
                    </div>
                  </div>

                  {/* Products */}
                  <div className="flex-1 p-4 space-y-4">
                    {[1, 2, 3, 4, 5].map((item) => (
                      <div 
                        key={item}
                        className="p-4 rounded-lg shadow-sm flex items-center space-x-4 bg-white"
                        style={{ borderRadius: theme.radius }}
                      >
                        <div 
                          className="w-16 h-16 rounded-lg bg-gray-100 flex-shrink-0"
                          style={{ borderRadius: theme.radius }}
                        ></div>
                        <div style={{ color: theme.text }}>
                          <h3 className="font-medium">Producto {item}</h3>
                          <p className="text-sm opacity-75">$9.99</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Categories Strip */}
                  <div className="sticky bottom-0 bg-white border-t border-gray-100">
                    <div className="flex overflow-x-auto p-2 hide-scrollbar">
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => setSelectedCategory(category.id)}
                          className={`flex-shrink-0 px-4 py-2 rounded-full mr-2 text-sm transition-colors ${
                            category.id === selectedCategory
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {category.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
} 