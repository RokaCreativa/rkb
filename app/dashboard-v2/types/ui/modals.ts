import { Category, Product, Section } from '@/app/dashboard-v2/types';

export type ModalType = 'editCategory' | 'editSection' | 'editProduct' | 'deleteCategory' | 'deleteSection' | 'deleteProduct' | 'customization' | null;

export interface ModalState {
  type: ModalType;
  data: Category | Section | Product | null;
  isOpen: boolean;
}
/* \
### 1. `useModalState.ts` - La fuente de verdad de la UI del Modal

Primero, convertimos`useModalState` en el verdadero dueño del estado de la UI del modal, incluyendo el estado de envío(`isSubmitting`).

 */