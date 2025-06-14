/**
 * 🧭 MIGA DE PAN CONTEXTUAL: Hook centralizado para gestión de modales en todo el dashboard
 * 
 * PORQUÉ CRÍTICO: Implementa Mandamiento #6 (Separación de Responsabilidades) extrayendo
 * toda la lógica de modales de los componentes de presentación
 * 
 * PROBLEMA RESUELTO: Sin este hook, DashboardView y MobileView tendrían múltiples useState
 * para cada modal, creando código duplicado y difícil de mantener
 * 
 * CONEXIONES CRÍTICAS:
 * - DashboardView.tsx línea ~25: const { modalState, openModal, closeModal, handleDeleteItem, handleConfirmDelete } = useModalState()
 * - MobileView.tsx línea ~40: const { openModal } = useModalState() (a través de ModalManager)
 * - EditModals.tsx: Todos los modales de edición reciben isOpen desde modalState.type
 * - DeleteConfirmationModal.tsx: Modal de confirmación que usa handleConfirmDelete
 * 
 * ARQUITECTURA: Hook → Store → API → UI (flujo unidireccional)
 * - Hook maneja UI state (qué modal está abierto)
 * - Store maneja business logic (llamadas a API)
 * - Componentes solo renderizan según el estado
 * 
 * DECISIÓN DE DISEÑO: Un solo estado para todos los modales en lugar de múltiples useState
 * porque simplifica la lógica y garantiza que solo un modal esté abierto a la vez
 */
'use client';

import { useState } from 'react';
import { useDashboardStore } from '@/app/dashboard-v2/stores/dashboardStore';
import { Category, Section, Product } from '@/app/dashboard-v2/types';

type ModalType = 'editCategory' | 'editSection' | 'editProduct' | 'editProductDirect' | 'delete' | null;
type ModalData = Category | Section | Product | null;
type ItemType = 'category' | 'section' | 'product';

export const useModalState = () => {
    /**
     * 🧭 MIGA DE PAN CONTEXTUAL: Estado unificado para todos los modales del sistema
     * PORQUÉ UN SOLO ESTADO: Garantiza que solo un modal esté abierto a la vez (mejor UX)
     * ESTRUCTURA: { type, data, itemType } permite manejar diferentes modales con una sola variable
     * CONEXIÓN: Este estado se lee en DashboardView para determinar qué modal renderizar
     */
    const [modalState, setModalState] = useState<{
        type: ModalType;
        data: ModalData;
        itemType?: ItemType;
    }>({ type: null, data: null });

    // 🧭 MIGA DE PAN: Conexión directa con store para operaciones de eliminación
    // PORQUÉ AQUÍ: El hook maneja la confirmación UI, el store maneja la lógica de negocio
    const { deleteCategory, deleteSection, deleteProduct } = useDashboardStore();

    /**
     * 🧭 MIGA DE PAN CONTEXTUAL: Función para abrir cualquier modal del sistema
     * CONEXIONES CRÍTICAS:
     * - CategoryGridView.tsx: onEdit → openModal('editCategory', category)
     * - SectionGridView.tsx: onEdit → openModal('editSection', section)  
     * - ProductGridView.tsx: onEdit → openModal('editProduct', product)
     * - FAB buttons: onAddNew → openModal('editCategory', null) para crear nuevo
     * DECISIÓN: data=null indica modo "crear", data!=null indica modo "editar"
     */
    const openModal = (type: ModalType, data: ModalData = null) => {
        setModalState({ type, data });
    };

    /**
     * 🧭 MIGA DE PAN CONTEXTUAL: Cierre universal de modales
     * CONEXIONES: Todos los modales reciben onClose={closeModal}
     * LIMPIEZA: Resetea completamente el estado para evitar datos residuales
     */
    const closeModal = () => {
        setModalState({ type: null, data: null });
    };

    /**
     * 🧭 MIGA DE PAN CONTEXTUAL: Preparación para modal de confirmación de eliminación
     * PORQUÉ DOS PASOS: 1) Abrir modal de confirmación, 2) Usuario confirma → eliminar
     * CONEXIONES: GridView.onDelete → handleDeleteItem → modal confirmación → handleConfirmDelete
     * PARÁMETRO itemType: Necesario para saber qué función de eliminación llamar después
     */
    const handleDeleteItem = (item: ModalData, itemType: ItemType) => {
        openModal('delete', item);
        setModalState(prev => ({ ...prev, itemType }));
    };

    /**
     * 🧭 MIGA DE PAN CONTEXTUAL: Ejecuta eliminación tras confirmación del usuario
     * PORQUÉ SWITCH: Diferentes entidades requieren diferentes funciones del store
     * CONEXIÓN: DeleteConfirmationModal.onConfirm → handleConfirmDelete
     * FLUJO COMPLETO: GridView → handleDeleteItem → modal → handleConfirmDelete → store.delete* → API
     * LIMPIEZA: Cierra modal automáticamente tras confirmar (UX fluida)
     */
    const handleConfirmDelete = () => {
        if (!modalState.data || !modalState.itemType) return;

        // Delegación al store según tipo de entidad
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
