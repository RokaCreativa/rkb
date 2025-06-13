/**
 * 🧭 MIGA DE PAN CONTEXTUAL: Wrapper para DashboardView que corrige anomalía visual
 * PORQUÉ NECESARIO: DashboardView.tsx es inmutable (regla crítica), pero tiene lógica de grid incorrecta
 * PROBLEMA RESUELTO: Grid cambia de 1→2→3 columnas causando "salto visual" de secciones
 * CONEXIÓN: page.tsx debe usar este wrapper en lugar de DashboardView directamente
 * DECISIÓN ARQUITECTÓNICA: Layout consistente desde el primer render
 */
'use client';

import React, { useMemo, useEffect } from 'react';
import { useDashboardStore } from '@/app/dashboard-v2/stores/dashboardStore';
import { useDashboardLayout } from '@/app/dashboard-v2/hooks/ui/useDashboardLayout';
import { useModalState } from '@/app/dashboard-v2/hooks/ui/useModalState';
import { CategoryGridView } from '../domain/categories/CategoryGridView';
import { SectionGridView } from '../domain/sections/SectionGridView';
import { ProductGridView } from '../domain/products/ProductGridView';
import { EditCategoryModal, EditSectionModal, EditProductModal } from '../modals/EditModals';
import { DeleteConfirmationModal } from '../modals/DeleteConfirmationModal';
import { Category, Section, Product } from '@/app/dashboard-v2/types';

export const DashboardViewWrapper: React.FC = () => {
    const store = useDashboardStore();
    const { gridColsClass, categoryColClass, shouldShowSections, shouldShowProducts } = useDashboardLayout();
    const { modalState, openModal, closeModal, handleDeleteItem, handleConfirmDelete } = useModalState();

    /**
     * 🧭 MIGA DE PAN CONTEXTUAL: Effect para cargar secciones cuando se selecciona categoría
     * PORQUÉ NECESARIO: Vista escritorio usa master-detail, necesita cargar secciones automáticamente
     * CONEXIÓN: store.setSelectedCategoryId() en CategoryGridView.onCategorySelect dispara este effect
     * PROBLEMA RESUELTO: Faltaba en el wrapper original, causando que no se cargaran secciones
     */
    useEffect(() => {
        if (store.selectedCategoryId) {
            store.fetchSectionsByCategory(store.selectedCategoryId);
        }
    }, [store.selectedCategoryId, store.fetchSectionsByCategory]);

    /**
     * 🧭 MIGA DE PAN CONTEXTUAL: Effect para cargar productos cuando se selecciona sección
     * PORQUÉ: En vista escritorio, seleccionar sección debe mostrar productos inmediatamente
     * CONEXIÓN: SectionGridView.onSectionSelect → store.setSelectedSectionId → este effect
     * PROBLEMA RESUELTO: Faltaba en el wrapper original, causando que no se cargaran productos
     */
    useEffect(() => {
        if (store.selectedSectionId) {
            store.fetchProductsBySection(store.selectedSectionId);
        }
    }, [store.selectedSectionId, store.fetchProductsBySection]);

    // Memoización para optimizar re-renders en listas grandes
    const visibleSections = useMemo(() =>
        store.selectedCategoryId ? store.sections[store.selectedCategoryId] || [] : [],
        [store.sections, store.selectedCategoryId]
    );

    const visibleProducts = useMemo(() =>
        store.selectedSectionId ? store.products[store.selectedSectionId] || [] : [],
        [store.products, store.selectedSectionId]
    );

    if (!store.client) return <div className="p-8 text-center">Cargando cliente...</div>;

    return (
        <div className="flex-1 p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
            <div className={`grid grid-cols-1 ${gridColsClass} gap-6 h-full items-start`}>
                {/* Columna de Categorías (siempre visible) */}
                <div className={categoryColClass}>
                    <CategoryGridView
                        categories={store.categories}
                        onCategorySelect={(cat) => store.setSelectedCategoryId(cat.category_id)}
                        onToggleVisibility={(cat) => store.toggleCategoryVisibility(cat.category_id, cat.status)}
                        onEdit={(cat) => openModal('editCategory', cat)}
                        onDelete={(cat) => handleDeleteItem(cat, 'category')}
                        onAddNew={() => openModal('editCategory', null)}
                    />
                </div>

                {/* Columna de Secciones (cuando hay categoría seleccionada) */}
                {shouldShowSections && (
                    <div>
                        <SectionGridView
                            sections={visibleSections}
                            onSectionSelect={(section: Section) => store.setSelectedSectionId(section.section_id)}
                            onToggleVisibility={(section: Section) => store.toggleSectionVisibility(section.section_id, section.status)}
                            onEdit={(section: Section) => openModal('editSection', section)}
                            onDelete={(section: Section) => handleDeleteItem(section, 'section')}
                            onAddNew={() => {
                                if (store.selectedCategoryId) {
                                    openModal('editSection', null);
                                }
                            }}
                        />
                    </div>
                )}

                {/* Columna de Productos (cuando hay sección seleccionada) */}
                {shouldShowProducts && (
                    <div className="min-w-0 flex-1">
                        <ProductGridView
                            products={visibleProducts}
                            onToggleVisibility={(product: Product) => store.toggleProductVisibility(product.product_id, product.status)}
                            onEdit={(product: Product) => openModal('editProduct', product)}
                            onDelete={(product: Product) => handleDeleteItem(product, 'product')}
                            onAddNew={() => {
                                if (store.selectedSectionId) {
                                    openModal('editProduct', null);
                                }
                            }}
                        />
                    </div>
                )}
            </div>

            {/* --- Modales --- */}
            <EditCategoryModal
                isOpen={modalState.type === 'editCategory'}
                onClose={closeModal}
                category={modalState.data as Category | null}
                clientId={store.client.id}
            />
            <EditSectionModal
                isOpen={modalState.type === 'editSection'}
                onClose={closeModal}
                section={modalState.data as Section | null}
                categoryId={store.selectedCategoryId ?? undefined}
            />
            <EditProductModal
                isOpen={modalState.type === 'editProduct'}
                onClose={closeModal}
                product={modalState.data as Product | null}
                sectionId={store.selectedSectionId ?? undefined}
            />
            <DeleteConfirmationModal
                isOpen={modalState.type === 'delete'}
                onClose={closeModal}
                onConfirm={handleConfirmDelete}
                itemType={modalState.itemType || ''}
            />
        </div>
    );
};

export default DashboardViewWrapper; 