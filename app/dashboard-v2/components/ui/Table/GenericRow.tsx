/**
 * 🧭 MIGA DE PAN CONTEXTUAL: Componente de Fila Genérico para Tablas
 *
 * 📍 UBICACIÓN: /app/dashboard-v2/components/ui/Table/GenericRow.tsx
 *
 * 🎯 PORQUÉ EXISTE:
 * Este componente nace de la necesidad de unificar la apariencia y comportamiento de todas las
 * filas de datos en el dashboard (Categorías, Secciones, Productos). Antes de su creación,
 * cada GridView (`CategoryGridView`, `SectionGridView`, etc.) implementaba su propia lógica de
 * renderizado de filas, llevando a inconsistencias visuales y duplicación de código.
 * GenericRow centraliza el estilo y la estructura, garantizando consistencia visual y
 * cumpliendo con el Mandamiento #3 (No Reinventar la Rueda) y #8 (Consistencia Visual).
 *
 * 🔄 FLUJO DE DATOS:
 * 1. Un componente `...GridView` (ej. `CategoryGridView`) mapea su array de datos.
 * 2. En cada iteración, renderiza `<GenericRow {...props} />`, pasando los datos específicos de ese ítem.
 * 3. `GenericRow` recibe los datos y los renderiza en los slots predefinidos (imagen, título, acciones, etc.).
 * 4. Utiliza `cva` para aplicar estilos condicionales (ej. si `isSelected` es true).
 *
 * 🔗 CONEXIONES DIRECTAS:
 * - Es consumido por: `CategoryGridView.tsx`, `SectionGridView.tsx`, `ProductGridView.tsx`.
 * - Utiliza: `cva` (class-variance-authority) para gestionar variantes de estilo.
 * - Renderiza: Componentes de UI como `Button`, `Image` de Next.js, e iconos de `lucide-react`.
 *
 * ⚠️ REGLAS DE NEGOCIO:
 * - Debe ser "tonto": No contiene lógica de estado, solo recibe props y renderiza.
 * - La estructura de slots debe ser flexible para acomodar las diferencias sutiles
 *   entre tipos de datos (ej. un producto tiene 'precio', una categoría no).
 *
 * 📊 PERFORMANCE:
 * - Está envuelto en `React.memo` para evitar re-renders innecesarios si sus props no cambian.
 * - Los callbacks pasados como props (ej. `onClick`, `onEdit`) deben estar memorizados
 *   en el componente padre (`useCallback`) para que `React.memo` funcione eficazmente.
 */

'use client';

import React from 'react';
import Image from 'next/image';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { getImagePath } from '@/app/dashboard-v2/utils/imageUtils';

// --- Definición de Estilos con CVA ---

const rowVariants = cva(
    'flex items-center p-2 rounded-md transition-all duration-150 ease-in-out cursor-pointer group',
    {
        variants: {
            variant: {
                default: 'bg-white hover:bg-gray-50',
                selected: 'bg-indigo-50 border-indigo-300 hover:bg-indigo-100 border-l-4',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

// --- Tipos y Props del Componente ---

interface GenericRowProps {
    id: number;
    isSelected: boolean;
    isReorderMode?: boolean;
    imageSrc?: string | null;
    imageAlt?: string;
    imageType: 'categories' | 'sections' | 'products';
    title?: string | null;
    subtitle?: string;
    status?: boolean | number;
    actions?: React.ReactNode;
    onClick?: () => void;
    showcaseIcon?: React.ReactNode;
}

// --- Implementación del Componente ---

export const GenericRow: React.FC<GenericRowProps> = ({
    id,
    isSelected,
    isReorderMode = false,
    imageSrc,
    imageAlt,
    imageType,
    title,
    subtitle,
    status,
    actions,
    onClick,
    showcaseIcon,
}) => {
    const variant = isSelected ? 'selected' : 'default';
    const rowClasses = cn(
        rowVariants({ variant }),
        { 'cursor-pointer group': !isReorderMode, 'cursor-default': isReorderMode },
        { 'opacity-50 grayscale': !status },
    );

    return (
        <div className={rowClasses} onClick={onClick}>
            {/* Slot para el icono de showcase (estrella), se oculta en modo reordenar */}
            {showcaseIcon && !isReorderMode && <div className="mr-3 flex-shrink-0">{showcaseIcon}</div>}

            {/* Contenedor de Imagen */}
            <div className="flex-shrink-0">
                <Image
                    src={getImagePath(imageSrc, imageType)}
                    alt={imageAlt || ''}
                    width={40}
                    height={40}
                    className="rounded-md object-cover"
                />
            </div>

            {/* Contenedor de Contenido Principal */}
            <div className="flex-grow flex items-center ml-4">
                <div className="flex flex-col flex-grow">
                    <span className="font-medium text-sm text-gray-800">{title}</span>
                    {subtitle && <span className="text-xs text-gray-500">{subtitle}</span>}
                </div>
            </div>

            {/* Contenedor de Acciones (se oculta en modo reordenar) */}
            {!isReorderMode &&
                <div className="flex items-center space-x-1 ml-4 flex-shrink-0">
                    {actions}
                </div>
            }
        </div>
    );
};

GenericRow.displayName = 'GenericRow'; 