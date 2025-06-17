/**
 * 🧭 MIGA DE PAN CONTEXTUAL: Cabecera del Dashboard
 *
 * 📍 UBICACIÓN: app/dashboard-v2/components/core/DashboardHeader.tsx
 *
 * 🎯 PORQUÉ EXISTE:
 * Proporciona un área consistente en la parte superior del dashboard para acciones globales
 * que afectan a toda la vista, como activar el "Modo Reordenar". Centraliza estos
 * controles en lugar de dispersarlos.
 *
 * 🔄 FLUJO DE DATOS:
 * 1. Lee `isReorderMode` y `toggleReorderMode` desde `useDashboardStore`.
 * 2. El usuario hace clic en el botón "Reordenar".
 * 3. Se llama a `toggleReorderMode`, actualizando el estado global.
 * 4. El `Button` y el texto cambian su apariencia gracias a la lectura reactiva del estado.
 */
'use client';

import React from 'react';
import { useDashboardStore } from '../../stores/dashboardStore';
import { Button } from '../ui/Button/Button';
import { ListOrdered, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const DashboardHeader = () => {
    const isReorderMode = useDashboardStore(state => state.isReorderMode);
    const toggleReorderMode = useDashboardStore(state => state.toggleReorderMode);

    return (
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
            <Button
                onClick={toggleReorderMode}
                variant={isReorderMode ? 'secondary' : 'outline'}
                size="sm"
                className="flex items-center space-x-2"
            >
                {isReorderMode ? (
                    <>
                        <X className="w-4 h-4" />
                        <span>Finalizar Orden</span>
                    </>
                ) : (
                    <>
                        <ListOrdered className="w-4 h-4" />
                        <span>Reordenar</span>
                    </>
                )}
            </Button>
        </div>
    );
}; 