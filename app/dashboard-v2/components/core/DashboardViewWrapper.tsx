/**
 * 🧭 MIGA DE PAN CONTEXTUAL: Wrapper para DashboardView que corrige anomalía visual
 * PORQUÉ NECESARIO: DashboardView.tsx es inmutable (regla crítica), pero tiene lógica de grid incorrecta
 * PROBLEMA RESUELTO: Grid cambia de 1→2→3 columnas causando "salto visual" de secciones
 * CONEXIÓN: page.tsx debe usar este wrapper en lugar de DashboardView directamente
 * DECISIÓN ARQUITECTÓNICA: Layout consistente desde el primer render
 */
'use client';

import React, { useMemo, useEffect } from 'react';
import { useDashboardStore, useMixedContentForCategory } from '@/app/dashboard-v2/stores/dashboardStore';
import { useDashboardLayout } from '@/app/dashboard-v2/hooks/ui/useDashboardLayout';
import { useModalState } from '@/app/dashboard-v2/hooks/ui/useModalState';
import { CategoryGridView } from '../domain/categories/CategoryGridView';
import { SectionGridView } from '../domain/sections/SectionGridView';
import { ProductGridView } from '../domain/products/ProductGridView';
import { MixedContentView } from '../views/MixedContentView';
import { EditCategoryModal, EditSectionModal, EditProductModal } from '../modals/EditModals';
import { DeleteConfirmationModal } from '../modals/DeleteConfirmationModal';
import { Category, Section, Product } from '@/app/dashboard-v2/types';

export const DashboardViewWrapper: React.FC = () => {
    const store = useDashboardStore();
    const { gridColsClass, categoryColClass, shouldShowSections, shouldShowProducts } = useDashboardLayout();
    const { modalState, openModal, closeModal, handleDeleteItem, handleConfirmDelete } = useModalState();
    
    // 🧭 MIGA DE PAN: Hook para contenido mixto T31 (FASE 1.2)
    // PORQUÉ: Obtiene secciones y productos directos combinados para jerarquía híbrida
    // CONEXIÓN: useMixedContentForCategory → MixedContentView
    const mixedContent = useMixedContentForCategory(store.selectedCategoryId);
    
    // 🧭 MIGA DE PAN: Obtener nombre de categoría seleccionada para UX contextual
    const selectedCategory = useMemo(() => 
        store.selectedCategoryId ? store.categories.find(c => c.category_id === store.selectedCategoryId) : null,
        [store.categories, store.selectedCategoryId]
    );

    /**
     * 🧭 MIGA DE PAN CONTEXTUAL: Effect para auto-detección inteligente T31 (FASE 1.1)
     * PORQUÉ CAMBIO: fetchDataForCategory es la función MAESTRA que decide automáticamente:
     * - Si categoría es "simple" → carga productos directos (T31)
     * - Si categoría es "sections" → carga secciones tradicionales
     * CONEXIÓN: store.setSelectedCategoryId() → este effect → fetchDataForCategory → auto-detección
     * PROBLEMA RESUELTO: Antes solo cargaba secciones, ahora maneja jerarquía híbrida T31
     * ARQUITECTURA: Implementa el patrón de auto-detección del Ultra Mega Checklist
     */
    useEffect(() => {
        if (store.selectedCategoryId) {
            store.fetchDataForCategory(store.selectedCategoryId);
        }
    }, [store.selectedCategoryId, store.fetchDataForCategory]);

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

    // 🧭 MIGA DE PAN: Memoización optimizada para re-renders en listas grandes
    const visibleSections = useMemo(() =>
        store.selectedCategoryId ? store.sections[store.selectedCategoryId] || [] : [],
        [store.sections, store.selectedCategoryId]
    );

    // 🧭 MIGA DE PAN: Productos híbridos T31 - soporta tradicionales y directos
    // PORQUÉ: Necesario para mostrar productos tanto de secciones como directos de categorías
    // CONEXIÓN: useCategoryProducts hook maneja la lógica híbrida automáticamente
    // FLUJO: Si hay sectionId → productos tradicionales, si no → productos directos de categoría
    const visibleProducts = useMemo(() => {
        if (store.selectedSectionId) {
            // Caso 1: Productos tradicionales de una sección específica
            return store.products[store.selectedSectionId] || [];
        } else if (store.selectedCategoryId) {
            // Caso 2: Productos directos de una categoría (T31)
            return store.products[`cat-${store.selectedCategoryId}`] || [];
        }
        return [];
    }, [store.products, store.selectedSectionId, store.selectedCategoryId]);

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
                        {/* 🎯 SOLUCIÓN v0.dev: Nuevas props para productos directos en categorías */}
                        onAddProductDirect={() => {
                            if (store.selectedCategoryId) {
                                openModal('editProductDirect', null);
                            }
                        }}
                        selectedCategoryId={store.selectedCategoryId}
                    />
                </div>

                {/* 🧭 MIGA DE PAN: Columna Mixta T31 (FASE 1.2) - Reemplaza secciones y productos separados */}
                {/* PORQUÉ: Jerarquía híbrida requiere mostrar secciones y productos directos juntos */}
                {/* CONEXIÓN: shouldShowSections determina cuándo mostrar contenido mixto */}
                {shouldShowSections && (
                    <div className="min-w-0 flex-1">
                        <MixedContentView
                            items={mixedContent}
                            categoryName={selectedCategory?.name}
                            onSectionSelect={(section: Section) => store.setSelectedSectionId(section.section_id)}
                            onSectionEdit={(section: Section) => openModal('editSection', section)}
                            onSectionDelete={(section: Section) => handleDeleteItem(section, 'section')}
                            onSectionToggleVisibility={(section: Section) => store.toggleSectionVisibility(section.section_id, section.status)}
                            onProductEdit={(product: Product) => openModal('editProductDirect', product)}
                            onProductDelete={(product: Product) => handleDeleteItem(product, 'product')}
                            onProductToggleVisibility={(product: Product) => store.toggleProductVisibility(product.product_id, product.status)}
                            onAddSection={() => {
                                if (store.selectedCategoryId) {
                                    openModal('editSection', null);
                                }
                            }}
                            onAddProductDirect={() => {
                                if (store.selectedCategoryId) {
                                    openModal('editProductDirect', null);
                                }
                            }}
                        />
                    </div>
                )}

                {/* 🧭 MIGA DE PAN: Columna de Productos Tradicionales (solo cuando hay sección seleccionada) */}
                {/* PORQUÉ: Mantiene flujo tradicional categoría → sección → productos */}
                {shouldShowProducts && store.selectedSectionId && (
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
                            title="Gestionar Productos"
                            subtitle="Productos de la sección seleccionada"
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
            {/* 🧭 MIGA DE PAN: Modal para productos directos T31 */}
            {/* PORQUÉ SEPARADO: Productos directos requieren categoryId en lugar de sectionId */}
            {/* CONEXIÓN: openModal('editProductDirect') → este modal → createProductDirect */}
            <EditProductModal
                isOpen={modalState.type === 'editProductDirect'}
                onClose={closeModal}
                product={modalState.data as Product | null}
                categoryId={store.selectedCategoryId ?? undefined}
                isDirect={true}
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