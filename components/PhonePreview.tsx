"use client"

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, Search } from 'lucide-react'

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
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)

  const defaultCategories = [
    { id: 1, name: 'PASTAS', image: '/images/categories/pastas.jpg' },
    { id: 2, name: 'Menu solo postres', image: '/images/categories/postres.jpg' },
    { id: 3, name: 'Carnes foryou', image: '/images/categories/carnes.jpg' },
  ]

  const displayCategories = categories.length > 0 ? categories : defaultCategories

  return (
    <div className="relative mx-auto" style={{ width: '350px', height: '680px' }}>
      {/* Phone Frame */}
      <div 
        className="absolute inset-0 border-[10px] border-gray-900 rounded-[2.5rem] shadow-xl overflow-hidden bg-white"
      >
        {/* Status Bar */}
        <div className="absolute top-0 inset-x-0 h-6 flex items-center justify-between px-8 bg-black text-white z-30">
          <div className="text-xs">17:14</div>
          <div className="flex space-x-1 items-center">
            <div className="text-xs flex space-x-1">
              <span>••••</span>
              <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                <path d="M12 21.25C13.1 21.25 14 20.35 14 19.25H10C10 20.35 10.9 21.25 12 21.25ZM18 15.25V10.25C18 7.15 16.34 4.55 13.5 3.85V3.25C13.5 2.15 12.6 1.25 11.5 1.25C10.4 1.25 9.5 2.15 9.5 3.25V3.85C6.67 4.55 5 7.15 5 10.25V15.25L3 17.25V18.25H21V17.25L19 15.25Z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="absolute inset-0 pt-6 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
            <span className="font-medium">Español</span>
            <button className="p-1 rounded-full">
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* Restaurant Info */}
          <div className="bg-white pt-4 pb-6">
            <div className="flex flex-col items-center justify-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Roka</h1>
              <div className="flex items-center text-sm mb-1">
                <span className="font-medium mr-1">5</span>
                <span className="mr-1">·</span>
                <span className="text-yellow-600">Excelente</span>
              </div>
              <div className="text-sm text-gray-500">1 valoración</div>
            </div>
          </div>

          {/* Info Section */}
          <div className="border-t border-b border-gray-200 py-4 px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">Info</span>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <div className="mt-1 pl-9 text-sm text-gray-500">
              Redes sociales
            </div>
          </div>

          {/* Categories */}
          <div className="px-4 py-4 space-y-3">
            {displayCategories.map(category => (
              <div
                key={category.id}
                className="flex items-center p-4 bg-white rounded-lg border border-gray-200"
              >
                <svg className="w-6 h-6 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="font-medium">{category.name}</span>
              </div>
            ))}
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