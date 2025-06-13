"use client";

/**
 * @fileoverview Adaptador para el sistema unificado de modales
 * @description 
 * Este archivo sirve como un adaptador que redirige cualquier uso del modal antiguo 
 * EditProductModal al nuevo sistema unificado en EditModals.tsx, manteniendo la compatibilidad
 * con el código existente mientras transitamos completamente al nuevo sistema.
 */

import React from "react";
import { EditProductModal as UnifiedEditProductModal } from "./EditModals";
import { Product, Section, Client } from "@/app/dashboard-v2/types";

// Props de la versión antigua para mantener compatibilidad
export interface EditProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product | null;
    client?: Client | null;
    selectedSection?: Section | null;
    setProducts?: React.Dispatch<React.SetStateAction<Record<string, Product[]>>>;
    onSuccess?: () => void;
    onProductUpdated?: (updatedProduct: Product) => void;
}

/**
 * Componente adaptador que redirige al nuevo sistema de modales
 * Mantiene la misma firma de props que el original para asegurar compatibilidad
 */
const EditProductModal: React.FC<EditProductModalProps> = ({
    isOpen,
    onClose,
    product,
    selectedSection,
    onSuccess,
}) => {
    // Manejar el callback de éxito si está definido
    const handleClose = () => {
        onClose();
        if (onSuccess) {
            onSuccess();
        }
    };

    return (
        <UnifiedEditProductModal
            isOpen={isOpen}
            onClose={handleClose}
            product={product}
            sectionId={selectedSection?.section_id}
        />
    );
};

export default EditProductModal;
