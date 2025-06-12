/**
 * @file DashboardClient.tsx
 * @description Componente cliente principal que actúa como punto de entrada para el dashboard.
 * @architecture
 * Este componente es el "cerebro" del lado del cliente para el dashboard. Su responsabilidad principal es
 * obtener la sesión del usuario y, a partir de ella, iniciar la carga de datos del menú a través del
 * store de Zustand. También renderiza los componentes troncales de la UI, como la barra de navegación
 * y el switcher de vistas (`DynamicView`).
 *
 * Sigue el patrón "Shell" o "Layout", donde este componente provee la estructura y los datos,
 * y los componentes hijos se encargan de la presentación.
 *
 * @workflow
 * 1.  **Autenticación:** Utiliza `useSession` de NextAuth para asegurar que el usuario esté autenticado.
 *     Si no lo está, lo redirige a la página de login.
 * 2.  **Carga de Datos Inicial:** Dentro de un `useEffect`, una vez que se confirma la sesión y se
 *     obtiene el `client_id` del usuario, llama a la acción `initializeDashboard` del store de Zustand.
 *     Esta acción se encarga de hacer el fetching de todos los datos necesarios (cliente, categorías, etc.)
 *     y de actualizar el estado global.
 * 3.  **Carga Dinámica de Vista:** Renderiza el componente `TopNavbar` y, crucialmente, carga
 *     `DynamicView` de forma asíncrona (`next/dynamic`) con `ssr: false`. Esta técnica es la
 *     piedra angular para soportar las vistas móvil y de escritorio sin conflictos de
 *     hidratación, ya que `DynamicView` (y sus hijos) solo se renderizarán en el navegador.
 *
 * @dependencies
 * - `useDashboardStore`: El hook para acceder al store de Zustand, que es la única fuente de verdad.
 * - `TopNavbar`: Componente de navegación superior.
 * - `DynamicView`: El componente cargado dinámicamente que decide si mostrar `MobileView` o `DashboardView`.
 */
'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import {
    useDashboardStore,
    DashboardState,
    DashboardActions,
} from '@/app/dashboard-v2/stores/dashboardStore';
import dynamic from 'next/dynamic';
import { TopNavbar } from './TopNavbar';
import { Loader } from '../ui/Loader';
import { useMediaQuery } from 'react-responsive';
import { DashboardView } from './DashboardView';
import { MobileView } from '../../views/MobileView';
import AuthDebugLayout from '../../AuthDebugLayout';
import { Toaster } from 'react-hot-toast';

// Carga dinámica del componente que cambiará entre vista móvil y de escritorio.
// SSR se deshabilita para evitar errores de hidratación, ya que el componente
// depende de las dimensiones de la ventana del navegador.
const DynamicView = dynamic(
    () => import('@/app/dashboard-v2/components/core/DynamicView'),
    {
        ssr: false,
        loading: () => (
            <div className="flex-1 p-4 bg-gray-50 flex items-center justify-center">
                <Loader message="Preparando interfaz..." />
            </div>
        ),
    }
);

interface DashboardClientProps {
}

export const DashboardClient: React.FC<DashboardClientProps> = () => {
    const { data: session, status } = useSession({
        required: true,
        onUnauthenticated() {
            redirect('/auth/signin');
        },
    });

    const { initializeDashboard, initialDataLoaded, isClientLoading } = useDashboardStore();

    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        if (session?.user?.client_id && !initialDataLoaded) {
            initializeDashboard(session.user.client_id);
        }
    }, [session, initialDataLoaded, initializeDashboard]);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const isDesktop = useMediaQuery({ query: '(min-width: 1024px)' });

    const renderContent = () => {
        if (isClientLoading || !initialDataLoaded) {
            return <div className="flex justify-center items-center h-screen">Cargando...</div>;
        }

        if (isDesktop) {
            return <DashboardView />;
        } else {
            return <MobileView />;
        }
    };

    return (
        <AuthDebugLayout>
            <div className="flex h-screen bg-gray-100">
                <div className="flex-1 flex flex-col overflow-hidden">
                    <TopNavbar />
                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
                        {isMounted ? renderContent() : null}
                    </main>
                </div>
                <Toaster position="bottom-right" />
            </div>
        </AuthDebugLayout>
    );
};

export default DashboardClient; 