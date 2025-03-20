"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { 
  HomeIcon,
  QrCodeIcon,
  CubeIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  UserIcon,
  PhotoIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  SquaresPlusIcon
} from '@heroicons/react/24/outline'

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

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`)
  }

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

  function renderNavLinks() {
    const navLinks = [
      { name: 'Dashboard', href: '/dashboard', icon: SquaresPlusIcon },
      { name: 'Inicio', href: '/dashboard', icon: HomeIcon },
      { name: 'Menú', href: '/dashboard/menu', icon: CubeIcon },
      { name: 'Productos', href: '/dashboard/productos', icon: CubeIcon },
      { name: 'Monedas', href: '/dashboard/monedas', icon: CurrencyDollarIcon },
      { name: 'Tipos de Negocio', href: '/dashboard/tipos-negocio', icon: BuildingOfficeIcon },
      { name: 'Cliente', href: '/dashboard/cliente', icon: UserIcon },
      { name: 'Logo', href: '/dashboard/logo', icon: PhotoIcon },
      { name: 'Código QR', href: '/dashboard/codigo-qr', icon: QrCodeIcon },
      { name: 'Estadísticas', href: '/dashboard/estadisticas', icon: ChartBarIcon },
      { name: 'Configuración', href: '/dashboard/configuracion', icon: Cog6ToothIcon },
    ]

    return (
      <>
        {navLinks.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`
              group flex items-center px-2 py-2 text-sm font-medium rounded-md
              ${isActive(item.href) 
                ? 'bg-indigo-50 text-indigo-600' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
            `}
          >
            <item.icon 
              className={`
                mr-3 flex-shrink-0 h-5 w-5
                ${isActive(item.href) ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'}
              `} 
            />
            {item.name}
          </Link>
        ))}
      </>
    )
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Sidebar para móvil */}
      <div className={`fixed inset-0 flex z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75" 
          onClick={() => setSidebarOpen(false)}
        ></div>
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Cerrar sidebar</span>
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              {clientLogo ? (
                <Image 
                  src={clientLogo} 
                  alt="Logo" 
                  width={140} 
                  height={40} 
                  className="h-10 w-auto"
                />
              ) : (
                <span className="text-xl font-semibold">RokaMenu</span>
              )}
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {renderNavLinks()}
            </nav>
          </div>
          
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
                  {userName.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                  {userName}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar para desktop */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 border-r border-gray-200 bg-white">
            <div className="flex items-center h-16 flex-shrink-0 px-4 bg-white border-b border-gray-200">
              {clientLogo ? (
                <Image 
                  src={clientLogo} 
                  alt="Logo" 
                  width={140} 
                  height={40} 
                  className="h-10 w-auto"
                />
              ) : (
                <span className="text-xl font-semibold">RokaMenu</span>
              )}
            </div>
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <nav className="mt-2 flex-1 px-2 space-y-1">
                {renderNavLinks()}
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <div className="flex items-center w-full">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    {userName}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
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
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
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
