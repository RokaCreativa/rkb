"use client";

/**
 * @fileoverview Componente de vista para la visualización y gestión de categorías
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-06-13
 */

import React, { useState, useEffect } from 'react';
import { PlusIcon, ArrowsUpDownIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import CategoryTable from "../domain/categories/CategoryTable";
import { Category, Section, Product } from "@/app/types/menu";
import { CompatibleProduct } from '@/app/dashboard-v2/types/type-adapters';

// ✅ SISTEMA UNIFICADO: Importación del store centralizado
import { useModalStore } from '@/app/dashboard-v2/hooks/ui/state/useModalStore';

// Componentes de modales (legacy, pendientes de refactorización completa)
import NewCategoryModal from '../modals/NewCategoryModal';
import { EditCategoryModal, EditSectionModal } from '../modals/EditModals';
import { DeleteConfirmationModal } from '../modals/DeleteConfirmationModal';
import NewSectionModal from '../modals/NewSectionModal';
import NewProductModal from '../modals/NewProductModal';
import SectionList from '@/app/dashboard-v2/components/domain/sections/SectionList';

/**
 * 🧭 INTERFAZ CONTEXTUAL: Props del CategoryView
 * PORQUÉ COMPLEJA: Maneja callbacks para múltiples entidades (categorías, secciones, productos)
 * CONEXIÓN: DashboardView.tsx pasa estas props desde el dashboardStore
 * PATRÓN: Delegación de eventos hacia arriba en la jerarquía de componentes
 */
interface CategoryViewProps {
  categories: Category[];
  sections: Record<number, Section[]>;
  expandedCategories: Record<number, boolean>;
  expandedSections: Record<number, boolean>;
  isUpdatingVisibility: number | null;
  onToggleCategoryVisibility: (categoryId: number, currentStatus: number) => void;
  onEditCategorySubmit: (category: Partial<Category>) => void;
  onDeleteCategorySubmit: (categoryId: number) => void;
  onAddCategorySubmit: (category: Partial<Category>) => void;
  onToggleSectionVisibility: (sectionId: number, currentStatus: number) => void;
  onEditSectionSubmit: (section: Partial<Section>) => void;
  onDeleteSectionSubmit: (sectionId: number) => void;
  onAddSectionSubmit: (section: Partial<Section>) => void;
  onSectionClick: (sectionId: number) => void;
  onCategoryClick: (category: Category) => void;
  products?: { [key: number]: Product[] };
  onToggleProductVisibility?: (productId: number, currentStatus: number, sectionId: number) => void;
  onEditProduct?: (product: Product) => void;
  onDeleteProduct?: (product: Product) => void;
  onAddProductSubmit?: (product: Partial<Product>) => void;
  isUpdatingProductVisibility?: number | null;
  isReorderModeActive?: boolean;
  onSectionsReorder?: (categoryId: number, sourceIndex: number, destinationIndex: number) => void;
  onProductReorder?: (sectionId: number, sourceIndex: number, destinationIndex: number) => void;
}

/**
 * 🧭 MIGA DE PAN CONTEXTUAL: Vista de categorías con gestión de modales legacy
 * 
 * PORQUÉ CRÍTICO: Centraliza la gestión de categorías en la vista de escritorio
 * ESTADO ACTUAL: Usa useState locales para modales (patrón legacy)
 * 
 * CONEXIONES CRÍTICAS:
 * - DashboardView.tsx: Componente padre que pasa props y callbacks
 * - CategoryTable.tsx: Tabla de categorías con acciones
 * - SectionList.tsx: Lista de secciones cuando categoría está expandida
 * 
 * ⚠️ DEUDA TÉCNICA IDENTIFICADA:
 * - Múltiples useState para modales (candidato para useModalStore)
 * - Lógica de modales duplicada en cada handler
 * - Podría beneficiarse de refactorización futura
 * 
 * MANDAMIENTOS APLICADOS:
 * #6: Separación responsabilidades (lógica delegada a componentes padre)
 * #7: Código documentado con comentarios contextuales
 * #8: Consistencia visual en modales
 */
const CategoryView: React.FC<CategoryViewProps> = ({
  categories,
  sections,
  expandedCategories,
  expandedSections,
  isUpdatingVisibility,
  onToggleCategoryVisibility,
  onEditCategorySubmit,
  onDeleteCategorySubmit,
  onAddCategorySubmit,
  onToggleSectionVisibility,
  onEditSectionSubmit,
  onDeleteSectionSubmit,
  onAddSectionSubmit,
  onSectionClick,
  onCategoryClick,
  products = {},
  onToggleProductVisibility,
  onEditProduct,
  onDeleteProduct,
  onAddProductSubmit,
  isUpdatingProductVisibility,
  isReorderModeActive = false,
  onSectionsReorder,
  onProductReorder
}) => {
  /**
   * 🧭 ESTADO LOCAL DE MODALES: Patrón legacy pero funcional
   * JUSTIFICACIÓN: Mantener estabilidad mientras se planifica refactorización
   * CANDIDATO: Futuro reemplazo por useModalStore unificado
   */

  // Estados de modales de categorías
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);
  const [isDeleteCategoryModalOpen, setIsDeleteCategoryModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // Estados de modales de secciones
  const [isAddSectionModalOpen, setIsAddSectionModalOpen] = useState(false);
  const [isEditSectionModalOpen, setIsEditSectionModalOpen] = useState(false);
  const [isDeleteSectionModalOpen, setIsDeleteSectionModalOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  // Estados de modales de productos
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [selectedSectionIdForProduct, setSelectedSectionIdForProduct] = useState<number | null>(null);

  /**
   * 🧭 HANDLERS DE CATEGORÍAS: Gestión de modales con patrón consistente
   * PATRÓN: setState(true) + setSelected(item) para abrir, setState(false) + setSelected(null) para cerrar
   * CONEXIÓN: Cada handler corresponde a una acción en CategoryTable.tsx
   */
  const handleAddCategory = () => {
    setIsAddCategoryModalOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsEditCategoryModalOpen(true);
  };

  const handleDeleteCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteCategoryModalOpen(true);
  };

  /**
   * 🧭 HANDLERS DE SECCIONES: Gestión de modales con contexto de categoría
   * COMPLEJIDAD ADICIONAL: Necesitan categoryId para crear secciones en categoría específica
   * CONEXIÓN: SectionList.tsx llama estos handlers para acciones de secciones
   */
  const handleAddSection = (categoryId: number) => {
    setSelectedCategoryId(categoryId);
    setIsAddSectionModalOpen(true);
  };

  const handleEditSection = (section: Section) => {
    setSelectedSection(section);
    setIsEditSectionModalOpen(true);
  };

  const handleDeleteSection = (section: Section) => {
    setSelectedSection(section);
    setIsDeleteSectionModalOpen(true);
  };

  /**
   * 🧭 HANDLERS DE PRODUCTOS: Gestión de modales con contexto de sección
   * CONEXIÓN: SectionList.tsx → ProductList.tsx llama este handler
   * CONTEXTO: selectedSectionIdForProduct determina en qué sección crear el producto
   */
  const handleAddProduct = (sectionId: number) => {
    setSelectedSectionIdForProduct(sectionId);
    setIsAddProductModalOpen(true);
  };

  /**
   * 🧭 MIGA DE PAN CONTEXTUAL: Logging para debugging de secciones
   * PORQUÉ: Ayuda a diagnosticar problemas de renderizado en SectionList
   * CONEXIÓN: selectedCategory determina qué secciones se muestran
   */
  useEffect(() => {
    if (selectedCategory) {
      console.log("🔍 [DEBUG] Secciones pasadas a SectionList:", {
        selectedCategoryId: selectedCategory.category_id,
        sectionsDisponibles: sections[selectedCategory.category_id] ? "Sí" : "No",
        cantidadSecciones: sections[selectedCategory.category_id]?.length || 0,
        sectionsMuestra: sections[selectedCategory.category_id]?.slice(0, 2) || [],
        expandedSections: expandedSections
      });
    }
  }, [selectedCategory, sections, expandedSections]);

  /**
   * 🧭 MIGA DE PAN CONTEXTUAL: Logging para debugging de reordenamiento
   * PORQUÉ: El drag&drop es complejo y necesita debugging
   * CONEXIÓN: isReorderModeActive viene de DashboardView
   */
  useEffect(() => {
    console.log("🚨 [CRITICAL] CategoryView - Estado de isReorderModeActive:", isReorderModeActive);
  }, [isReorderModeActive]);

  /**
   * 🧭 MIGA DE PAN CONTEXTUAL: Handler de reordenamiento con logging detallado
   * PORQUÉ COMPLEJO: Maneja tanto reordenamiento de categorías como de secciones
   * CONEXIÓN: onSectionsReorder viene de DashboardView y va al dashboardStore
   * DECISIÓN: Mantener logging extensivo para debugging de drag&drop
   */
  const onReorderCategory = (sourceIndex: number, destinationIndex: number) => {
    console.log(
      '🔄 [DRAG DEBUG] CategoryView -> onReorderCategory llamado:',
      {
        sourceIndex,
        destinationIndex,
        isReorderModeActiveProp: isReorderModeActive,
        isReorderModeActiveState: isReorderModeActive,
        onSectionsReorderExists: !!onSectionsReorder
      }
    );

    if (isReorderModeActive) {
      // Reordenación de categorías
      if (categories && categories.length > 0) {
        // Si estamos en el contexto de una categoría específica
        if (selectedCategory) {
          const categoryId = selectedCategory.category_id;
          console.log('✅ CategoryView -> Reordenando secciones para categoría:', categoryId);

          if (onSectionsReorder) {
            // Llamamos directamente a la función onSectionsReorder con los parámetros esperados
            onSectionsReorder(categoryId, sourceIndex, destinationIndex);
          } else {
            console.error('❌ [DRAG ERROR] onSectionsReorder no está disponible');
          }
        } else {
          // Estamos reordenando categorías globalmente
          console.log('✅ CategoryView -> Reordenando categorías globalmente');

          // Usar el primer argumento disponible para la reordenación
          if (onSectionsReorder) {
            // En este caso, usamos el ID de la primera categoría como un comodín
            // La lógica real de reordenamiento de categorías debería manejarse en el componente padre
            const firstCategoryId = categories[0].category_id;
            onSectionsReorder(firstCategoryId, sourceIndex, destinationIndex);
          } else {
            console.error('❌ [DRAG ERROR] onSectionsReorder no está disponible para categorías');
          }
        }
      } else {
        console.error('❌ [DRAG ERROR] No hay categorías disponibles para reordenar');
      }
    } else {
      console.warn('⚠️ [DRAG WARNING] Intento de reordenamiento cuando isReorderModeActive es false');
    }
  };

  return (
    <div className="flex flex-col w-full min-h-0 p-4 bg-indigo-50/30">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-xl font-bold text-indigo-800">Gestiona tu menú</h1>
        <div className="flex gap-2">
          <button
            onClick={() => {
              console.log("🔄 [DEBUG] Botón de reordenamiento presionado");
              if (onSectionsReorder) {
                onSectionsReorder(-1, -1, -1);
              }
            }}
            className={`px-2 py-1 rounded-md text-sm font-medium flex items-center ${isReorderModeActive
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : 'border border-indigo-600 text-indigo-600 hover:bg-indigo-50'
              }`}
          >
            {isReorderModeActive ? 'Finalizar' : 'Reordenar'}
          </button>
          <button
            onClick={handleAddCategory}
            className="px-2 py-1 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
          >
            Añadir
          </button>
        </div>
      </div>

      <div className="grow rounded-lg overflow-hidden">
        <CategoryTable
          categories={categories}
          expandedCategories={expandedCategories}
          isUpdatingVisibility={isUpdatingVisibility}
          onCategoryClick={onCategoryClick}
          onToggleCategoryVisibility={onToggleCategoryVisibility}
          onEditCategory={handleEditCategory}
          onDeleteCategory={handleDeleteCategory}
          sections={sections}
          expandedSections={expandedSections}
          onAddSection={handleAddSection}
          onSectionClick={onSectionClick}
          onToggleSectionVisibility={onToggleSectionVisibility}
          onEditSection={handleEditSection}
          onDeleteSection={handleDeleteSection}
          onAddProduct={handleAddProduct}
          products={products}
          onToggleProductVisibility={onToggleProductVisibility}
          onEditProduct={(product: CompatibleProduct) => onEditProduct && onEditProduct(product as Product)}
          onDeleteProduct={(product: CompatibleProduct) => onDeleteProduct && onDeleteProduct(product as Product)}
          isUpdatingProductVisibility={isUpdatingProductVisibility}
          onAddCategory={handleAddCategory}
          onReorderCategory={onReorderCategory}
          isReorderModeActive={isReorderModeActive}
          onProductsReorder={isReorderModeActive && onProductReorder ?
            (sectionId: number, sourceIndex: number, destinationIndex: number) => {
              onProductReorder(sectionId, sourceIndex, destinationIndex);
            } : undefined
          }
        />
      </div>

      {/* Modals */}
      <NewCategoryModal
        isOpen={isAddCategoryModalOpen}
        onClose={() => setIsAddCategoryModalOpen(false)}
        client={null}
        setCategories={(() => { }) as any}
        onSuccess={() => {
          if (onAddCategorySubmit) {
            onAddCategorySubmit({} as Partial<Category>);
          }
        }}
      />

      {isEditCategoryModalOpen && selectedCategory && (
        <EditCategoryModal
          isOpen={isEditCategoryModalOpen}
          onClose={() => setIsEditCategoryModalOpen(false)}
          categoryToEdit={selectedCategory}
          client={null}
          setCategories={(cats) => {
            if (onEditCategorySubmit && selectedCategory) {
              // Buscar la categoría editada y enviarla al callback
              const updatedCategory = Array.isArray(cats) ?
                cats.find(c => c.category_id === selectedCategory.category_id) : null;
              if (updatedCategory) onEditCategorySubmit(updatedCategory);
            }
          }}
        />
      )}

      {isDeleteCategoryModalOpen && selectedCategory && (
        <DeleteConfirmationModal
          isOpen={isDeleteCategoryModalOpen}
          onClose={() => setIsDeleteCategoryModalOpen(false)}
          itemType="Categoría"
          onConfirm={() => {
            setIsDeleteCategoryModalOpen(false);
            onDeleteCategorySubmit(selectedCategory.category_id);
          }}
        />
      )}

      {isAddSectionModalOpen && selectedCategoryId !== null && (
        <NewSectionModal
          isOpen={isAddSectionModalOpen}
          onClose={() => setIsAddSectionModalOpen(false)}
          categoryId={selectedCategoryId || 0}
          setSections={(sections: any) => {
            if (onAddSectionSubmit && selectedCategoryId) {
              // Extraer la última sección añadida
              const sectionId = selectedCategoryId.toString();
              const sectionList = sections[sectionId] || [];
              const lastSection = sectionList.length > 0 ? sectionList[sectionList.length - 1] : null;
              if (lastSection) {
                onAddSectionSubmit({
                  ...lastSection,
                  category_id: selectedCategoryId
                });
              }
            }
          }}
        />
      )}

      {isEditSectionModalOpen && selectedCategory && (
        <EditSectionModal
          isOpen={isEditSectionModalOpen}
          onClose={() => setIsEditSectionModalOpen(false)}
          section={selectedCategory}
          updateSection={async (formData, sectionId, categoryId) => {
            if (onEditSectionSubmit && selectedCategory) {
              // Simplemente llamar al callback con la sección seleccionada
              onEditSectionSubmit(selectedCategory);
            }
            return true;
          }}
        />
      )}

      {isDeleteSectionModalOpen && selectedCategory && (
        <DeleteConfirmationModal
          isOpen={isDeleteSectionModalOpen}
          onClose={() => setIsDeleteSectionModalOpen(false)}
          itemType="Sección"
          onConfirm={() => {
            setIsDeleteSectionModalOpen(false);
            onDeleteSectionSubmit(selectedCategory.section_id);
          }}
        />
      )}

      {isAddProductModalOpen && selectedCategory && (
        <NewProductModal
          isOpen={isAddProductModalOpen}
          onClose={() => setIsAddProductModalOpen(false)}
          sectionId={selectedCategory.category_id}
          setProducts={(products: any) => {
            if (onAddProductSubmit && selectedCategory) {
              // Extraer el último producto añadido
              const sectionId = selectedCategory.category_id.toString();
              const productList = products[sectionId] || [];
              const lastProduct = productList.length > 0 ? productList[productList.length - 1] : null;
              if (lastProduct) {
                onAddProductSubmit({
                  ...lastProduct,
                  section_id: selectedCategory.category_id
                });
              }
            }
          }}
        />
      )}

      {/* Añadir logs de diagnóstico para debug */}
      {selectedCategory && (
        <div className="mt-2 ml-4">
          <SectionList
            sections={sections[selectedCategory.category_id] || []}
            expandedSections={expandedSections}
            onSectionClick={onSectionClick}
            onToggleSectionVisibility={onToggleSectionVisibility}
            onEditSection={(section) => onEditSectionSubmit(section)}
            onDeleteSection={(section) => onDeleteSectionSubmit(section.section_id)}
            onAddProduct={(sectionId) => onAddProductSubmit && onAddProductSubmit({ section_id: sectionId } as any)}
            products={products}
            onToggleProductVisibility={onToggleProductVisibility}
            onEditProduct={(product: CompatibleProduct) => onEditProduct && onEditProduct(product as Product)}
            onDeleteProduct={(product: CompatibleProduct) => onDeleteProduct && onDeleteProduct(product as Product)}
            isUpdatingVisibility={isUpdatingVisibility}
            isUpdatingProductVisibility={isUpdatingProductVisibility}
            categoryName={selectedCategory.name || ''}
            categoryId={selectedCategory.category_id}
            onAddSectionToCategory={() => onAddSectionSubmit && onAddSectionSubmit({ category_id: selectedCategory.category_id } as any)}
            isReorderModeActive={isReorderModeActive}
            onSectionsReorder={isReorderModeActive && onSectionsReorder ?
              (categoryId: number, sourceIndex: number, destinationIndex: number) => {
                onSectionsReorder(categoryId, sourceIndex, destinationIndex);
              } : undefined
            }
            onProductsReorder={isReorderModeActive && onProductReorder ?
              (sectionId: number, sourceIndex: number, destinationIndex: number) => {
                onProductReorder(sectionId, sourceIndex, destinationIndex);
              } : undefined
            }
            key={`section-list-${selectedCategory?.category_id}`}
          />
        </div>
      )}
    </div>
  );
};

export default CategoryView; 