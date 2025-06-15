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
import { useDashboardStore } from '@/app/dashboard-v2/stores/dashboardStore';
import { useModalState } from '@/app/dashboard-v2/hooks/ui/useModalState';
import { CategoryGridView } from '../domain/categories/CategoryGridView';
import { SectionGridView } from '../domain/sections/SectionGridView';
import { ProductGridView } from '../domain/products/ProductGridView';
import { EditCategoryModal, EditSectionModal, EditProductModal } from '../modals/EditModals';
import { DeleteConfirmationModal } from '../modals/DeleteConfirmationModal';
import { MoveItemModal } from '../modals/MoveItemModal';
import { Category, Section, Product } from '@/app/dashboard-v2/types';
import { getCategoryDisplayMode, isCategorySimpleMode } from '../../utils/categoryUtils';

export const DashboardView: React.FC = () => {
  const store = useDashboardStore();
  const selectedCategoryId = useDashboardStore(state => state.selectedCategoryId);
  const selectedSectionId = useDashboardStore(state => state.selectedSectionId);
  const sections = useDashboardStore(state => state.sections);
  const products = useDashboardStore(state => state.products);
  const categories = useDashboardStore(state => state.categories);

  const { modalState, openModal, closeModal, handleDeleteItem, handleMoveItem, handleConfirmDelete } = useModalState();

  /**
   * 🧭 MIGA DE PAN CONTEXTUAL: Effect para cargar datos cuando se selecciona categoría
   * PORQUÉ NECESARIO: Vista escritorio usa master-detail, necesita cargar datos automáticamente
   * CONEXIÓN: store.setSelectedCategoryId() en CategoryGridView.onCategorySelect dispara este effect
   * T31.5: Ahora usa fetchDataForCategory para auto-detección y carga híbrida
   * FLUJO: fetchDataForCategory → detecta si es simple/compleja → carga secciones y/o productos
   */
  useEffect(() => {
    if (selectedCategoryId) {
      store.fetchDataForCategory(selectedCategoryId);
    }
  }, [selectedCategoryId, store.fetchDataForCategory]);

  /**
   * 🧭 MIGA DE PAN CONTEXTUAL: Effect para cargar productos cuando se selecciona sección
   * PORQUÉ: En vista escritorio, seleccionar sección debe mostrar productos inmediatamente
   * CONEXIÓN: SectionGridView.onSectionSelect → store.setSelectedSectionId → este effect
   * FLUJO: CategoryGrid → SectionGrid → ProductGrid (master-detail tradicional)
   */
  useEffect(() => {
    if (selectedSectionId) store.fetchProductsBySection(selectedSectionId);
  }, [selectedSectionId, store.fetchProductsBySection]);

  // --- DERIVED AND MEMOIZED DATA ---
  
  /**
   * 🧭 MIGA DE PAN CONTEXTUAL (SOLUCIÓN FINAL AL BUG DE DUPLICACIÓN)
   * 
   * 🎯 PORQUÉ ESTE CAMBIO:
   * El error de duplicación ocurría porque los componentes hijos recibían listas de datos "sucias"
   * (mezcladas) y trataban de filtrarlas, causando inconsistencias.
   * 
   * ✅ LA SOLUCIÓN CORRECTA (Patrón: "Cálculo en el Padre"):
   * 1. El componente padre (`DashboardView`) es el ÚNICO que conoce el estado global (productos, secciones).
   * 2. Se usa `useMemo` para crear listas limpias y separadas para cada tipo de dato.
   *    - `sectionsForCategory`: Solo las secciones de la categoría seleccionada.
   *    - `directProductsForCategory`: Solo los productos cuyo `category_id` coincide.
   *    - `productsForSection`: Solo los productos de la sección seleccionada.
   * 3. Estas listas limpias y pre-calculadas se pasan como props a los componentes hijos.
   * 4. Los componentes hijos ahora son "tontos": solo renderizan la lista que reciben, sin filtrar nada.
   * 
   * 🔗 CONEXIÓN: Este patrón es la aplicación correcta de la lección aprendida sobre los selectores de Zustand.
   * Evita cálculos complejos en los hijos y centraliza la lógica de datos en el orquestador.
   */
  const sectionsForCategory = useMemo(
    () => selectedCategoryId ? sections[selectedCategoryId] || [] : [],
    [sections, selectedCategoryId]
  );
  
  const directProductsForCategory = useMemo(
    () => selectedCategoryId ? (products[`cat-${selectedCategoryId}`] || []).filter(p => p.category_id === selectedCategoryId) : [],
    [products, selectedCategoryId]
  );
  
  const productsForSection = useMemo(
    () => selectedSectionId ? products[selectedSectionId] || [] : [],
    [products, selectedSectionId]
  );

  const categoryDisplayMode = useMemo(() => {
    if (!selectedCategoryId) return 'none';
    return getCategoryDisplayMode(sectionsForCategory);
  }, [selectedCategoryId, sectionsForCategory]);
  
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
    if (isSimpleCategory && selectedCategoryId) {
      return 'lg:grid-cols-2';
    }
    if (isSectionsCategory) {
      return selectedSectionId
        ? 'lg:grid-cols-3' // 3 columnas: categorías + secciones + productos
        : selectedCategoryId
          ? 'lg:grid-cols-2' // 2 columnas: categorías + secciones
          : '';
    }
    return ''; // 1 columna por defecto
  })();

  if (!store.client) return <div className="p-8 text-center">Cargando cliente...</div>;

  return (
    <div className="flex-1 p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className={`grid grid-cols-1 ${gridColsClass} gap-6 h-full items-start`}>
        {/* Columna de Categorías (siempre visible) */}
        <div className={!selectedCategoryId ? 'lg:col-span-full' : ''}>
          <CategoryGridView
            categories={categories}
            directProducts={directProductsForCategory}
            onCategorySelect={(cat) => store.setSelectedCategoryId(cat.category_id)}
            onToggleVisibility={(cat) => store.toggleCategoryVisibility(cat.category_id, cat.status)}
            onEdit={(cat) => openModal('editCategory', cat)}
            onDelete={(cat) => handleDeleteItem(cat, 'category')}
            onAddNew={() => openModal('editCategory', null)}
            selectedCategoryId={selectedCategoryId}
            onAddProductDirect={() => openModal('editProductDirect', null)}
            onProductEdit={(prod) => openModal('editProductDirect', prod)}
            onProductDelete={(prod) => handleDeleteItem(prod, 'product')}
            onProductToggleVisibility={(prod) => store.toggleProductVisibility(prod.product_id, prod.status)}
          />
        </div>

        {/* 
         * 🧭 MIGA DE PAN CONTEXTUAL (REFACTORIZACIÓN CRÍTICA)
         *
         * 🎯 PORQUÉ ESTE CAMBIO:
         * El error de duplicación ocurría porque la lógica anterior SIEMPRE renderizaba SectionGridView
         * en la segunda columna, sin importar el tipo de categoría.
         *
         * 🔄 NUEVO FLUJO DE RENDERIZADO:
         * 1. Calculamos `categoryDisplayMode` ('sections' o 'simple') de forma segura con useMemo.
         * 2. Usamos ese valor para decidir QUÉ componente renderizar en la segunda columna.
         * 3. Si es 'sections', renderizamos SectionGridView.
         * 4. Si es 'simple', la lógica de productos directos YA está dentro de CategoryGridView.
         *    Por lo tanto, la segunda y tercera columna NO deben renderizarse para categorías simples.
         *    El layout se ajusta con `gridColsClass` para que CategoryGridView ocupe más espacio.
         *
         * ✅ RESULTADO: Se elimina la duplicación. Cada componente tiene su única responsabilidad.
         * SectionGridView -> Solo muestra secciones.
         * CategoryGridView -> Muestra categorías y (si los tiene) sus productos directos.
         * ProductGridView -> Muestra productos de una sección.
         */}

        {/* Columna 2: Secciones (SÓLO si la categoría las tiene) */}
        {selectedCategoryId && isSectionsCategory && (
          <div className="min-w-0 flex-1">
            <SectionGridView
              sections={sectionsForCategory}
              onSectionSelect={(section: Section) => store.setSelectedSectionId(section.section_id)}
              onToggleVisibility={(section: Section) => store.toggleSectionVisibility(section.section_id, section.status)}
              onEdit={(section: Section) => openModal('editSection', section)}
              onDelete={(section: Section) => handleDeleteItem(section, 'section')}
              onMove={(section: Section) => handleMoveItem(section, 'section')}
              onAddNew={() => openModal('editSection', null)}
              onAddProduct={(section) => {
                store.setSelectedSectionId(section.section_id);
                openModal('editProduct', null);
              }}
            />
          </div>
        )}

        {/* Columna 3: Productos de una Sección (SÓLO si hay una sección seleccionada) */}
        {selectedSectionId && (
          <div className="min-w-0 flex-1">
            <ProductGridView
              products={productsForSection}
              onToggleVisibility={(product: Product) => store.toggleProductVisibility(product.product_id, product.status)}
              onEdit={(product: Product) => openModal('editProduct', product)}
              onDelete={(product: Product) => handleDeleteItem(product, 'product')}
              onMove={(product: Product) => handleMoveItem(product, 'product')}
              onAddNew={() => openModal('editProduct', null)}
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
        categoryId={selectedCategoryId ?? undefined}
      />
      <EditProductModal
        isOpen={modalState.type === 'editProduct' || modalState.type === 'editProductDirect'}
        onClose={closeModal}
        product={modalState.data as Product | null}
        sectionId={selectedSectionId ?? undefined}
        categoryId={selectedCategoryId ?? undefined}
        isDirect={modalState.type === 'editProductDirect'}
      />
      <DeleteConfirmationModal
        isOpen={modalState.type === 'delete'}
        onClose={closeModal}
        onConfirm={handleConfirmDelete}
        itemType={modalState.itemType || ''}
      />
      <MoveItemModal
        isOpen={modalState.type === 'move'}
        onClose={closeModal}
        item={modalState.data}
        itemType={modalState.itemType || 'product'}
      />
    </div>
  );
};

export default DashboardView; 
