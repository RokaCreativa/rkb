/**
 * @file DeleteConfirmationModal.tsx
 * @description Componente de modal para confirmar la eliminación de una entidad.
 * @architecture
 * Este es un componente de UI genérico y reutilizable diseñado para una tarea crítica:
 * prevenir acciones destructivas accidentales. No contiene lógica de negocio.
 *
 * @workflow
 * 1. Es invocado por el hook `useModalState` cuando el usuario hace clic en un icono de papelera.
 * 2. Recibe el `itemType` (ej: "Categoría") para mostrar un mensaje claro y específico.
 * 3. Recibe los callbacks `onClose` y `onConfirm`.
 * 4. Si el usuario hace clic en "Sí, eliminar", llama a `onConfirm`, que a su vez ejecuta
 *    `handleConfirmDelete` en `useModalState`, el cual finalmente llama a la acción
 *    correspondiente en `dashboardStore`.
 *
 * @dependencies
 * - `BaseModal`: Para una apariencia consistente con otros modales de la aplicación.
 * - `useModalState`: Es el hook que orquesta la visibilidad y las acciones de este modal.
 */
'use client';

import React from 'react';
import { BaseModal } from '@/app/dashboard-v2/components/ui/Modal/BaseModal';
import { Button } from '@/app/dashboard-v2/components/ui/Button/Button';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    itemType: string;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    itemType,
}) => {
    if (!isOpen) return null;

    const title = `Eliminar ${itemType}`;

    const footer = (
        <div className="flex justify-end space-x-2">
            <Button variant="ghost" onClick={onClose}>
                Cancelar
            </Button>
            <Button
                variant="danger"
                onClick={() => {
                    onConfirm();
                    onClose();
                }}
            >
                <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                Sí, eliminar
            </Button>
        </div>
    );

    return (
        <BaseModal isOpen={isOpen} onClose={onClose} title={title} footer={footer} size="sm">
            <div className="flex items-start">
                <div className="mx-auto shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                </div>
                <div className="ml-4 text-left">
                    <p className="text-sm text-gray-500">
                        ¿Estás seguro de que quieres eliminar est{itemType === 'Categoría' || itemType === 'Sección' ? 'a' : 'e'} {itemType.toLowerCase()}? Esta acción no se puede deshacer.
                        Todos los datos asociados serán eliminados permanentemente.
                    </p>
                </div>
            </div>
        </BaseModal>
    );
};