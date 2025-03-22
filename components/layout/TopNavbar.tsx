import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard,
  QrCode,
  BarChart3,
  Settings,
  User,
  Bell,
  MoreHorizontal,
  ArrowUpDown
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

/**
 * Barra de navegación superior minimalista con iconos y texto
 * Implementa diseño horizontal compacto con menú desplegable para móviles
 * Actualizado: 29-05-2024 (UTC+0 - Londres/Tenerife)
 */
interface TopNavbarProps {
  isReorderModeActive?: boolean;
  onToggleReorderMode?: () => void;
}

export default function TopNavbar({ 
  isReorderModeActive = false,
  onToggleReorderMode 
}: TopNavbarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [notificationCount, setNotificationCount] = useState(3); // Número de notificaciones pendientes
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Elementos de navegación principal - rediseñado según solicitud
  const navigation = [
    { 
      name: "Dashboard", 
      href: "/dashboard", 
      icon: LayoutDashboard,
      description: "Vista general y estadísticas"
    },
    { 
      name: "Código QR", 
      href: "/dashboard/codigo-qr", 
      icon: QrCode,
      description: "Genera y personaliza tu código QR"
    },
    { 
      name: "Estadísticas", 
      href: "/dashboard/estadisticas", 
      icon: BarChart3,
      description: "Visualiza métricas de tu negocio"
    },
    { 
      name: "Configuración", 
      href: "/dashboard/configuracion", 
      icon: Settings,
      description: "Personaliza ajustes del sistema"
    },
    { 
      name: "Perfil", 
      href: "/dashboard/perfil", 
      icon: User,
      description: "Gestiona tu perfil de usuario"
    }
  ];

  return (
    <div className="sticky top-0 z-30 w-full bg-white border-b border-gray-200">
      <div className="mx-auto px-2 sm:px-4 h-12 flex items-center">
        <div className="flex justify-between items-center w-full">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center">
              <Image
                src="/images/client-logo.png"
                alt="RokaMenu"
                width={120}
                height={36}
                className="h-8 w-auto"
                priority
              />
            </Link>
          </div>
          
          {/* Navegación principal - Iconos con texto */}
          <div className="hidden md:flex items-center px-2 space-x-3">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center py-1 px-2 rounded-md transition-colors text-sm font-medium
                    ${isActive 
                      ? "text-indigo-600 bg-indigo-50" 
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                    }
                  `}
                  aria-label={item.name}
                >
                  <item.icon className="w-4 h-4 mr-1.5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
          
          {/* Botones de acción rápida */}
          <div className="flex items-center space-x-2">
            {/* Botón de reordenamiento */}
            {onToggleReorderMode && (
              <button 
                onClick={onToggleReorderMode}
                className={`
                  p-1.5 rounded-md transition-colors flex items-center text-sm font-medium
                  ${isReorderModeActive 
                    ? "text-indigo-600 bg-indigo-50" 
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }
                `}
                aria-label={isReorderModeActive ? "Desactivar reordenamiento" : "Activar reordenamiento"}
                title={isReorderModeActive ? "Desactivar reordenamiento" : "Activar reordenamiento"}
              >
                <ArrowUpDown className="w-4 h-4 mr-1.5" />
                <span className="hidden sm:inline">{isReorderModeActive ? "Desactivar orden" : "Activar orden"}</span>
              </button>
            )}
          
            {/* Botón hamburguesa para móviles */}
            <button 
              className="md:hidden p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menú principal"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>

            {/* Notificaciones */}
            <button 
              className="relative p-1.5 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
              aria-label="Notificaciones"
            >
              <Bell className="w-4 h-4" />
              {notificationCount > 0 && (
                <span className="absolute top-0 right-0 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-medium text-white">
                  {notificationCount}
                </span>
              )}
            </button>
            
            {/* Avatar del usuario */}
            <div className="flex-shrink-0">
              <button className="p-0.5 rounded-full hover:bg-gray-100">
                <div className="h-7 w-7 rounded-full overflow-hidden bg-gray-200 ring-1 ring-gray-100">
                  {session?.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || "Usuario"}
                      width={28}
                      height={28}
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-indigo-100 text-indigo-700 font-medium text-sm">
                      {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Indicador de modo de reordenamiento */}
      {isReorderModeActive && (
        <div className="py-1 px-2 text-center text-xs text-indigo-600 bg-indigo-50 border-b border-indigo-100">
          Modo de reordenamiento activo - Arrastra los elementos para cambiar su orden
        </div>
      )}
      
      {/* Menú móvil */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white shadow-md">
          <div className="py-1 px-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center py-2 px-3 rounded-md text-sm font-medium
                    ${isActive ? "bg-indigo-50 text-indigo-600" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"}
                  `}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className={`w-5 h-5 mr-3 ${isActive ? "text-indigo-500" : "text-gray-400"}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            
            {/* Opción de reordenamiento para móviles */}
            {onToggleReorderMode && (
              <button
                onClick={() => {
                  onToggleReorderMode();
                  setMobileMenuOpen(false);
                }}
                className={`
                  flex items-center py-2 px-3 rounded-md text-sm font-medium w-full text-left
                  ${isReorderModeActive ? "bg-indigo-50 text-indigo-600" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"}
                `}
              >
                <ArrowUpDown className={`w-5 h-5 mr-3 ${isReorderModeActive ? "text-indigo-500" : "text-gray-400"}`} />
                <span>{isReorderModeActive ? "Desactivar reordenamiento" : "Activar reordenamiento"}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 