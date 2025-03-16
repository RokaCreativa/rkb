"use client"

import { useState } from 'react'
import Link from 'next/link'
import { 
  HomeIcon, 
  QrCodeIcon,
  Cog6ToothIcon,
  BellIcon,
  ClipboardDocumentListIcon,
  PhotoIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline'

const menuItems = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Menús', href: '/dashboard/menus', icon: ClipboardDocumentListIcon },
  { name: 'Productos', href: '/dashboard/productos', icon: ShoppingBagIcon },
  { name: 'Código QR', href: '/dashboard/qr', icon: QrCodeIcon },
  { name: 'Apariencia', href: '/dashboard/apariencia', icon: PhotoIcon },
  { name: 'Configuración', href: '/dashboard/configuracion', icon: Cog6ToothIcon },
]

export default function Sidebar() {
  const [notifications, setNotifications] = useState(3) // Ejemplo de notificaciones

  return (
    <div className="h-full w-64 bg-white border-r border-gray-200">
      <div className="flex flex-col h-full">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <img
              className="h-8 w-auto"
              src="/logo.png"
              alt="RokaMenu"
            />
          </div>
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                <item.icon className="mr-3 h-6 w-6" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        
        {/* Botón de notificaciones */}
        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
          <button
            className="flex-shrink-0 group block w-full"
            onClick={() => setNotifications(0)}
          >
            <div className="flex items-center">
              <div className="relative">
                <BellIcon className="h-6 w-6 text-gray-400 group-hover:text-gray-500" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 flex items-center justify-center text-xs text-white">
                    {notifications}
                  </span>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                  Notificaciones
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
} 