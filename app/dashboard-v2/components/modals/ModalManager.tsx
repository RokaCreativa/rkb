'use client';

import React from 'react';
import { useModalStore } from '@/app/dashboard-v2/hooks/ui/state/useModalStore';
import { useSession } from 'next-auth/react';

// Importar todos los modales
import NewCategoryModal from './NewCategoryModal';
import EditCategoryModal from './EditCategoryModal';
import DeleteCategoryConfirmation from './DeleteCategoryConfirmation';
import NewSectionModal from './NewSectionModal';
import EditSectionModal from './EditSectionModal';
import DeleteSectionConfirmation from './DeleteSectionConfirmation';
import NewProductModal from './NewProductModal';
import EditProductModal from './EditProductModal';
import DeleteProductConfirmation from './DeleteProductConfirmation';
import { Category, Section, Product } from '@/app/dashboard-v2/types';

// Props que los componentes de gestión (como MobileView) necesitarán pasar
export interface ModalManagerProps {
    // TODO: Unificar los tipos de los `setters` y eliminar los `as any`
    setCategories: React.Dispatch<React.SetStateAction<any[]>>;
    setSections: React.Dispatch<React.SetStateAction<any>>;
    setProducts: React.Dispatch<React.SetStateAction<any>>;
    onSuccess: () => void;

    activeCategoryId?: number;
    activeSectionId?: number;
}

/**
 * Componente despachador que renderiza el modal activo según el estado de useModalStore.
 * Centraliza la lógica de renderizado de modales para mantener otros componentes limpios.
 */
export const ModalManager: React.FC<ModalManagerProps> = (props) => {
    const { data: session } = useSession();
    const { modalType, modalProps, closeModal } = useModalStore();

    if (!modalType) return null;

    // Los modales de edición/eliminación que restauramos desde Git esperan props con nombres
    // diferentes a los que había intentado estandarizar. Aquí usamos los nombres correctos
    // que esperan los componentes originales.
    const categoryToEdit = modalProps.category as Category | null;
    const sectionToEdit = modalProps.section as Section | null;
    const productToEdit = modalProps.product as Product | null;

    // Necesitamos la sesión y el cliente para algunos modales
    const client = session?.user?.client || null;
    const clientId = session?.user?.client_id || null;

    switch (modalType) {
        // ========== DEUDA TÉCNICA: Se usa 'as any' para evitar conflictos de tipos ==========
        // La solución a largo plazo es unificar los tipos en todos los modales.

        // Casos de Categoría
        case 'newCategory':
            return <NewCategoryModal
                isOpen={true}
                onClose={closeModal}
                setCategories={props.setCategories as any}
                onSuccess={props.onSuccess}
                client={client}
            />;
        case 'editCategory':
            return <EditCategoryModal
                isOpen={true}
                onClose={closeModal}
                categoryToEdit={categoryToEdit as any}
                setCategories={props.setCategories as any}
                onSuccess={props.onSuccess}
                client={client}
            />;
        case 'deleteCategory':
            return <DeleteCategoryConfirmation
                isOpen={true}
                onClose={closeModal}
                categoryId={categoryToEdit!.category_id}
                categoryName={categoryToEdit!.name}
                onDeleted={props.onSuccess as any}
                clientId={clientId}
            />;

        // Casos de Sección
        case 'newSection':
            return <NewSectionModal
                isOpen={true}
                onClose={closeModal}
                categoryId={props.activeCategoryId!}
                setSections={props.setSections as any}
                onSuccess={props.onSuccess}
            />;
        case 'editSection':
            // El modal restaurado espera 'section', no 'sectionToEdit'
            return <EditSectionModal
                isOpen={true}
                onClose={closeModal}
                section={sectionToEdit as any}
                onSuccess={props.onSuccess}
            />;
        case 'deleteSection':
            return <DeleteSectionConfirmation
                isOpen={true}
                onClose={closeModal}
                sectionId={sectionToEdit!.section_id}
                sectionName={sectionToEdit!.name}
                onDeleted={props.onSuccess as any}
                categoryId={props.activeCategoryId!}
            />;

        // Casos de Producto
        case 'newProduct':
            return <NewProductModal
                isOpen={true}
                onClose={closeModal}
                sectionId={props.activeSectionId!}
                setProducts={props.setProducts as any}
                onSuccess={props.onSuccess}
                selectedSection={sectionToEdit} // El modal original lo necesita
            />;
        case 'editProduct':
            // El modal restaurado espera 'product', no 'productToEdit'
            return <EditProductModal
                isOpen={true}
                onClose={closeModal}
                product={productToEdit as any}
                setProducts={props.setProducts as any}
                onSuccess={props.onSuccess}
                client={client}
                selectedSection={sectionToEdit} // El modal original lo necesita
            />;
        case 'deleteProduct':
            return <DeleteProductConfirmation
                isOpen={true}
                onClose={closeModal}
                productId={productToEdit!.product_id}
                productName={productToEdit!.name}
                onDeleted={props.onSuccess as any}
            />;

        default:
            return null;
    }
}; 