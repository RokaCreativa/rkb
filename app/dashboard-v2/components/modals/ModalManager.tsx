'use client';

import { useState } from 'react';
import { useDashboardStore } from '../../stores/dashboardStore';
import type { Category, Section, Product } from '../../types';

export type ModalType =
  | 'editCategory'
  | 'editSection'
  | 'editProduct'
  | 'deleteConfirmation'
  | null;
export type ItemType = 'category' | 'section' | 'product';
type ModalData = Category | Section | Product | null;

export interface ModalOptions {
  item?: ModalData;
  type?: ItemType;
}

interface FullModalState {
  type: ModalType;
  options: ModalOptions;
}

export const useModalState = () => {
  const [modalState, setModalState] = useState<FullModalState>({
    type: null,
    options: {},
  });

  const {
    deleteCategory, deleteSection, deleteProduct,
    createCategory, updateCategory,
    createSection, updateSection,
    createProduct, updateProduct
  } = useDashboardStore();

  const openModal = (type: ModalType, options: ModalOptions = {}) => {
    setModalState({ type, options });
  };

  const closeModal = () => {
    setModalState({ type: null, options: {} });
  };

  const handleConfirmDelete = () => {
    const { item, type } = modalState.options;
    if (!item || !type) return;

    switch (type) {
      case 'category':
        deleteCategory((item as Category).category_id);
        break;
      case 'section':
        deleteSection((item as Section).section_id);
        break;
      case 'product':
        deleteProduct((item as Product).product_id);
        break;
    }
    closeModal();
  };

  const handleSave = async (formData: { data: Partial<any>; imageFile?: File | null }) => {
    const { item, type } = modalState.options;
    if (!type) return;

    const { data, imageFile } = formData;
    const isEditing = !!item;

    try {
      switch (type) {
        case 'category':
          if (isEditing) await updateCategory((item as Category).category_id, data, imageFile);
          else await createCategory(data, imageFile);
          break;
        case 'section':
          if (isEditing) await updateSection((item as Section).section_id, data, imageFile);
          else await createSection(data, imageFile);
          break;
        case 'product':
          if (isEditing) await updateProduct((item as Product).product_id, data, imageFile);
          else await createProduct(data, imageFile);
          break;
      }
      closeModal();
    } catch (error) {
      console.error("Error en handleSave:", error);
    }
  };

  return {
    modalState,
    openModal,
    closeModal,
    handleConfirmDelete,
    handleSave,
  };
};
