/**
 * @file useModalState.tsx
 * @description Hook personalizado para gestionar el estado de los modales en el dashboard.
 * @architecture
 * Este hook es un ejemplo de "Separación de Responsabilidades" (Mandamiento #6).
 * Su propósito es extraer y centralizar toda la lógica relacionada con la apertura, cierre
 * y gestión de datos de los modales de edición y eliminación.
 *
 * @decoupling
 * Al usar este hook, el componente orquestador (`DashboardView`) se simplifica enormemente.
 * En lugar de tener múltiples `useState` para cada modal, `DashboardView` simplemente llama a `useModalState()`
 * y obtiene una interfaz limpia (`modalState`, `openModal`, `closeModal`, etc.) para trabajar.
 *
 * @dependencies
 * - `dashboardStore`: Se conecta directamente con el store de Zustand para invocar las acciones
 *   de eliminación (`deleteCategory`, `deleteSection`, etc.) cuando el usuario confirma
 *   la acción en el `DeleteConfirmationModal`. Esto mantiene la lógica de API dentro del store.
 */
'use client';

import { useState } from 'react';
import { useDashboardStore } from '@/app/dashboard-v2/stores/dashboardStore';
import { Category, Section, Product } from '@/app/dashboard-v2/types';

type ModalType = 'editCategory' | 'editSection' | 'editProduct' | 'delete' | null;
type ModalData = Category | Section | Product | null;
type ItemType = 'category' | 'section' | 'product';

export const useModalState = () => {
    const [modalState, setModalState] = useState<{
        type: ModalType;
        data: ModalData;
        itemType?: ItemType;
    }>({ type: null, data: null });

    const { deleteCategory, deleteSection, deleteProduct } = useDashboardStore();

    const openModal = (type: ModalType, data: ModalData = null) => {
        setModalState({ type, data });
    };

    const closeModal = () => {
        setModalState({ type: null, data: null });
    };

    const handleDeleteItem = (item: ModalData, itemType: ItemType) => {
        openModal('delete', item);
        setModalState(prev => ({ ...prev, itemType }));
    };

    const handleConfirmDelete = () => {
        if (!modalState.data || !modalState.itemType) return;

        switch (modalState.itemType) {
            case 'category':
                deleteCategory((modalState.data as Category).category_id);
                break;
            case 'section':
                deleteSection((modalState.data as Section).section_id);
                break;
            case 'product':
                deleteProduct((modalState.data as Product).product_id);
                break;
            default:
                break;
        }
        closeModal();
    };

    return {
        modalState,
        openModal,
        closeModal,
        handleDeleteItem,
        handleConfirmDelete,
    };
};
