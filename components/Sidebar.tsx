"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Menu, 
  Package, 
  Settings,
  QrCode,
  ChevronRight,
  Users
} from "lucide-react"

/**
 * Navegación principal del dashboard
 * Organizada en secciones:
 * 1. Principal (Dashboard)
 * 2. Gestión de Contenido (Menús, Productos)
 * 3. Marketing (QR)
 * 4. Administración (Usuarios, Configuración)
 */
const navigation = [
  // Principal
  { 
    name: "Dashboard", 
    href: "/dashboard", 
    icon: LayoutDashboard,
    description: "Vista general y estadísticas"
  },
  
  // Gestión de Contenido
  { 
    name: "Menús", 
    href: "/dashboard/menus", 
    icon: Menu,
    description: "Gestiona tus menús y categorías"
  },
  { 
    name: "Productos", 
    href: "/dashboard/products", 
    icon: Package,
    description: "Administra tu catálogo de productos"
  },
  
  // Marketing
  { 
    name: "Código QR", 
    href: "/dashboard/qr", 
    icon: QrCode,
    description: "Genera y personaliza tu código QR"
  },
  
  // Administración
  { 
    name: "Usuarios", 
    href: "/dashboard/users", 
    icon: Users,
    description: "Gestiona los usuarios del sistema"
  },
  { 
    name: "Configuración", 
    href: "/dashboard/settings", 
    icon: Settings,
    description: "Personaliza la apariencia y ajustes"
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col w-64 bg-gray-900">
      {/* Logo */}
      <div className="h-16 flex items-center px-6">
        <Link 
          href="/dashboard" 
          className="flex items-center gap-2 text-white"
        >
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <span className="text-gray-900 font-bold text-xl">R</span>
          </div>
          <span className="font-semibold text-xl">RokaMenu</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <div className="space-y-8">
          {/* Principal */}
          <div>
            <div className="px-3 mb-2">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Principal
              </h2>
            </div>
            <div className="space-y-1">
              {navigation.slice(0, 1).map((item) => (
                <NavItem key={item.name} item={item} pathname={pathname} />
              ))}
            </div>
          </div>

          {/* Gestión de Contenido */}
          <div>
            <div className="px-3 mb-2">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Gestión de Contenido
              </h2>
            </div>
            <div className="space-y-1">
              {navigation.slice(1, 3).map((item) => (
                <NavItem key={item.name} item={item} pathname={pathname} />
              ))}
            </div>
          </div>

          {/* Marketing */}
          <div>
            <div className="px-3 mb-2">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Marketing
              </h2>
            </div>
            <div className="space-y-1">
              {navigation.slice(3, 4).map((item) => (
                <NavItem key={item.name} item={item} pathname={pathname} />
              ))}
            </div>
          </div>

          {/* Administración */}
          <div>
            <div className="px-3 mb-2">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Administración
              </h2>
            </div>
            <div className="space-y-1">
              {navigation.slice(4).map((item) => (
                <NavItem key={item.name} item={item} pathname={pathname} />
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* User */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
          <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate">Mi Restaurante</p>
            <p className="text-xs opacity-50">Administrador</p>
          </div>
        </div>
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
          ? "bg-gray-800 text-white" 
          : "text-gray-400 hover:text-white hover:bg-gray-800"
        }
      `}
      title={item.description}
    >
      <Icon className="w-5 h-5" />
      <span className="flex-1">{item.name}</span>
      {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
    </Link>
  )
} 