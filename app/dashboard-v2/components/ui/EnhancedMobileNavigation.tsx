/**
 * 🧭 MIGA DE PAN CONTEXTUAL: Navegación móvil mejorada con FASE 6 - Responsive Drill-Down Avanzado
 * 
 * PORQUÉ CRÍTICO: Implementa mejoras UX de v0.dev para navegación móvil fluida
 * PROBLEMA RESUELTO: Navegación móvil básica sin feedback visual ni orientación contextual
 * 
 * MEJORAS IMPLEMENTADAS:
 * 1. Transiciones suaves con Framer Motion
 * 2. Breadcrumbs dinámicos para orientación
 * 3. Gestos de swipe para navegación intuitiva
 * 4. Historial de navegación mejorado
 * 5. Indicadores de carga y estados
 * 
 * CONEXIONES CRÍTICAS:
 * - MobileView.tsx: Componente padre que usa esta navegación
 * - dashboardStore.ts: Fuente de datos y estado de navegación
 * - CategoryList/SectionListView/ProductListView: Componentes de contenido
 * 
 * PATRÓN v0.dev: Componentes memoizados + transiciones fluidas + gestos nativos
 * ARQUITECTURA: Separación clara entre navegación y contenido
 */
'use client';

import React, { useMemo, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { useDashboardStore, useCategoryDisplayMode } from '../../stores/dashboardStore';
import { 
    ArrowLeftIcon, 
    HomeIcon, 
    ChevronRightIcon,
    Bars3Icon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { Button } from '../Button/Button';
import { Category, Section } from '../../types';

// --- TIPOS PARA NAVEGACIÓN MEJORADA ---

type NavigationItem = {
    id: string;
    name: string;
    type: 'categories' | 'sections' | 'products';
    categoryId?: number;
    sectionId?: number;
};

interface EnhancedMobileNavigationProps {
    children: React.ReactNode;
    onSwipeBack?: () => void;
    showBreadcrumbs?: boolean;
    showGestures?: boolean;
}

/**
 * 🧭 MIGA DE PAN CONTEXTUAL: Componente de breadcrumbs dinámicos
 * 
 * PORQUÉ NECESARIO: Usuario necesita orientación en navegación drill-down profunda
 * PROBLEMA RESUELTO: Usuario se pierde en jerarquía sin saber dónde está
 * 
 * OPTIMIZACIÓN: React.memo para evitar re-renders innecesarios
 * CONEXIÓN: Se actualiza automáticamente con cambios en dashboardStore
 */
const DynamicBreadcrumbs: React.FC<{
    onNavigate: (item: NavigationItem) => void;
}> = React.memo(({ onNavigate }) => {
    const {
        activeView,
        activeCategoryId,
        activeSectionId,
        categories,
        sections
    } = useDashboardStore();

    // 🧭 MIGA DE PAN: Construcción inteligente de breadcrumbs según contexto
    const breadcrumbItems = useMemo(() => {
        const items: NavigationItem[] = [
            { id: 'home', name: 'Inicio', type: 'categories' }
        ];

        if (activeCategoryId) {
            const category = categories.find(c => c.category_id === activeCategoryId);
            if (category) {
                items.push({
                    id: `cat-${activeCategoryId}`,
                    name: category.name,
                    type: 'sections',
                    categoryId: activeCategoryId
                });
            }
        }

        if (activeSectionId && activeCategoryId) {
            const section = sections[activeCategoryId]?.find(s => s.section_id === activeSectionId);
            if (section) {
                items.push({
                    id: `sec-${activeSectionId}`,
                    name: section.name,
                    type: 'products',
                    categoryId: activeCategoryId,
                    sectionId: activeSectionId
                });
            }
        }

        return items;
    }, [activeView, activeCategoryId, activeSectionId, categories, sections]);

    const handleBreadcrumbClick = useCallback((item: NavigationItem) => {
        onNavigate(item);
    }, [onNavigate]);

    return (
        <motion.div 
            className="flex items-center space-x-1 px-4 py-2 bg-gray-50 border-b overflow-x-auto"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
        >
            {breadcrumbItems.map((item, index) => (
                <React.Fragment key={item.id}>
                    <button
                        onClick={() => handleBreadcrumbClick(item)}
                        className={`flex items-center px-2 py-1 rounded text-sm whitespace-nowrap transition-colors ${
                            index === breadcrumbItems.length - 1
                                ? 'text-blue-600 font-medium bg-blue-50'
                                : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
                        }`}
                    >
                        {index === 0 && <HomeIcon className="h-4 w-4 mr-1" />}
                        {item.name}
                    </button>
                    {index < breadcrumbItems.length - 1 && (
                        <ChevronRightIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    )}
                </React.Fragment>
            ))}
        </motion.div>
    );
});

DynamicBreadcrumbs.displayName = 'DynamicBreadcrumbs';

/**
 * 🧭 MIGA DE PAN CONTEXTUAL: Header mejorado con navegación contextual
 * 
 * ARQUITECTURA: Combina botón back + título dinámico + acciones contextuales
 * OPTIMIZACIÓN: Callbacks memoizados para evitar re-renders
 */
const EnhancedHeader: React.FC<{
    title: string;
    canGoBack: boolean;
    onBack: () => void;
    onMenuToggle?: () => void;
}> = React.memo(({ title, canGoBack, onBack, onMenuToggle }) => {
    const handleBack = useCallback(() => {
        onBack();
    }, [onBack]);

    const handleMenuToggle = useCallback(() => {
        onMenuToggle?.();
    }, [onMenuToggle]);

    return (
        <motion.header 
            className="flex items-center justify-between p-4 bg-white border-b shadow-sm"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="flex items-center">
                {canGoBack && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleBack}
                        className="mr-3 p-2"
                    >
                        <ArrowLeftIcon className="h-5 w-5" />
                    </Button>
                )}
                <h1 className="text-lg font-semibold text-gray-900 truncate">
                    {title}
                </h1>
            </div>

            {onMenuToggle && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMenuToggle}
                    className="p-2"
                >
                    <Bars3Icon className="h-5 w-5" />
                </Button>
            )}
        </motion.header>
    );
});

EnhancedHeader.displayName = 'EnhancedHeader';

/**
 * 🧭 MIGA DE PAN CONTEXTUAL: Componente principal de navegación móvil mejorada
 * 
 * CARACTERÍSTICAS AVANZADAS:
 * 1. Detección de gestos de swipe para navegación
 * 2. Transiciones fluidas entre vistas
 * 3. Breadcrumbs dinámicos
 * 4. Header contextual con acciones
 * 5. Indicadores de carga y estados
 * 
 * PATRÓN v0.dev: Componente contenedor que orquesta navegación compleja
 */
export const EnhancedMobileNavigation: React.FC<EnhancedMobileNavigationProps> = ({
    children,
    onSwipeBack,
    showBreadcrumbs = true,
    showGestures = true
}) => {
    const {
        activeView,
        activeCategoryId,
        activeSectionId,
        categories,
        sections,
        history,
        handleBack,
        setSelectedCategoryId,
        setSelectedSectionId,
        isLoading
    } = useDashboardStore();

    const categoryDisplayMode = useCategoryDisplayMode(activeCategoryId);
    const containerRef = useRef<HTMLDivElement>(null);

    // 🧭 MIGA DE PAN: Título dinámico según contexto de navegación
    const dynamicTitle = useMemo(() => {
        if (activeView === 'products' && activeCategoryId) {
            if (categoryDisplayMode === 'simple') {
                const category = categories.find(c => c.category_id === activeCategoryId);
                return category?.name || 'Productos';
            }
            if (activeSectionId) {
                const section = sections[activeCategoryId]?.find(s => s.section_id === activeSectionId);
                return section?.name || 'Productos';
            }
        }
        if (activeView === 'sections' && activeCategoryId) {
            const category = categories.find(c => c.category_id === activeCategoryId);
            return category?.name || 'Secciones';
        }
        return 'Categorías';
    }, [activeView, activeCategoryId, activeSectionId, categories, sections, categoryDisplayMode]);

    // 🧭 MIGA DE PAN: Detección de capacidad de navegación hacia atrás
    const canGoBack = useMemo(() => {
        return history.length > 0 || activeView !== 'categories';
    }, [history.length, activeView]);

    // 🧭 MIGA DE PAN: Manejo de gestos de swipe para navegación
    const handlePanEnd = useCallback((event: any, info: PanInfo) => {
        if (!showGestures) return;

        const { offset, velocity } = info;
        const swipeThreshold = 100;
        const velocityThreshold = 500;

        // Swipe hacia la derecha (back)
        if (
            (offset.x > swipeThreshold && velocity.x > 0) ||
            (velocity.x > velocityThreshold)
        ) {
            if (canGoBack) {
                handleBack();
            } else if (onSwipeBack) {
                onSwipeBack();
            }
        }
    }, [showGestures, canGoBack, handleBack, onSwipeBack]);

    // 🧭 MIGA DE PAN: Navegación desde breadcrumbs
    const handleBreadcrumbNavigation = useCallback((item: NavigationItem) => {
        if (item.type === 'categories') {
            // Navegar a inicio
            useDashboardStore.getState().handleBack();
        } else if (item.type === 'sections' && item.categoryId) {
            // Navegar a secciones de categoría
            setSelectedCategoryId(item.categoryId);
        } else if (item.type === 'products' && item.categoryId && item.sectionId) {
            // Navegar a productos de sección
            setSelectedCategoryId(item.categoryId);
            setSelectedSectionId(item.sectionId);
        }
    }, [setSelectedCategoryId, setSelectedSectionId]);

    // 🧭 MIGA DE PAN: Variantes de animación para transiciones fluidas
    const pageVariants = {
        initial: { opacity: 0, x: 20 },
        in: { opacity: 1, x: 0 },
        out: { opacity: 0, x: -20 }
    };

    const pageTransition = {
        type: 'tween',
        ease: 'anticipate',
        duration: 0.3
    };

    return (
        <div className="flex flex-col h-full bg-gray-50" ref={containerRef}>
            {/* Header mejorado */}
            <EnhancedHeader
                title={dynamicTitle}
                canGoBack={canGoBack}
                onBack={handleBack}
            />

            {/* Breadcrumbs dinámicos */}
            {showBreadcrumbs && (
                <DynamicBreadcrumbs onNavigate={handleBreadcrumbNavigation} />
            )}

            {/* Contenido principal con gestos y transiciones */}
            <motion.div
                className="flex-1 overflow-hidden"
                drag={showGestures ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onPanEnd={handlePanEnd}
                whileDrag={{ scale: 0.95 }}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`${activeView}-${activeCategoryId}-${activeSectionId}`}
                        initial="initial"
                        animate="in"
                        exit="out"
                        variants={pageVariants}
                        transition={pageTransition}
                        className="h-full"
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        ) : (
                            children
                        )}
                    </motion.div>
                </AnimatePresence>
            </motion.div>

            {/* Indicador de gesto (opcional) */}
            {showGestures && canGoBack && (
                <motion.div
                    className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.7 }}
                    exit={{ opacity: 0 }}
                >
                    ← Desliza para volver
                </motion.div>
            )}
        </div>
    );
}; 