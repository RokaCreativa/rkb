/**
 * 🎯 MANDAMIENTO #7 - SEPARACIÓN ABSOLUTA DE LÓGICA Y PRESENTACIÓN
 * 
 * 🧭 PREGUNTA TRAMPA: ¿Cuál es la arquitectura de este componente maestro?
 * RESPUESTA: Orquestador Master-Detail de 3 columnas que deriva datos del store y los pasa a grids tontos
 * 
 * 📍 PROPÓSITO: Director de orquesta del dashboard de escritorio
 * Conecta store global → deriva datos con useMemo → pasa props a componentes UI tontos
 * 
 * ⚠️ NO DEBE HACER: Estado local de negocio, llamadas API directas, lógica compleja de transformación
 * 
 * 🔗 DEPENDENCIAS CRÍTICAS:
 * - useDashboardStore (stores/) - Fuente única de verdad para datos
 * - useModalState (hooks/ui/) - Manejo de modales
 * - CategoryGridView, SectionGridView, ProductGridView (components/domain/) - Grids tontos
 * - EditModals (components/modals/) - Modales de edición
 * 
 * 🚨 PROBLEMA RESUELTO: Bucles infinitos React 19 con patrón selector atómico + useMemo (Bitácora #32)
 * 
 * 🧠 ARQUITECTURA HÍBRIDA: Maneja listas mixtas (categorías+productos globales, secciones+productos locales)
 * 
 * 🔄 FLUJO CRÍTICO:
 * 1. Store → useMemo (derivación) → Props → Componentes UI
 * 2. Eventos UI → Callbacks → Store actions
 * 
 * 🚨 ANTES DE CREAR ALGO NUEVO → REVISAR ESTA LISTA DE DEPENDENCIAS
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
    moveItem,
    toggleCategoryVisibility,
    toggleSectionVisibility,
    toggleProductVisibility,
    selectedCategoryId,
    selectedSectionId,
    setSelectedCategoryId,
    setSelectedSectionId,
    toggleShowcaseStatus,
    createCategory,
    updateCategory,
    createSection,
    updateSection,
    createProduct,
    updateProduct,
  } = useDashboardStore();

  const { modalState, openModal, closeModal, handleConfirmDelete } = useModalState();

  // =================================================================
  // 🧭 PASO 2: Derivación de Datos con `useMemo` para cada Grid
  // Se procesan los datos brutos del store para crear las listas específicas.
  // 🚨 Patrón CRÍTICO para evitar bucles de renderizado en React 19 con Zustand.
  // =================================================================

  /**
   * 🧭 MIGA DE PAN CONTEXTUAL: Derivación de Datos para el Grid 1 (Categorías + Prods. Globales)
   *
   * 📍 UBICACIÓN: app/dashboard-v2/components/core/DashboardView.tsx → useMemo<grid1Items>
   *
   * 🎯 PORQUÉ EXISTE:
   * Para construir la lista mixta que se muestra en la primera columna del dashboard.
   * Su responsabilidad es tomar los datos crudos del store y devolver un array combinado
   * de categorías reales y productos directos globales, listos para ser renderizados.
   *
   * 🔄 FLUJO DE DATOS:
   * 1. Reacciona a cambios en `categories`, `sections`, y `products` del store.
   * 2. Encuentra la `virtualCategory` que agrupa los productos globales.
   * 3. Busca la `virtualSection` dentro de esa categoría virtual.
   * 4. Extrae los productos de esa `virtualSection` del estado global `products`.
   * 5. Filtra las categorías para excluir la `virtualCategory` y obtener solo las reales.
   * 6. Combina `realCategories` y `globalProducts` en un solo array y lo ordena.
   *
   * 🚨 PROBLEMA RESUELTO (Bitácora #38):
   * - Esta lógica corrige el bug donde los productos globales no aparecían.
   * - La implementación anterior era incorrecta porque intentaba buscar los productos
   *   directamente en la categoría virtual, omitiendo el paso de la sección virtual.
   * - Esta es la implementación de UI de la "Arquitectura Híbrida Definitiva".
   *
   * 📖 MANDAMIENTOS RELACIONADOS:
   * - #6 (Separación de Responsabilidades): La vista deriva datos, el store los contiene.
   * - #7 (Legibilidad): La lógica está encapsulada y comentada aquí.
   */
  const grid1Items = useMemo(() => {
    // 1. Encontrar la categoría virtual
    const virtualCategory = categories.find(c => c.is_virtual_category);

    let globalProducts: Product[] = [];
    if (virtualCategory) {
      // 2. Encontrar la sección virtual dentro de esa categoría
      const virtualSectionsForCategory = sections[virtualCategory.category_id] || [];
      const virtualSection = virtualSectionsForCategory.find(s => s.is_virtual);

      if (virtualSection) {
        // 3. Obtener los productos de esa sección virtual (estos son los productos globales)
        globalProducts = products[virtualSection.section_id] || [];
      }
    }

    // 4. Obtener solo las categorías reales (no virtuales)
    const realCategories = categories.filter(c => !c.is_virtual_category);

    // 5. Combinar y ordenar
    const combined = [...realCategories, ...globalProducts];

    // 🚨 DEDUPLICACIÓN: Eliminar elementos duplicados por ID
    const deduplicatedItems = combined.filter((item, index, array) => {
      const isCategory = !('price' in item);
      const itemId = isCategory ? item.category_id : item.product_id;
      const itemType = isCategory ? 'category' : 'product';

      return array.findIndex(otherItem => {
        const otherIsCategory = !('price' in otherItem);
        const otherItemId = otherIsCategory ? otherItem.category_id : otherItem.product_id;
        const otherItemType = otherIsCategory ? 'category' : 'product';

        return itemType === otherItemType && itemId === otherItemId;
      }) === index;
    });

    // 🧠 ORDENACIÓN: Usar campos contextuales específicos
    // - Categorías: categories_display_order
    // - Productos globales: categories_display_order
    return deduplicatedItems.sort((a, b) => {
      // Solo ordenar por campo contextual específico, sin interferencias de status
      const aOrder = ('price' in a)
        ? (a.categories_display_order ?? 999)  // Producto: usar categories_display_order
        : (a.categories_display_order ?? 999); // Categoría: usar categories_display_order

      const bOrder = ('price' in b)
        ? (b.categories_display_order ?? 999)  // Producto: usar categories_display_order  
        : (b.categories_display_order ?? 999); // Categoría: usar categories_display_order

      return aOrder - bOrder;
    });
  }, [categories, sections, products]);

  /**
   * 🧭 MIGA DE PAN CONTEXTUAL: Derivación de Datos para el Grid 2 (Secciones + Prods. Locales)
   *
   * 📍 UBICACIÓN: app/dashboard-v2/components/core/DashboardView.tsx → useMemo<sectionsAndLocalProducts>
   *
   * 🎯 PORQUÉ EXISTE:
   * Para construir la lista mixta de la segunda columna, que es contextual a la categoría
   * seleccionada en el Grid 1. Muestra las secciones de esa categoría y sus productos directos "locales".
   *
   * ⚠️ REGLA DE NEGOCIO CRÍTICA (Bitácora #35):
   * - La definición canónica de un "Producto Directo Local" es un producto que tiene
   *   un `category_id` asignado, pero NO tiene un `section_id`. Esta lógica de filtrado
   *   es la implementación de esa regla.
   *
   * 🔄 FLUJO DE DATOS:
   * 1. Reacciona a cambios en `selectedCategoryId`, `sections`, y `products`.
   * 2. Si no hay categoría seleccionada, devuelve una lista vacía.
   * 3. Obtiene las secciones normales para la categoría seleccionada (`sections[selectedCategoryId]`).
   * 4. Aplana TODOS los productos del store y los filtra para encontrar solo los locales.
   * 5. Combina las secciones y los productos locales en un solo array y lo ordena.
   *
   * 🚨 PROBLEMA RESUELTO (Bitácora #38):
   * - Implementaciones anteriores eran inestables porque no filtraban con precisión.
   * - Este filtro robusto asegura que no haya "fugas" de productos de otras categorías
   *   o de los productos globales, estabilizando la UI.
   */
  const sectionsAndLocalProducts = useMemo(() => {
    if (!selectedCategoryId) return [];

    // Obtiene las secciones de la categoría seleccionada.
    const sectionsForCategory = sections[selectedCategoryId] || [];

    // 🧠 Lógica clave según Bitácora #45 y Memoria #3419991175739654741
    // Un producto directo LOCAL es aquel que tiene category_id pero no section_id.
    const allProductsFlat = Object.values(products).flat();
    const localDirectProducts = allProductsFlat.filter(p => p.category_id === selectedCategoryId && !p.section_id);

    // Combina y ordena.
    const combined = [...sectionsForCategory, ...localDirectProducts];

    // 🧠 ORDENACIÓN: Usar campos contextuales específicos
    // - Secciones: sections_display_order  
    // - Productos locales: sections_display_order
    return combined.sort((a, b) => {
      // Solo ordenar por campo contextual específico, sin interferencias de status
      const aOrder = ('price' in a)
        ? (a.sections_display_order ?? 999)  // Producto local: usar sections_display_order
        : (a.sections_display_order ?? 999); // Sección: usar sections_display_order

      const bOrder = ('price' in b)
        ? (b.sections_display_order ?? 999)  // Producto local: usar sections_display_order
        : (b.sections_display_order ?? 999); // Sección: usar sections_display_order

      return aOrder - bOrder;
    });
  }, [selectedCategoryId, sections, products]);

  // 🧠 Memo para Grid 3: Productos de una Sección
  const grid3Items: Product[] = useMemo(() => {
    if (!selectedSectionId) return [];
    const productList = products[selectedSectionId] || [];

    // 🧠 ORDENACIÓN: Usar campo contextual específico
    // - Productos normales: products_display_order
    return [...productList].sort((a, b) => {
      // Solo ordenar por campo contextual específico, sin interferencias de status
      const aOrder = a.products_display_order ?? 999;
      const bOrder = b.products_display_order ?? 999;

      return aOrder - bOrder;
    });
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

  const handleSaveModal = async ({ data, imageFile }: { data: any; imageFile?: File | null }) => {
    try {
      const { item, type } = modalState.options;

      if (type === 'category') {
        if (item) {
          await updateCategory((item as Category).category_id, data, imageFile);
        } else if (client) {
          await createCategory({ ...data, client_id: client.client_id }, imageFile);
        }
      } else if (type === 'section') {
        if (item) {
          await updateSection((item as Section).section_id, data, imageFile);
        } else if (selectedCategoryId) {
          await createSection({ ...data, category_id: selectedCategoryId }, imageFile);
        }
      } else if (type === 'product') {
        if (item) {
          await updateProduct((item as Product).product_id, data, imageFile);
        } else {
          const productData = {
            ...data,
            category_id: modalState.options.isDirect ? selectedCategoryId : undefined,
            section_id: !modalState.options.isDirect ? selectedSectionId : undefined,
          };
          await createProduct(productData, imageFile);
        }
      }
      closeModal();
    } catch (error) {
      console.error(`❌ Error al guardar desde DashboardView:`, error);
      throw error;
    }
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
          isReorderMode={isReorderMode}
          onCategorySelect={handleCategorySelect}
          onProductSelect={() => { }} // Placeholder, productos directos no son seleccionables
          onMoveItem={moveItem}
          onToggleVisibility={(item) => {
            if ('price' in item) { // Es Producto
              toggleProductVisibility(item.product_id, !item.status);
            } else { // Es Categoría
              toggleCategoryVisibility(item.category_id, !item.status);
            }
          }}
          onEdit={(item) => {
            if ('price' in item) { // Es Producto
              openModal('editProduct', { item, type: 'product', isDirect: true, isGlobal: true });
            } else { // Es Categoría
              openModal('editCategory', { item, type: 'category' });
            }
          }}
          onDelete={(item) => {
            if ('price' in item) { // Es Producto
              openModal('deleteConfirmation', { item, type: 'product' });
            } else { // Es Categoría
              openModal('deleteConfirmation', { item, type: 'category' });
            }
          }}
          onAddNewCategory={() => openModal('editCategory', { type: 'category' })}
          onAddNewProductDirect={() => openModal('editProduct', { type: 'product', isDirect: true, isGlobal: true })}
        />

        {/* Grid 2: Secciones y Productos Locales */}
        <SectionGridView
          sections={sectionsAndLocalProducts}
          title="Secciones"
          selectedSectionId={selectedSectionId}
          isReorderMode={isReorderMode}
          onSectionSelect={handleSectionSelect}
          onMoveItem={moveItem}
          selectedCategoryId={selectedCategoryId}
          onToggleVisibility={(item) => {
            if ('price' in item) { // Es Producto
              toggleProductVisibility(item.product_id, !item.status);
            } else { // Es Sección
              toggleSectionVisibility((item as Section).section_id, !item.status);
            }
          }}
          onEdit={(item) => {
            if ('price' in item) { // Es Producto
              openModal('editProduct', { item, type: 'product', isDirect: true });
            } else { // Es Sección
              openModal('editSection', { item, type: 'section' });
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
          onAddNew={() => selectedCategoryId ? openModal('editSection', { type: 'section' }) : null}
          onAddProductDirect={() => selectedCategoryId ? openModal('editProduct', { type: 'product', isDirect: true }) : null}
        />

        {/* Grid 3: Productos de Sección */}
        <ProductGridView
          products={grid3Items}
          title="Productos"
          isReorderMode={isReorderMode}
          onMoveItem={moveItem}
          selectedSectionId={selectedSectionId}
          onToggleVisibility={(item) => toggleProductVisibility(item.product_id, !item.status)}
          onToggleShowcase={toggleShowcaseStatus}
          onEdit={(item) => openModal('editProduct', { item, type: 'product' })}
          onDelete={(item) => openModal('deleteConfirmation', { item, type: 'product' })}
          onAddNew={() => { if (selectedSectionId) openModal('editProduct', { type: 'product' }); }}
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
        item={modalState.options?.item as Category | null}
        onSave={handleSaveModal}
      />
      <EditSectionModal
        isOpen={modalState.type === 'editSection'}
        onClose={closeModal}
        item={modalState.options?.item as Section | null}
        onSave={handleSaveModal}
      />
      <EditProductModal
        isOpen={modalState.type === 'editProduct'}
        onClose={closeModal}
        item={modalState.options?.item as Product | null}
        onSave={handleSaveModal}
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