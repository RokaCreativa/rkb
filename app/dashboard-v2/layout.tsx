"use client";

import '../globals.css';
import './globals.css'; // Importar los estilos específicos del dashboard-v2
import './styles/index.css'; // Importar el archivo principal de estilos que incluye todos los demás
import './styles/theme.css'; // Importar el archivo de tema con variables de colores
import './styles/animations.css'; // Importar el archivo de animaciones
import './styles/grids.css'; // Importar estilos específicos para los grids
import { Inter } from 'next/font/google';
import AuthDebugLayout from './AuthDebugLayout';
import { useSession } from 'next-auth/react';

// Importar sistema de internacionalización
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n/i18n';

/**
 * @fileoverview Layout para la sección de dashboard de RokaMenu
 * @author RokaMenu Team
 * @version 1.0.2
 * @updated 2024-08-25
 */

const inter = Inter({ subsets: ['latin'] });

/**
 * Layout del Dashboard
 * 
 * Este componente envuelve todas las páginas del dashboard y proporciona:
 * - Estilos globales
 * - Fuente Inter de Google
 * - Autenticación
 * - Soporte para internacionalización (i18n)
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={`dashboard-v2 min-h-screen bg-gray-100 ${inter.className}`}>
      {/* Proveedor de i18n para habilitar traducciones en toda la aplicación */}
      <I18nextProvider i18n={i18n}>
        <AuthDebugLayout>
          {children}
        </AuthDebugLayout>
      </I18nextProvider>
    </div>
  );
} 