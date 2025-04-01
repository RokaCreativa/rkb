/**
 * @fileoverview Layout para la sección de dashboard de RokaMenu
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-03-30
 */

import { ReactNode } from 'react';
import { DashboardProvider } from './components/DashboardProvider';
import AuthDebugLayout from './AuthDebugLayout';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardProvider>
        <AuthDebugLayout>
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
        </AuthDebugLayout>
      </DashboardProvider>
    </div>
  );
} 