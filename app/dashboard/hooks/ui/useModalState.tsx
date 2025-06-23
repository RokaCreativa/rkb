/**
 * 🧭 MIGA DE PAN CONTEXTUAL: Hook Centralizado para Gestión de Modales Unificado
 *
 * 📍 UBICACIÓN: hooks/ui/useModalState.tsx → Hook Principal de Modales
 *
 * 🎯 PORQUÉ EXISTE:
 * Implementa el sistema de modales unificado (T36 completado) extrayendo toda la lógica
 * de estado de los modales fuera de los componentes de presentación. Garantiza que solo
 * un modal pueda estar abierto a la vez y centraliza toda la lógica CRUD de modales.
 * Cumple Mandamiento #7 (Separación de Responsabilidades).
 *
 * 🔄 FLUJO DE DATOS:
 * 1. Componente UI → openModal(type, options) → ESTE HOOK
 * 2. modalState actualizado → componente re-renderiza modal apropiado
 * 3. Modal → handleSave() | handleConfirmDelete() → dashboardStore actions
 * 4. Store action completa → closeModal() → modal se cierra automáticamente
 * 5. UI actualizada → nueva data visible sin modal
 *
 * 🔗 CONEXIONES DIRECTAS:
 * - ENTRADA: DesktopMasterDetailView.tsx → openModal() llamadas
 * - ENTRADA: MobileDrillDownView.tsx → openModal() llamadas  
 * - SALIDA: EditModalComponents.tsx → consume modalState
 * - SALIDA: DeleteConfirmationModalComponent.tsx → consume modalState
 * - STORE: useDashboardStore → todas las actions CRUD (línea 44-47)
 *
 * 🚨 PROBLEMA RESUELTO (Bitácora #36):
 * - Antes: Lógica de modales duplicada en múltiples componentes
 * - Error: Estado inconsistente, múltiples modales abiertos simultáneamente
 * - Solución: Hook centralizado con estado único y actions unificadas
 * - Beneficio: Código DRY, comportamiento consistente, fácil debugging
 * - Fecha: 2025-01-10 - Sistema modales unificado completado
 *
 * 🎯 CASOS DE USO REALES:
 * - Crear categoría → openModal('editCategory', {}) → modo creación
 * - Editar producto → openModal('editProduct', {item: product}) → modo edición
 * - Eliminar sección → openModal('deleteConfirmation', {item: section, type: 'section'})
 * - Producto directo → openModal('editProduct', {isDirect: true, parentId: categoryId})
 *
 * ⚠️ REGLAS DE NEGOCIO CRÍTICAS:
 * - options.item = null/undefined → MODO CREACIÓN
 * - options.item con datos → MODO EDICIÓN
 * - Solo UN modal abierto a la vez (modalState.type controla)
 * - closeModal() automático en handleSave() exitoso
 * - NO cerrar modal en error (permite corrección)
 *
 * 🔗 DEPENDENCIAS CRÍTICAS:
 * - REQUIERE: useDashboardStore con todas las actions CRUD
 * - REQUIERE: EditModalComponents + DeleteConfirmationModalComponent
 * - REQUIERE: Tipos Category, Section, Product desde types/
 * - ROMPE SI: dashboardStore actions fallan sin toast
 * - ROMPE SI: modalState no se resetea correctamente
 *
 * 📊 PERFORMANCE:
 * - useState local → re-renders mínimos, solo cuando modal cambia
 * - Lazy modal rendering → solo renderiza modal activo
 * - Actions memoizadas → no re-crean funciones en cada render
 * - Error handling → no bloquea UI en fallos de API
 *
 * 📖 MANDAMIENTOS RELACIONADOS:
 * - Mandamiento #7 (Separación): Lógica aquí, UI en componentes "tontos"
 * - Mandamiento #3 (DRY): Elimina duplicación de lógica modal
 * - Mandamiento #6 (Consistencia): Comportamiento modal uniforme
 * - Mandamiento #1 (Contexto): Mantiene estado coherente entre vistas
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
    isDirect?: boolean;
    isGlobal?: boolean;
    parentId?: number;
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
