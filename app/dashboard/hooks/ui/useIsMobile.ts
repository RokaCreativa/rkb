'use client';

import { useState, useEffect } from 'react';

const useIsMobile = (breakpoint = 768): boolean => {
    // Inicializa el estado para que coincida con el del servidor (donde no hay 'window').
    // Usamos una función para que `window.innerWidth` solo se llame en el cliente.
    const [isMobile, setIsMobile] = useState(
        () => typeof window !== 'undefined' && window.innerWidth < breakpoint
    );

    useEffect(() => {
        // Esta función solo se ejecutará en el cliente.
        const checkDevice = () => {
            setIsMobile(window.innerWidth < breakpoint);
        };

        // Añadir el listener para cambios de tamaño de la ventana
        window.addEventListener('resize', checkDevice);

        // Limpiar el listener al desmontar el componente
        return () => {
            window.removeEventListener('resize', checkDevice);
        };
    }, [breakpoint]);

    return isMobile;
};

export default useIsMobile; 