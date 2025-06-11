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

import React, { useEffect } from 'react';
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

const DashboardClient = () => {
    const { data: session, status } = useSession({
        required: true,
        onUnauthenticated() {
            redirect('/auth/signin');
        },
    });

    const initializeDashboard = useDashboardStore(
        (s: DashboardState & DashboardActions) => s.initializeDashboard
    );
    const initialDataLoaded = useDashboardStore(
        (s: DashboardState) => s.initialDataLoaded
    );

    useEffect(() => {
        // Asegurarse de que tengamos el client_id y que los datos no se hayan cargado ya.
        if (session?.user?.client_id && !initialDataLoaded) {
            initializeDashboard(session.user.client_id);
        }
    }, [session, initialDataLoaded, initializeDashboard]);

    // Muestra un loader mientras se valida la sesión o se cargan los datos iniciales.
    if (status === 'loading' || !initialDataLoaded) {
        return (
            <div className="p-4 bg-gray-50 min-h-screen flex items-center justify-center">
                <Loader message="Cargando datos del menú..." />
            </div>
        );
    }

    return (
        <div className="flex h-screen flex-col">
            {/* La barra de navegación es común para ambas vistas y se renderiza aquí. */}
            <TopNavbar />
            <main
                className="flex-1 overflow-y-auto bg-gray-100 p-4"
                style={{ height: 'calc(100vh - 64px)' }}
            >
                {/* El DynamicView decide qué vista mostrar (móvil o escritorio) solo en el cliente. */}
                <DynamicView />
            </main>
        </div>
    );
};

export default DashboardClient; 