"use client";

import React, { useState, useEffect } from 'react';
import { EyeIcon, EyeSlashIcon, PencilIcon, TrashIcon, PlusIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';
import { Loader } from '@/app/dashboard-v2/components/ui/Loader';
import { Category, Section, Product } from '@/app/types/menu';
import { getImagePath, handleImageError } from '@/app/dashboard-v2/utils/imageUtils';
import Image from 'next/image';
import SectionList from '@/app/dashboard-v2/components/domain/sections/SectionList';
import { GridIcon } from '@/app/dashboard-v2/components/ui/grid/GridIcon';
import { Section as DomainSection } from '@/app/dashboard-v2/types/domain/section';
import { CompatibleProduct, adaptDomainSectionToMenu } from '@/app/dashboard-v2/types/type-adapters';

interface CategoryTableProps {
  categories: Category[];
  expandedCategories: Record<number, boolean>;
  isUpdatingVisibility: number | null;
  onCategoryClick: (category: Category) => void;
  onToggleCategoryVisibility: (categoryId: number, currentStatus: number) => void;
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (category: Category) => void;
  sections: Record<number, Section[]>;
  expandedSections: Record<number, boolean>;
  onAddSection: (categoryId: number) => void;
  onSectionClick: (sectionId: number) => void;
  onToggleSectionVisibility: (sectionId: number, currentStatus: number) => void;
  onEditSection: (section: Section) => void;
  onDeleteSection: (section: Section) => void;
  onAddProduct: (sectionId: number) => void;
  onReorderCategory?: (sourceIndex: number, destinationIndex: number) => void;
  isReorderModeActive?: boolean;
  products?: Record<number, Product[]>;
  onToggleProductVisibility?: (productId: number, currentStatus: number, sectionId: number) => void;
  onEditProduct?: (product: Product) => void;
  onDeleteProduct?: (product: Product) => void;
  isUpdatingProductVisibility?: number | null;
  onAddCategory?: () => void;
  onProductsReorder?: (sectionId: number, sourceIndex: number, destinationIndex: number) => void;
}

const CategoryTable: React.FC<CategoryTableProps> = ({
  categories,
  expandedCategories,
  isUpdatingVisibility,
  onCategoryClick,
  onToggleCategoryVisibility,
  onEditCategory,
  onDeleteCategory,
  sections,
  expandedSections,
  onAddSection,
  onSectionClick,
  onToggleSectionVisibility,
  onEditSection,
  onDeleteSection,
  onAddProduct,
  onReorderCategory,
  isReorderModeActive = false,
  products = {},
  onToggleProductVisibility,
  onEditProduct,
  onDeleteProduct,
  isUpdatingProductVisibility = null,
  onAddCategory,
  onProductsReorder
}) => {
  // Diagnóstico para drag and drop al inicio de la renderización
  console.log('🚨 [CRITICAL] CategoryTable renderización:', {
    categoriesCount: categories?.length || 0,
    isReorderModeActive,
    onReorderCategoryExists: !!onReorderCategory
  });

  const [showHiddenCategories, setShowHiddenCategories] = useState(true);

  const visibleCategories = categories.filter(cat => cat.status === 1);
  const hiddenCategories = categories.filter(cat => cat.status !== 1);

  const visibleCategoriesCount = visibleCategories.length;
  const totalCategories = categories.length;

  /**
   * Renderiza una fila de categoría en la tabla de categorías
   * Incluye atributos data-label y data-entity-type para la visualización en tarjetas móviles
   */
  const renderCategoryRow = (
    category: Category,
    index: number,
    provided: any,
    snapshot: any
  ) => (
    <tr
      ref={provided.innerRef}
      {...provided.draggableProps}
      className={`${snapshot.isDragging
        ? "grid-item-dragging-category"
        : expandedCategories[category.category_id]
          ? "category-bg"
          : "hover:bg-gray-50"
        } mt-4`}
      data-entity-type="category"
      data-display-order={category.display_order || index + 1}
    >
      {/* Badge de orden - ahora es un td para evitar errores de hidratación */}
      <td className="hidden sm:hidden"></td>

      <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500 w-10">
        <div className="flex items-center">
          <button
            onClick={() => onCategoryClick(category)}
            className={`p-1 rounded-full transition-colors ${expandedCategories[category.category_id]
              ? "bg-indigo-100 category-title"
              : "hover:bg-gray-200 text-gray-500"
              }`}
            aria-label={expandedCategories[category.category_id] ? "Colapsar" : "Expandir"}
            aria-expanded={expandedCategories[category.category_id]}
          >
            {expandedCategories[category.category_id] ? (
              <GridIcon type="category" icon="collapse" size="large" />
            ) : (
              <GridIcon type="category" icon="expand" size="large" />
            )}
          </button>
        </div>
      </td>
      <td
        className="px-3 py-2 cursor-pointer cell-name"
        onClick={() => !isReorderModeActive && onCategoryClick(category)}
        data-label="Nombre"
      >
        <div className="flex items-center">
          <div
            {...provided.dragHandleProps}
            className={`mr-2 px-2 py-1 rounded-md transition-colors ${isReorderModeActive
              ? 'category-drag-handle bg-indigo-50 border-2 border-indigo-300 shadow-sm'
              : 'text-gray-400'
              }`}
            title={isReorderModeActive ? "Arrastrar para reordenar" : ""}
          >
            <GridIcon
              type="category"
              icon="drag"
              size="large"
              className={isReorderModeActive ? "text-indigo-600 animate-pulse" : "text-gray-400"}
            />
          </div>
          <div className="flex items-center">
            <span className={`text-sm font-medium ${expandedCategories[category.category_id]
              ? "category-text"
              : "text-gray-700"
              }`}>{category.name}</span>
            <span className="text-xs text-gray-500 ml-2">
              ({category.visible_sections_count || 0}/{category.sections_count || 0} secciones visibles)
            </span>
          </div>
        </div>
      </td>
      <td
        className="px-2 py-2 whitespace-nowrap text-sm text-gray-500 text-center cell-order"
        data-label="Orden"
      >
        {category.display_order || index + 1}
      </td>
      <td
        className="px-3 py-2 whitespace-nowrap cell-image"
        data-label="Imagen"
      >
        <div className="flex justify-center">
          <div className="category-image-container">
            <Image
              src={getImagePath(category.image, 'categories')}
              alt={category.name || ''}
              width={40}
              height={40}
              className="category-image object-cover! w-full! h-full!"
              onError={handleImageError}
            />
          </div>
        </div>
      </td>
      <td
        className="px-2 py-2 whitespace-nowrap text-center cell-visibility"
        data-label="Visibilidad"
      >
        <button
          onClick={() => onToggleCategoryVisibility(category.category_id, category.status)}
          className={`inline-flex items-center justify-center h-6 w-6 rounded ${category.status === 1
            ? 'category-action category-icon-hover'
            : 'text-gray-400 hover:bg-gray-100'
            }`}
          disabled={isUpdatingVisibility === category.category_id}
          aria-label={category.status === 1 ? "Ocultar categoría" : "Mostrar categoría"}
        >
          {isUpdatingVisibility === category.category_id ? (
            <div className="w-4 h-4 border-2 border-t-transparent border-indigo-500 rounded-full animate-spin"></div>
          ) : (
            <GridIcon
              type="category"
              icon={category.status === 1 ? "visibility" : "hidden"}
              size="medium"
            />
          )}
        </button>
      </td>
      <td
        className="px-3 py-2 whitespace-nowrap text-center cell-actions"
        data-label="Acciones"
      >
        <div className="flex justify-center space-x-1">
          <button
            onClick={() => onAddSection(category.category_id)}
            className="action-button category-action category-icon-hover"
            title="Agregar sección"
          >
            <GridIcon type="category" icon="add" size="medium" />
          </button>
          <button
            onClick={() => onEditCategory(category)}
            className="action-button category-action category-icon-hover"
          >
            <GridIcon type="category" icon="edit" size="medium" />
          </button>
          <button
            onClick={() => onDeleteCategory(category)}
            className="category-action-delete"
          >
            <GridIcon type="category" icon="delete" size="medium" />
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="rounded-lg border category-border overflow-hidden bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 py-2 category-bg border-b category-border">
        <h2 className="text-sm font-medium category-text">
          Tus menús (Comidas, Bebidas, Postres...)
        </h2>
        <div className="flex items-center">
          <div className="text-xs category-title mr-4">
            ({visibleCategoriesCount}/{totalCategories} Visibles)
          </div>
          <button
            onClick={() => setShowHiddenCategories(!showHiddenCategories)}
            className="text-xs category-title hover:text-indigo-800 flex items-center gap-1"
          >
            {showHiddenCategories ? 'Ocultar' : 'Mostrar'} no visibles
            {showHiddenCategories ?
              <ArrowDownIcon className="h-3 w-3" /> :
              <ArrowDownIcon className="h-3 w-3" />
            }
          </button>
        </div>
      </div>

      <table className="min-w-full divide-y category-border">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-2 py-2 text-left text-xs font-medium category-title uppercase tracking-wider w-10"></th>
            <th scope="col" className="px-3 py-2 text-left text-xs font-medium category-title uppercase tracking-wider">
              <div className="flex items-center gap-1">
                <ArrowUpIcon className="h-3 w-3 category-title" />
                <span>Nombre</span>
              </div>
            </th>
            <th scope="col" className="px-2 py-2 text-center text-xs font-medium category-title uppercase tracking-wider w-16">Orden</th>
            <th scope="col" className="px-3 py-2 text-center text-xs font-medium category-title uppercase tracking-wider w-16">Foto</th>
            <th scope="col" className="px-2 py-2 text-center text-xs font-medium category-title uppercase tracking-wider w-16">
              <EyeIcon className="h-4 w-4 mx-auto category-title" />
            </th>
            <th scope="col" className="px-3 py-2 text-center text-xs font-medium category-title uppercase tracking-wider w-20">Acciones</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y category-border">
          {visibleCategories.map((category, index) => (
            <React.Fragment key={`section-group-${category.category_id}`}>
              <tr>
                <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500 w-10">
                  <div className="flex items-center">
                    <button
                      onClick={() => onCategoryClick(category)}
                      className={`p-1 rounded-full transition-colors ${expandedCategories[category.category_id]
                        ? "bg-indigo-100 category-title"
                        : "hover:bg-gray-200 text-gray-500"
                        }`}
                      aria-label={expandedCategories[category.category_id] ? "Colapsar" : "Expandir"}
                      aria-expanded={expandedCategories[category.category_id]}
                    >
                      {expandedCategories[category.category_id] ? (
                        <GridIcon type="category" icon="collapse" size="large" />
                      ) : (
                        <GridIcon type="category" icon="expand" size="large" />
                      )}
                    </button>
                  </div>
                </td>
                <td
                  className="px-3 py-2 cursor-pointer cell-name"
                  onClick={() => !isReorderModeActive && onCategoryClick(category)}
                >
                  <div className="flex items-center">
                    <div
                      className={`mr-2 px-2 py-1 rounded-md transition-colors ${isReorderModeActive
                        ? 'category-drag-handle bg-indigo-50 border-2 border-indigo-300 shadow-sm'
                        : 'text-gray-400'
                        }`}
                      title={isReorderModeActive ? "Arrastrar para reordenar" : ""}
                    >
                      <GridIcon
                        type="category"
                        icon="drag"
                        size="large"
                        className={isReorderModeActive ? "text-indigo-600 animate-pulse" : "text-gray-400"}
                      />
                    </div>
                    <div className="flex items-center">
                      <span className={`text-sm font-medium ${expandedCategories[category.category_id]
                        ? "category-text"
                        : "text-gray-700"
                        }`}>{category.name}</span>
                      <span className="text-xs text-gray-500 ml-2">
                        ({category.visible_sections_count || 0}/{category.sections_count || 0} secciones visibles)
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500 text-center cell-order">
                  {category.display_order || index + 1}
                </td>
                <td className="px-3 py-2 whitespace-nowrap cell-image">
                  <div className="flex justify-center">
                    <div className="category-image-container">
                      <Image
                        src={getImagePath(category.image, 'categories')}
                        alt={category.name || ''}
                        width={40}
                        height={40}
                        className="category-image object-cover! w-full! h-full!"
                        onError={handleImageError}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-center cell-visibility">
                  <button
                    onClick={() => onToggleCategoryVisibility(category.category_id, category.status)}
                    className={`inline-flex items-center justify-center h-6 w-6 rounded ${category.status === 1
                      ? 'category-action category-icon-hover'
                      : 'text-gray-400 hover:bg-gray-100'
                      }`}
                    disabled={isUpdatingVisibility === category.category_id}
                    aria-label={category.status === 1 ? "Ocultar categoría" : "Mostrar categoría"}
                  >
                    {isUpdatingVisibility === category.category_id ? (
                      <div className="w-4 h-4 border-2 border-t-transparent border-indigo-500 rounded-full animate-spin"></div>
                    ) : (
                      <GridIcon
                        type="category"
                        icon={category.status === 1 ? "visibility" : "hidden"}
                        size="medium"
                      />
                    )}
                  </button>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-center cell-actions">
                  <div className="flex justify-center space-x-1">
                    <button
                      onClick={() => onAddSection(category.category_id)}
                      className="action-button category-action category-icon-hover"
                      title="Agregar sección"
                    >
                      <GridIcon type="category" icon="add" size="medium" />
                    </button>
                    <button
                      onClick={() => onEditCategory(category)}
                      className="action-button category-action category-icon-hover"
                    >
                      <GridIcon type="category" icon="edit" size="medium" />
                    </button>
                    <button
                      onClick={() => onDeleteCategory(category)}
                      className="category-action-delete"
                    >
                      <GridIcon type="category" icon="delete" size="medium" />
                    </button>
                  </div>
                </td>
              </tr>

              {/* Render sections if category is expanded */}
              {expandedCategories[category.category_id] && (
                <tr>
                  <td colSpan={6} className="p-0">
                    <div className="ml-8 mb-4">
                      <SectionList
                        sections={sections[category.category_id] || []}
                        expandedSections={expandedSections}
                        onSectionClick={onSectionClick}
                        onToggleSectionVisibility={onToggleSectionVisibility}
                        onEditSection={(section) => onEditSection && onEditSection(adaptDomainSectionToMenu(section as DomainSection))}
                        onDeleteSection={(section) => onDeleteSection && onDeleteSection(adaptDomainSectionToMenu(section as DomainSection))}
                        onAddProduct={sectionId => onAddProduct && onAddProduct(sectionId)}
                        products={products}
                        onToggleProductVisibility={onToggleProductVisibility}
                        onEditProduct={onEditProduct as (product: CompatibleProduct) => void}
                        onDeleteProduct={onDeleteProduct as (product: CompatibleProduct) => void}
                        isUpdatingVisibility={isUpdatingVisibility}
                        isUpdatingProductVisibility={isUpdatingProductVisibility}
                        categoryName={category.name}
                        categoryId={category.category_id}
                        onSectionsReorder={
                          onReorderCategory
                            ? (categoryId: number, sourceIndex: number, destinationIndex: number) => {
                              console.log("CategoryTable - reordering sections", {
                                categoryId,
                                sourceIndex,
                                destinationIndex,
                                onReorderCategoryExists: !!onReorderCategory,
                                isReorderModeActive
                              });
                              onReorderCategory(sourceIndex, destinationIndex);
                            }
                            : undefined
                        }
                        onAddSectionToCategory={onAddSection}
                        isReorderModeActive={isReorderModeActive}

                      />
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}

          {showHiddenCategories && hiddenCategories.map((category, index) => (
            <tr key={`hidden-category-${category.category_id}`} className="grid-item-hidden hover:bg-gray-50">
              <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500 w-10">
                <div className="flex items-center">
                  <button
                    onClick={() => onCategoryClick(category)}
                    className={`p-1 rounded-full transition-colors hover:bg-gray-200 text-gray-400`}
                    aria-label={expandedCategories[category.category_id] ? "Colapsar" : "Expandir"}
                  >
                    {expandedCategories[category.category_id] ? (
                      <GridIcon type="category" icon="collapse" size="large" />
                    ) : (
                      <GridIcon type="category" icon="expand" size="large" />
                    )}
                  </button>
                </div>
              </td>
              <td
                className="px-3 py-2 cursor-pointer"
                onClick={() => onCategoryClick(category)}
              >
                <div className="flex items-center">
                  <div className="mr-2">
                    <GridIcon type="category" icon="drag" size="large" />
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-400">{category.name}</span>
                    <span className="text-xs text-gray-400 ml-2">
                      ({category.visible_sections_count || 0}/{category.sections_count || 0} secciones visibles)
                    </span>
                  </div>
                </div>
              </td>
              <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-400 text-center">{category.display_order || visibleCategories.length + index + 1}</td>
              <td className="px-3 py-2 whitespace-nowrap">
                <div className="flex justify-center">
                  <div className="category-image-container opacity-70">
                    <Image
                      src={getImagePath(category.image, 'categories')}
                      alt={category.name || ''}
                      width={40}
                      height={40}
                      className="category-image object-cover! w-full! h-full! opacity-50 grayscale"
                      onError={handleImageError}
                    />
                  </div>
                </div>
              </td>
              <td className="px-2 py-2 whitespace-nowrap text-center">
                <button
                  onClick={() => onToggleCategoryVisibility(category.category_id, category.status)}
                  className="p-1.5 rounded-full text-gray-400 bg-gray-50 hover:bg-gray-100"
                  title="No visible"
                  disabled={isUpdatingVisibility === category.category_id}
                >
                  {isUpdatingVisibility === category.category_id ? (
                    <div className="w-5 h-5 flex items-center justify-center">
                      <div className="w-3 h-3 border-2 border-current border-t-transparent animate-spin rounded-full"></div>
                    </div>
                  ) : (
                    <GridIcon
                      type="category"
                      icon={category.status === 1 ? "visibility" : "hidden"}
                      size="medium"
                    />
                  )}
                </button>
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-center">
                <div className="flex justify-center space-x-1">
                  <button
                    onClick={() => onAddSection(category.category_id)}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                    title="Agregar sección"
                  >
                    <GridIcon type="category" icon="add" size="medium" />
                  </button>
                  <button
                    onClick={() => onEditCategory(category)}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                  >
                    <GridIcon type="category" icon="edit" size="medium" />
                  </button>
                  <button
                    onClick={() => onDeleteCategory(category)}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                  >
                    <GridIcon type="category" icon="delete" size="medium" />
                  </button>
                </div>
              </td>
            </tr>
          ))}

          {/* Botón para agregar categoría al final de la lista */}
          {onAddCategory && (
            <tr className="bg-gray-50">
              <td colSpan={6} className="px-3 py-3 text-center">
                <button
                  onClick={onAddCategory}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded category-button"
                >
                  <GridIcon type="category" icon="add" size="medium" />
                  Agregar categoría
                </button>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CategoryTable; 