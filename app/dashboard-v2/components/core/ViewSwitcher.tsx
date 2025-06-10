'use client';

import React from 'react';
import useIsMobile from '../../hooks/ui/useIsMobile';
import MobileView from '../../views/MobileView';
import DashboardView from './DashboardView';

const ViewSwitcher = () => {
    const isMobile = useIsMobile();

    // Esta comprobación es para evitar errores de hidratación en Next.js.
    // El hook solo funciona en el cliente.
    const [hasMounted, setHasMounted] = React.useState(false);
    React.useEffect(() => {
        setHasMounted(true);
    }, []);

    if (!hasMounted) {
        return null; // O un loader/spinner si se prefiere
    }

    return isMobile ? <MobileView /> : <DashboardView />;
};

export default ViewSwitcher;