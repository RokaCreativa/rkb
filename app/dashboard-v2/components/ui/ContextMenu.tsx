/**
 * 🧭 MIGA DE PAN CONTEXTUAL: ContextMenu - Componente TONTO de Menú Contextual
 *
 * 📍 UBICACIÓN: app/dashboard-v2/components/ui/ContextMenu.tsx
 *
 * 🎯 PORQUÉ EXISTE:
 * Componente de presentación PURA que renderiza menús contextuales con tres puntos.
 * Cumple estrictamente el Mandamiento #7 de separación de lógica y presentación.
 * Maneja solo estado interno de UI (abrir/cerrar), no lógica de negocio.
 *
 * 🔄 FLUJO DE DATOS:
 * 1. Recibe acciones como props (callbacks puros)
 * 2. Maneja estado interno de visibilidad del menú
 * 3. Emite eventos a través de callbacks onClick
 * 4. Se cierra automáticamente al hacer clic fuera
 *
 * 🔗 CONEXIONES DIRECTAS:
 * - USADO EN: SectionListView.tsx, CategoryList.tsx
 * - PATRÓN: Menú desplegable con acciones contextuales
 * - EVENTOS: onClick para cada acción, auto-cierre
 *
 * 🚨 PROBLEMAS RESUELTOS:
 * - ANTES: Componentes duplicados para menús contextuales
 * - SOLUCIÓN: Un solo componente reutilizable para todos los menús
 * - FECHA: 2025-01-25 - Limpieza de componentes obsoletos
 *
 * 📖 MANDAMIENTOS RELACIONADOS:
 * - Mandamiento #7: Componente TONTO - solo presentación
 * - Sin lógica de negocio, solo estado de UI local
 * - Responsabilidad única: mostrar menú contextual
 *
 * @version 2.0.0 - Limpieza y documentación actualizada
 * @updated 2025-01-25
 */

"use client";

import React, { useState, useRef, useEffect } from 'react';
import { EllipsisVerticalIcon } from '@heroicons/react/24/solid';

/**
 * Estructura de una acción individual dentro del menú contextual
 * Define cómo se comporta cada opción del menú
 */
interface Action {
    label: string;
    onClick: () => void;
    isDestructive?: boolean; // Para mostrar acciones peligrosas en rojo
}

/**
 * Props para el componente ContextMenu - solo lo esencial
 * Eliminadas props innecesarias que violaban la separación de responsabilidades
 */
interface ContextMenuProps {
    actions: Action[];
}
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