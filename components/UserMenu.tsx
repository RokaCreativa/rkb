"use client"

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { User, LogOut, Settings, ChevronDown } from 'lucide-react'
import Link from 'next/link'

/**
 * Componente para mostrar el menú de usuario en el sidebar
 * Incluye opciones para acceder al perfil y cerrar sesión
 */
export default function UserMenu() {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  
  const userName = session?.user?.name || session?.user?.email?.split('@')[0] || 'Usuario'
  
  const toggleMenu = () => setIsOpen(!isOpen)
  
  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth/signin' })
  }
  
  return (
    <div className="relative">
      <button
        onClick={toggleMenu}
        className="flex items-center w-full px-3 py-2 text-sm text-left text-gray-700 transition-colors rounded-md hover:bg-gray-100"
      >
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold">
              {userName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium truncate max-w-[120px]">
              {userName}
            </span>
            <span className="text-xs text-gray-500">
              {session?.user?.role || 'Usuario'}
            </span>
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 w-full mb-1 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-10">
          <Link 
            href="/dashboard/perfil"
            className="flex items-center w-full px-3 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
          >
            <User className="w-4 h-4 mr-2" />
            Mi perfil
          </Link>
          <Link 
            href="/dashboard/configuracion"
            className="flex items-center w-full px-3 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
          >
            <Settings className="w-4 h-4 mr-2" />
            Configuración
          </Link>
          <button
            onClick={handleSignOut}
            className="flex items-center w-full px-3 py-2 text-sm text-left text-red-600 hover:bg-gray-100"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  )
} 