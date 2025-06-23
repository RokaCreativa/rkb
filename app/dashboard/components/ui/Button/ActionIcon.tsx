/**
 * 🧭 MIGA DE PAN CONTEXTUAL: Botón de Acción Estandarizado
 *
 * 📍 UBICACIÓN: /app/dashboard-v2/components/ui/Button/ActionIcon.tsx
 *
 * 🎯 PORQUÉ EXISTE:
 * Este componente nace para resolver la inconsistencia en los botones de acción a lo largo de
 * toda la aplicación. Antes, cada GridView definía sus propios botones, resultando en
 * diferentes tamaños, paddings, y a veces hasta diferentes librerías de iconos.
 * ActionIcon centraliza el estilo y comportamiento de TODOS los botones que solo
 * contienen un icono, garantizando 100% de consistencia visual (Mandamiento #8).
 *
 * 🔄 FLUJO DE DATOS:
 * 1. Un componente padre (ej. `ProductGridView`) necesita renderizar un botón de editar.
 * 2. Renderiza `<ActionIcon Icon={Pencil} ... />`.
 * 3. Este componente renderiza el componente `Button` base con las props pre-configuradas
 *    (variant: 'ghost', size: 'sm', etc.) y pasa el componente `Icon` dentro.
 *
 * 🔗 CONEXIONES DIRECTAS:
 * - PADRE: `GenericRow` o cualquier `GridView` que lo use.
 * - HIJO: Utiliza el componente `Button` base.
 * - RECIBE: Un componente de icono (ej. de `lucide-react`).
 */
'use client';

import React from 'react';
import { Button, ButtonProps } from './Button';
import { cn } from '@/lib/utils';

interface ActionIconProps extends Omit<ButtonProps, 'children'> {
    Icon: React.ElementType;
    className?: string;
    iconClassName?: string;
}

export const ActionIcon = React.forwardRef<HTMLButtonElement, ActionIconProps>(
    ({ Icon, className, iconClassName, ...props }, ref) => {
        return (
            <Button
                ref={ref}
                variant="ghost"
                size="sm"
                className={cn('p-1 h-auto', className)}
                {...props}
            >
                <Icon className={cn('w-5 h-5', iconClassName)} />
            </Button>
        );
    }
);

ActionIcon.displayName = 'ActionIcon'; 