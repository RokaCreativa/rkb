import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Acceso No Autorizado | RokaMenu",
  description: "No tienes permisos para acceder a esta sección",
};

/**
 * Página de acceso no autorizado
 * 
 * Esta página se muestra cuando un usuario intenta acceder a una sección
 * para la cual no tiene permisos adecuados.
 */
export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <div className="text-red-500 text-5xl mb-6">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            className="w-16 h-16 mx-auto"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
            />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Acceso No Autorizado
        </h1>
        
        <p className="text-gray-600 mb-6">
          No tienes los permisos necesarios para acceder a esta sección. 
          Si crees que deberías tener acceso, por favor contacta al administrador.
        </p>
        
        <div className="flex flex-col space-y-3">
          <Link 
            href="/"
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Volver al Inicio
          </Link>
          
          <Link 
            href="/auth/signin"
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            Iniciar sesión con otra cuenta
          </Link>
        </div>
      </div>
    </div>
  );
} 