"use client";

import React from 'react';

/**
 * @interface FabProps
 * @description Propiedades para el componente Botón de Acción Flotante (FAB).
 * @property {() => void} onClick - La función a ejecutar cuando se hace clic en el botón.
 * @property {React.ReactNode} icon - El elemento de icono que se mostrará dentro del botón.
 * @property {string} [label] - Texto descriptivo para accesibilidad (aria-label).
 */
interface FabProps {
    onClick: () => void;
    icon: React.ReactNode;
    label?: string; // Para accesibilidad
}

/**
 * @component Fab
 * @description Un componente genérico de Botón de Acción Flotante (Floating Action Button).
 * Se posiciona de forma fija en la esquina inferior derecha de la pantalla.
 * Está diseñado para ser la acción principal y más común en una vista determinada.
 * @param {FabProps} props - Las propiedades del componente.
 * @returns {React.ReactElement}
 */
const Fab: React.FC<FabProps> = ({ onClick, icon, label }) => {
    return (
        <button
            onClick={onClick}
            aria-label={label || 'Add new item'}
            className="fixed bottom-6 right-6 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-lg flex items-center justify-center z-20 transition-duration-300 ease-in-out hover:scale-110"
        >
            {icon}
        </button>
    );
};

export default Fab; 