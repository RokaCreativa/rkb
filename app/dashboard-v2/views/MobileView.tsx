/**
 * 🧭 MIGA DE PAN CONTEXTUAL MAESTRA: Orquestador de la Vista Móvil
 *
 * 📍 UBICACIÓN: app/dashboard-v2/views/MobileView.tsx
 *
 * 🎯 PORQUÉ EXISTE:
 * Este componente es el controlador principal para la experiencia de usuario en dispositivos móviles.
 * Implementa un patrón de navegación "Drill-Down" (taladro), donde el usuario navega a través de
 * niveles jerárquicos (Categorías -> Secciones -> Productos) en una sola vista que se actualiza.
 *
 * 🔄 FLUJO DE DATOS Y ESTADO:
 * 1. **Estado Global (`useDashboardStore`):** Consume los datos (categorías, secciones, productos) y las
 *    acciones CRUD del store central. También utiliza los `selectedCategoryId` y `selectedSectionId`
 *    del store para filtrar los datos a mostrar.
 * 2. **Estado Local (`useState`):** Utiliza un estado local `currentView` para controlar qué
 *    lista se está mostrando en un momento dado ('categories', 'sections', o 'products'). Este es
 *    un uso ACEPTABLE de `useState` porque el estado de la navegación es puramente local a la
 *    vista móvil y no necesita ser compartido globalmente.
 * 3. **Navegación:**
 *    - `handleCategorySelect`: Actualiza el `selectedCategoryId` en el store y cambia `currentView` a 'sections'.
 *    - `handleSectionSelect`: Actualiza el `selectedSectionId` en el store y cambia `currentView` a 'products'.
 *    - `handleBack`: Navega hacia atrás en la jerarquía, limpiando la selección correspondiente en el store.
 * 4. **Renderizado Condicional:** Muestra `CategoryList`, `SectionList`, o `ProductList` basado en el valor de `currentView`.
 * 5. **FAB Contextual:** El Botón de Acción Flotante (`Fab`) cambia su acción (`onClick`) dependiendo de `currentView`.
 *
 * 🔗 CONEXIONES DIRECTAS:
 * - **Consume Estado de:** `useDashboardStore`, `useModalState`.
 * - **Renderiza Componentes Hijos:** `CategoryList`, `SectionList`, `ProductList`, `Fab`, y todos los `EditModals`.
 *
 * 🚨 PROBLEMA RESUELTO:
 * - Se refactorizó para consumir datos y tipos del `dashboardStore` v2, eliminando la dependencia de hooks y tipos `legacy`.
 * - Los componentes de lista (`CategoryList`, `SectionList`, `ProductList`) fueron refactorizados para ser más simples y consistentes, usando `GenericRow`.
 *
 * ⚠️ REGLAS DE NEGOCIO:
 * - El flujo de navegación es estrictamente jerárquico. No se puede saltar de categorías a productos directamente.
 * - El botón "Volver" es la única forma de navegar hacia arriba en la jerarquía.
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

    // Filtra los datos del store basados en las selecciones actuales.
    const sectionsForCategory = selectedCategoryId ? sections[selectedCategoryId] || [] : [];
    const productsForSection = selectedSectionId ? products[selectedSectionId] || [] : [];

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
                        categories={categories}
                        onCategoryClick={handleCategorySelect}
                        onEditCategory={(item: Category) => openModal('editCategory', { item })}
                        onDeleteCategory={(item: Category) => openModal('deleteConfirmation', { item, type: 'category' })}
                        onToggleVisibility={(item: Category) => toggleCategoryVisibility(item.category_id, !item.status)}
                        expandedCategories={{}}
                    />
                )}
                {currentView === 'sections' && (
                    <SectionList
                        sections={sectionsForCategory}
                        onSectionSelect={handleSectionSelect}
                        onEdit={(item: Section) => openModal('editSection', { item })}
                        onDelete={(item: Section) => openModal('deleteConfirmation', { item, type: 'section' })}
                        onToggleVisibility={(item: Section) => toggleSectionVisibility(item.section_id, !item.status)}
                    />
                )}
                {currentView === 'products' && (
                    <ProductList
                        products={productsForSection}
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
                category={modalState.options.item as Category | null}
                clientId={client?.client_id}
            />
            <EditSectionModal
                isOpen={modalState.type === 'editSection'}
                onClose={closeModal}
                section={modalState.options.item as Section | null}
                categoryId={modalState.options.parentId || (modalState.options.item as Section)?.category_id}
            />
            <EditProductModal
                isOpen={modalState.type === 'editProduct'}
                onClose={closeModal}
                product={modalState.options.item as Product | null}
                sectionId={modalState.options.parentId}
                isDirect={modalState.options.isDirect}
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