/**
 * 🧭 MIGA DE PAN CONTEXTUAL: Punto de Entrada Principal del Dashboard
 *
 * 📍 UBICACIÓN: components/core/DashboardClient.tsx → Componente Principal
 *
 * 🎯 PORQUÉ EXISTE:
 * Actúa como "Shell" o "Layout" principal del dashboard. Su responsabilidad es orquestar
 * la autenticación, inicialización de datos y renderizado de la estructura base de la UI.
 * Es el único punto de entrada que garantiza que el usuario esté autenticado y los datos
 * estén cargados antes de mostrar cualquier interfaz.
 *
 * 🔄 FLUJO DE DATOS:
 * 1. NextAuth → useSession() → verificación autenticación
 * 2. session.user.client_id → initializeDashboard() en store
 * 3. dashboardStore → carga completa de datos (cliente, categorías, etc.)
 * 4. initialDataLoaded: true → renderiza TopNavbar + DynamicView
 * 5. DynamicView → ResponsiveViewSwitcher → MobileView | DashboardView
 *
 * 🔗 CONEXIONES DIRECTAS:
 * - ENTRADA: app/dashboard/page.tsx → renderiza ESTE componente
 * - SALIDA: TopNavbar (línea 47) + DynamicView (línea 48)
 * - STORE: useDashboardStore.initializeDashboard() → línea 42
 * - AUTH: useSession() → NextAuth → middleware.ts
 *
 * 🚨 PROBLEMA RESUELTO (Bitácora #36):
 * - Antes: Conflictos de hidratación entre SSR y CSR en vistas móvil/desktop
 * - Error: React hydration mismatch por diferencias de viewport
 * - Solución: Dynamic import con ssr: false para ResponsiveViewSwitcher
 * - Fecha: 2025-01-10 - Implementación sistema modales unificado
 *
 * 🎯 CASOS DE USO REALES:
 * - Usuario login → bakery@bakery.com → client_id: 1 → dashboard completo
 * - Usuario sin sesión → redirect /auth/signin automático
 * - Datos no cargados → Loader hasta initialDataLoaded: true
 * - Mobile/Desktop → DynamicView decide vista apropiada
 *
 * ⚠️ REGLAS DE NEGOCIO CRÍTICAS:
 * - NUNCA renderizar UI sin autenticación verificada
 * - NUNCA mostrar dashboard sin initialDataLoaded: true
 * - Dynamic import OBLIGATORIO para ResponsiveViewSwitcher (evita hydration)
 * - session.user.client_id REQUERIDO para initializeDashboard()
 *
 * 🔗 DEPENDENCIAS CRÍTICAS:
 * - REQUIERE: NextAuth configurado + middleware.ts activo
 * - REQUIERE: dashboardStore.initializeDashboard() funcional
 * - REQUIERE: TopNavbar + ResponsiveViewSwitcher componentes
 * - ROMPE SI: session.user.client_id undefined o null
 * - ROMPE SI: API /api/client no responde correctamente
 *
 * 📊 PERFORMANCE:
 * - Dynamic import → code splitting automático para vista responsive
 * - ssr: false → evita cálculos innecesarios en servidor
 * - useEffect dependency → solo re-ejecuta si session o initialDataLoaded cambian
 * - Loader optimizado → feedback visual durante carga de datos
 *
 * 📖 MANDAMIENTOS RELACIONADOS:
 * - Mandamiento #7 (Separación): UI "tonta", lógica en store y hooks
 * - Mandamiento #5 (Mobile-First): ResponsiveViewSwitcher maneja adaptabilidad
 * - Mandamiento #1 (Contexto): Consulta session antes de inicializar
 * - Mandamiento #6 (Consistencia): Patrón Shell uniforme para toda la app
 */
'use client';

import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useDashboardStore } from '@/app/dashboard/stores/dashboardStore';
import dynamic from 'next/dynamic';
import { TopNavbar } from './TopNavbar';
import { Loader } from '../ui/Loader';
import { Toaster } from 'react-hot-toast';

const DynamicView = dynamic(
    () => import('@/app/dashboard/components/core/ResponsiveViewSwitcher'),
    {
        ssr: false,
        loading: () => (
            <div className="flex-1 flex items-center justify-center h-full">
                <Loader message="Preparando interfaz..." />
            </div>
        ),
    }
);

export const DashboardClient: React.FC = () => {
    const { data: session, status } = useSession({
        required: true,
        onUnauthenticated() {
            redirect('/auth/signin');
        },
    });

    const { initializeDashboard, initialDataLoaded } = useDashboardStore();

    useEffect(() => {
        if (session?.user?.client_id && !initialDataLoaded) {
            initializeDashboard(session.user.client_id);
        }
    }, [session, initialDataLoaded, initializeDashboard]);

    if (status === 'loading' || !initialDataLoaded) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-100">
                <Loader message="Cargando datos del cliente..." />
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-100">
            <div className="flex-1 flex flex-col overflow-hidden">
                <TopNavbar />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
                    <DynamicView />
                </main>
            </div>
            <Toaster position="bottom-right" />
        </div>
    );
};

export default DashboardClient; 