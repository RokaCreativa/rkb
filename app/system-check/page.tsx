"use client";

import { useEffect, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';

export default function SystemCheckPage() {
  const { data: session, status } = useSession();
  const [checks, setChecks] = useState<{
    name: string;
    status: 'pending' | 'success' | 'error';
    message?: string;
    details?: any;
  }[]>([
    { name: 'Autenticación', status: 'pending' },
    { name: 'API Cliente', status: 'pending' },
    { name: 'API Categorías', status: 'pending' },
    { name: 'API Secciones', status: 'pending' },
    { name: 'Middleware', status: 'pending' },
  ]);
  
  // Verificar autenticación
  useEffect(() => {
    const updateCheck = (name: string, status: 'pending' | 'success' | 'error', message?: string, details?: any) => {
      setChecks(prev => 
        prev.map(check => 
          check.name === name ? { ...check, status, message, details } : check
        )
      );
    };
    
    // Verificar autenticación
    if (status === 'loading') {
      updateCheck('Autenticación', 'pending', 'Verificando sesión...');
    } else if (status === 'authenticated') {
      updateCheck('Autenticación', 'success', 'Sesión activa', session);
    } else {
      updateCheck('Autenticación', 'error', 'No hay sesión activa');
    }
  }, [status, session]);
  
  // Verificar APIs
  useEffect(() => {
    const checkAPI = async (name: string, endpoint: string) => {
      try {
        const updateCheck = (status: 'pending' | 'success' | 'error', message?: string, details?: any) => {
          setChecks(prev => 
            prev.map(check => 
              check.name === name ? { ...check, status, message, details } : check
            )
          );
        };
        
        updateCheck('pending', `Verificando ${endpoint}...`);
        
        const response = await fetch(endpoint);
        const data = await response.json();
        
        if (response.ok) {
          updateCheck('success', `${endpoint} responde correctamente`, data);
        } else {
          updateCheck('error', `Error en ${endpoint}: ${response.status} ${response.statusText}`, data);
        }
      } catch (error) {
        setChecks(prev => 
          prev.map(check => 
            check.name === name ? { 
              ...check, 
              status: 'error', 
              message: `Error al conectar con ${endpoint}: ${String(error)}` 
            } : check
          )
        );
      }
    };
    
    // Solo verificar APIs si estamos autenticados
    if (status === 'authenticated') {
      checkAPI('API Cliente', '/api/client');
      checkAPI('API Categorías', '/api/categories');
      checkAPI('API Secciones', '/api/sections?category_id=1');
    }
  }, [status]);
  
  // Verificar middleware
  useEffect(() => {
    const checkMiddleware = async () => {
      try {
        const updateCheck = (status: 'pending' | 'success' | 'error', message?: string, details?: any) => {
          setChecks(prev => 
            prev.map(check => 
              check.name === 'Middleware' ? { ...check, status, message, details } : check
            )
          );
        };
        
        updateCheck('pending', 'Verificando middleware...');
        
        // Intentar acceder a una ruta protegida con un fetch directo
        const response = await fetch('/api/auth/check-auth');
        const data = await response.json();
        
        if (response.ok) {
          updateCheck('success', 'Middleware funciona correctamente', data);
        } else {
          updateCheck('error', `Error en middleware: ${response.status} ${response.statusText}`, data);
        }
      } catch (error) {
        setChecks(prev => 
          prev.map(check => 
            check.name === 'Middleware' ? { 
              ...check, 
              status: 'error', 
              message: `Error al verificar middleware: ${String(error)}` 
            } : check
          )
        );
      }
    };
    
    checkMiddleware();
  }, []);
  
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'success': return 'bg-green-100 text-green-800 border-green-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto mt-10 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Diagnóstico del Sistema</h1>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Estado de verificaciones</h2>
        <div className="space-y-3">
          {checks.map((check) => (
            <div 
              key={check.name} 
              className={`p-4 border rounded-md ${getStatusColor(check.status)}`}
            >
              <div className="flex justify-between items-center">
                <h3 className="font-medium">{check.name}</h3>
                <span className="px-2 py-1 rounded-full text-xs">
                  {check.status === 'pending' ? 'Verificando...' : 
                   check.status === 'success' ? 'Correcto' : 'Error'}
                </span>
              </div>
              {check.message && (
                <p className="text-sm mt-1">{check.message}</p>
              )}
              {check.details && process.env.NODE_ENV === 'development' && (
                <details className="mt-2">
                  <summary className="text-xs cursor-pointer">Ver detalles</summary>
                  <pre className="mt-1 p-2 bg-gray-50 rounded text-xs overflow-auto max-h-40">
                    {JSON.stringify(check.details, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex space-x-4">
        <button
          onClick={() => window.location.href = '/dashboard-v2'}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
        >
          Ir al Dashboard
        </button>
        
        <button
          onClick={() => window.location.href = '/dashboard-v2'}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
        >
          Ver Dashboard
        </button>
        
        {status !== 'authenticated' && (
          <button
            onClick={() => signIn()}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Iniciar Sesión
          </button>
        )}
      </div>
      
      <div className="mt-8 text-sm text-gray-500">
        <p>Esta página realiza diagnósticos básicos de la aplicación para ayudar a identificar problemas.</p>
        <p>Recomendamos verificar también la consola del navegador para mensajes adicionales.</p>
      </div>
    </div>
  );
} 