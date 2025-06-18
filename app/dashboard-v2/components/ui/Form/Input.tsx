/**
 * 🧭 MIGA DE PAN CONTEXTUAL: Componente de Input Reutilizable
 *
 * 📍 UBICACIÓN: app/dashboard-v2/components/ui/Form/Input.tsx
 *
 * 🎯 PORQUÉ EXISTE:
 * Para proveer un componente de <input> estilizado y consistente a lo largo de toda la aplicación,
 * evitando la repetición de clases de Tailwind y asegurando una apariencia unificada.
 * Fue creado inicialmente para el modal de doble confirmación de borrado.
 *
 * 🔄 FLUJO DE DATOS:
 * Es un componente "tonto" que simplemente envuelve un <input> nativo.
 * Acepta todas las props de un input HTML estándar y las pasa directamente.
 *
 * 🔗 CONEXIONES DIRECTAS:
 * - Utiliza `cn` de `@/lib/utils` para combinar clases de Tailwind.
 * - Es consumido por `DeleteConfirmationModal.tsx`.
 */
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    as?: 'input' | 'textarea';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, as = 'input', ...props }, ref) => {

        const commonClasses =
            'flex w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

        if (as === 'textarea') {
            return (
                <textarea
                    className={cn(commonClasses, 'min-h-[80px]', className)}
                    ref={ref as React.Ref<HTMLTextAreaElement>}
                    {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
                />
            );
        }

        return (
            <input
                type={type}
                className={cn(commonClasses, 'h-10', className)}
                ref={ref}
                {...props}
            />
        );
    }
);
Input.displayName = 'Input';

export { Input }; 