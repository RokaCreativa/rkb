"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Menu as MenuIcon, 
  Package, 
  CreditCard, 
  Store,
  User,
  Image as ImageIcon,
  QrCode,
  BarChart3,
  Settings,
  ChevronRight,
} from 'lucide-react'
import UserMenu from '@/components/UserMenu'

/**
 * Sidebar principal para el dashboard de RokaMenu
 * Proporciona navegación organizada en secciones lógicas
 */
const navigation = [
  // Principal
  { 
    name: "Dashboard", 
    href: "/dashboard", 
    icon: LayoutDashboard,
    description: "Vista general y estadísticas"
  },
  { 
    name: "Inicio", 
    href: "/dashboard", 
    icon: LayoutDashboard,
    description: "Página principal del dashboard"
  },
  
  // Gestión de Contenido
  { 
    name: "Menú", 
    href: "/dashboard/menu", 
    icon: MenuIcon,
    description: "Gestiona tus menús y categorías"
  },
  { 
    name: "Productos", 
    href: "/dashboard/productos", 
    icon: Package,
    description: "Administra tu catálogo de productos"
  },
  { 
    name: "Monedas", 
    href: "/dashboard/monedas", 
    icon: CreditCard,
    description: "Configura monedas y precios"
  },
  { 
    name: "Tipos de Negocio", 
    href: "/dashboard/tipos-negocio", 
    icon: Store,
    description: "Configura los tipos de negocio"
  },
  
  // Configuración de Cliente
  { 
    name: "Cliente", 
    href: "/dashboard/cliente", 
    icon: User,
    description: "Información del cliente"
  },
  { 
    name: "Logo", 
    href: "/dashboard/logo", 
    icon: ImageIcon,
    description: "Administra el logo de tu negocio"
  },
  
  // Marketing
  { 
    name: "Código QR", 
    href: "/dashboard/codigo-qr", 
    icon: QrCode,
    description: "Genera y personaliza tu código QR"
  },
  
  // Administración
  { 
    name: "Estadísticas", 
    href: "/dashboard/estadisticas", 
    icon: BarChart3,
    description: "Visualiza estadísticas y métricas"
  },
  { 
    name: "Configuración", 
    href: "/dashboard/configuracion", 
    icon: Settings,
    description: "Personaliza la apariencia y ajustes"
  },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col w-64 bg-white h-full border-r border-gray-200">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <Link 
          href="/dashboard" 
          className="flex items-center gap-2 text-gray-900"
        >
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">R</span>
          </div>
          <span className="font-semibold text-xl">RokaMenu</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="space-y-8">
          {/* Principal */}
          <div>
            <div className="px-3 mb-2">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Principal
              </h2>
            </div>
            <div className="space-y-1">
              {navigation.slice(0, 2).map((item) => (
                <NavItem key={item.name} item={item} pathname={pathname} />
              ))}
            </div>
          </div>

          {/* Gestión de Contenido */}
          <div>
            <div className="px-3 mb-2">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Gestión de Contenido
              </h2>
            </div>
            <div className="space-y-1">
              {navigation.slice(2, 6).map((item) => (
                <NavItem key={item.name} item={item} pathname={pathname} />
              ))}
            </div>
          </div>

          {/* Configuración de Cliente */}
          <div>
            <div className="px-3 mb-2">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Cliente
              </h2>
            </div>
            <div className="space-y-1">
              {navigation.slice(6, 8).map((item) => (
                <NavItem key={item.name} item={item} pathname={pathname} />
              ))}
            </div>
          </div>

          {/* Marketing */}
          <div>
            <div className="px-3 mb-2">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Marketing
              </h2>
            </div>
            <div className="space-y-1">
              {navigation.slice(8, 9).map((item) => (
                <NavItem key={item.name} item={item} pathname={pathname} />
              ))}
            </div>
          </div>

          {/* Administración */}
          <div>
            <div className="px-3 mb-2">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Administración
              </h2>
            </div>
            <div className="space-y-1">
              {navigation.slice(9).map((item) => (
                <NavItem key={item.name} item={item} pathname={pathname} />
              ))}
            </div>
          </div>
        </div>
      </nav>
      
      {/* User Menu */}
      <div className="border-t border-gray-200 p-4">
        <UserMenu />
      </div>
    </div>
  )
}

function NavItem({ 
  item, 
  pathname 
}: { 
  item: typeof navigation[0]
  pathname: string 
}) {
  const isActive = pathname === item.href
  const Icon = item.icon

  return (
    <Link
      href={item.href}
      className={`
        group flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
        ${isActive 
          ? "bg-indigo-50 text-indigo-600" 
          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        }
      `}
      title={item.description}
    >
      <Icon className={`w-5 h-5 ${isActive ? "text-indigo-500" : "text-gray-400 group-hover:text-gray-500"}`} />
      <span className="flex-1">{item.name}</span>
      {isActive && <ChevronRight className="w-4 h-4 ml-auto text-indigo-500" />}
    </Link>
  )
} 