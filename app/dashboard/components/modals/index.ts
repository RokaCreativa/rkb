/**
 * @file index.ts
 * @description Archivo barril (barrel file) para componentes de modal del dashboard
 * @author TuNombre
 * @version 1.0.0
 * @lastUpdated 2024-03-27
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

// Componentes base de modal
export { default as BaseModal } from './BaseModal';
export { default as FormModal } from './FormModal';
export { default as ConfirmationModal } from './ConfirmationModal';
export { default as DeleteModal } from './DeleteModal';
export type { DeleteItemType } from './DeleteModal';

// Modales de confirmación de eliminación
export * from './deletions'; 