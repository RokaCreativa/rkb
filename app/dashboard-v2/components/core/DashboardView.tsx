/**
 * @file DashboardView.tsx
 * @description Orquestador principal para la vista de escritorio del dashboard.
 * @architecture
 * Este componente es el corazón de la nueva arquitectura "Master-Detail" de escritorio.
 * Su responsabilidad ha sido refactorizada para ser únicamente un **orquestador de vistas**,
 * cumpliendo con el Mandamiento #6 (Separación de Responsabilidades). No contiene lógica de negocio.
 *
 * @workflow
 * 1.  **Obtiene Estado y Acciones:** Se suscribe al `dashboardStore` para obtener los arrays de datos
 *     (categorías, secciones, productos) y las acciones para cambiar el estado de selección
 *     (`setSelectedCategoryId`, `setSelectedSectionId`).
 * 2.  **Filtra Datos:** Utiliza `useMemo` para calcular eficientemente qué secciones y productos
 *     deben mostrarse (`visibleSections`, `visibleProducts`) basándose en los IDs seleccionados.
 * 3.  **Renderiza las Columnas:** Muestra hasta tres componentes `GridView` en un layout de columnas.
 *     La visibilidad de las columnas de "detalle" (`SectionGridView`, `ProductGridView`) es condicional,
 *     dependiendo de si se ha seleccionado un item en la columna "maestra" anterior.
 * 4.  **Gestiona Modales:** Utiliza el hook `useModalState` para manejar la apertura/cierre de
 *     todos los modales, pasando las funciones de apertura (`openModal`, `handleDeleteItem`)
 *     a los `GridView` hijos como props.
 *
 * @dependencies
 * - `dashboardStore`: Su fuente de verdad para todos los datos y el estado de selección.
 * - `useModalState`: Delega toda la gestión de la UI de los modales a este hook.
 * - `*GridView.tsx`: Los componentes "tontos" que se encargan de renderizar cada columna.
 */
'use client';

import React, { useMemo } from 'react';
import { useDashboardStore } from '@/app/dashboard-v2/stores/dashboardStore';
import { useModalState } from '@/app/dashboard-v2/hooks/ui/useModalState';
import { CategoryGridView } from '../domain/categories/CategoryGridView';
import { SectionGridView } from '../domain/sections/SectionGridView';
import { ProductGridView } from '../domain/products/ProductGridView';
import { EditCategoryModal, EditSectionModal, EditProductModal } from '../modals/EditModals';
import { DeleteConfirmationModal } from '../modals/DeleteConfirmationModal';
import { Category, Section, Product } from '@/app/dashboard-v2/types';

export const DashboardView: React.FC = () => {
  // --- STATE MANAGEMENT ---
  const {
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
  } = useDashboardStore();

  const {
    modalState,
    openModal,
    closeModal,
    handleDeleteItem,
    handleConfirmDelete,
  } = useModalState();

  // --- DATA FILTERING ---
  // Usamos useMemo para evitar recalcular estos arrays en cada render a menos que las dependencias cambien.
  const visibleSections = useMemo(() => {
    if (!selectedCategoryId) return [];
    return sections[selectedCategoryId] || [];
  }, [sections, selectedCategoryId]);

  const visibleProducts = useMemo(() => {
    if (!selectedSectionId) return [];
    return products[selectedSectionId] || [];
  }, [products, selectedSectionId]);


  // --- RENDER ---
  return (
    <div className="flex-1 p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full items-start">
        {/* COLUMNA 1: CATEGORÍAS */}
        <div className="lg:col-span-1 h-full">
          <CategoryGridView
            categories={categories}
            onCategorySelect={(category) => setSelectedCategoryId(category.category_id)}
            onToggleVisibility={toggleCategoryVisibility}
            onEdit={(category) => openModal('editCategory', category)}
            onDelete={(category) => handleDeleteItem(category, 'category')}
            onAddNew={() => openModal('editCategory', null)}
          />
        </div>

        {/* COLUMNA 2: SECCIONES (CONDICIONAL) */}
        <div className="lg:col-span-1 h-full">
          {selectedCategoryId && (
            <SectionGridView
              sections={visibleSections}
              onSectionSelect={(section) => setSelectedSectionId(section.section_id)}
              onToggleVisibility={toggleSectionVisibility}
              onEdit={(section) => openModal('editSection', section)}
              onDelete={(section) => handleDeleteItem(section, 'section')}
              onAddNew={() => openModal('editSection', null)}
            />
          )}
        </div>

        {/* COLUMNA 3: PRODUCTOS (CONDICIONAL) */}
        <div className="lg:col-span-1 h-full">
          {selectedSectionId && (
            <ProductGridView
              products={visibleProducts}
              onToggleVisibility={toggleProductVisibility}
              onEdit={(product) => openModal('editProduct', product)}
              onDelete={(product) => handleDeleteItem(product, 'product')}
              onAddNew={() => openModal('editProduct', null)}
            />
          )}
        </div>
      </div>

      {/* --- MODALES --- */}
      <EditCategoryModal
        isOpen={modalState.type === 'editCategory'}
        onClose={closeModal}
        category={modalState.data as Category | null}
      />
      <EditSectionModal
        isOpen={modalState.type === 'editSection'}
        onClose={closeModal}
        section={modalState.data as Section | null}
      />
      <EditProductModal
        isOpen={modalState.type === 'editProduct'}
        onClose={closeModal}
        product={modalState.data as Product | null}
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
