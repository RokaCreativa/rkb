/**
 * Archivo de barril (barrel file) para los componentes de estado del dashboard
 * 
 * Este archivo simplifica la importación de componentes desde un único punto,
 * permitiendo usar:
 * 
 * import { ApiStateHandler, LoadingStates, ErrorStates, EmptyStates } from '@/app/dashboard/components/state';
 */

export { default as ApiStateHandler } from './ApiStateHandler';
// Estos componentes serán implementados en el futuro según el plan de refactorización
// export { default as LoadingStates } from './LoadingStates';
// export { default as ErrorStates } from './ErrorStates';
// export { default as EmptyStates } from './EmptyStates'; 
 