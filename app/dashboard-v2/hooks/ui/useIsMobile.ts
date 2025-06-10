'use client';

import { useState, useEffect } from 'react';

const useIsMobile = (breakpoint = 768): boolean => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // La comprobación inicial debe ocurrir solo en el cliente,
        // donde el objeto `window` está disponible.
        const checkDevice = () => {
            setIsMobile(window.innerWidth < breakpoint);
        };

        // Comprobar al montar el componente
        checkDevice();

        // Añadir un listener para cambios de tamaño de la ventana
        window.addEventListener('resize', checkDevice);

        // Limpiar el listener al desmontar el componente
        return () => {
            window.removeEventListener('resize', checkDevice);
        };
    }, [breakpoint]);

    return isMobile;
};

export default useIsMobile; 