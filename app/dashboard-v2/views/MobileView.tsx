/**
 * 🎯 MANDAMIENTO #7 - SEPARACIÓN ABSOLUTA DE LÓGICA Y PRESENTACIÓN
 * 
 * 🧭 PREGUNTA TRAMPA: ¿Qué patrón de navegación usa y por qué tiene estado local?
 * RESPUESTA: Drill-Down jerárquico (categorías→secciones→productos) con estado local PERMITIDO para navegación UI
 * 
 * 📍 PROPÓSITO: Controlador principal para experiencia móvil
 * Implementa navegación "taladro" en una sola vista que se actualiza según la jerarquía
 * 
 * ⚠️ NO DEBE HACER: Lógica de negocio compleja, llamadas API directas, transformaciones de datos
 * ✅ SÍ PUEDE HACER: Estado local para navegación UI (currentView) - es puramente presentacional
 * 
 * 🔗 DEPENDENCIAS CRÍTICAS:
 * - useDashboardStore (stores/) - Datos y acciones CRUD
 * - useModalState (hooks/ui/) - Manejo de modales
 * - CategoryList, SectionList, ProductList (components/domain/) - Listas de datos
 * - Fab (components/ui/) - Botón flotante contextual
 * 
 * 🚨 PROBLEMA RESUELTO: Refactorización v2 eliminando dependencias legacy (Bitácora #35)
 * 
 * 🧠 ARQUITECTURA MÓVIL: Navegación jerárquica estricta con FAB contextual
 * 
 * 🔄 FLUJO CRÍTICO:
 * 1. Store → Filtrado local → Listas UI
 * 2. Selección → Actualizar store + cambiar vista local
 * 3. Navegación hacia atrás → Limpiar selección + vista anterior
 * 
 * 🚨 ANTES DE CREAR ALGO NUEVO → REVISAR ESTA LISTA DE DEPENDENCIAS
 */
'use client';

import React, { useState } from 'react';
import { useDashboardStore } from '../stores/dashboardStore';
import { useModalState } from '../hooks/ui/useModalState';
import { Category, Section, Product } from '../types';
import { ArrowLeftIcon, PlusIcon } from '@heroicons/react/24/solid';

// Vistas de lista (ahora todas usan exportaciones nombradas y tipos v2)
import { CategoryList } from '../components/domain/categories/CategoryList';
import { SectionList } from '../components/domain/sections/SectionList';
import { ProductList } from '../components/domain/products/ProductList';

// Componentes UI
import Fab from '../components/ui/Fab';
import { EditCategoryModal, EditSectionModal, EditProductModal } from '../components/modals/EditModals';
import { DeleteConfirmationModal } from '../components/modals/DeleteConfirmationModal';
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
        client
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
                    await useDashboardStore.getState().updateCategory((item as Category).category_id, data, imageFile);
                } else if (client) {
                    await useDashboardStore.getState().createCategory({ ...data, client_id: client.client_id }, imageFile);
                }
            } else if (type === 'section') {
                if (item) {
                    await useDashboardStore.getState().updateSection((item as Section).section_id, data, imageFile);
                } else if (selectedCategoryId) {
                    await useDashboardStore.getState().createSection({ ...data, category_id: selectedCategoryId }, imageFile);
                }
            } else if (type === 'product') {
                if (item) {
                    await useDashboardStore.getState().updateProduct((item as Product).product_id, data, imageFile);
                } else if (selectedSectionId) {
                    await useDashboardStore.getState().createProduct({ ...data, section_id: selectedSectionId }, imageFile);
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