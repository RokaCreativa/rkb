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

// Modificar las importaciones para usar los componentes que realmente existen
import NewCategoryModal from '../modals/NewCategoryModal';
import EditCategoryModal from '../modals/EditCategoryModal';
import DeleteModal from '../modals/DeleteModal';
import NewSectionModal from '../modals/NewSectionModal';
import EditSectionModal from '../modals/EditSectionModal';
import NewProductModal from '../modals/NewProductModal';
import SectionList from '@/app/dashboard-v2/components/domain/sections/SectionList';

/**
 * Props para el componente CategoryView
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
 * Componente que gestiona la visualización y acciones relacionadas con categorías
 * 
 * Esta vista centraliza la interacción con las categorías del menú, incluyendo:
 * - Lista de categorías con sus propiedades
 * - Acciones para añadir, editar y eliminar categorías
 * - Navegación a la vista de secciones
 * - Delegación de eventos a los componentes padres a través de callbacks
 * 
 * @param {CategoryViewProps} props - Propiedades del componente
 * @returns {JSX.Element} La vista de categorías renderizada
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
  // Modal states
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);
  const [isDeleteCategoryModalOpen, setIsDeleteCategoryModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const [isAddSectionModalOpen, setIsAddSectionModalOpen] = useState(false);
  const [isEditSectionModalOpen, setIsEditSectionModalOpen] = useState(false);
  const [isDeleteSectionModalOpen, setIsDeleteSectionModalOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [selectedSectionIdForProduct, setSelectedSectionIdForProduct] = useState<number | null>(null);

  // Category modal handlers
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

  // Section modal handlers
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

  // Product modal handlers
  const handleAddProduct = (sectionId: number) => {
    setSelectedSectionIdForProduct(sectionId);
    setIsAddProductModalOpen(true);
  };

  // Añadir useEffect para log de secciones cuando cambia la categoría seleccionada
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

  // Diagnóstico para isReorderModeActive
  useEffect(() => {
    console.log("🚨 [CRITICAL] CategoryView - Estado de isReorderModeActive:", isReorderModeActive);
  }, [isReorderModeActive]);

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
      console.warn('⚠️ [DRAG WARN] Ignorando reordenamiento porque isReorderModeActive es false');
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

      <div className="flex-grow rounded-lg overflow-hidden">
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
        <DeleteModal
          isOpen={isDeleteCategoryModalOpen}
          onClose={() => setIsDeleteCategoryModalOpen(false)}
          entityType="category"
          entityId={selectedCategory.category_id}
          entityName={selectedCategory.name}
          onConfirm={async () => {
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

      {isEditSectionModalOpen && selectedSection && (
        <EditSectionModal
          isOpen={isEditSectionModalOpen}
          onClose={() => setIsEditSectionModalOpen(false)}
          section={selectedSection}
          updateSection={async (formData, sectionId, categoryId) => {
            if (onEditSectionSubmit && selectedSection) {
              // Simplemente llamar al callback con la sección seleccionada
              onEditSectionSubmit(selectedSection);
            }
            return true;
          }}
        />
      )}

      {isDeleteSectionModalOpen && selectedSection && (
        <DeleteModal
          isOpen={isDeleteSectionModalOpen}
          onClose={() => setIsDeleteSectionModalOpen(false)}
          entityType="section"
          entityId={selectedSection.section_id}
          entityName={selectedSection.name}
          onConfirm={async () => {
            setIsDeleteSectionModalOpen(false);
            onDeleteSectionSubmit(selectedSection.section_id);
          }}
        />
      )}

      {isAddProductModalOpen && selectedSectionIdForProduct !== null && (
        <NewProductModal
          isOpen={isAddProductModalOpen}
          onClose={() => setIsAddProductModalOpen(false)}
          sectionId={selectedSectionIdForProduct}
          setProducts={(products: any) => {
            if (onAddProductSubmit && selectedSectionIdForProduct) {
              // Extraer el último producto añadido
              const sectionId = selectedSectionIdForProduct.toString();
              const productList = products[sectionId] || [];
              const lastProduct = productList.length > 0 ? productList[productList.length - 1] : null;
              if (lastProduct) {
                onAddProductSubmit({
                  ...lastProduct,
                  section_id: selectedSectionIdForProduct
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