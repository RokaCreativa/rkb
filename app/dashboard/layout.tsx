"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { XMarkIcon, Bars3Icon } from '@heroicons/react/24/outline'
import Sidebar from '@/components/layout/Sidebar'

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
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [clientLogo, setClientLogo] = useState<string | null>(null)
  const [userName, setUserName] = useState<string>("Usuario")

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      if (session.user.name) {
        setUserName(session.user.name)
      } else if (session.user.email) {
        setUserName(session.user.email.split('@')[0])
      }

      const fetchClientLogo = async () => {
        try {
          setClientLogo("/images/client-logo.png")
        } catch (error) {
          console.error("Error al cargar el logo del cliente:", error)
        }
      }

      fetchClientLogo()
    }
  }, [session, status])

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Sidebar para móvil */}
      <div 
        className={`fixed inset-0 flex z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}
        aria-hidden="true"
      >
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity" 
          onClick={() => setSidebarOpen(false)}
        ></div>
        
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white transform transition ease-in-out duration-300">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Cerrar sidebar</span>
              <XMarkIcon className="h-6 w-6 text-white" />
            </button>
          </div>
          
          <Sidebar />
        </div>
      </div>

      {/* Sidebar para desktop */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <Sidebar />
      </div>

      {/* Contenido principal */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white border-b border-gray-200 lg:hidden">
          <button
            type="button"
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Abrir sidebar</span>
            <Bars3Icon className="h-6 w-6" />
          </button>
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex">
              <span className="flex items-center text-lg font-semibold">
                Dashboard
              </span>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              <div className="ml-3 relative">
                <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
                  {userName.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </div>

        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-full mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
