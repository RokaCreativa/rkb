"use client";

import React, { useState, useRef, useEffect } from 'react';
import { EllipsisVerticalIcon } from '@heroicons/react/24/solid';

/**
 * @interface Action
 * @description Define la estructura de una acción individual dentro del menú contextual.
 * @property {string} label - El texto que se mostrará para la acción.
 * @property {() => void} onClick - La función a ejecutar cuando se selecciona la acción.
 * @property {boolean} [isDestructive] - Si es true, el texto se mostrará en color rojo para indicar una acción destructiva (ej: Eliminar).
 */
interface Action {
    label: string;
    onClick: () => void;
    isDestructive?: boolean;
}

/**
 * @interface ContextMenuProps
 * @description Propiedades para el componente ContextMenu.
 * @property {Action[]} actions - Un array de objetos de acción que se mostrarán en el menú.
 */
interface ContextMenuProps {
    actions: Action[];
}

/**
 * @component ContextMenu
 * @description Un menú contextual que se activa con un botón de tres puntos.
 * Muestra una lista de acciones y se gestiona a sí mismo (abrir/cerrar).
 * El menú se cierra automáticamente si se hace clic fuera de él.
 * @param {ContextMenuProps} props - Las propiedades del componente.
 * @returns {React.ReactElement}
 */
const ContextMenu: React.FC<ContextMenuProps> = ({ actions }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const toggleMenu = (e: React.MouseEvent) => {
        // Detenemos la propagación para evitar que un clic en el menú
        // active también el onClick del elemento padre (ej: el <li> que navega).
        e.stopPropagation();
        setIsOpen(!isOpen);
    };

    // Este efecto es el responsable de cerrar el menú cuando el usuario
    // hace clic en cualquier otra parte de la página.
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            <button onClick={toggleMenu} className="p-2 rounded-full hover:bg-gray-200">
                <EllipsisVerticalIcon className="h-5 w-5 text-gray-600" />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-30 ring-1 ring-black ring-opacity-5">
                    <ul className="py-1">
                        {actions.map((action, index) => (
                            <li key={index}>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation(); // Previene que el LI capture el click
                                        action.onClick();
                                        setIsOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-2 text-sm ${action.isDestructive
                                        ? 'text-red-600 hover:bg-red-50'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    {action.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ContextMenu; 