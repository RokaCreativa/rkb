/**
 * Exportaciones de los componentes modales del dashboard
 * @note Estos son componentes temporales hasta que implementemos los reales
 */

import { FC } from 'react';

// Definir interfaces para los modales
interface DeleteCategoryConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId: number;
  categoryName: string;
  onDeleted: (categoryId: number) => void;
  clientId: number | null;
  onDeleteConfirmed: (categoryId: number) => Promise<boolean>;
}

interface DeleteSectionConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  sectionId: number;
  sectionName: string;
  onDeleted: (sectionId: number) => void;
}

interface DeleteProductConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  productId: number;
  productName: string;
  deleteProduct: (productId: number) => Promise<boolean>;
  onDeleted: (productId: number) => void;
}

// Componentes temporales
export const DeleteCategoryConfirmation: FC<DeleteCategoryConfirmationProps> = (props) => {
  // Este es un componente temporal que no hace nada
  return null;
};

export const DeleteSectionConfirmation: FC<DeleteSectionConfirmationProps> = (props) => {
  // Este es un componente temporal que no hace nada
  return null;
};

export const DeleteProductConfirmation: FC<DeleteProductConfirmationProps> = (props) => {
  // Este es un componente temporal que no hace nada
  return null;
}; 