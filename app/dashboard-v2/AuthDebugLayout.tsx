"use client";

import { useSession, signIn } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function AuthDebugLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [authChecks, setAuthChecks] = useState<any[]>([]);
  
  useEffect(() => {
    // Añadir un nuevo check al historial cada vez que cambia el estado
    setAuthChecks(prev => [
      ...prev,
      {
        timestamp: new Date().toISOString(),
        status,
        hasSession: !!session,
      }
    ]);
    
    console.log(`[AuthDebugLayout] Estado actual: ${status}, Sesión: ${!!session}`);
    
    // Si no está autenticado después de un tiempo, intentar redirigir
    if (status === 'unauthenticated') {
      console.log('[AuthDebugLayout] Usuario no autenticado, preparando redirección...');
      
      const redirectTimer = setTimeout(() => {
        console.log('[AuthDebugLayout] Redirigiendo a página de inicio de sesión...');
        // Usar la misma ruta que el dashboard original usa para la autenticación
        window.location.href = '/auth/signin?callbackUrl=/dashboard-v2';
      }, 2000);
      
      return () => clearTimeout(redirectTimer);
    }
  }, [status, session]);
  
  // Si está cargando, mostrar un spinner
  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600 mb-4"></div>
          <h2 className="text-xl font-medium text-gray-700">Verificando sesión...</h2>
          <p className="text-sm text-gray-500 mt-2">Espere mientras verificamos sus credenciales</p>
        </div>
        
        {/* Historial de verificaciones para depuración */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg text-xs max-w-md w-full">
            <p className="font-medium">Información de depuración:</p>
            <div className="mt-2 overflow-auto max-h-60">
              <table className="min-w-full text-left">
                <thead>
                  <tr>
                    <th className="py-1">Hora</th>
                    <th className="py-1">Estado</th>
                    <th className="py-1">Sesión</th>
                  </tr>
                </thead>
                <tbody>
                  {authChecks.map((check, i) => (
                    <tr key={i} className="border-t border-gray-200">
                      <td className="py-1">{new Date(check.timestamp).toLocaleTimeString()}</td>
                      <td className="py-1">{check.status}</td>
                      <td className="py-1">{check.hasSession ? 'Sí' : 'No'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }
  
  // Si no está autenticado, mostrar mensaje de error
  if (status === 'unauthenticated') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="text-center">
          <div className="bg-red-100 p-3 rounded-full inline-block mb-4">
            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-6v3m4.5-8.5l-7.072 7.072a3 3 0 1 0 4.243 4.243l7.072-7.072a6 6 0 0 0-4.243-4.243z" />
            </svg>
          </div>
          <h2 className="text-xl font-medium text-gray-700">Acceso restringido</h2>
          <p className="text-sm text-gray-500 mt-2">Debe iniciar sesión para acceder al dashboard</p>
          <p className="text-xs text-gray-500 mt-1">Redirigiendo automáticamente...</p>
          
          <button 
            onClick={() => signIn(undefined, { callbackUrl: '/dashboard-v2' })}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Iniciar sesión ahora
          </button>
        </div>
        
        {/* Botón para ir a la página de prueba */}
        <button 
          onClick={() => window.location.href = '/auth-test'}
          className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
        >
          Diagnosticar problemas
        </button>
        
        {/* Historial de verificaciones para depuración */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg text-xs max-w-md w-full">
            <p className="font-medium">Información de depuración:</p>
            <div className="mt-2 overflow-auto max-h-60">
              <table className="min-w-full text-left">
                <thead>
                  <tr>
                    <th className="py-1">Hora</th>
                    <th className="py-1">Estado</th>
                    <th className="py-1">Sesión</th>
                  </tr>
                </thead>
                <tbody>
                  {authChecks.map((check, i) => (
                    <tr key={i} className="border-t border-gray-200">
                      <td className="py-1">{new Date(check.timestamp).toLocaleTimeString()}</td>
                      <td className="py-1">{check.status}</td>
                      <td className="py-1">{check.hasSession ? 'Sí' : 'No'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }
  
  // Si está autenticado, mostrar el contenido
  return <>{children}</>;
} 