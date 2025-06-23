/**
 * 🧭 MIGA DE PAN CONTEXTUAL: Switcher Responsivo Anti-Hidratación
 *
 * 📍 UBICACIÓN: components/core/ResponsiveViewSwitcher.tsx → DynamicView Component
 *
 * 🎯 PORQUÉ EXISTE:
 * Resuelve el problema crítico de renderizar diferentes layouts (móvil/desktop) sin causar
 * errores de hidratación de React/Next.js. Es la implementación técnica del Mandamiento #5
 * (Mobile-First) que garantiza experiencias optimizadas para cada dispositivo.
 *
 * 🔄 FLUJO DE DATOS:
 * 1. DashboardClient → dynamic import con ssr: false → ESTE COMPONENTE
 * 2. useState(hasMounted: false) → useEffect → setHasMounted(true)
 * 3. useIsMobile() → media query → boolean isMobile
 * 4. Conditional render → MobileDrillDownView | DesktopMasterDetailView
 * 5. Componente final → consume dashboardStore según su patrón
 *
 * 🔗 CONEXIONES DIRECTAS:
 * - ENTRADA: DashboardClient.tsx → dynamic import (línea 15-23)
 * - SALIDA: MobileDrillDownView.tsx | DesktopMasterDetailView.tsx
 * - HOOK: useIsMobile() → hooks/ui/useIsMobile.ts
 * - STORE: Ambas vistas consumen useDashboardStore independientemente
 *
 * 🚨 PROBLEMA RESUELTO (Bitácora #36):
 * - Antes: React Hydration Error por diferencias SSR vs CSR en viewport
 * - Error: "Text content did not match" entre servidor y cliente
 * - Solución: hasMounted pattern + ssr: false en dynamic import
 * - Técnica: Renderizar loader genérico hasta que useEffect se ejecute
 * - Fecha: 2025-01-10 - Sistema modales unificado
 *
 * 🎯 CASOS DE USO REALES:
 * - Desktop (>768px) → DesktopMasterDetailView → 3 columnas grid
 * - Mobile (<768px) → MobileDrillDownView → navegación drill-down
 * - Tablet → depende de orientación y configuración useIsMobile
 * - Resize dinámico → re-evalúa isMobile automáticamente
 *
 * ⚠️ REGLAS DE NEGOCIO CRÍTICAS:
 * - NUNCA usar useIsMobile en SSR (solo después de hasMounted: true)
 * - NUNCA renderizar vista específica sin verificar hasMounted
 * - Loader genérico DEBE ser idéntico en servidor y cliente
 * - Dynamic import con ssr: false es OBLIGATORIO en parent
 *
 * 🔗 DEPENDENCIAS CRÍTICAS:
 * - REQUIERE: DashboardClient con dynamic import ssr: false
 * - REQUIERE: useIsMobile hook funcional con media queries
 * - REQUIERE: MobileDrillDownView + DesktopMasterDetailView existentes
 * - ROMPE SI: useIsMobile se ejecuta en servidor
 * - ROMPE SI: hasMounted pattern se omite
 *
 * 📊 PERFORMANCE:
 * - Code splitting → cada vista se carga solo cuando es necesaria
 * - Media query → re-evaluación automática en resize
 * - hasMounted → evita re-renders innecesarios en hidratación
 * - Loader mínimo → feedback visual sin overhead
 *
 * 📖 MANDAMIENTOS RELACIONADOS:
 * - Mandamiento #5 (Mobile-First): Implementación técnica principal
 * - Mandamiento #7 (Separación): Lógica de detección en hook, UI aquí
 * - Mandamiento #6 (Consistencia): Patrón uniforme de responsive design
 * - Mandamiento #1 (Contexto): Mantiene contexto entre vistas
 */
'use client';

import React from 'react';
import useIsMobile from '../../hooks/ui/useIsMobile';
import DesktopMasterDetailView from './DesktopMasterDetailView';
import MobileDrillDownView from '../../views/MobileDrillDownView';

const DynamicView = () => {
    const isMobile = useIsMobile();

    // Esta comprobación es para evitar errores de hidratación en Next.js.
    // El hook useIsMobile solo funciona del lado del cliente.
    const [hasMounted, setHasMounted] = React.useState(false);
    React.useEffect(() => {
        setHasMounted(true);
    }, []);

    if (!hasMounted) {
        // Renderiza un loader genérico que coincide en servidor y cliente
        // para evitar el mismatch de hidratación.
        return (
            <div className="p-4 bg-gray-50 min-h-screen flex items-center justify-center">
                <p className="text-gray-500">Cargando vista...</p>
            </div>
        );
    }

    return isMobile ? <MobileDrillDownView /> : <DesktopMasterDetailView />;
};

export default DynamicView; 