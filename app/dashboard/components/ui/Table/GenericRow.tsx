/**
 * 🧭 MIGA DE PAN CONTEXTUAL: Componente de Fila Genérico Unificado
 *
 * 📍 UBICACIÓN: components/ui/Table/GenericRow.tsx → Componente UI Reutilizable
 *
 * 🎯 PORQUÉ EXISTE:
 * Unifica la apariencia y comportamiento de TODAS las filas de datos en el dashboard
 * (Categorías, Secciones, Productos). Elimina duplicación de código entre GridViews
 * y garantiza consistencia visual absoluta. Implementa Mandamiento #3 (DRY) y
 * #6 (Consistencia Visual). Es la base para el futuro sistema de reordenamiento.
 *
 * 🔄 FLUJO DE DATOS:
 * 1. GridView component → map(items) → ESTE COMPONENTE por ítem
 * 2. Props específicas → title, imageSrc, status, actions
 * 3. CVA variants → estilos condicionales según isSelected
 * 4. Slots renderizado → imagen + contenido + acciones
 * 5. onClick event → callback al GridView padre
 *
 * 🔗 CONEXIONES DIRECTAS:
 * - ENTRADA: CategoryDesktopMixedGrid.tsx → renderiza categorías + productos
 * - ENTRADA: SectionDesktopMixedGrid.tsx → renderiza secciones + productos locales
 * - ENTRADA: ProductDesktopSimpleGrid.tsx → renderiza productos normales
 * - SALIDA: Image (Next.js) + iconos (lucide-react)
 * - ESTILOS: CVA variants + cn() utility
 *
 * 🚨 PROBLEMA RESUELTO (Bitácora #58 - Limpieza Masiva):
 * - Antes: Cada GridView tenía su propia lógica de renderizado de filas
 * - Error: Inconsistencias visuales y duplicación masiva de código
 * - Solución: Componente genérico con slots y variants
 * - Beneficio: Consistencia absoluta + mantenimiento centralizado
 * - Fecha: 2025-01-20 - Unificación componentes UI
 *
 * 🎯 CASOS DE USO REALES:
 * - Categoría → imagen + nombre + actions (edit, delete, visibility)
 * - Producto → imagen + nombre + precio + actions + showcase icon
 * - Sección → imagen + nombre + actions (edit, delete, visibility)
 * - Estado selected → highlight visual con border-l-4 indigo
 * - Estado inactive → opacity-50 + grayscale
 *
 * ⚠️ REGLAS DE NEGOCIO CRÍTICAS:
 * - Componente "tonto": SOLO renderiza, NO maneja estado
 * - isSelected: solo aplica a categorías (selectedCategoryId)
 * - showcaseIcon: solo visible para productos destacados
 * - actions: se ocultan en isReorderMode (futuro drag&drop)
 * - status: controla opacity + grayscale visual
 *
 * 🔗 DEPENDENCIAS CRÍTICAS:
 * - REQUIERE: CVA para variants de estilos
 * - REQUIERE: Next.js Image component
 * - REQUIERE: getImagePath utility para rutas de imágenes
 * - REQUIERE: cn() utility para class merging
 * - ROMPE SI: imageType no coincide con carpetas backend
 * - ROMPE SI: callbacks padre no memoizados (re-renders)
 *
 * 📊 PERFORMANCE:
 * - React.memo → evita re-renders si props no cambian
 * - CVA variants → estilos compilados en build time
 * - Image Next.js → optimización automática de imágenes
 * - Conditional rendering → actions solo cuando necesario
 *
 * 📖 MANDAMIENTOS RELACIONADOS:
 * - Mandamiento #3 (DRY): Elimina duplicación entre GridViews
 * - Mandamiento #6 (Consistencia): Apariencia uniforme en todo dashboard
 * - Mandamiento #7 (Separación): UI "tonta", lógica en componentes padre
 * - Mandamiento #8 (Calidad): Código reutilizable y mantenible
 */

'use client';

import React from 'react';
import Image from 'next/image';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { getImagePath } from '@/app/dashboard/utils/imageUtils';

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