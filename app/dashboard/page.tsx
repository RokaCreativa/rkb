import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { 
  LayoutGrid, 
  UtensilsCrossed, 
  Settings, 
  Users,
  Bell,
  LogOut
} from "lucide-react"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/auth/signin')
  }

  const user = await prisma.usuarios.findFirst({
    where: {
      us_email: session.user.email as string
    }
  })

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">No tienes acceso a esta página</h1>
        <p>Usuario no encontrado.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <span className="text-lg font-semibold text-blue-600">RokaMenu</span>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            <Link href="/dashboard" className="flex items-center px-4 py-2 text-gray-700 bg-blue-50 rounded-lg">
              <LayoutGrid className="w-5 h-5 mr-3 text-blue-600" />
              <span>Dashboard</span>
            </Link>
            <Link href="/dashboard/menus" className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-200">
              <UtensilsCrossed className="w-5 h-5 mr-3" />
              <span>Menús</span>
            </Link>
            <Link href="/dashboard/products" className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-200">
              <UtensilsCrossed className="w-5 h-5 mr-3" />
              <span>Productos</span>
            </Link>
            <Link href="/dashboard/settings" className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-200">
              <Settings className="w-5 h-5 mr-3" />
              <span>Configuración</span>
            </Link>
          </nav>
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">{user.nombre || user.us_nombreusuario}</p>
                <p className="text-xs text-gray-500">{user.us_email}</p>
              </div>
              <Link href="/api/auth/signout" className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200">
                <LogOut className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="pl-64">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <h1 className="text-lg font-medium">Dashboard</h1>
              <div className="flex items-center space-x-4">
                <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200">
                  <Bell className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <div className="grid grid-cols-1 gap-6 mb-6 lg:grid-cols-3">
            {/* Stats Cards */}
            <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <LayoutGrid className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="ml-5">
                    <h3 className="text-lg font-medium text-gray-900">Total Categorías</h3>
                    <p className="text-2xl font-semibold text-gray-900">12</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3 rounded-b-lg">
                <Link href="/dashboard/categories" className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200">
                  Ver todas
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <UtensilsCrossed className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="ml-5">
                    <h3 className="text-lg font-medium text-gray-900">Total Productos</h3>
                    <p className="text-2xl font-semibold text-gray-900">48</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3 rounded-b-lg">
                <Link href="/dashboard/products" className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200">
                  Ver todos
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="ml-5">
                    <h3 className="text-lg font-medium text-gray-900">Usuarios Activos</h3>
                    <p className="text-2xl font-semibold text-gray-900">3</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3 rounded-b-lg">
                <Link href="/dashboard/users" className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200">
                  Ver todos
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Acciones Rápidas</h3>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <Link href="/dashboard/categories/new" className="group block p-6 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-500 transition-colors duration-200">
                        <LayoutGrid className="w-6 h-6 text-blue-600 group-hover:text-white" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-medium text-gray-900">Nueva Categoría</h4>
                      <p className="mt-1 text-sm text-gray-500">Crea una nueva categoría para tus productos</p>
                    </div>
                  </div>
                </Link>

                <Link href="/dashboard/products/new" className="group block p-6 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-500 transition-colors duration-200">
                        <UtensilsCrossed className="w-6 h-6 text-blue-600 group-hover:text-white" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-medium text-gray-900">Nuevo Producto</h4>
                      <p className="mt-1 text-sm text-gray-500">Agrega un nuevo producto a tu menú</p>
                    </div>
                  </div>
                </Link>

                <Link href="/dashboard/settings" className="group block p-6 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-500 transition-colors duration-200">
                        <Settings className="w-6 h-6 text-blue-600 group-hover:text-white" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-medium text-gray-900">Configuración</h4>
                      <p className="mt-1 text-sm text-gray-500">Personaliza la configuración de tu cuenta</p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
