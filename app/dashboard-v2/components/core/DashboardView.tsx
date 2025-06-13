/**
 * 🧭 MIGA DE PAN CONTEXTUAL: Orquestador principal para la vista de ESCRITORIO (master-detail)
 * 
 * PORQUÉ EXISTE: Separación clara entre navegación móvil (drill-down) y escritorio (master-detail)
 * ARQUITECTURA CRÍTICA: Este componente NO maneja estado, solo orquesta la comunicación entre:
 * - dashboardStore.ts: Estado global y lógica de negocio
 * - GridView components: Presentación de datos en formato tabla/grid
 * - useModalState.tsx: Gestión de modales para CRUD operations
 * 
 * CONEXIONES CRÍTICAS:
 * - page.tsx línea ~25: <DashboardClient> → DashboardView (solo en escritorio)
 * - MobileView.tsx: Contraparte móvil con navegación drill-down
 * - CategoryGridView, SectionGridView, ProductGridView: Componentes hijos especializados
 * 
 * DECISIÓN ARQUITECTÓNICA: Layout adaptativo con CSS Grid que cambia columnas según contexto:
 * - Sin selección: 1 columna (solo categorías)
 * - Categoría simple: 2 columnas (categorías + productos directos)
 * - Categoría compleja: 2-3 columnas (categorías + secciones + productos)
 * 
 * FLUJO DE DATOS: store → hooks → memoized data → GridView props → UI
 */
'use client';

import React, { useMemo, useEffect } from 'react';
import { useDashboardStore, useCategoryDisplayMode, useCategoryProducts } from '@/app/dashboard-v2/stores/dashboardStore';
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

  /**
   * 🧭 MIGA DE PAN CONTEXTUAL: Effect para cargar secciones cuando se selecciona categoría
   * PORQUÉ NECESARIO: Vista escritorio usa master-detail, necesita cargar secciones automáticamente
   * CONEXIÓN: store.setSelectedCategoryId() en CategoryGridView.onCategorySelect dispara este effect
   * DECISIÓN: Se cambió de fetchDataForCategory a fetchSectionsByCategory para navegación tradicional
   * PROBLEMA RESUELTO: Auto-detección causaba comportamiento inconsistente en escritorio
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
   * FLUJO: CategoryGrid → SectionGrid → ProductGrid (master-detail tradicional)
   */
  useEffect(() => {
    if (store.selectedSectionId) store.fetchProductsBySection(store.selectedSectionId);
  }, [store.selectedSectionId, store.fetchProductsBySection]);

  // 🧭 MIGA DE PAN: Hooks de auto-detección para renderizado condicional (SOLO para UI, no navegación)
  const categoryDisplayMode = useCategoryDisplayMode(store.selectedCategoryId);
  const categoryProducts = useCategoryProducts(store.selectedCategoryId, store.selectedSectionId);

  // Memoización para optimizar re-renders en listas grandes
  const visibleSections = useMemo(() => store.selectedCategoryId ? store.sections[store.selectedCategoryId] || [] : [], [store.sections, store.selectedCategoryId]);
  const visibleProducts = useMemo(() => store.selectedSectionId ? store.products[store.selectedSectionId] || [] : [], [store.products, store.selectedSectionId]);

  if (!store.client) return <div className="p-8 text-center">Cargando cliente...</div>;

  // 🧭 MIGA DE PAN CONTEXTUAL: Lógica de layout adaptativo para CSS Grid
  const isSimpleCategory = categoryDisplayMode === 'simple';
  const isSectionsCategory = categoryDisplayMode === 'sections';

  /**
   * DECISIÓN UX CRÍTICA: Layout dinámico según contexto de selección
   * PORQUÉ COMPLEJO: Diferentes tipos de categorías requieren diferentes layouts
   * - Sin selección: Categorías ocupan todo el ancho (mejor UX para selección inicial)
   * - Categoría simple: 2 columnas (categorías + productos, sin secciones intermedias)
   * - Categoría compleja: 2-3 columnas (categorías + secciones + productos opcionales)
   * CONEXIÓN: Se aplica en className del grid container principal
   */
  const gridColsClass = (() => {
    if (isSimpleCategory && store.selectedCategoryId) {
      return 'lg:grid-cols-2';
    }
    if (isSectionsCategory) {
      return store.selectedSectionId
        ? 'lg:grid-cols-3' // 3 columnas: categorías + secciones + productos
        : store.selectedCategoryId
          ? 'lg:grid-cols-2' // 2 columnas: categorías + secciones
          : '';
    }
    return ''; // 1 columna por defecto
  })();

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

        {/* 🎯 T32.2 - RENDERIZADO ADAPTATIVO: Mostrar Secciones SIEMPRE para permitir gestión */}
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

        {/* 🎯 T32.2 - PRODUCTOS DIRECTOS: Para categorías simples, mostrar productos cuando hay sección seleccionada */}
        {store.selectedCategoryId && isSimpleCategory && store.selectedSectionId && (
          <div className="min-w-0 flex-1">
            <ProductGridView
              products={categoryProducts}
              onToggleVisibility={(product: Product) => store.toggleProductVisibility(product.product_id, product.status)}
              onEdit={(product: Product) => openModal('editProduct', product)}
              onDelete={(product: Product) => handleDeleteItem(product, 'product')}
              onAddNew={() => {
                if (store.selectedCategoryId) {
                  openModal('editProduct', null);
                }
              }}
            />
          </div>
        )}

        {/* 🎯 T32.2 - PRODUCTOS TRADICIONALES: Para categorías complejas con sección seleccionada */}
        {store.selectedSectionId && isSectionsCategory && (
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
