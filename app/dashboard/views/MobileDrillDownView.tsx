/**
 * 🧭 MIGA DE PAN CONTEXTUAL: Vista Móvil con Navegación Drill-Down Jerárquica
 *
 * 📍 UBICACIÓN: views/MobileDrillDownView.tsx → Componente Principal Vista Móvil
 *
 * 🎯 PORQUÉ EXISTE:
 * Implementa la experiencia móvil optimizada del dashboard usando patrón drill-down jerárquico
 * (categorías → secciones → productos). Cumple Mandamiento #5 (Mobile-First) proporcionando
 * navegación intuitiva en una sola pantalla que se actualiza según la jerarquía seleccionada.
 * Permite estado local para navegación UI (excepción válida al Mandamiento #7).
 *
 * 🔄 FLUJO DE DATOS:
 * 1. useDashboardStore → datos globales (categorías, secciones, productos)
 * 2. useState(currentView) → controla nivel jerárquico mostrado
 * 3. Selección usuario → actualiza store + cambia vista local
 * 4. handleBack() → limpia selección store + retrocede vista
 * 5. FAB contextual → abre modal apropiado según vista actual
 *
 * 🔗 CONEXIONES DIRECTAS:
 * - ENTRADA: ResponsiveViewSwitcher.tsx → cuando isMobile: true
 * - STORE: useDashboardStore → todas las actions y estado global
 * - HOOK: useModalState → gestión centralizada de modales
 * - LISTAS: CategoryList, SectionList, ProductList → componentes "tontos"
 * - UI: Fab → botón flotante contextual por vista
 *
 * 🚨 PROBLEMA RESUELTO (Bitácora #35):
 * - Antes: Dependencias legacy rotas a componentes dashboard-v2
 * - Error: Imports incorrectos causaban fallos de compilación
 * - Solución: Refactorización completa a tipos V2 y rutas correctas
 * - Beneficio: Vista móvil estable y mantenible
 * - Fecha: 2025-01-12 - Refactorización masiva V2
 *
 * 🎯 CASOS DE USO REALES:
 * - Usuario móvil → ve lista categorías → tap categoría → lista secciones
 * - En secciones → tap sección → lista productos de esa sección
 * - FAB categorías → crea nueva categoría → modal + store update
 * - Botón atrás → retrocede jerarquía + limpia selección store
 * - Editar ítem → modal contextual + handleSaveModal → store action
 *
 * ⚠️ REGLAS DE NEGOCIO CRÍTICAS:
 * - currentView: 'categories' | 'sections' | 'products' (jerárquico estricto)
 * - selectedCategoryId REQUERIDO para mostrar secciones
 * - selectedSectionId REQUERIDO para mostrar productos
 * - FAB contextual: solo permite crear en nivel actual
 * - handleBack() DEBE limpiar selecciones store apropiadas
 *
 * 🔗 DEPENDENCIAS CRÍTICAS:
 * - REQUIERE: useDashboardStore con datos cargados (initialDataLoaded: true)
 * - REQUIERE: useModalState para gestión de modales
 * - REQUIERE: CategoryList, SectionList, ProductList componentes
 * - REQUIERE: EditModals + DeleteConfirmationModal componentes
 * - ROMPE SI: selectedCategoryId null cuando currentView: 'sections'
 * - ROMPE SI: selectedSectionId null cuando currentView: 'products'
 *
 * 📊 PERFORMANCE:
 * - Filtrado local → solo re-calcula cuando store cambia
 * - Ordenación por status → ítems activos primero
 * - Lazy loading → solo renderiza vista actual
 * - Modal lazy → solo renderiza modal abierto
 * - useState local → re-renders mínimos solo en navegación
 *
 * 📖 MANDAMIENTOS RELACIONADOS:
 * - Mandamiento #5 (Mobile-First): Implementación principal para móvil
 * - Mandamiento #7 (Separación): Lógica en store, UI en componentes "tontos"
 * - Mandamiento #6 (Consistencia): FAB y navegación uniforme
 * - Mandamiento #1 (Contexto): Mantiene selecciones coherentes en store
 */
'use client';

import React, { useState } from 'react';
import { useDashboardStore } from '../stores/dashboardStore';
import { useModalState } from '../hooks/ui/useModalState';
import { Category, Section, Product } from '../types';
import { ArrowLeftIcon, PlusIcon } from '@heroicons/react/24/solid';

// Vistas de lista (ahora todas usan exportaciones nombradas y tipos v2)
import { CategoryList } from '../components/domain/categories/CategoryMobileSimpleList';
import { SectionList } from '../components/domain/sections/SectionMobileSimpleList';
import { ProductList } from '../components/domain/products/ProductMobileSimpleList';

// Componentes UI
import Fab from '../components/ui/Fab';
import { EditCategoryModal, EditSectionModal, EditProductModal } from '../components/modals/EditModalComponents';
import { DeleteConfirmationModal } from '../components/modals/DeleteConfirmationModalComponent';
import { Loader } from '../components/ui/Loader';

export const MobileView = () => {
    // =================================================================
    // 🧭 PASO 1: Conexión a Estados Globales
    // Se suscribe tanto al store de datos (`dashboardStore`) como al de modales (`useModalState`).
    // =================================================================
    const {
        categories,
        sections,
        products,
        selectedCategoryId,
        setSelectedCategoryId,
        selectedSectionId,
        setSelectedSectionId,
        toggleCategoryVisibility,
        toggleSectionVisibility,
        toggleProductVisibility,
        isLoading,
        initialDataLoaded,
        client,
        createCategory,
        updateCategory,
        createSection,
        updateSection,
        createProduct,
        updateProduct
    } = useDashboardStore();

    const { modalState, openModal, closeModal, handleConfirmDelete } = useModalState();

    // =================================================================
    // 🧭 PASO 2: Estado de Navegación Local
    // `currentView` controla qué nivel de la jerarquía se muestra.
    // =================================================================
    const [currentView, setCurrentView] = useState<'categories' | 'sections' | 'products'>('categories');

    // =================================================================
    // 🧭 PASO 3: Manejadores de Navegación "Drill-Down"
    // =================================================================
    const handleCategorySelect = (category: Category) => {
        setSelectedCategoryId(category.category_id);
        setCurrentView('sections');
    };

    const handleSectionSelect = (section: Section) => {
        setSelectedSectionId(section.section_id);
        setCurrentView('products');
    };

    const handleBack = () => {
        if (currentView === 'products') {
            setCurrentView('sections');
            setSelectedSectionId(null);
        } else if (currentView === 'sections') {
            setCurrentView('categories');
            setSelectedCategoryId(null);
        }
    };

    const handleSaveModal = async ({ data, imageFile }: { data: any; imageFile?: File | null }) => {
        try {
            const { item, type } = modalState.options;

            if (type === 'category') {
                if (item) {
                    await updateCategory((item as Category).category_id, data, imageFile);
                } else if (client) {
                    await createCategory({ ...data, client_id: client.client_id }, imageFile);
                }
            } else if (type === 'section') {
                if (item) {
                    await updateSection((item as Section).section_id, data, imageFile);
                } else if (selectedCategoryId) {
                    await createSection({ ...data, category_id: selectedCategoryId }, imageFile);
                }
            } else if (type === 'product') {
                if (item) {
                    await updateProduct((item as Product).product_id, data, imageFile);
                } else if (selectedSectionId) {
                    await createProduct({ ...data, section_id: selectedSectionId }, imageFile);
                }
            }
            closeModal();
        } catch (error) {
            console.error(`❌ Error al guardar desde MobileView:`, error);
            throw error;
        }
    };

    const renderFab = () => {
        let fabAction = () => { };
        switch (currentView) {
            case 'categories':
                fabAction = () => openModal('editCategory');
                break;
            case 'sections':
                if (selectedCategoryId) {
                    fabAction = () => openModal('editSection', { parentId: selectedCategoryId });
                }
                break;
            case 'products':
                if (selectedSectionId) {
                    fabAction = () => openModal('editProduct', { parentId: selectedSectionId });
                }
                break;
        }
        return <Fab onClick={fabAction} icon={<PlusIcon className="h-6 w-6" />} label="Añadir nuevo" />;
    };

    // =================================================================
    // 🧭 PASO 4: Lógica de Renderizado Condicional
    // Basado en el estado de carga, y los datos filtrados del store.
    // =================================================================

    if (!initialDataLoaded || isLoading) {
        return <div className="flex h-full w-full items-center justify-center"><Loader message="Cargando..." /></div>;
    }

    // Filtra y ordena los datos del store basados en las selecciones actuales.
    const sortedCategories = [...categories].sort((a, b) => {
        if (a.status !== b.status) return a.status ? -1 : 1;
        return 0; // Podríamos añadir un segundo criterio de ordenación aquí si fuera necesario
    });

    const sectionsForCategory = selectedCategoryId ? sections[selectedCategoryId] || [] : [];
    const sortedSections = [...sectionsForCategory].sort((a, b) => {
        if (a.status !== b.status) return a.status ? -1 : 1;
        return 0;
    });

    const productsForSection = selectedSectionId ? products[selectedSectionId] || [] : [];
    const sortedProducts = [...productsForSection].sort((a, b) => {
        if (a.status !== b.status) return a.status ? -1 : 1;
        return 0;
    });

    return (
        <div className="p-4 h-full flex flex-col bg-gray-50 relative pb-20">
            {/* Botón de "Volver" condicional */}
            {currentView !== 'categories' && (
                <button onClick={handleBack} className="mb-4 text-blue-600 flex items-center font-semibold">
                    <ArrowLeftIcon className="h-5 w-5 mr-2" />
                    Volver
                </button>
            )}

            <div className="flex-1 overflow-y-auto bg-white rounded-lg shadow-soft p-4">
                {/* Renderizado condicional de la lista activa */}
                {currentView === 'categories' && (
                    <CategoryList
                        categories={sortedCategories}
                        onCategoryClick={handleCategorySelect}
                        onEditCategory={(item: Category) => openModal('editCategory', { item })}
                        onDeleteCategory={(item: Category) => openModal('deleteConfirmation', { item, type: 'category' })}
                        onToggleVisibility={(item: Category) => toggleCategoryVisibility(item.category_id, !item.status)}
                        expandedCategories={{}}
                    />
                )}
                {currentView === 'sections' && (
                    <SectionList
                        sections={sortedSections}
                        onSectionSelect={handleSectionSelect}
                        onEdit={(item: Section) => openModal('editSection', { item })}
                        onDelete={(item: Section) => openModal('deleteConfirmation', { item, type: 'section' })}
                        onToggleVisibility={(item: Section) => toggleSectionVisibility(item.section_id, !item.status)}
                    />
                )}
                {currentView === 'products' && (
                    <ProductList
                        products={sortedProducts}
                        onEdit={(item: Product) => openModal('editProduct', { item })}
                        onDelete={(item: Product) => openModal('deleteConfirmation', { item, type: 'product' })}
                        onToggleVisibility={(item: Product) => toggleProductVisibility(item.product_id, !item.status)}
                    />
                )}
            </div>

            {/* FAB Contextual y Modales */}
            {renderFab()}

            <EditCategoryModal
                isOpen={modalState.type === 'editCategory'}
                onClose={closeModal}
                item={modalState.options.item as Category | null}
                onSave={handleSaveModal}
            />
            <EditSectionModal
                isOpen={modalState.type === 'editSection'}
                onClose={closeModal}
                item={modalState.options.item as Section | null}
                onSave={handleSaveModal}
            />
            <EditProductModal
                isOpen={modalState.type === 'editProduct'}
                onClose={closeModal}
                item={modalState.options.item as Product | null}
                onSave={handleSaveModal}
            />
            <DeleteConfirmationModal
                isOpen={modalState.type === 'deleteConfirmation'}
                onClose={closeModal}
                onConfirm={handleConfirmDelete}
                itemType={modalState.options.type ?? 'item'}
            />
        </div>
    );
};

export default MobileView;