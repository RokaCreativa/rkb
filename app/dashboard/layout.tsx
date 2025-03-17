"use client"

import { useState } from 'react'
import UserMenu from '../components/UserMenu'
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
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <img
                className="h-8 w-auto"
                src="/logo.png"
                alt="RokaMenu"
              />
            </div>
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Main content area */}
          <div className="flex-1 min-w-0">
            {children}
          </div>

          {/* Mobile preview - fixed for larger screens */}
          <div className="hidden lg:block w-[400px] bg-white rounded-lg shadow-sm">
            <MobilePreview />
          </div>
        </div>
      </div>
    </div>
  )
}
