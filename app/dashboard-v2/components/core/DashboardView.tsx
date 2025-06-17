/**
 * 🧭 MIGA DE PAN CONTEXTUAL MAESTRA: Orquestador del Dashboard de Escritorio
 *
 * 📍 UBICACIÓN: app/dashboard-v2/components/core/DashboardView.tsx
 *
 * 🎯 PORQUÉ EXISTE:
 * Este componente es el "director de orquesta" de la vista de escritorio (Master-Detail de 3 columnas).
 * Su única responsabilidad es:
 * 1. Conectarse al `dashboardStore` para obtener el estado global.
 * 2. Procesar y derivar los datos brutos del store en listas listas para consumir por cada Grid.
 * 3. Pasar los datos procesados y los callbacks de acciones a los componentes de Grid "tontos".
 * NO contiene estado local (`useState`) para la lógica de negocio.
 *
 * 🔄 FLUJO DE DATOS:
 * 1. `useDashboardStore()`: Se suscribe al estado global (categorías, secciones, productos, selecciones).
 * 2. `useMemo` (Hooks de Derivación): Se utilizan varios `useMemo` para transformar los datos brutos del
 *    store en las listas específicas que cada Grid necesita, recalculando solo cuando los datos base cambian.
 *    - `grid1Items`: Combina categorías reales + productos directos globales.
 *    - `sectionsAndLocalProducts`: Combina secciones + productos directos locales de la categoría seleccionada.
 *    - `grid3Items`: Productos de la sección seleccionada.
 * 3. `Props Drilling` (Controlado): Pasa las listas y los manejadores de eventos (que llaman a acciones del store)
 *    a `CategoryGridView`, `SectionGridView` y `ProductGridView`.
 *
 * 🔗 CONEXIONES DIRECTAS:
 * - **Consume Estado de:** `useDashboardStore`.
 * - **Dispara Acciones en:** `useDashboardStore` (ej. `setSelectedCategoryId`) y `useModalState` (ej. `openModal`).
 * - **Renderiza Componentes Hijos:** `DashboardHeader`, `CategoryGridView`, `SectionGridView`, `ProductGridView`, y todos los `EditModals`.
 *
 * 🚨 PROBLEMA RESUELTO (Bitácora #13, #32):
 * - Se eliminó el `useState` local para manejar selecciones, que rompía el flujo de datos unidireccional y causaba una UI no responsiva.
 * - La lógica de derivación de datos con `useMemo` previene bucles infinitos en React 19 que ocurrían cuando el filtrado se hacía en el selector de Zustand.
 * - Se implementó la lógica para manejar la "Arquitectura Híbrida Definitiva" (Bitácora #35), mostrando correctamente las listas mixtas.
 *
 * ⚠️ REGLAS DE NEGOCIO:
 * - Los type guards (`'price' in item`) son cruciales en los manejadores de eventos para diferenciar entre los tipos de ítems en las listas mixtas.
 * - La lógica de `useMemo` es la ÚNICA fuente de verdad para el contenido de los grids.
 */

/**
 * 📜 Recordatorio del Mandamiento #7: Separación Absoluta de Lógica y Presentación
 * ---------------------------------------------------------------------------------
 * "Separarás estrictamente la lógica de la presentación. Los componentes UI serán tan
 * simples (‘tontos’) como sea posible. La lógica de negocio, manejo de datos y
 * efectos secundarios vivirán solo en hooks personalizados y librerías auxiliares (lib)."
 */
import React, { useMemo } from 'react';
import { useDashboardStore } from '@/app/dashboard-v2/stores/dashboardStore';
import { useModalState, ItemType } from '@/app/dashboard-v2/hooks/ui/useModalState';
import { Category, Section, Product } from '@/app/dashboard-v2/types';

import { DashboardHeader } from './DashboardHeader';
import { CategoryGridView } from '../domain/categories/CategoryGridView';
import { SectionGridView } from '../domain/sections/SectionGridView';
import { ProductGridView } from '../domain/products/ProductGridView';
import { EditCategoryModal, EditSectionModal, EditProductModal } from '../modals/EditModals';
import { DeleteConfirmationModal } from '../modals/DeleteConfirmationModal';

const DashboardView = () => {
  // =================================================================
  // 🧭 PASO 1: Conexión al Estado Global
  // Se obtiene todo el estado y las acciones necesarias del store central.
  // =================================================================
  const {
    client,
    categories,
    sections,
    products,
    isReorderMode,
    toggleReorderMode,
    toggleCategoryVisibility,
    toggleSectionVisibility,
    toggleProductVisibility,
    selectedCategoryId,
    selectedSectionId,
    setSelectedCategoryId,
    setSelectedSectionId,
    toggleShowcaseStatus,
  } = useDashboardStore();

  const { modalState, openModal, closeModal, handleConfirmDelete } = useModalState();

  // =================================================================
  // 🧭 PASO 2: Derivación de Datos con `useMemo` para cada Grid
  // Se procesan los datos brutos del store para crear las listas específicas.
  // 🚨 Patrón CRÍTICO para evitar bucles de renderizado en React 19 con Zustand.
  // =================================================================

  // 🧠 Lógica Memoizada para encontrar el ID de la Sección Global.
  // DEBE CALCULARSE PRIMERO porque grid1Items depende de él.
  const globalSectionId = useMemo(() => {
    const virtualCategory = categories.find((c) => c.is_virtual_category);
    if (!virtualCategory) return undefined;

    const allSections = Object.values(sections).flat();
    const virtualSection = allSections.find(
      (s) => s.category_id === virtualCategory.category_id
    );
    return virtualSection?.section_id;
  }, [categories, sections]);

  const allProducts = useMemo(() => Object.values(products).flat(), [products]);

  // 🧠 Memo para Grid 1: Categorías y Productos Globales
  const grid1Items = useMemo(() => {
    // 1. Obtener las categorías que no son virtuales.
    const realCategories = categories.filter((c) => !c.is_virtual_category);

    // 2. ✅ CORRECCIÓN: Obtener los productos globales filtrando por el ID de la sección virtual.
    const globalDirectProducts = allProducts.filter((p) => p.section_id === globalSectionId);

    // 3. Ordenar y combinar.
    return [...realCategories, ...globalDirectProducts].sort(
      (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)
    );
  }, [categories, allProducts, globalSectionId]);

  // 🧠 Memo para Grid 2: Secciones y Productos Locales
  const sectionsAndLocalProducts = useMemo(() => {
    if (!selectedCategoryId) return [];

    // Obtiene las secciones y productos directos para la categoría seleccionada.
    const sectionsForCategory = sections[selectedCategoryId] || [];
    const localDirectProducts = products[`cat-${selectedCategoryId}`] || [];

    // Combina y ordena.
    const combined = [...sectionsForCategory, ...localDirectProducts].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));

    return combined;
  }, [selectedCategoryId, sections, products]);

  // 🧠 Memo para Grid 3: Productos de una Sección
  const grid3Items: Product[] = useMemo(() => {
    if (!selectedSectionId) return [];
    return products[selectedSectionId] || [];
  }, [selectedSectionId, products]);

  // =================================================================
  // 🧭 PASO 3: Manejadores de Eventos
  // Delegan toda la lógica a las acciones del store o del hook de modales.
  // =================================================================

  const handleCategorySelect = (category: Category) => {
    const newId = selectedCategoryId === category.category_id ? null : category.category_id;
    setSelectedCategoryId(newId);
  };

  const handleSectionSelect = (section: Section) => {
    const newId = selectedSectionId === section.section_id ? null : section.section_id;
    setSelectedSectionId(newId);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50">
      <DashboardHeader />

      {/* ================================================================= */}
      {/* 🧭 PASO 4: Renderizado de Grids                                   */}
      {/* Se pasan los datos derivados y los manejadores a los componentes  */}
      {/* "tontos" que solo se encargan de pintar la UI.                  */}
      {/* ================================================================= */}
      <main className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 overflow-y-auto">

        {/* Grid 1: Categorías y Productos Globales */}
        <CategoryGridView
          items={grid1Items}
          selectedCategoryId={selectedCategoryId}
          onCategorySelect={handleCategorySelect}
          onProductSelect={() => { }} // Placeholder, productos directos no son seleccionables
          onToggleVisibility={(item) => {
            if ('price' in item) { // Es Producto
              toggleProductVisibility(item.product_id, !item.status);
            } else { // Es Categoría
              toggleCategoryVisibility(item.category_id, !item.status);
            }
          }}
          onEdit={(item) => {
            if ('price' in item) { // Es Producto
              openModal('editProduct', { item, isDirect: true, isGlobal: true });
            } else { // Es Categoría
              openModal('editCategory', { item });
            }
          }}
          onDelete={(item) => {
            if ('price' in item) { // Es Producto
              openModal('deleteConfirmation', { item, type: 'product' });
            } else { // Es Categoría
              openModal('deleteConfirmation', { item, type: 'category' });
            }
          }}
          onAddNewCategory={() => openModal('editCategory')}
          onAddNewProductDirect={() => openModal('editProduct', { isDirect: true, isGlobal: true })}
        />

        {/* Grid 2: Secciones y Productos Locales */}
        <SectionGridView
          sections={sectionsAndLocalProducts}
          title="Secciones"
          selectedSectionId={selectedSectionId}
          onSectionSelect={handleSectionSelect}
          onToggleVisibility={(item) => {
            if ('price' in item) { // Es Producto
              toggleProductVisibility(item.product_id, !item.status);
            } else { // Es Sección
              toggleSectionVisibility((item as Section).section_id, !item.status);
            }
          }}
          onEdit={(item) => {
            if ('price' in item) { // Es Producto
              openModal('editProduct', { item, isDirect: true });
            } else { // Es Sección
              openModal('editSection', { item });
            }
          }}
          onDelete={(item) => {
            if ('price' in item) { // Es Producto
              openModal('deleteConfirmation', { item, type: 'product' });
            } else { // Es Sección
              openModal('deleteConfirmation', { item, type: 'section' });
            }
          }}
          isCategorySelected={!!selectedCategoryId}
          onAddNew={() => selectedCategoryId ? openModal('editSection', { parentId: selectedCategoryId }) : null}
          onAddProductDirect={() => selectedCategoryId ? openModal('editProduct', { parentId: selectedCategoryId, isDirect: true }) : null}
        />

        {/* Grid 3: Productos de Sección */}
        <ProductGridView
          products={grid3Items}
          title="Productos"
          onToggleVisibility={(item) => toggleProductVisibility(item.product_id, !item.status)}
          onToggleShowcase={toggleShowcaseStatus}
          onEdit={(item) => openModal('editProduct', { item })}
          onDelete={(item) => openModal('deleteConfirmation', { item, type: 'product' })}
          onAddNew={() => { if (selectedSectionId) openModal('editProduct', { parentId: selectedSectionId }); }}
          isSectionSelected={!!selectedSectionId}
        />
      </main>

      {/* ================================================================= */}
      {/* 🧭 PASO 5: Renderizado de Modales                                 */}
      {/* Los modales se controlan a través del `useModalState` hook.      */}
      {/* ================================================================= */}
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
        categoryId={modalState.options.parentId}
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

export default DashboardView;