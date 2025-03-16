"use client"

import { useState } from 'react'
import { Cog6ToothIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface MobilePreviewProps {
  onClose?: () => void
  showCloseButton?: boolean
}

export default function MobilePreview({ onClose, showCloseButton = false }: MobilePreviewProps) {
  const [showSettings, setShowSettings] = useState(false)

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <h3 className="text-lg font-medium text-gray-900">Vista Previa</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
          >
            <Cog6ToothIcon className="h-5 w-5" />
          </button>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Mobile frame */}
      <div className="flex-1 p-4 overflow-hidden">
        <div className="relative mx-auto h-[700px] w-[350px] rounded-[3rem] border-[14px] border-gray-900 overflow-hidden shadow-xl">
          {/* Notch */}
          <div className="absolute top-0 inset-x-0 h-6 bg-gray-900">
            <div className="absolute top-1.5 left-1/2 -translate-x-1/2 h-2.5 w-16 bg-gray-800 rounded-full" />
          </div>
          
          {/* Screen content */}
          <div className="relative h-full bg-white overflow-y-auto">
            {/* Ejemplo de contenido */}
            <div className="p-4">
              <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4" />
              <div className="h-4 bg-gray-100 rounded w-3/4 mx-auto mb-2" />
              <div className="h-4 bg-gray-100 rounded w-1/2 mx-auto" />
              
              {/* Lista de elementos */}
              <div className="mt-8 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
                      <div className="h-4 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="absolute right-4 top-16 w-72 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-4">Configuración de Apariencia</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color Principal</label>
              <div className="flex items-center space-x-2">
                <input type="color" className="h-8 w-8 rounded border border-gray-200" />
                <input type="text" className="flex-1 px-2 py-1 text-sm border border-gray-200 rounded" placeholder="#000000" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color de Fondo</label>
              <div className="flex items-center space-x-2">
                <input type="color" className="h-8 w-8 rounded border border-gray-200" />
                <input type="text" className="flex-1 px-2 py-1 text-sm border border-gray-200 rounded" placeholder="#FFFFFF" />
              </div>
            </div>
            <button className="w-full bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
              Aplicar Cambios
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 