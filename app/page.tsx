'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  
  return (
    <main className="flex flex-col min-h-screen items-center justify-center bg-gray-900 text-white p-4">
      <h1 className="text-4xl font-bold mb-8 text-center">¡Bienvenido a RokaMenu!</h1>
      
      <div className="flex flex-col gap-4 w-full max-w-md">
        <Link 
          href="/dashboard"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg text-center transition-colors"
        >
          Dashboard Original
        </Link>
        
        <Link 
          href="/dashboard-v2"
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg text-center transition-colors"
        >
          Dashboard V2
        </Link>
        
        <Link 
          href="/system-check"
          className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg text-center transition-colors"
        >
          System Check
        </Link>
        
        <Link 
          href="/auth/signin"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-center transition-colors"
        >
          Iniciar Sesión
        </Link>
      </div>
    </main>
  );
}
