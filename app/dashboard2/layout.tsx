export default function Dashboard2Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Barra lateral */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r">
        <div className="p-6">
          <h1 className="text-xl font-bold">RokaMenu</h1>
        </div>
        <nav className="px-4 py-2">
          <ul className="space-y-2">
            <li>
              <a 
                href="/dashboard2" 
                className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <span className="ml-3">Categorías</span>
              </a>
            </li>
            <li>
              <a 
                href="/dashboard2/productos" 
                className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <span className="ml-3">Productos</span>
              </a>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Contenido principal */}
      <main className="ml-64">
        {children}
      </main>
    </div>
  )
} 