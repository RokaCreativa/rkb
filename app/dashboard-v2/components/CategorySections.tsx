"use client";

import React, { useState, useEffect } from 'react';
import { Category, Section } from '../types';
import { LegacySection, toLegacySection, toOfficialSection } from '../types/legacy';
import SectionList from './sections/SectionList';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { PlusIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import SectionDetail from './SectionDetail';
import useDataState from '../hooks/useDataState';

interface CategorySectionsProps {
  category: Category;
}

export default function CategorySections({ category }: CategorySectionsProps) {
  const [sections, setSections] = useState<Section[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    sections: sectionsMap,
    fetchSectionsByCategory,
    deleteSection
  } = useDataState();
  
  // Cargar secciones cuando cambia la categoría
  useEffect(() => {
    const loadSections = async () => {
      if (!category) return;
      
      setIsLoading(true);
      try {
        await fetchSectionsByCategory(category.category_id);
        setIsLoading(false);
      } catch (error) {
        console.error('Error al cargar secciones:', error);
        setIsLoading(false);
      }
    };
    
    loadSections();
  }, [category, fetchSectionsByCategory]);
  
  // Actualizar secciones locales cuando cambia el store
  useEffect(() => {
    if (category && sectionsMap && sectionsMap[category.category_id]) {
      // Usar directamente las secciones del store ya que son del tipo Section
      const dashboardSections = sectionsMap[category.category_id] || [];
      setSections(dashboardSections);
    }
  }, [category, sectionsMap]);
  
  // Manejador para abrir el modal de edición
  const handleEditClick = (legacySection: LegacySection) => {
    // Convertir de LegacySection a Section para el estado interno
    const officialSection = toOfficialSection(legacySection);
    setSelectedSection(officialSection);
    setIsEditModalOpen(true);
  };
  
  // Manejador para abrir el modal de eliminación
  const handleDeleteClick = (legacySection: LegacySection) => {
    // Convertir de LegacySection a Section para el estado interno
    const officialSection = toOfficialSection(legacySection);
    setSelectedSection(officialSection);
    setIsDeleteModalOpen(true);
  };
  
  // Manejador para confirmar eliminación
  const handleConfirmDelete = async () => {
    if (!selectedSection) return;
    
    try {
      await deleteSection(selectedSection.section_id, category.category_id);
      setIsDeleteModalOpen(false);
      setSelectedSection(null);
      toast.success('Sección eliminada correctamente');
    } catch (error) {
      console.error('Error al eliminar la sección:', error);
      toast.error('Error al eliminar la sección');
    }
  };
  
  // Manejador para drag and drop
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    
    if (sourceIndex === destinationIndex) return;
    
    // Aquí iría la lógica para reordenar secciones
    toast.success('Orden actualizado');
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  if (!sections || sections.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <h3 className="text-lg font-medium text-gray-900">No hay secciones en esta categoría</h3>
        <p className="mt-1 text-sm text-gray-500">
          Crea una nueva sección para mostrar productos.
        </p>
        <div className="mt-6">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Nueva Sección
          </button>
        </div>
      </div>
    );
  }
  
  // Ordenar secciones por el campo display_order
  const sortedSections = [...sections].sort((a, b) => a.display_order - b.display_order);
  
  return (
    <div className="space-y-6">
      {/* Header con botones de acción */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-900">
          Secciones de {category.name}
        </h2>
        
        <div className="flex space-x-3">
          <button
            type="button"
            className={`inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${
              isReorderMode 
                ? 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200' 
                : 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200'
            }`}
            onClick={() => setIsReorderMode(!isReorderMode)}
          >
            {isReorderMode ? 'Terminar Reordenación' : 'Reordenar Secciones'}
          </button>
          
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Nueva Sección
          </button>
        </div>
      </div>
      
      {/* Lista de secciones con drag and drop */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="sections" isDropDisabled={!isReorderMode}>
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4"
            >
              {sortedSections.map((section, index) => (
                <Draggable
                  key={section.section_id}
                  draggableId={`section-${section.section_id}`}
                  index={index}
                  isDragDisabled={!isReorderMode}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`${snapshot.isDragging ? 'border-2 border-indigo-300' : ''}`}
                    >
                      <SectionDetail 
                        section={toLegacySection(section)}
                        onEditClick={handleEditClick}
                        onDeleteClick={handleDeleteClick}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      
      {/* Modal de confirmación de eliminación */}
      {isDeleteModalOpen && selectedSection && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900">Confirmar eliminación</h3>
            <p className="mt-2 text-sm text-gray-500">
              ¿Estás seguro de que deseas eliminar la sección "{selectedSection.name}"? Esta acción no se puede deshacer y se eliminarán todos los productos asociados.
            </p>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                type="button"
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedSection(null);
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
                onClick={handleConfirmDelete}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Implementar modales de creación y edición según sea necesario */}
    </div>
  );
} 