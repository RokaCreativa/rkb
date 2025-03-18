import Link from 'next/link'

export default function Sidebar() {
  return (
    <aside className="fixed top-0 left-0 z-40 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0" aria-label="Sidebar">
      <div className="h-full px-3 py-4 overflow-y-auto bg-gray-50">
        <div className="mb-5">
          <h1 className="text-xl font-bold px-3">RokaMenu</h1>
        </div>
        <ul className="space-y-2 font-medium">
          <li>
            <Link href="/dashboard2/categorias" className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 group">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span className="ms-3">Categorías</span>
            </Link>
          </li>
          <li>
            <Link href="/dashboard2/productos" className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 group">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="ms-3">Productos</span>
            </Link>
          </li>
          <li>
            <Link href="/dashboard2/menu" className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 group">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="ms-3">Menú</span>
            </Link>
          </li>
          <li>
            <Link href="/dashboard2/alergenos" className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 group">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="ms-3">Alérgenos</span>
            </Link>
          </li>
          <li className="pt-4 mt-4 border-t border-gray-200">
            <Link href="/dashboard2/cliente" className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 group">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="ms-3">Cliente</span>
            </Link>
          </li>
          <li>
            <Link href="/dashboard2/fotos" className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 group">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="ms-3">Fotos</span>
            </Link>
          </li>
        </ul>
      </div>
    </aside>
  )
} 