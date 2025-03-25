"use client";

/**
 * @fileoverview Componente para la visualización y gestión de secciones dentro de una categoría
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-03-26
 */

import React from 'react';
import { Category, Section, Client } from '@/app/types/menu';
import { ChevronDownIcon, ChevronRightIcon, ArrowLeftIcon, PlusIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { useDragAndDrop } from '@/lib/hooks/ui';

/**
 * Props para el componente SectionsView
 */
interface SectionsViewProps {
  /**
   * Categoría seleccionada actualmente
   */
  selectedCategory: Category;
  
  /**
   * Lista de secciones a mostrar
   */
  sections: Section[];
  
  /**
   * Registro de secciones expandidas por ID
   */
  expandedSections: Record<number, boolean>;
  
  /**
   * Función que se ejecuta al hacer clic en una sección
   * @param sectionId ID de la sección seleccionada
   */
  onSectionClick: (sectionId: number) => void;
  
  /**
   * Función que se ejecuta para crear una nueva sección
   */
  onNewSection: () => void;
  
  /**
   * Función que se ejecuta para editar una sección
   * @param section Sección a editar
   */
  onEditSection: (section: Section) => void;
  
  /**
   * Función que se ejecuta para eliminar una sección
   * @param sectionId ID de la sección a eliminar
   */
  onDeleteSection: (sectionId: number) => void;
  
  /**
   * Función que se ejecuta para cambiar la visibilidad de una sección
   * @param sectionId ID de la sección
   */
  onToggleVisibility: (sectionId: number) => Promise<void>;
  
  /**
   * ID de la sección que está actualizando su visibilidad
   */
  isUpdatingVisibility: number | null;
  
  /**
   * Función que se ejecuta para reordenar secciones
   * @param sourceIndex Índice de origen
   * @param destinationIndex Índice de destino
   */
  onReorderSection: (sourceIndex: number, destinationIndex: number) => void;
  
  /**
   * Función que se ejecuta para volver a la vista anterior
   */
  onBackClick: () => void;
  
  /**
   * Lista completa de categorías
   */
  allCategories: Category[];
  
  /**
   * Registro completo de secciones por categoría
   */
  allSections: Record<string, Section[]>;
  
  /**
   * Información del cliente
   */
  client: Client | null;
}

/**
 * Componente que muestra la lista de secciones de una categoría
 * Permite la navegación, expansión, creación, edición y eliminación de secciones
 * 
 * Este componente muestra todas las secciones disponibles para una categoría específica,
 * permitiendo al usuario gestionarlas (crear, editar, eliminar) y navegar a la vista de
 * productos de cada sección. También incluye funcionalidad para reordenar las secciones
 * mediante arrastrar y soltar (drag and drop).
 */
const SectionsView: React.FC<SectionsViewProps> = ({
  selectedCategory,
  sections,
  expandedSections,
  onSectionClick,
  onNewSection,
  onEditSection,
  onDeleteSection,
  onToggleVisibility,
  isUpdatingVisibility,
  onReorderSection,
  onBackClick,
  allCategories,
  allSections,
  client
}) => {
  // Utilizar el hook para manejar eventos de drag and drop
  const { getDragHandlers } = useDragAndDrop<Section>(onReorderSection);

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center">
          <button
            type="button"
            onClick={onBackClick}
            className="mr-3 rounded-full p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          >
            <ArrowLeftIcon className="h-5 w-5" aria-hidden="true" />
          </button>
          <h2 className="text-lg font-medium text-gray-900">
            Secciones: {selectedCategory.name}
          </h2>
        </div>
        <button
          type="button"
          onClick={onNewSection}
          className="inline-flex items-center gap-x-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <PlusIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
          Nueva Sección
        </button>
      </div>
      
      <ul className="divide-y divide-gray-200">
        {sections.length === 0 ? (
          <li className="p-4 text-center text-sm text-gray-500">
            No hay secciones disponibles en esta categoría. ¡Crea una nueva sección para comenzar!
          </li>
        ) : (
          sections.map((section, index) => (
            <li 
              key={section.section_id} 
              className="px-4 py-3 flex items-center hover:bg-gray-50"
              {...getDragHandlers(index)}
            >
              <div className="flex-1 flex items-center">
                <button
                  onClick={() => onSectionClick(section.section_id)}
                  className="flex items-center text-left"
                >
                  {expandedSections[section.section_id] ? (
                    <ChevronDownIcon className="h-5 w-5 text-gray-400 mr-2" />
                  ) : (
                    <ChevronRightIcon className="h-5 w-5 text-gray-400 mr-2" />
                  )}
                  
                  {section.image ? (
                    <div className="relative h-10 w-10 mr-3">
                      <Image
                        src={section.image}
                        alt={section.name}
                        fill
                        className="object-cover rounded"
                        sizes="40px"
                      />
                    </div>
                  ) : (
                    <div className="h-10 w-10 bg-gray-200 rounded mr-3 flex items-center justify-center">
                      <span className="text-xs text-gray-500">Sin img</span>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{section.name}</h3>
                    <p className="text-xs text-gray-500">
                      {section.status === 1 ? 'Visible' : 'Oculta'}
                    </p>
                  </div>
                </button>
              </div>
              
              <div className="ml-4 flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => onToggleVisibility(section.section_id)}
                  disabled={isUpdatingVisibility === section.section_id}
                  className={`px-2 py-1 text-xs rounded-md ${
                    section.status === 1
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {isUpdatingVisibility === section.section_id ? 'Actualizando...' : section.status === 1 ? 'Visible' : 'Oculta'}
                </button>
                
                <button
                  type="button"
                  onClick={() => onEditSection(section)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Editar
                </button>
                
                <button
                  type="button"
                  onClick={() => onDeleteSection(section.section_id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default SectionsView; 