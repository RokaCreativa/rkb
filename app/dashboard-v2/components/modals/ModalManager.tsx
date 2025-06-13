/**
 * 🧭 MIGA DE PAN CONTEXTUAL: Despachador central de modales UNIFICADO para todo el sistema dashboard
 * 
 * PORQUÉ CRÍTICO: Implementa patrón Dispatcher para centralizar la lógica de renderizado de modales
 * PROBLEMA RESUELTO: Sin este componente, cada vista tendría que manejar 9+ modales diferentes
 * 
 * ✅ REFACTORIZACIÓN COMPLETA: Todos los modales de eliminación ahora usan DeleteConfirmationModal
 * - Eliminados: DeleteCategoryConfirmation, DeleteSectionConfirmation, DeleteProductConfirmation
 * - Unificado: Un solo modal con colores consistentes y lógica centralizada
 * 
 * CONEXIONES CRÍTICAS:
 * - MobileView.tsx línea ~130: <ModalManager onSuccess={handleModalSuccess} />
 * - useModalStore.tsx: Estado global que determina qué modal renderizar
 * - EditModals.tsx: Sistema unificado para modales de edición
 * - DeleteConfirmationModal.tsx: Modal unificado para eliminaciones
 * 
 * FLUJO DE DATOS: useModalStore → ModalManager → Modal específico → API → store → UI refresh
 */
'use client';

import React from 'react';
import { useModalStore } from '@/app/dashboard-v2/hooks/ui/state/useModalStore';
import { useSession } from 'next-auth/react';

// ✅ SISTEMA UNIFICADO: Modales refactorizados
import { EditCategoryModal, EditSectionModal, EditProductModal } from './EditModals';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';

// ⚠️ DEUDA TÉCNICA: Modales legacy que necesitan refactorización
import NewCategoryModal from './NewCategoryModal';
import NewSectionModal from './NewSectionModal';
import NewProductModal from './NewProductModal';
import { Category, Section, Product } from '@/app/dashboard-v2/types';
import { useDashboardStore } from '@/app/dashboard-v2/stores/dashboardStore';

/**
 * 🧭 MIGA DE PAN CONTEXTUAL: Props que recibe ModalManager desde las vistas
 * PORQUÉ COMPLEJAS: Diferentes modales necesitan diferentes callbacks y datos de contexto
 * CONEXIÓN: MobileView pasa estas props, DashboardView usa useModalState directamente
 */
export interface ModalManagerProps {
    setCategories: React.Dispatch<React.SetStateAction<any[]>>;
    setSections: React.Dispatch<React.SetStateAction<any>>;
    setProducts: React.Dispatch<React.SetStateAction<any>>;
    onSuccess: () => void; // Callback crítico para refrescar datos tras operaciones CRUD
    onSectionDeleted?: (sectionId: number) => void; // Callback específico para navegación tras eliminar

    // Contexto de navegación móvil
    activeCategoryId?: number;
    activeSectionId?: number;
}

/**
 * 🧭 MIGA DE PAN CONTEXTUAL: Componente despachador que renderiza el modal activo
 * PATRÓN: Switch statement que mapea modalType → componente específico
 * ESTADO: Lee de useModalStore (estado global) para saber qué modal mostrar
 * LIMPIEZA: Si modalType es null, no renderiza nada (modal cerrado)
 */
export const ModalManager: React.FC<ModalManagerProps> = (props) => {
    const { data: session } = useSession();
    const { modalType, modalProps, closeModal } = useModalStore();

    if (!modalType) return null;

    /**
     * 🧭 MIGA DE PAN CONTEXTUAL: Extracción de datos del modal desde modalProps
     * PORQUÉ NECESARIO: Diferentes modales esperan diferentes tipos de datos
     * TIPADO: Cast explícito porque modalProps es genérico en useModalStore
     * CONEXIÓN: Estos datos vienen de openModal() calls en las vistas
     */
    const categoryToEdit = modalProps.category as Category | null;
    const sectionToEdit = modalProps.section as Section | null;
    const productToEdit = modalProps.product as Product | null;

    // Datos de sesión necesarios para autenticación en APIs
    const client = session?.user?.client || null;
    const clientId = session?.user?.client_id || null;

    /**
     * 🧭 MIGA DE PAN CONTEXTUAL: Switch dispatcher - corazón del sistema de modales
     * PATRÓN: Cada case mapea un modalType a su componente correspondiente
     * ✅ ARQUITECTURA UNIFICADA: Todos los modales de eliminación usan DeleteConfirmationModal
     */
    switch (modalType) {
        // ========== CATEGORÍAS ==========
        case 'newCategory':
            // ⚠️ LEGACY: NewCategoryModal usa props específicas
            return <NewCategoryModal
                isOpen={true}
                onClose={closeModal}
                setCategories={props.setCategories as any}
                onSuccess={props.onSuccess}
                client={client}
            />;
        case 'editCategory':
            // ✅ UNIFICADO: EditCategoryModal del sistema refactorizado
            return <EditCategoryModal
                isOpen={true}
                onClose={closeModal}
                category={categoryToEdit}
                clientId={clientId ?? undefined}
            />;
        case 'deleteCategory':
            // ✅ UNIFICADO: Usando DeleteConfirmationModal con colores consistentes
            return <DeleteConfirmationModal
                isOpen={true}
                onClose={closeModal}
                itemType="Categoría"
                onConfirm={() => {
                    if (categoryToEdit) {
                        useDashboardStore.getState().deleteCategory(categoryToEdit.category_id);
                        props.onSuccess();
                    }
                }}
            />;

        // ========== SECCIONES ==========
        case 'newSection':
            // ⚠️ LEGACY: Requiere activeCategoryId del contexto de navegación
            return <NewSectionModal
                isOpen={true}
                onClose={closeModal}
                categoryId={props.activeCategoryId!}
                setSections={props.setSections as any}
                onSuccess={props.onSuccess}
            />;
        case 'editSection':
            // ✅ UNIFICADO: EditSectionModal del sistema refactorizado
            return <EditSectionModal
                isOpen={true}
                onClose={closeModal}
                section={sectionToEdit}
                categoryId={props.activeCategoryId}
            />;
        case 'deleteSection':
            // ✅ UNIFICADO: Usando DeleteConfirmationModal con colores consistentes
            return <DeleteConfirmationModal
                isOpen={true}
                onClose={closeModal}
                itemType="Sección"
                onConfirm={() => {
                    if (sectionToEdit) {
                        useDashboardStore.getState().deleteSection(sectionToEdit.section_id);
                        props.onSuccess();
                        // Callback específico para navegación tras eliminar sección
                        if (props.onSectionDeleted) {
                            props.onSectionDeleted(sectionToEdit.section_id);
                        }
                    }
                }}
            />;

        // ========== PRODUCTOS ==========
        case 'newProduct':
            /**
             * 🧭 MIGA DE PAN CONTEXTUAL: Modal de productos con lógica adaptativa
             * COMPLEJIDAD: Maneja tanto categorías simples como complejas
             * CATEGORÍAS SIMPLES: Usan categoryId directamente (sin sección intermedia)
             * CATEGORÍAS COMPLEJAS: Usan sectionId tradicionalmente
             * CONEXIÓN: modalProps viene de FAB clicks en MobileView.renderFab()
             */
            const categoryId = modalProps.categoryId as number | undefined;
            const sectionFromProps = modalProps.section as Section | undefined;

            return <NewProductModal
                isOpen={true}
                onClose={closeModal}
                sectionId={sectionFromProps?.section_id || props.activeSectionId}
                categoryId={categoryId} // Nueva prop para categorías simples
                setProducts={props.setProducts as any}
                onSuccess={props.onSuccess}
                selectedSection={sectionFromProps} // Solo si hay sección
            />;
        case 'editProduct':
            // ✅ UNIFICADO: EditProductModal del sistema refactorizado
            return <EditProductModal
                isOpen={true}
                onClose={closeModal}
                product={productToEdit}
                sectionId={props.activeSectionId}
            />;
        case 'deleteProduct':
            // ✅ UNIFICADO: Usando DeleteConfirmationModal con colores consistentes
            return <DeleteConfirmationModal
                isOpen={true}
                onClose={closeModal}
                itemType="Producto"
                onConfirm={() => {
                    if (productToEdit) {
                        useDashboardStore.getState().deleteProduct(productToEdit.product_id);
                        props.onSuccess();
                    }
                }}
            />;

        default:
            return null;
    }
}; 