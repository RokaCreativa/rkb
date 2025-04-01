"use client";

import { useSession } from 'next-auth/react';
import { DashboardProvider } from './components/DashboardProvider';
import './styles/index.css'; // Importamos el sistema de diseño

/**
 * @fileoverview Layout para la sección de dashboard de RokaMenu
 * @author RokaMenu Team
 * @version 1.0.1
 * @updated 2024-04-14
 */

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';

  return (
    <>
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
    </>
  );
} 