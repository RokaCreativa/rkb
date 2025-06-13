/**
 * @fileoverview MobileView - Componente principal para la interfaz de usuario en dispositivos móviles.
 * @description
 * Este componente actúa como el controlador central para la navegación y visualización en la vista móvil.
 * Ahora es un componente "tonto" que consume su estado y lógica del store centralizado de Zustand (`useDashboardStore`).
 * Esto resuelve los problemas de rendimiento y bucles de renderizado de la arquitectura anterior.
 *
 * ✅ T32.3 COMPLETADO - INTEGRACIÓN AUTO-DETECCIÓN: Unifica comportamiento entre escritorio y móvil
 * usando la misma lógica de auto-detección inteligente para jerarquía flexible.
 *
 * @architecture
 * Este componente está envuelto en un `<DragDropContext>` para soportar la funcionalidad de
 * arrastrar y soltar en sus componentes hijos (como `SectionList`), aunque esta funcionalidad
 * pueda estar desactivada visualmente en la vista móvil por defecto. El manejador `onDragEnd`
 * es necesario para que el contexto funcione correctamente.
 */
'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useDashboardStore, useCategoryDisplayMode, useCategoryProducts } from '../stores/dashboardStore';
import { CategoryList } from '../components/domain/categories/CategoryList';
import { SectionListView } from '../components/domain/sections/SectionListView';
import { ProductListView } from '../components/domain/products/ProductListView';
import Fab from '../components/ui/Fab';
import { useModalStore } from '../hooks/ui/state/useModalStore';
import { ModalManager } from '../components/modals/ModalManager';
import { ArrowLeftIcon, PlusIcon } from '@heroicons/react/24/solid';
import { Category, Section, Product } from '../types';
import { toast } from 'react-hot-toast';
import { getCategoryDisplayMode } from '../utils/categoryUtils';

export const MobileView: React.FC = () => {
    // --- CONEXIÓN AL STORE CENTRAL DE ZUSTAND ---
    const {
        categories,
        sections,
        products,
        activeView,
        activeCategoryId,
        activeSectionId,
        handleCategorySelect,
        handleSectionSelect,
        handleBack,
        fetchCategories,
        fetchDataForCategory,
        toggleCategoryVisibility,
        toggleSectionVisibility,
        toggleProductVisibility,
        isLoading,
        initialDataLoaded,
    } = useDashboardStore();

    // ✅ T32.3 - HOOKS DE AUTO-DETECCIÓN: Integración con lógica inteligente
    const categoryDisplayMode = useCategoryDisplayMode(activeCategoryId);
    const categoryProducts = useCategoryProducts(activeCategoryId, activeSectionId);

    const { openModal } = useModalStore();
    const { data: session, status: sessionStatus } = useSession();
    const clientId = session?.user?.client_id;

    // --- CARGA DE DATOS INICIAL ---
    useEffect(() => {
        if (sessionStatus === 'authenticated' && clientId && !initialDataLoaded) {
            fetchCategories(clientId);
        }
    }, [sessionStatus, clientId, fetchCategories, initialDataLoaded]);

    /**
     * 🧭 MIGA DE PAN CONTEXTUAL: Función wrapper que conecta la UI móvil con la lógica del store
     * PORQUÉ EXISTE: Originalmente tenía lógica de auto-detección compleja, ahora es un simple wrapper
     * PROBLEMA RESUELTO: Se eliminó la auto-detección que causaba navegación inconsistente
     * CONEXIONES CRÍTICAS:
     * - CategoryList.tsx línea ~45: onCategoryClick prop recibe esta función
     * - dashboardStore.ts handleCategorySelect: La función real que maneja la navegación
     * DECISIÓN ARQUITECTÓNICA: Mantener el wrapper para futuras mejoras sin cambiar la interfaz
     * FLUJO: CategoryList onClick → handleCategorySelectWithAutoDetection → store.handleCategorySelect
     */
    const handleCategorySelectWithAutoDetection = (categoryId: number) => {
        // Delegación directa al store - toda la lógica está centralizada allí
        handleCategorySelect(categoryId);
    };

    /**
     * 🧭 MIGA DE PAN CONTEXTUAL: Renderiza FAB (Floating Action Button) contextual según vista activa
     * PORQUÉ COMPLEJO: Cada vista (categories/sections/products) necesita crear diferentes entidades
     * CONEXIONES CRÍTICAS:
     * - Fab.tsx: Componente reutilizable que recibe onClick y icon
     * - ModalManager.tsx: openModal() que maneja todos los modales del sistema
     * - useModalState.tsx: Hook que gestiona el estado de modales
     * LÓGICA DE NEGOCIO: 
     * - categories → crear nueva categoría
     * - sections → crear nueva sección en categoría activa
     * - products → crear producto (en categoría simple O sección específica)
     * DECISIÓN UX: FAB siempre visible para acceso rápido a creación
     */
    const renderFab = () => {
        let onClickAction = () => { };
        if (activeView === 'categories') {
            onClickAction = () => openModal('newCategory');
        } else if (activeView === 'sections' && activeCategoryId) {
            onClickAction = () => openModal('newSection', { categoryId: activeCategoryId });
        } else if (activeView === 'products' && activeCategoryId) {
            // LÓGICA ADAPTATIVA: Diferentes flujos según tipo de categoría
            if (categoryDisplayMode === 'simple') {
                onClickAction = () => {
                    // VALIDACIÓN CRÍTICA: Prevenir errores de estado inconsistente
                    if (activeCategoryId) {
                        openModal('newProduct', { categoryId: activeCategoryId });
                    } else {
                        toast.error('Error: No se puede determinar la categoría activa');
                    }
                };
            } else if (activeSectionId) {
                // Para categorías complejas, necesitamos la sección específica
                const section = sections[activeCategoryId]?.find((s: Section) => s.section_id === activeSectionId);
                onClickAction = () => openModal('newProduct', { section });
            }
        }
        return <Fab onClick={onClickAction} icon={<PlusIcon className="h-6 w-6" />} />;
    };

    /**
     * 🧭 MIGA DE PAN CONTEXTUAL: Genera títulos dinámicos para la cabecera según contexto de navegación
     * PORQUÉ NECESARIO: La navegación drill-down requiere títulos contextuales para orientación del usuario
     * CONEXIONES: Se renderiza en la cabecera principal del componente (línea ~200)
     * LÓGICA DE NEGOCIO:
     * - products + categoría simple → nombre de la categoría (ej: "SNACKS")
     * - products + categoría compleja → nombre de la sección (ej: "Hamburguesas Clásicas")
     * - sections → nombre de la categoría (ej: "HAMBURGUESAS")
     * - categories → título fijo "Categorías"
     * DECISIÓN UX: Títulos descriptivos para que el usuario sepa dónde está en la jerarquía
     */
    const getTitle = () => {
        if (activeView === 'products' && activeCategoryId) {
            // Para categorías simples, mostrar nombre de categoría
            if (categoryDisplayMode === 'simple') {
                const category = categories.find((c: Category) => c.category_id === activeCategoryId);
                return category?.name || 'Productos';
            }
            // Para categorías complejas, mostrar nombre de sección
            if (activeSectionId) {
                const section = sections[activeCategoryId]?.find((s: Section) => s.section_id === activeSectionId);
                return section?.name || 'Productos';
            }
        }
        if (activeView === 'sections' && activeCategoryId) {
            const category = categories.find((c: Category) => c.category_id === activeCategoryId);
            return category?.name || 'Secciones';
        }
        return 'Categorías';
    };

    /**
     * 🧭 MIGA DE PAN CONTEXTUAL: Callback crítico para sincronización tras operaciones CRUD
     * PORQUÉ COMPLEJO: Diferentes vistas requieren diferentes estrategias de refresco
     * PROBLEMA RESUELTO: Contadores desactualizados y vistas inconsistentes tras crear/editar
     * CONEXIONES CRÍTICAS:
     * - ModalManager.tsx: onSuccess prop que recibe esta función
     * - dashboardStore.ts: fetchCategories, fetchProductsByCategory, fetchProductsBySection
     * ESTRATEGIA DE REFRESCO:
     * 1. Siempre refrescar categorías (para contadores de visibilidad)
     * 2. Refrescar productos según contexto (categoría simple vs sección específica)
     * 3. Caso especial: vista sections necesita fetchDataForCategory para actualizar modo
     * DECISIÓN ARQUITECTÓNICA: Refresco granular para optimizar rendimiento
     */
    const handleModalSuccess = () => {
        // CRÍTICO: Siempre refrescar categorías para mantener contadores sincronizados
        if (clientId) {
            useDashboardStore.getState().fetchCategories(clientId);
        }

        // Estrategia de refresco según contexto de navegación
        if (activeCategoryId && categoryDisplayMode === 'simple') {
            useDashboardStore.getState().fetchProductsByCategory(activeCategoryId);
        }
        else if (activeSectionId) {
            useDashboardStore.getState().fetchProductsBySection(activeSectionId);
        }

        // CASO ESPECIAL: Vista sections necesita recalcular modo de visualización
        // Esto maneja el caso donde se crea la primera sección en categoría vacía
        if (activeView === 'sections' && activeCategoryId) {
            useDashboardStore.getState().fetchDataForCategory(activeCategoryId);
        }
    };

    /**
     * 🧭 MIGA DE PAN CONTEXTUAL: Maneja eliminación de secciones con navegación inteligente
     * PORQUÉ ESPECÍFICO: La eliminación de secciones puede dejar al usuario en estado inconsistente
     * PROBLEMA RESUELTO: Usuario quedaba viendo productos de sección eliminada
     * CONEXIONES: SectionListView.tsx onDelete prop recibe esta función
     * LÓGICA DE NAVEGACIÓN:
     * 1. Refrescar lista de secciones de la categoría
     * 2. Si estamos viendo productos de la sección eliminada → navegar atrás
     * 3. Limpiar activeSectionId si era la sección eliminada
     * DECISIÓN UX: Navegación automática para evitar estados de error
     */
    const handleSectionDeleted = (sectionId: number) => {
        // Refrescar datos de la categoría actual
        if (activeCategoryId) {
            useDashboardStore.getState().fetchSectionsByCategory(activeCategoryId);
        }

        // Navegación inteligente si estamos viendo la sección eliminada
        if (activeView === 'products' && activeSectionId === sectionId) {
            handleBack();
        }

        // Limpieza de estado para evitar referencias a sección inexistente
        if (activeSectionId === sectionId) {
            useDashboardStore.setState({ activeSectionId: null });
        }
    };

    // --- RENDERIZADO CONDICIONAL POR ESTADO DE CARGA ---
    if (sessionStatus === 'loading' || isLoading) {
        return (
            <div className="md:hidden p-4 bg-gray-50 min-h-screen flex items-center justify-center">
                <p className="text-gray-500">Cargando dashboard...</p>
            </div>
        );
    }

    return (
        <div className="md:hidden p-4 bg-gray-50 min-h-screen relative pb-20">
            <ModalManager
                setCategories={() => { }}
                setSections={() => { }}
                setProducts={() => { }}
                onSuccess={handleModalSuccess}
                activeCategoryId={activeCategoryId ?? undefined}
                activeSectionId={activeSectionId ?? undefined}
            />

            <div className="bg-white p-4 rounded-lg shadow-md mb-4">
                <div className="flex items-center mb-4">
                    {activeView !== 'categories' && (
                        <button onClick={handleBack} className="mr-4 p-2 rounded-full hover:bg-gray-100">
                            <ArrowLeftIcon className="h-6 w-6 text-gray-700" />
                        </button>
                    )}
                    <h2 className="text-xl font-bold capitalize">{getTitle()}</h2>
                </div>

                {activeView === 'categories' && (
                    <CategoryList
                        categories={categories}
                        onCategoryClick={(category: Category) => handleCategorySelectWithAutoDetection(category.category_id)}
                        onEditCategory={(category: Category) => openModal('editCategory', { category })}
                        onDeleteCategory={(category: Category) => openModal('deleteCategory', { category })}
                        onToggleVisibility={(category: Category) => toggleCategoryVisibility(category.category_id, category.status)}
                        expandedCategories={{}}
                    />
                )}

                {/* ✅ T32.3 - RENDERIZADO ADAPTATIVO: Mostrar secciones SIEMPRE para permitir gestión */}
                {activeView === 'sections' && activeCategoryId && (
                    <SectionListView
                        sections={sections[activeCategoryId] || []}
                        onSectionClick={(section: Section) => handleSectionSelect(section.section_id)}
                        onToggleVisibility={(section: Section) => {
                            // 🧭 MIGA DE PAN: activeCategoryId está conectado con handleCategorySelect del store
                            // y es fundamental para la jerarquía Category->Section->Product en la navegación móvil
                            if (!activeCategoryId) {
                                console.error('Error: activeCategoryId es null al cambiar visibilidad de sección');
                                toast.error('Error de navegación. Regrese a categorías e intente de nuevo.');
                                return;
                            }
                            toggleSectionVisibility(section.section_id, section.status);
                        }}
                        onEdit={(section: Section) => openModal('editSection', { section })}
                        onDelete={(section: Section) => openModal('deleteSection', { section })}
                    />
                )}

                {/* ✅ T32.3 - PRODUCTOS ADAPTATIVOS: Usar productos de categoría O sección según modo */}
                {activeView === 'products' && activeCategoryId && (
                    <ProductListView
                        products={categoryDisplayMode === 'simple' ? categoryProducts : (products[activeSectionId || 0] || [])}
                        onToggleVisibility={(product: Product) => {
                            // 🧭 MIGA DE PAN: Para categorías simples no necesitamos activeSectionId
                            if (categoryDisplayMode === 'sections' && !activeSectionId) {
                                console.error('Error: activeSectionId es null al intentar cambiar visibilidad de producto');
                                toast.error('Error de navegación. Regrese a la categoría e intente de nuevo.');
                                return;
                            }
                            toggleProductVisibility(product.product_id, product.status);
                        }}
                        onEdit={(product: Product) => openModal('editProduct', { product })}
                        onDelete={(product: Product) => openModal('deleteProduct', { product })}
                    />
                )}
            </div>

            {renderFab()}
        </div>
    );
};