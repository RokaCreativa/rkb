import { create } from 'zustand';
import { Category, Section, Product } from '@/app/dashboard-v2/types';

type ModalType =
    | 'newCategory'
    | 'editCategory'
    | 'deleteCategory'
    | 'newSection'
    | 'editSection'
    | 'deleteSection'
    | 'newProduct'
    | 'editProduct'
    | 'deleteProduct';

interface ModalProps {
    category?: Category;
    section?: Section;
    product?: Product;
    categoryId?: number;
}

interface ModalState {
    modalType: ModalType | null;
    modalProps: ModalProps;
    isOpen: boolean;
    openModal: (type: ModalType, props?: ModalProps) => void;
    closeModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
    modalType: null,
    modalProps: {},
    isOpen: false,
    openModal: (type, props = {}) => set({ modalType: type, modalProps: props, isOpen: true }),
    closeModal: () => set({ modalType: null, modalProps: {}, isOpen: false }),
})); 