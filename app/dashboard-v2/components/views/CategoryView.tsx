"use client";

/**
 * @fileoverview Componente de vista para la visualización y gestión de categorías
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-06-13
 */

import React, { useState } from 'react';
import { PlusIcon } from "@heroicons/react/24/outline";
import CategoryTable from "../CategoryTable";
import { Category, Section, Product } from "@/app/types/menu";

// Modificar las importaciones para usar los componentes que realmente existen
import NewCategoryModal from '../modals/NewCategoryModal';
import EditCategoryModal from '../modals/EditCategoryModal';
import DeleteCategoryModal from '../modals/DeleteCategoryModal';
import NewSectionModal from '../modals/NewSectionModal';
import EditSectionModal from '../modals/EditSectionModal';
import DeleteSectionModal from '../modals/DeleteSectionModal';
import NewProductModal from '../modals/NewProductModal';

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
  isUpdatingProductVisibility
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
  
  const [isReorderModeActive, setIsReorderModeActive] = useState(false);

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

  return (
    <div className="flex flex-col w-full min-h-0 p-4 bg-indigo-50/30">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-indigo-800">Gestión de Menú</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setIsReorderModeActive(!isReorderModeActive)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center ${
              isReorderModeActive 
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'border border-indigo-600 text-indigo-600 hover:bg-indigo-50'
            }`}
          >
            {isReorderModeActive ? 'Finalizar reordenación' : 'Reordenar categorías'}
          </button>
          <button
            onClick={handleAddCategory}
            className="px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
          >
            Añadir categoría
          </button>
        </div>
      </div>
      
      <div className="mb-4">
        <p className="text-indigo-800 text-sm">
          Añade, edita y gestiona tus categorías. Puedes reordenarlas haciendo clic en &quot;Reordenar categorías&quot;.
        </p>
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
          isReorderModeActive={isReorderModeActive}
          products={products}
          onToggleProductVisibility={onToggleProductVisibility}
          onEditProduct={onEditProduct}
          onDeleteProduct={onDeleteProduct}
          isUpdatingProductVisibility={isUpdatingProductVisibility}
        />
      </div>

      {/* Modals */}
      <NewCategoryModal
        isOpen={isAddCategoryModalOpen}
        onClose={() => setIsAddCategoryModalOpen(false)}
        client={null}
        setCategories={(() => {}) as any}
        onSuccess={() => {
          if (onAddCategorySubmit) {
            onAddCategorySubmit({} as Partial<Category>);
          }
        }}
      />
      
      {selectedCategory && (
        <>
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
          
          <DeleteCategoryModal 
            isOpen={isDeleteCategoryModalOpen}
            onClose={() => setIsDeleteCategoryModalOpen(false)}
            categoryId={selectedCategory.category_id}
            categoryName={selectedCategory.name || 'esta categoría'}
            onConfirm={async () => {
              if (onDeleteCategorySubmit) {
                onDeleteCategorySubmit(selectedCategory.category_id);
              }
              return Promise.resolve();
            }}
          />
        </>
      )}
      
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
      
      {selectedSection && (
        <>
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
          
          <DeleteSectionModal
            isOpen={isDeleteSectionModalOpen}
            onClose={() => setIsDeleteSectionModalOpen(false)}
            sectionId={selectedSection.section_id}
            sectionName={selectedSection.name || 'esta sección'}
            onConfirm={async () => {
              if (onDeleteSectionSubmit) {
                onDeleteSectionSubmit(selectedSection.section_id);
              }
              return Promise.resolve();
            }}
          />
        </>
      )}
      
      {selectedSectionIdForProduct && onAddProductSubmit && (
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
    </div>
  );
};

export default CategoryView; 