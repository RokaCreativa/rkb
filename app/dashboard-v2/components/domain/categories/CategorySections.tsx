"use client";

import React, { useState, useEffect } from 'react';
import { Category } from '@/app/dashboard-v2/types/domain/category';
import { Section } from '@/app/dashboard-v2/types/domain/section';
import { LegacySection, toLegacySection, toOfficialSection } from '@/app/dashboard-v2/types/legacy';
import SectionList from '@/app/dashboard-v2/components/domain/sections/SectionList';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { PlusIcon } from '@heroicons/react/24/outline';
import { Bars3Icon } from '@heroicons/react/24/solid';
import { toast } from 'react-hot-toast';
import SectionDetail from '@/app/dashboard-v2/components/domain/sections/SectionDetail';
import useSectionManagement from '@/app/dashboard-v2/hooks/domain/section/useSectionManagement';

/**
 * Props para el componente CategorySections
 */
interface CategorySectionsProps {
  /** Categoría a mostrar */
  category: Category;
}

/**
 * Componente que muestra las secciones de una categoría específica
 * 
 * IMPORTANTE: Este componente NO incluye su propio DragDropContext,
 * debe ser utilizado dentro del DragDropContext global en DashboardView.
 */
export default function CategorySections({ category }: CategorySectionsProps) {
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState<Section | null>(null);
  const [isReorderMode, setIsReorderMode] = useState(false);

  // Usar el hook de estado global
  const { 
    sections: allSections, 
    setSections: setAllSections, 
    fetchSectionsByCategory, 
    deleteSection 
  } = useSectionManagement();

  useEffect(() => {
    // Solo cargar secciones si tenemos una categoría válida
    if (category && category.category_id) {
      const loadSections = async () => {
        try {
          setIsLoading(true);
          await fetchSectionsByCategory(category.category_id);
          setIsLoading(false);
        } catch (error) {
          console.error("Error cargando secciones:", error);
          setError("Error al cargar las secciones");
          setIsLoading(false);
        }
      };
      
      loadSections();
    }
  }, [category, fetchSectionsByCategory]);

  // Actualizar las secciones locales cuando cambien en el estado global
  useEffect(() => {
    if (category && allSections[category.category_id]) {
      setSections(allSections[category.category_id]);
    }
  }, [category, allSections]);

  // Manejar el clic en editar sección
  const handleEditClick = (section: LegacySection) => {
    // Implementar lógica para editar sección
    console.log("Editar sección:", section);
    // Aquí se abriría un modal o se navegaría a una vista de edición
  };

  // Manejar el clic en eliminar sección
  const handleDeleteClick = (section: LegacySection) => {
    setSectionToDelete(toOfficialSection(section));
    setShowDeleteModal(true);
  };

  // Confirmar eliminación de sección
  const confirmDelete = async () => {
    if (!sectionToDelete) return;
    
    try {
      await deleteSection(sectionToDelete.section_id, category.category_id);
      toast.success("Sección eliminada correctamente");
      setShowDeleteModal(false);
      setSectionToDelete(null);
    } catch (error) {
      console.error("Error eliminando sección:", error);
      toast.error("Error al eliminar la sección");
    }
  };

  // Ordenar secciones por display_order
  const sortedSections = [...sections].sort((a, b) => 
    (a.display_order || 999) - (b.display_order || 999)
  );

  // Manejar evento de reordenamiento (arrastrar y soltar)
  const handleDragEnd = (result: any) => {
    // Esta función ya no necesita implementar un onDragEnd completo
    // porque será manejado por el DragDropContext global
    // Solo conservamos la lógica para actualizar la vista local
    console.log("Reordenar secciones:", result);
    
    if (!result.destination) return;
    
    const items = Array.from(sortedSections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Actualizar el orden de visualización
    const updatedItems = items.map((item, index) => ({
      ...item,
      display_order: index + 1
    }));
    
    // Actualizar estado local
    if (category.category_id) {
      setAllSections({
        ...allSections,
        [category.category_id]: updatedItems
      });
    }
  };

  // ID único para el Droppable basado en la categoría
  const droppableId = `sections-category-${category.category_id}`;

  if (isLoading) {
    return <div>Cargando secciones...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="grid-container section-border">
      <div className="grid-header section-border section-bg">
        <h2 className="grid-title section-title">
          Secciones de {category.name}
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsReorderMode(!isReorderMode)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md ${
              isReorderMode 
              ? 'section-button' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {isReorderMode ? 'Guardar orden' : 'Reordenar secciones'}
          </button>
          <button
            onClick={() => {
              // Implementar lógica para agregar sección
              console.log("Agregar sección a categoría:", category.category_id);
            }}
            className="px-3 py-1.5 text-sm font-medium rounded-md section-button flex items-center"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Agregar sección
          </button>
        </div>
      </div>
      
      {/* IMPORTANTE: No hay DragDropContext aquí, solo Droppable */}
      <Droppable droppableId={droppableId} type="section" isDropDisabled={!isReorderMode}>
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="space-y-4 p-4"
          >
            {sortedSections.map((section, index) => (
              <Draggable
                key={section.section_id}
                draggableId={section.section_id.toString()}
                index={index}
                isDragDisabled={!isReorderMode}
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`grid-row ${snapshot.isDragging ? 'grid-item-dragging-section' : 'section-hover'}`}
                  >
                    <div className="flex items-center mb-2">
                      {/* Handle de arrastre separado */}
                      <div 
                        {...provided.dragHandleProps}
                        className="section-drag-handle mr-2 p-2 rounded-lg bg-teal-50 hover:bg-teal-100 cursor-grab"
                        title="Arrastrar para reordenar"
                        aria-label="Arrastrar para reordenar"
                        style={{
                          touchAction: 'none',
                          userSelect: 'none',
                          WebkitUserSelect: 'none',
                          MozUserSelect: 'none',
                          msUserSelect: 'none'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                        }}
                        onTouchStart={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <Bars3Icon className="h-5 w-5 text-teal-600" />
                      </div>
                      <SectionDetail 
                        section={toLegacySection(section)}
                        onEditClick={handleEditClick}
                        onDeleteClick={handleDeleteClick}
                      />
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
      
      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && sectionToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Eliminar sección</h3>
            <p className="mb-6">¿Está seguro que desea eliminar la sección "{sectionToDelete.name}"? Esta acción no se puede deshacer.</p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 