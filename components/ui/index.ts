/**
 * Exportaciones de componentes UI
 * 
 * Este archivo centraliza todas las exportaciones de los componentes UI
 * para facilitar su importación desde otros archivos.
 */

// Componentes básicos
export { default as Alert } from './Alert';
export { default as Button } from './button';
export { default as Card } from './card';
export { default as ConfirmDialog } from './ConfirmDialog';
export { default as ImageUpload } from './ImageUpload';
export { default as Modal } from './Modal';
export { default as Notification } from './Notification';
export { default as Pagination } from './Pagination';
export { default as Spinner } from './Spinner';
export { default as Table } from './Table';
export { default as TextField } from './TextField';

// Componentes de utilidad
export {
  If,
  Else,
  Show,
  For,
  Switch,
  Case,
  Default,
  ConditionalWrapper
} from './conditional';

// Tipos exportados
export type { ButtonProps, ButtonVariant, ButtonSize } from './button';
export type { CardProps, CardVariant } from './card';
export type { ConfirmDialogProps, ConfirmDialogType } from './ConfirmDialog';
export type { ImageUploadProps } from './ImageUpload';
export type { ModalProps, ModalSize } from './Modal';
export type { PaginationProps } from './Pagination';
export type { SpinnerProps, SpinnerVariant, SpinnerSize } from './Spinner';
export type { 
  Column, 
  TableProps, 
  SortDirection 
} from './Table';
export type { 
  TextFieldProps, 
  TextFieldVariant, 
  TextFieldSize, 
  TextFieldState 
} from './TextField';
export type { AlertProps, AlertVariant } from './Alert'; 