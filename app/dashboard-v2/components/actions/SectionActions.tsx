/**
 * @fileoverview Componente para las acciones relacionadas con secciones
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-03-27
 */

import React from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import Button from '../ui/Button/Button';

interface SectionActionsProps {
  /**
   * Categoría seleccionada actualmente
   */
  categoryName: string;

  /**
   * Función que se ejecuta al hacer clic en "Nueva Sección"
   */
  onNewSection: () => void;
}

/**
 * Componente que muestra los botones de acción para las secciones
 * 
 * Este componente agrupa los botones de acción relacionados con las secciones,
 * como el botón para crear una nueva sección dentro de la categoría seleccionada.
 */
const SectionActions: React.FC<SectionActionsProps> = ({ categoryName, onNewSection }) => {
  return (
    <div className="mb-4">
      <Button
        onClick={onNewSection}
        variant="success"
        fullWidth
        leftIcon={<PlusIcon className="h-5 w-5" />}
      >
        {categoryName ? `Añadir nueva sección a ${categoryName}` : 'Nueva Sección'}
      </Button>
    </div>
  );
};

export default SectionActions; 