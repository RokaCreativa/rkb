"use client";

import { useEffect, useState } from 'react';
import { useSession, signIn, signOut } from "next-auth/react";

export default function AuthTestPage() {
  const { data: session, status } = useSession();
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/session');
        const data = await response.json();
        console.log('Session API response:', data);
        if (data.error) {
          setErrorDetails(data.error);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setErrorDetails(String(error));
      }
    };
    
    checkSession();
  }, []);

  return (
    <div className="p-8 max-w-lg mx-auto mt-10 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Estado de Autenticación</h1>
      
      <div className="mb-4 p-4 bg-gray-100 rounded">
        <p><strong>Estado:</strong> {status}</p>
        <p><strong>Sesión:</strong> {session ? 'Activa' : 'No hay sesión'}</p>
        
        {errorDetails && (
          <div className="mt-2 p-2 bg-red-100 text-red-700 rounded">
            <p><strong>Error:</strong> {errorDetails}</p>
          </div>
        )}
        
        {session && (
          <div className="mt-2">
            <p><strong>Usuario:</strong> {session.user?.name || 'Sin nombre'}</p>
            <p><strong>Email:</strong> {session.user?.email || 'Sin email'}</p>
            <p><strong>ID:</strong> {session.user?.id || 'Sin ID'}</p>
            <p><strong>Rol:</strong> {session.user?.role || 'Sin rol'}</p>
            <p><strong>Client ID:</strong> {session.user?.client_id || 'Sin cliente'}</p>
          </div>
        )}
      </div>
      
      <div className="flex space-x-4">
        {!session ? (
          <button
            onClick={() => signIn()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Iniciar Sesión
          </button>
        ) : (
          <button
            onClick={() => signOut()}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Cerrar Sesión
          </button>
        )}
        
        <button
          onClick={() => window.location.href = '/dashboard-v2'}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Ir al Dashboard
        </button>
      </div>
      
      <div className="mt-4 text-sm">
        <p>Si estás viendo esta página y no hay sesión activa, deberías haber sido redirigido a la página de inicio de sesión.</p>
        <p>Si estás viendo esta página y hay errores, revisa la consola del navegador para más detalles.</p>
      </div>
    </div>
  );
} 