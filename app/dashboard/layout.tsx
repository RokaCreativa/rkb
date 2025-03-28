"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { DashboardProvider } from './context'

/**
 * Componente de diseño principal del dashboard
 *
 * - Estructura el layout del panel de administración.
 * - Recibe `children` como prop para renderizar el contenido.
 * - Utiliza DashboardProvider para proporcionar el contexto a todos los componentes.
 * - Solo activa el proveedor cuando el usuario está autenticado para evitar cargas innecesarias.
 * - Actualizado: 29-03-2024 (UTC+0 - Londres/Tenerife)
 */

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const isAuthenticated = status === 'authenticated'

  return (
    <>
      {isAuthenticated ? (
        <DashboardProvider>
          <div className="min-h-screen bg-gray-50">
            {/* El TopNavbar se renderiza dentro de los componentes hijos */}
            <main>
              {children}
            </main>
          </div>
        </DashboardProvider>
      ) : (
        <div className="min-h-screen bg-gray-50">
          <main>{children}</main>
        </div>
      )}
    </>
  )
}
