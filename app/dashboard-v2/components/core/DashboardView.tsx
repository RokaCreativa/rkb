/**
 * @file DashboardView.tsx
 * @description Orquestador principal para la vista de escritorio.
 * @architecture
 * Este componente es un orquestador que consume `dashboardStore` y pasa datos y acciones
 * a los componentes `GridView` hijos. Se usan funciones anónimas para adaptar las acciones
 * del store a las props que esperan los hijos, resolviendo discrepancias de tipos.
 * Se ha añadido lógica para renderizar condicionalmente las columnas y adaptar la grilla
 * de forma dinámica para una mejor UX.
 */
'use client';

import React, { useMemo, useEffect } from 'react';
import { useDashboardStore } from '@/app/dashboard-v2/stores/dashboardStore';
import { useModalState } from '@/app/dashboard-v2/hooks/ui/useModalState';
import { CategoryGridView } from '../domain/categories/CategoryGridView';
import { SectionGridView } from '../domain/sections/SectionGridView';
import { ProductGridView } from '../domain/products/ProductGridView';
import { EditCategoryModal, EditSectionModal, EditProductModal } from '../modals/EditModals';
import { DeleteConfirmationModal } from '../modals/DeleteConfirmationModal';
import { Category, Section, Product } from '@/app/dashboard-v2/types';

export const DashboardView: React.FC = () => {
  const store = useDashboardStore();

  const { modalState, openModal, closeModal, handleDeleteItem, handleConfirmDelete } = useModalState();

  useEffect(() => {
    if (store.selectedCategoryId) store.fetchSectionsByCategory(store.selectedCategoryId);
  }, [store.selectedCategoryId, store.fetchSectionsByCategory]);

  useEffect(() => {
    if (store.selectedSectionId) store.fetchProductsBySection(store.selectedSectionId);
  }, [store.selectedSectionId, store.fetchProductsBySection]);

  const visibleSections = useMemo(() => store.selectedCategoryId ? store.sections[store.selectedCategoryId] || [] : [], [store.sections, store.selectedCategoryId]);
  const visibleProducts = useMemo(() => store.selectedSectionId ? store.products[store.selectedSectionId] || [] : [], [store.products, store.selectedSectionId]);

  if (!store.client) return <div className="p-8 text-center">Cargando cliente...</div>;

  // Determinar dinámicamente las columnas de la grilla para un layout adaptable.
  const gridColsClass = store.selectedSectionId
    ? 'lg:grid-cols-3' // 3 columnas si hay categoría y sección seleccionadas
    : store.selectedCategoryId
      ? 'lg:grid-cols-2' // 2 columnas si solo hay categoría seleccionada
      : ''; // La categoría ocupará todo el ancho por defecto

  return (
    <div className="flex-1 p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className={`grid grid-cols-1 ${gridColsClass} gap-6 h-full items-start`}>
        {/* Columna de Categorías (siempre visible) */}
        <div className={!store.selectedCategoryId ? 'lg:col-span-full' : ''}>
          <CategoryGridView
            categories={store.categories}
            onCategorySelect={(cat) => store.setSelectedCategoryId(cat.category_id)}
            onToggleVisibility={(cat) => store.toggleCategoryVisibility(cat.category_id, cat.status)}
            onEdit={(cat) => openModal('editCategory', cat)}
            onDelete={(cat) => handleDeleteItem(cat, 'category')}
            onAddNew={() => openModal('editCategory', null)}
          />
        </div>

        {/* Columna de Secciones (visible si se selecciona una categoría) */}
        {store.selectedCategoryId && (
          <div className={!store.selectedSectionId && store.selectedCategoryId ? 'lg:col-span-1' : ''}>
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

        {/* Columna de Productos (visible si se selecciona una sección) */}
        {store.selectedSectionId && (
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

export default DashboardView; 
