"use client";

import '../globals.css';
import './styles/animations.css'; // Importar el archivo de animaciones
import { Inter } from 'next/font/google';
import AuthDebugLayout from './AuthDebugLayout';
import { useSession } from 'next-auth/react';
import { DashboardProvider } from './components/DashboardProvider';
import './styles/index.css'; // Importamos el sistema de diseño

/**
 * @fileoverview Layout para la sección de dashboard de RokaMenu
 * @author RokaMenu Team
 * @version 1.0.1
 * @updated 2024-04-14
 */

const inter = Inter({ subsets: ['latin'] });

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';

  return (
    <div className={`min-h-screen bg-gray-100 ${inter.className}`}>
      <AuthDebugLayout>
        {isAuthenticated ? (
          <DashboardProvider>
            <div className="min-h-screen bg-gray-50 dashboard-v2 base-body-styles">
              <main className="flex-1 p-0">
                {children}
              </main>
            </div>
          </DashboardProvider>
        ) : (
          <div className="min-h-screen bg-gray-50 dashboard-v2 base-body-styles">
            <main className="flex-1 p-0">
              {children}
            </main>
          </div>
        )}
      </AuthDebugLayout>
    </div>
  );
} 