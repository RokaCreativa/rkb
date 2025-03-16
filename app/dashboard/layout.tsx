"use client"

import { useState } from 'react'
import Sidebar from '../components/layout/Sidebar'
import MobilePreview from '../components/preview/MobilePreview'

/**
 * Componente de diseño principal del dashboard
 *
 * - Estructura el layout del panel de administración.
 * - Contiene el Sidebar, el Header y el contenido principal.
 * - Recibe `children` como prop para renderizar contenido dinámico.
 */

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [showMobilePreview, setShowMobilePreview] = useState(false)

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 flex">
        {/* Content area */}
        <div className="flex-1 overflow-auto">
          <div className="py-6 px-4 sm:px-6 lg:px-8 min-h-screen">
            {children}
          </div>
        </div>

        {/* Mobile Preview - Fixed on large screens */}
        <div className="hidden xl:block w-[380px] border-l border-gray-200 bg-white overflow-hidden">
          <div className="h-full sticky top-0">
            <MobilePreview />
          </div>
        </div>
      </div>

      {/* Mobile Preview Button - Only on small screens */}
      <button
        onClick={() => setShowMobilePreview(true)}
        className="xl:hidden fixed bottom-4 right-4 bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition-colors z-50"
      >
        Vista Previa
      </button>

      {/* Mobile Preview Modal - For small screens */}
      {showMobilePreview && (
        <div className="xl:hidden fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50">
          <div className="absolute inset-y-0 right-0 w-full max-w-md">
            <div className="h-full">
              <MobilePreview 
                showCloseButton 
                onClose={() => setShowMobilePreview(false)} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
