/**
 * @fileoverview MobileView - Componente principal para la interfaz de usuario en dispositivos móviles.
 * @description
 * Este componente actúa como el controlador central para la navegación y visualización en la vista móvil.
 * Ahora es un componente "tonto" que consume su estado y lógica del store centralizado de Zustand (`useDashboardStore`).
 * Esto resuelve los problemas de rendimiento y bucles de renderizado de la arquitectura anterior.
 *
 * @architecture
 * Este componente está envuelto en un `<DragDropContext>` para soportar la funcionalidad de
 * arrastrar y soltar en sus componentes hijos (como `SectionList`), aunque esta funcionalidad
 * pueda estar desactivada visualmente en la vista móvil por defecto. El manejador `onDragEnd`
 * es necesario para que el contexto funcione correctamente.
 */
'use client';

import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { useDashboardStore } from '../stores/dashboardStore';
import { CategoryList } from '../components/domain/categories/CategoryList';
import { SectionListView } from '../components/domain/sections/SectionListView';
import { ProductListView } from '../components/domain/products/ProductListView';
import Fab from '../components/ui/Fab';
import { useModalStore } from '../hooks/ui/state/useModalStore';
import { ModalManager } from '../components/modals/ModalManager';
import { ArrowLeftIcon, PlusIcon } from '@heroicons/react/24/solid';
import { Category, Section, Product } from '../types';

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
        toggleCategoryVisibility,
        toggleSectionVisibility,
        toggleProductVisibility,
        isLoading,
        initialDataLoaded,
    } = useDashboardStore();

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
     * @function onDragEnd
     * @description Manejador para el evento de finalización de arrastre de `DragDropContext`.
     * Aunque el drag-and-drop visual no esté activo en móvil, este manejador es requerido
     * por el contexto para que los componentes anidados funcionen sin errores.
     * En el futuro, aquí se implementará la lógica para el "modo de reordenación" móvil.
     * @param {DropResult} result - El resultado de la operación de arrastre.
     */
    const onDragEnd = (result: DropResult) => {
        // TODO: Implementar la lógica de reordenamiento para el modo móvil.
        console.log('Drag ended', result);
    };

    /**
     * Renderiza el Botón de Acción Flotante (FAB) según el contexto.
     * La lógica ahora lee directamente del store para decidir qué modal abrir.
     */
    const renderFab = () => {
        let onClickAction = () => { };
        if (activeView === 'categories') {
            onClickAction = () => openModal('newCategory');
        } else if (activeView === 'sections' && activeCategoryId) {
            onClickAction = () => openModal('newSection', { categoryId: activeCategoryId });
        } else if (activeView === 'products' && activeSectionId && activeCategoryId) {
            const section = sections[activeCategoryId]?.find((s: Section) => s.section_id === activeSectionId);
            onClickAction = () => openModal('newProduct', { section });
        }
        return <Fab onClick={onClickAction} icon={<PlusIcon className="h-6 w-6" />} />;
    };

    /**
     * Determina el título a mostrar en la cabecera.
     * Lee directamente del estado del store.
     */
    const getTitle = () => {
        if (activeView === 'products' && activeSectionId && activeCategoryId) {
            const section = sections[activeCategoryId]?.find((s: Section) => s.section_id === activeSectionId);
            return section?.name || 'Productos';
        }
        if (activeView === 'sections' && activeCategoryId) {
            const category = categories.find((c: Category) => c.category_id === activeCategoryId);
            return category?.name || 'Secciones';
        }
        return 'Categorías';
    };

    // La función `onSuccess` para el ModalManager ya no es necesaria, ya que la lógica de
    // recarga de datos está ahora dentro de las propias acciones del store de Zustand.

    // --- RENDERIZADO CONDICIONAL POR ESTADO DE CARGA ---
    if (sessionStatus === 'loading' || isLoading) {
        return (
            <div className="md:hidden p-4 bg-gray-50 min-h-screen flex items-center justify-center">
                <p className="text-gray-500">Cargando dashboard...</p>
            </div>
        );
    }

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="md:hidden p-4 bg-gray-50 min-h-screen relative pb-20">
                <ModalManager
                    setCategories={() => { }}
                    setSections={() => { }}
                    setProducts={() => { }}
                    onSuccess={() => { }}
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
                            onCategoryClick={handleCategorySelect}
                            onEditCategory={(category: Category) => openModal('editCategory', { category })}
                            onDeleteCategory={(category: Category) => openModal('deleteCategory', { category })}
                            onToggleVisibility={(category: Category) => toggleCategoryVisibility(category.category_id, category.status)}
                            expandedCategories={{}}
                        />
                    )}

                    {activeView === 'sections' && activeCategoryId && (
                        <SectionListView
                            sections={sections[activeCategoryId] || []}
                            onSectionClick={handleSectionSelect}
                            onToggleVisibility={(section: Section) => toggleSectionVisibility(section.section_id, activeCategoryId, section.status)}
                            onEdit={(section: Section) => openModal('editSection', { section })}
                            onDelete={(section: Section) => openModal('deleteSection', { section })}
                        />
                    )}

                    {activeView === 'products' && activeSectionId && (
                        <ProductListView
                            products={products[activeSectionId] || []}
                            onToggleVisibility={(product: Product) => toggleProductVisibility(product.product_id, activeSectionId, product.status)}
                            onEdit={(product: Product) => openModal('editProduct', { product })}
                            onDelete={(product: Product) => openModal('deleteProduct', { product })}
                        />
                    )}
                </div>

                {renderFab()}
            </div>
        </DragDropContext>
    );
};