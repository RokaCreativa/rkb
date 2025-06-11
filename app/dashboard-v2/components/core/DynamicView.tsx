/**
 * @file DynamicView.tsx
 * @description Componente "switcher" que decide qué vista principal renderizar (móvil o escritorio).
 * @architecture
 * Este componente es la solución al problema de renderizar diferentes layouts para móvil y escritorio
 * sin causar errores de hidratación de React/Next.js. También es el corazón del cumplimiento del
 * Mandamiento #5 (Mobile-First Supremacy).
 *
 * @workflow
 * 1.  **Montaje en Cliente:** Utiliza un estado `hasMounted` para asegurarse de que el código que
 *     depende del navegador (como `useIsMobile`) solo se ejecute en el cliente. Durante el renderizado
 *     del servidor, o antes de que el componente se monte en el cliente, muestra un loader.
 *     Esto garantiza que el HTML del servidor y el primer render del cliente coincidan.
 * 2.  **Detección de Dispositivo:** Una vez montado, el hook `useIsMobile` se activa y determina
 *     si el ancho de la pantalla corresponde a un dispositivo móvil.
 * 3.  **Renderizado Condicional:** Basado en el booleano `isMobile`, renderiza `MobileView` o `DashboardView`.
 *
 * @dependencies
 * - `useIsMobile`: El hook que contiene la lógica de media query.
 * - `MobileView`: La UI principal para la experiencia móvil.
 * - `DashboardView`: La UI principal para la experiencia de escritorio (la vista Master-Detail).
 * - `DashboardClient`: Este componente es cargado de forma asíncrona por `DashboardClient` con la
 *   opción `ssr: false`, que es CRÍTICA para que esta estrategia funcione.
 */
'use client';

import React from 'react';
import useIsMobile from '../../hooks/ui/useIsMobile';
import { MobileView } from '../../views/MobileView';
import DashboardView from './DashboardView';

const DynamicView = () => {
    const isMobile = useIsMobile();

    // Esta comprobación es para evitar errores de hidratación en Next.js.
    // El hook useIsMobile solo funciona del lado del cliente.
    const [hasMounted, setHasMounted] = React.useState(false);
    React.useEffect(() => {
        setHasMounted(true);
    }, []);

    if (!hasMounted) {
        // Renderiza un loader genérico que coincide en servidor y cliente
        // para evitar el mismatch de hidratación.
        return (
            <div className="p-4 bg-gray-50 min-h-screen flex items-center justify-center">
                <p className="text-gray-500">Cargando vista...</p>
            </div>
        );
    }

    return isMobile ? <MobileView /> : <DashboardView />;
};

export default DynamicView; 