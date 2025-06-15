/**
 * 🧭 MIGA DE PAN CONTEXTUAL: Wrapper Orquestador del Dashboard de Escritorio
 *
 * 📍 UBICACIÓN: app/dashboard-v2/components/core/DashboardViewWrapper.tsx
 *
 * 🎯 PORQUÉ EXISTE:
 * Este componente es el verdadero orquestador de la vista de escritorio. Envuelve a todos los
 * componentes GridView y maneja la derivación de datos del estado global (Zustand) para
 * pasarlos como props a los componentes de presentación "tontos". Su existencia resuelve
 * problemas de renderizado y lógica de datos que existían en versiones anteriores.
 *
 * 🔄 FLUJO DE DATOS:
 * 1. `useDashboardStore`: Obtiene el estado crudo (categorías, secciones, productos, selecciones).
 * 2. `useMemo` (directProductsForCategory, sectionsForCategory): Filtra y separa los datos crudos en listas limpias.
 * 3. `JSX Render`: Pasa las listas limpias como props a `CategoryGridView` y `MixedContentView`.
 * 4. `CategoryGridView` recibe `directProductsForCategory` y los muestra en el panel izquierdo.
 * 5. `MixedContentView` recibe `sectionsForCategory` y muestra las secciones en el panel derecho.
 *
 * 🔗 CONEXIONES DIRECTAS:
 * - ENTRADA: Es renderizado por `app/dashboard/page.tsx`.
 * - ESTADO: `useDashboardStore` (Zustand).
 * - HIJOS: `CategoryGridView`, `MixedContentView`, `ProductGridView`, `EditModals`.
 *
 * 🚨 PROBLEMA RESUELTO (Esta sesión):
 * - **BUG:** Los "Productos Directos" se mostraban duplicados: en el panel de categorías (izq) y en el panel de contenido (der).
 * - **CAUSA RAÍZ:** Un `useMemo` llamado `mixedContent` combinaba erróneamente secciones y productos directos en una sola lista que se pasaba al panel derecho.
 * - **SOLUCIÓN:** Se eliminó `mixedContent`. Se crearon dos `useMemo` separados (`sectionsForCategory` y `directProductsForCategory`). Cada lista se pasa ahora al componente correcto, eliminando la duplicación.
 * - FECHA RESOLUCIÓN: 2024-07-17
 *
 * ⚠️ REGLAS DE NEGOCIO:
 * - `CategoryGridView` es responsable de mostrar la lista de categorías Y los productos directos de la categoría seleccionada.
 * - `MixedContentView` (usado aquí como un visualizador de secciones) es responsable de mostrar SÓLO las secciones de la categoría seleccionada.
 * - `ProductGridView` es responsable de mostrar los productos de la sección seleccionada.
 *
 * 📊 PERFORMANCE:
 * - Se usan selectores de Zustand optimizados y hooks `useMemo` para prevenir re-renders innecesarios.
 * - La carga de datos es reactiva (`useEffect`) a la selección del usuario.
 */
'use client';

import React, { useMemo, useEffect } from 'react';
import { useDashboardStore } from '@/app/dashboard-v2/stores/dashboardStore';
import { useDashboardLayout } from '@/app/dashboard-v2/hooks/ui/useDashboardLayout';
import { useModalState } from '@/app/dashboard-v2/hooks/ui/useModalState';
import { CategoryGridView } from '../domain/categories/CategoryGridView';
import { SectionGridView } from '../domain/sections/SectionGridView';
import { ProductGridView } from '../domain/products/ProductGridView';
import { MixedContentView } from '../views/MixedContentView';
import { EditCategoryModal, EditSectionModal, EditProductModal } from '../modals/EditModals';
import { DeleteConfirmationModal } from '../modals/DeleteConfirmationModal';
import { Category, Section, Product } from '@/app/dashboard-v2/types';
import { useModalStore } from '@/app/dashboard-v2/hooks/ui/state/useModalStore';

export const DashboardViewWrapper: React.FC = () => {
    // 🧭 MIGA DE PAN CRÍTICO: CONSOLIDACIÓN DE SELECTORES PARA EVITAR BUCLES INFINITOS
    // PROBLEMA RESUELTO: Múltiples llamadas a useDashboardStore causaban bucles infinitos en React 19
    // SOLUCIÓN: Un solo selector que obtiene todo el estado necesario de una vez
    // CONEXIÓN: Patrón recomendado por Zustand para React 19 + Concurrent Features
    const {
        client,
        categories,
        sections,
        products,
        selectedCategoryId,
        selectedSectionId,
        setSelectedCategoryId,
        setSelectedSectionId,
        toggleCategoryVisibility,
        toggleSectionVisibility,
        toggleProductVisibility,
        fetchDataForCategory,
        fetchProductsBySection
    } = useDashboardStore();

    const { gridColsClass, categoryColClass, shouldShowSections, shouldShowProducts } = useDashboardLayout();
    const { modalState, openModal, closeModal, handleDeleteItem, handleConfirmDelete } = useModalState();

    // 🧭 MIGA DE PAN: Obtener nombre de categoría seleccionada para UX contextual
    const selectedCategory = useMemo(() =>
        selectedCategoryId ? categories.find(c => c.category_id === selectedCategoryId) : null,
        [categories, selectedCategoryId]
    );

    /**
     * 🧭 MIGA DE PAN (BUG-FIX): Separación de datos para eliminar duplicación
     * PROBLEMA: `mixedContent` combinaba secciones y productos, causando que los productos
     * aparecieran tanto en el panel izquierdo (CategoryGridView) como en el derecho (MixedContentView).
     * SOLUCIÓN: Creamos dos listas memoizadas separadas.
     *  - `directProductsForCategory`: solo productos directos, para el panel izquierdo.
     *  - `sectionsForCategory`: solo secciones, para el panel derecho.
     * CONEXIÓN: `CategoryGridView` consume `directProductsForCategory`. `MixedContentView` consume `sectionsForCategory`.
     */
    const directProductsForCategory = useMemo(() => {
        if (!selectedCategoryId) return [];
        return (products[`cat-${selectedCategoryId}`] || [])
            .filter(product => product.category_id === selectedCategoryId && product.section_id === null)
            .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    }, [selectedCategoryId, products]);

    const sectionsForCategory = useMemo(() => {
        if (!selectedCategoryId) return [];
        return (sections[selectedCategoryId] || [])
            .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    }, [selectedCategoryId, sections]);

    /**
     * 🧭 MIGA DE PAN CONTEXTUAL: Effect para auto-detección inteligente T31
     * PORQUÉ: Este effect se dispara cuando el usuario selecciona una categoría.
     * FLUJO: Llama a `fetchDataForCategory`, que a su vez carga tanto las secciones como los
     * productos (directos y de sección) para esa categoría, poblando el store.
     * CONEXIÓN: `CategoryGridView.onCategorySelect` -> `setSelectedCategoryId` -> Este effect.
     */
    useEffect(() => {
        if (selectedCategoryId) {
            fetchDataForCategory(selectedCategoryId);
        }
    }, [selectedCategoryId, fetchDataForCategory]);

    /**
     * 🧭 MIGA DE PAN CONTEXTUAL: Effect para cargar productos cuando se selecciona sección
     * PORQUÉ: En vista escritorio, seleccionar sección debe mostrar productos inmediatamente
     * CONEXIÓN: SectionGridView.onSectionSelect → store.setSelectedSectionId → este effect
     * PROBLEMA RESUELTO: Faltaba en el wrapper original, causando que no se cargaran productos
     */
    useEffect(() => {
        if (selectedSectionId) {
            fetchProductsBySection(selectedSectionId);
        }
    }, [selectedSectionId, fetchProductsBySection]);

    // 🧭 MIGA DE PAN: Memoización optimizada para re-renders en listas grandes
    const visibleSections = useMemo(() =>
        selectedCategoryId ? sections[selectedCategoryId] || [] : [],
        [sections, selectedCategoryId]
    );

    // 🧭 MIGA DE PAN: Productos híbridos T31 - soporta tradicionales y directos
    // PORQUÉ: Necesario para mostrar productos tanto de secciones como directos de categorías
    // CONEXIÓN: useCategoryProducts hook maneja la lógica híbrida automáticamente
    // FLUJO: Si hay sectionId → productos tradicionales, si no → productos directos de categoría
    const visibleProducts = useMemo(() => {
        if (selectedSectionId) {
            // Caso 1: Productos tradicionales de una sección específica
            return products[selectedSectionId] || [];
        } else if (selectedCategoryId) {
            // Caso 2: Productos directos de una categoría (T31)
            return products[`cat-${selectedCategoryId}`] || [];
        }
        return [];
    }, [products, selectedSectionId, selectedCategoryId]);

    if (!client) return <div className="p-8 text-center">Cargando cliente...</div>;

    return (
        <div className="flex-1 p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
            <div className={`grid grid-cols-1 ${gridColsClass} gap-6 h-full items-start`}>
                {/* 🧭 MIGA DE PAN: Columna de Categorías y Productos Directos */}
                {/* ROL: Muestra la lista maestra de categorías. Si una se selecciona, también renderiza
                    la lista de productos directos para ESA categoría usando la prop `directProducts`. */}
                <div className={categoryColClass}>
                    <CategoryGridView
                        categories={categories}
                        directProducts={directProductsForCategory}
                        onCategorySelect={(cat) => setSelectedCategoryId(cat.category_id)}
                        onToggleVisibility={(cat) => toggleCategoryVisibility(cat.category_id, !cat.status)}
                        onEdit={(cat) => openModal('editCategory', cat)}
                        onDelete={(cat) => handleDeleteItem(cat, 'category')}
                        onAddNew={() => openModal('editCategory', null)}
                        onAddProductDirect={() => {
                            if (selectedCategoryId) {
                                openModal('editProductDirect', null);
                            }
                        }}
                        selectedCategoryId={selectedCategoryId}
                        onProductEdit={(product: Product) => openModal('editProductDirect', product)}
                        onProductDelete={(product: Product) => handleDeleteItem(product, 'product')}
                        onProductToggleVisibility={(product: Product) => toggleProductVisibility(product.product_id, !product.status)}
                    />
                </div>

                {/* 🧭 MIGA DE PAN: Columna de Secciones (usando MixedContentView) */}
                {/* ROL: Muestra el contenido de la categoría seleccionada. Tras el FIX, solo se le
                    pasan las secciones, por lo que actúa como un visualizador de secciones. */}
                {shouldShowSections && (
                    <div className="min-w-0 flex-1">
                        <MixedContentView
                            items={sectionsForCategory.map(s => ({ ...s, itemType: 'section' }))}
                            categoryName={selectedCategory?.name}
                            onSectionSelect={(section: Section) => setSelectedSectionId(section.section_id)}
                            onSectionEdit={(section: Section) => openModal('editSection', section)}
                            onSectionDelete={(section: Section) => handleDeleteItem(section, 'section')}
                            onSectionToggleVisibility={(section: Section) => toggleSectionVisibility(section.section_id, !section.status)}
                            onProductEdit={(product: Product) => openModal('editProductDirect', product)}
                            onProductDelete={(product: Product) => handleDeleteItem(product, 'product')}
                            onProductToggleVisibility={(product: Product) => toggleProductVisibility(product.product_id, !product.status)}
                            onAddSection={() => {
                                if (selectedCategoryId) {
                                    openModal('editSection', null);
                                }
                            }}
                            onAddProduct={() => {
                                if (selectedSectionId) {
                                    openModal('editProduct', null);
                                }
                            }}
                            isSectionSelected={!!selectedSectionId}
                        />
                    </div>
                )}

                {/* 🧭 MIGA DE PAN: Columna de Productos Tradicionales */}
                {/* ROL: Solo se muestra cuando se ha seleccionado una sección. Muestra los productos
                    que pertenecen a ESA sección específica. */}
                {shouldShowProducts && selectedSectionId && (
                    <div className="min-w-0 flex-1">
                        <ProductGridView
                            products={visibleProducts}
                            onToggleVisibility={(product: Product) => toggleProductVisibility(product.product_id, !product.status)}
                            onEdit={(product: Product) => openModal('editProduct', product)}
                            onDelete={(product: Product) => handleDeleteItem(product, 'product')}
                            onAddNew={() => {
                                if (selectedSectionId) {
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
                clientId={client?.id}
            />
            <EditSectionModal
                isOpen={modalState.type === 'editSection'}
                onClose={closeModal}
                section={modalState.data as Section | null}
                categoryId={selectedCategoryId ?? undefined}
            />
            <EditProductModal
                isOpen={modalState.type === 'editProduct'}
                onClose={closeModal}
                product={modalState.data as Product | null}
                sectionId={selectedSectionId ?? undefined}
            />
            {/* 🧭 MIGA DE PAN: Modal para productos directos T31 */}
            {/* PORQUÉ SEPARADO: Productos directos requieren categoryId en lugar de sectionId */}
            {/* CONEXIÓN: openModal('editProductDirect') → este modal → createProductDirect */}
            <EditProductModal
                isOpen={modalState.type === 'editProductDirect'}
                onClose={closeModal}
                product={modalState.data as Product | null}
                categoryId={selectedCategoryId ?? undefined}
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