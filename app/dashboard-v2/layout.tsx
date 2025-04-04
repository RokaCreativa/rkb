"use client";

import '../globals.css';
import './globals.css'; // Importar los estilos específicos del dashboard-v2
import './styles/theme.css'; // Importar el archivo de tema con variables de colores
import './styles/animations.css'; // Importar el archivo de animaciones
import './styles/grids.css'; // Importar estilos específicos para los grids
import { Inter } from 'next/font/google';
import AuthDebugLayout from './AuthDebugLayout';
import { useSession } from 'next-auth/react';

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
  return (
    <div className={`min-h-screen bg-gray-100 ${inter.className}`}>
      <AuthDebugLayout>
        {children}
      </AuthDebugLayout>
    </div>
  );
} 