/**
 * 🧭 MIGA DE PAN CONTEXTUAL: Hook centralizado para gestión de modales
 *
 * 📍 UBICACIÓN: app/dashboard-v2/hooks/ui/useModalState.tsx
 *
 * 🎯 PORQUÉ EXISTE:
 * Implementa Mandamiento #6 (Separación de Responsabilidades) extrayendo
 * toda la lógica de estado de los modales fuera de los componentes de presentación.
 * Esto evita código duplicado y asegura que solo un modal pueda estar abierto a la vez.
 *
 * 🔄 FLUJO DE DATOS:
 * 1. Un componente (ej: `DashboardView`) llama a `openModal` con un tipo (`editCategory`) y un objeto de opciones (`{item: ...}`).
 * 2. Este hook actualiza su `modalState` interno.
 * 3. `DashboardView` lee `modalState` y renderiza el modal correspondiente.
 * 4. El modal, al cerrarse o confirmar, llama a `closeModal` o `handleConfirmDelete`.
 *
 * 🔗 CONEXIONES DIRECTAS:
 * - CONSUMIDO POR: `DashboardView.tsx`
 * - CONTROLA A: `EditModals.tsx`, `DeleteConfirmationModal.tsx`
 * - LLAMA A: Funciones del `useDashboardStore` para ejecutar la eliminación.
 *
 * ⚠️ REGLAS DE NEGOCIO:
 * - `options.item = null` (o ausente) significa "modo creación".
 * - `options.item` con datos significa "modo edición".
 * - El objeto `options` es el único canal para pasar datos y contexto al modal.
 */
'use client';

import { useState } from 'react';
import { useDashboardStore } from '../../stores/dashboardStore';
import { Category, Section, Product } from '../../types';

// --- TIPOS EXPORTADOS (CORREGIDO: Se exporta ItemType) ---
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

// CONTRATO EXPLÍCITO: Definiendo el tipo de retorno del hook
export interface UseModalStateReturn {
    modalState: FullModalState;
    openModal: (type: ModalType, options?: ModalOptions) => void;
    closeModal: () => void;
    handleConfirmDelete: () => void;
    handleSave: (formData: { data: Partial<any>; imageFile?: File | null }) => Promise<void>;
}

export const useModalState = (): UseModalStateReturn => {
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
            closeModal(); // Cierra el modal en caso de éxito
        } catch (error) {
            // El toast de error ya lo muestra la acción del store.
            // No cerramos el modal para que el usuario pueda corregir.
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
