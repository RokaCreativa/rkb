/**
 * @file index.ts
 * @description Archivo de barril (barrel file) para componentes modales
 * @author TuNombre
 * @version 1.0.0
 * @lastUpdated 2024-03-27
 * 
 * @usage
 * import { BaseModal, FormModal, ConfirmationModal, DeleteModal } from '@/app/dashboard/components/modals';
 */

/**
 * Este archivo simplifica la importación de modales desde un único punto,
 * permitiendo usar:
 * import { 
 *   BaseModal, 
 *   FormModal, 
 *   ConfirmationModal,
 *   DeleteModal,
 *   DeleteCategoryConfirmation,
 *   DeleteSectionConfirmation,
 *   DeleteProductConfirmation
 * } from '@/app/dashboard/components/modals';
 */

// Componentes modales base
export { default as BaseModal } from './BaseModal';
export { default as FormModal } from './FormModal';
export { default as ConfirmationModal } from './ConfirmationModal';
export { default as DeleteModal } from './DeleteModal';
export type { DeleteItemType } from './DeleteModal';

// Componentes de confirmación de eliminación específicos
export { default as DeleteCategoryConfirmation } from './DeleteCategoryConfirmation';
export { default as DeleteSectionConfirmation } from './DeleteSectionConfirmation';
export { default as DeleteProductConfirmation } from './DeleteProductConfirmation';

// Modales de confirmación de eliminación
export * from './deletions'; 