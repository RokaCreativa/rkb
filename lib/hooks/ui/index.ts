/**
 * @file index.ts
 * @description Archivo barril (barrel file) para hooks de UI
 * @author TuNombre
 * @version 1.0.0
 * @lastUpdated 2024-03-27
 */

/**
 * Este archivo simplifica la importación de hooks de UI desde un único punto,
 * permitiendo usar:
 * import { 
 *   useModalState, 
 *   useMultipleModals,
 *   useDragAndDrop, 
 *   useLoadingState,
 *   useToastNotifications
 * } from '@/lib/hooks/ui';
 */

export { default as useModalState, useMultipleModals } from './useModalState';
export { default as useLoadingState } from './useLoadingState';
export { default as useToastNotifications } from './useToastNotifications';
export { default as useDragAndDrop } from './useDragAndDrop'; 