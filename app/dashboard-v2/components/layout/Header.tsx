"use client";

/**
 * @fileoverview Componente de cabecera para el panel de administración
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-03-26
 * 
 * Este componente implementa la barra de navegación superior del dashboard
 * de administración, mostrando el logo, información del usuario y controles
 * de navegación.
 */

import { signOut, useSession } from "next-auth/react";
import { Menu, LogOut, User } from "lucide-react";
import Link from "next/link";

/**
 * Componente de cabecera para el dashboard
 * 
 * Este componente muestra la barra superior de navegación con:
 * - Logo/nombre de la aplicación con enlace al dashboard
 * - Botón de menú para dispositivos móviles
 * - Información del usuario actual (email)
 * - Botón para cerrar sesión
 * 
 * Utiliza el hook useSession de NextAuth para acceder a la información
 * de la sesión actual del usuario autenticado.
 * 
 * @returns {JSX.Element} Componente de cabecera con navegación y controles de usuario
 */
const Header = () => {
  // Obtener información de la sesión actual
  const { data: session } = useSession();

  return (
    <header className="bg-white border-b">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-4">
          <button className="lg:hidden">
            <Menu className="h-6 w-6" />
          </button>
          <Link href="/dashboard" className="text-xl font-bold text-gray-900">
            RokaMenu
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-gray-500" />
            <span className="text-sm text-gray-700">{session?.user?.email}</span>
          </div>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <LogOut className="h-4 w-4" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
