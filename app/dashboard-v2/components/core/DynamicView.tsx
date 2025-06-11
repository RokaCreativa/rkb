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