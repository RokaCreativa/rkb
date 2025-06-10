"use client";

/**
 * @fileoverview Hook especializado para la gestión completa de secciones del menú
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-06-15
 * 
 * Este hook centraliza toda la lógica de negocio relacionada con las secciones del menú.
 * Proporciona funcionalidades para cargar, crear, actualizar, eliminar y gestionar la 
 * visibilidad de las secciones, además de manejar los estados de carga y errores.
 * 
 * El hook está diseñado para ser utilizado por el hook principal useDashboardState,
 * que actúa como fachada para coordinar todos los hooks de dominio.
 */

import { useState, useCallback } from 'react';
import { Section, SectionState, SectionActions } from '@/app/dashboard-v2/types';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { DashboardService } from '@/lib/services/dashboardService';

/**
 * Hook para gestionar todos los aspectos relacionados con las secciones del menú
 * 
 * Proporciona un conjunto completo de funciones para administrar secciones,
 * incluyendo carga por categoría, creación, actualización, eliminación, 
 * cambio de visibilidad y reordenamiento.
 * 
 * @example
 * // Uso básico del hook
 * const sectionManagement = useSectionManagement();
 * 
 * // Cargar secciones de una categoría
 * useEffect(() => {
 *   if (selectedCategory) {
 *     sectionManagement.fetchSectionsByCategory(selectedCategory.category_id);
 *   }
 * }, [selectedCategory]);
 * 
 * @returns Objeto con estados y funciones para la gestión completa de secciones
 */
export default function useSectionManagement() {
  // Obtener la sesión actual del usuario para acceder a su ID de cliente
  const { data: session } = useSession();

  // Estado para almacenar las secciones indexadas por ID de categoría
  // El formato es: { "1": [sección1, sección2], "2": [sección3, sección4], ... }
  const [sections, setSections] = useState<{ [key: string]: Section[] }>({});

  // Estado para indicar si hay una operación de carga en progreso
  const [isLoading, setIsLoading] = useState(false);

  // Estado para almacenar mensajes de error
  const [error, setError] = useState<string | null>(null);

  // Estado para controlar qué sección está actualizando su visibilidad
  // Cuando una sección está actualizando su visibilidad, contiene su ID
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState<number | null>(null);

  /**
   * Carga todas las secciones de una categoría específica
   * @param categoryId ID de la categoría
   * @returns Promise con las secciones cargadas o array vacío en caso de error
   */
  const fetchSectionsByCategory = useCallback(async (categoryId: number): Promise<Section[]> => {
    try {
      // Comprobar primero si tenemos los datos en sessionStorage para desarrollo
      if (process.env.NODE_ENV === 'development') {
        const sessionKey = `sections_data_category_${categoryId}`;
        const storedData = sessionStorage.getItem(sessionKey);

        if (storedData) {
          const parsedData = JSON.parse(storedData);
          console.log(`📋 Usando secciones de categoría ${categoryId} almacenadas en sessionStorage (${parsedData.length} secciones)`);

          // Actualizar el estado de secciones para esta categoría
          setSections(prev => ({
            ...prev,
            [categoryId]: parsedData
          }));

          return parsedData;
        }
      }

      // Actualizar el estado de carga de la categoría específica
      setIsLoading(true);

      // Limpiar errores previos
      setError(null);

      console.log(`🔍 Obteniendo secciones para categoría ID=${categoryId}...`);

      // Determinar qué ID de cliente usar
      const clientId = session?.user?.client_id || 3; // Usar 3 como cliente de prueba si no hay sesión

      // Hacer la petición a la API
      const response = await fetch(`/api/sections?category_id=${categoryId}&client_id=${clientId}`);

      // Verificar respuesta
      if (!response.ok) {
        throw new Error(`Error al cargar secciones: ${response.status} ${response.statusText}`);
      }

      // Parsear datos
      const data = await response.json();

      // Verificar que los datos son válidos
      if (data && Array.isArray(data)) {
        // Asegurar que los datos sean consistentes
        const cleanData = data.map(section => ({
          ...section,
          image: section.image || null, // Asegurar que image sea string | null (nunca undefined)
          status: Number(section.status), // Asegurar que status sea número
          display_order: Number(section.display_order || 0), // Asegurar que display_order sea número
          client_id: section.client_id || clientId, // Usar cliente por defecto si no hay
          products_count: Number(section.products_count || 0), // Incluir contador total
          visible_products_count: Number(section.visible_products_count || 0) // Incluir contador visible
        }));

        // Guardar en sessionStorage para desarrollo
        if (process.env.NODE_ENV === 'development') {
          const sessionKey = `sections_data_category_${categoryId}`;
          sessionStorage.setItem(sessionKey, JSON.stringify(cleanData));
          console.log(`💾 Datos de secciones para categoría ${categoryId} guardados en sessionStorage (${cleanData.length} secciones)`);
        }

        // Actualizar el estado de secciones para esta categoría
        setSections(prev => ({
          ...prev,
          [categoryId]: cleanData
        }));

        // Actualizar el estado de carga
        setIsLoading(false);

        return cleanData;
      } else {
        throw new Error(`Formato de datos incorrecto para categoría ${categoryId}`);
      }
    } catch (err) {
      console.error(`❌ Error cargando secciones para categoría ${categoryId}:`, err);
      setError(`Error al cargar secciones para categoría ${categoryId}`);

      // Actualizar el estado de carga
      setIsLoading(false);

      return [];
    }
  }, [session]);

  /**
   * Crea una nueva sección en la categoría especificada
   * 
   * Esta función envía los datos del formulario al servidor para crear una nueva sección.
   * Si la operación es exitosa, actualiza el estado local añadiendo la nueva sección
   * a la lista de secciones de la categoría correspondiente.
   * 
   * @param formData - Objeto FormData con los datos de la nueva sección (incluyendo category_id, name, etc.)
   * @param categoryId - ID de la categoría a la que pertenecerá la nueva sección
   * @returns Promise<boolean> - true si la operación fue exitosa, false en caso de error
   * 
   * @example
   * // Crear una nueva sección con datos de un formulario
   * const form = new FormData();
   * form.append('name', 'Postres');
   * form.append('category_id', '3');
   * const success = await createSection(form, 3);
   * if (success) {
   *   console.log('Sección creada exitosamente');
   * }
   */
  const createSection = useCallback(async (formData: FormData, categoryId: number) => {
    try {
      // Indicar que se está realizando una operación
      setIsLoading(true);

      // Enviar los datos al servidor mediante una petición POST
      const response = await fetch('/api/sections', {
        method: 'POST',
        body: formData, // FormData con los campos necesarios
      });

      // Verificar si la respuesta fue exitosa
      if (!response.ok) {
        throw new Error(`Error al crear la sección: ${response.status}`);
      }

      // Obtener la nueva sección creada desde la respuesta
      const newSection = await response.json();

      // Actualizar el estado local añadiendo la nueva sección
      setSections(prevSections => {
        // Obtener el array de secciones actual para la categoría o usar un array vacío
        const currentSections = prevSections[categoryId.toString()] || [];

        // Devolver el nuevo estado con la sección añadida
        return {
          ...prevSections,
          [categoryId.toString()]: [...currentSections, newSection]
        };
      });

      // Mostrar mensaje de éxito al usuario
      toast.success('Sección creada correctamente');

      // Indicar que la operación ha finalizado
      setIsLoading(false);

      // Devolver true para indicar éxito
      return true;
    } catch (err) {
      // Registrar el error en la consola para depuración
      console.error('Error creando sección:', err);

      // Actualizar el estado de error
      setError('Error al crear la sección');

      // Mostrar mensaje de error al usuario
      toast.error('No se pudo crear la sección. Por favor, intenta nuevamente.');

      // Indicar que la operación ha finalizado (con error)
      setIsLoading(false);

      // Devolver false para indicar fallo
      return false;
    }
  }, []);

  /**
   * Actualiza una sección existente con los nuevos datos proporcionados
   * 
   * Envía los datos actualizados al servidor y, si la operación es exitosa,
   * actualiza el estado local con los nuevos datos de la sección.
   * 
   * @param formData - Objeto FormData con los datos actualizados de la sección
   * @param sectionId - ID de la sección que se va a actualizar
   * @param categoryId - ID de la categoría a la que pertenece la sección
   * @returns Promise<boolean> - true si la operación fue exitosa, false en caso de error
   * 
   * @example
   * // Actualizar el nombre de una sección
   * const form = new FormData();
   * form.append('name', 'Postres Especiales');
   * form.append('category_id', '3');
   * const success = await updateSection(form, 12, 3);
   */
  const updateSection = useCallback(async (formData: FormData, sectionId: number, categoryId: number) => {
    try {
      // Indicar que se está realizando una operación
      setIsLoading(true);

      // Enviar los datos al servidor mediante una petición PUT
      const response = await fetch(`/api/sections/${sectionId}`, {
        method: 'PUT',
        body: formData,
      });

      // Verificar si la respuesta fue exitosa
      if (!response.ok) {
        throw new Error(`Error al actualizar la sección: ${response.status}`);
      }

      // Obtener la sección actualizada desde la respuesta
      const updatedSection = await response.json();

      // Actualizar el estado local con la sección actualizada
      setSections(prevSections => {
        // Obtener el array de secciones actual para la categoría
        const currentSections = prevSections[categoryId.toString()] || [];

        // Crear un nuevo array con la sección actualizada
        const updatedSections = currentSections.map(section =>
          section.section_id === sectionId ? updatedSection : section
        );

        // Devolver el nuevo estado
        return {
          ...prevSections,
          [categoryId.toString()]: updatedSections
        };
      });

      // Mostrar mensaje de éxito al usuario
      toast.success('Sección actualizada correctamente');

      // Indicar que la operación ha finalizado
      setIsLoading(false);

      // Devolver true para indicar éxito
      return true;
    } catch (err) {
      // Registrar el error en la consola para depuración
      console.error('Error actualizando sección:', err);

      // Actualizar el estado de error
      setError('Error al actualizar la sección');

      // Mostrar mensaje de error al usuario
      toast.error('No se pudo actualizar la sección. Por favor, intenta nuevamente.');

      // Indicar que la operación ha finalizado (con error)
      setIsLoading(false);

      // Devolver false para indicar fallo
      return false;
    }
  }, []);

  /**
   * Elimina una sección por su ID
   * 
   * Envía una petición al servidor para eliminar la sección y,
   * si la operación es exitosa, actualiza el estado local eliminando
   * la sección de la lista correspondiente.
   * 
   * @param sectionId - ID de la sección que se va a eliminar
   * @param categoryId - ID de la categoría a la que pertenece la sección
   * @returns Promise<boolean> - true si la operación fue exitosa, false en caso de error
   * 
   * @example
   * // Eliminar una sección
   * const success = await deleteSection(12, 3);
   * if (success) {
   *   console.log('Sección eliminada exitosamente');
   * }
   */
  const deleteSection = useCallback(async (sectionId: number, categoryId: number) => {
    try {
      // Indicar que se está realizando una operación
      setIsLoading(true);

      // Enviar la petición de eliminación al servidor
      const response = await fetch(`/api/sections/${sectionId}`, {
        method: 'DELETE',
      });

      // Verificar si la respuesta fue exitosa
      if (!response.ok) {
        throw new Error(`Error al eliminar la sección: ${response.status}`);
      }

      // Actualizar el estado local eliminando la sección
      setSections(prevSections => {
        // Obtener el array de secciones actual para la categoría
        const currentSections = prevSections[categoryId.toString()] || [];

        // Filtrar las secciones para excluir la que se acaba de eliminar
        const updatedSections = currentSections.filter(
          section => section.section_id !== sectionId
        );

        // Devolver el nuevo estado
        return {
          ...prevSections,
          [categoryId.toString()]: updatedSections
        };
      });

      // Mostrar mensaje de éxito al usuario
      toast.success('Sección eliminada correctamente');

      // Indicar que la operación ha finalizado
      setIsLoading(false);

      // Devolver true para indicar éxito
      return true;
    } catch (err) {
      // Registrar el error en la consola para depuración
      console.error('Error eliminando sección:', err);

      // Actualizar el estado de error
      setError('Error al eliminar la sección');

      // Mostrar mensaje de error al usuario
      toast.error('No se pudo eliminar la sección. Por favor, intenta nuevamente.');

      // Indicar que la operación ha finalizado (con error)
      setIsLoading(false);

      // Devolver false para indicar fallo
      return false;
    }
  }, []);

  /**
   * Cambia la visibilidad de una sección (visible/oculta)
   * 
   * Actualiza el estado local primero (actualización optimista) y luego
   * envía la petición al servidor para confirmar el cambio. Si la operación
   * falla, revierte el cambio local.
   * 
   * @param sectionId - ID de la sección cuya visibilidad se cambiará
   * @param categoryId - ID de la categoría a la que pertenece la sección
   * @param currentStatus - Estado actual (1: visible, 0: oculta)
   * @returns Promise<boolean> - true si la operación fue exitosa, false en caso de error
   * 
   * @example
   * // Cambiar la visibilidad de una sección
   * const success = await toggleSectionVisibility(12, 3, 1);
   * // Si currentStatus era 1 (visible), ahora será 0 (oculta)
   */
  const toggleSectionVisibility = useCallback(async (
    sectionId: number,
    categoryId: number,
    currentStatus: number
  ) => {
    try {
      // Marcar que estamos actualizando la visibilidad de esta sección
      setIsUpdatingVisibility(sectionId);

      // Calcular el nuevo estado (alternar entre 0 y 1)
      const newStatus = currentStatus === 1 ? 0 : 1;

      // Actualización optimista en UI (actualizar antes de confirmar con el servidor)
      setSections(prevSections => {
        // Obtener las secciones actuales para esta categoría
        const currentSections = prevSections[categoryId.toString()] || [];

        // Crear un nuevo array con la sección actualizada
        const updatedSections = currentSections.map(section => {
          if (section.section_id === sectionId) {
            return { ...section, status: newStatus };
          }
          return section;
        });

        // Devolver el nuevo estado
        return {
          ...prevSections,
          [categoryId.toString()]: updatedSections
        };
      });

      // Enviar la actualización al servidor
      const response = await fetch(`/api/sections/${sectionId}/visibility`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      // Verificar si la respuesta fue exitosa
      if (!response.ok) {
        throw new Error(`Error al cambiar la visibilidad: ${response.status}`);
      }

      // Marcar que hemos completado la actualización
      setIsUpdatingVisibility(null);

      // Devolver true para indicar éxito
      return true;
    } catch (err) {
      // Registrar el error en la consola para depuración
      console.error('Error al cambiar visibilidad de sección:', err);

      // Revertir cambio en caso de error (volver al estado anterior)
      setSections(prevSections => {
        const currentSections = prevSections[categoryId.toString()] || [];

        const revertedSections = currentSections.map(section => {
          if (section.section_id === sectionId) {
            return { ...section, status: currentStatus };
          }
          return section;
        });

        return {
          ...prevSections,
          [categoryId.toString()]: revertedSections
        };
      });

      // Marcar que hemos completado la actualización (con error)
      setIsUpdatingVisibility(null);

      // Mostrar mensaje de error al usuario
      toast.error('Error al cambiar la visibilidad de la sección');

      // Devolver false para indicar fallo
      return false;
    }
  }, []);

  /**
   * Reordena un conjunto de secciones y actualiza su orden en el servidor
   * 
   * Esta función recibe un array de secciones reordenadas y actualiza tanto
   * el estado local como el servidor con el nuevo orden.
   * 
   * @param sectionList - Array de secciones con el nuevo orden
   * @returns Promise con resultado de la operación (success, data/error)
   * 
   * @example
   * // Reordenar secciones después de una operación de arrastrar y soltar
   * const result = await reorderSections(reorderedSections);
   * if (result.success) {
   *   console.log('Secciones reordenadas exitosamente');
   * }
   */
  const reorderSections = useCallback(async (sectionList: Section[]) => {
    try {
      // Verificar que hay secciones para reordenar
      if (!sectionList || sectionList.length === 0) {
        throw new Error('No hay secciones para reordenar');
      }

      // Obtener el ID de la categoría a la que pertenecen estas secciones
      const categoryId = sectionList[0].category_id;

      // Actualización optimista en UI (actualizar antes de confirmar con el servidor)
      setSections(prevSections => ({
        ...prevSections,
        [categoryId.toString()]: sectionList
      }));

      // Enviar la actualización al servidor
      const response = await fetch('/api/sections/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sections: sectionList }),
      });

      // Procesar la respuesta
      if (response.ok) {
        const result = await response.json();
        return { success: true, data: result };
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al reordenar secciones');
      }
    } catch (error) {
      // Registrar el error en la consola para depuración
      console.error('Error reordering sections:', error);

      // Devolver objeto con información del error
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al reordenar secciones'
      };
    }
  }, []);

  // Devolver todos los estados y funciones necesarios para la gestión de secciones
  return {
    sections,           // Estado: Objeto con secciones indexadas por ID de categoría
    setSections,        // Función: Actualizar directamente el estado de secciones
    isLoading,          // Estado: Indica si hay una operación en curso
    isUpdatingVisibility, // Estado: ID de la sección que está actualizando visibilidad (o null)
    error,              // Estado: Mensaje de error si algo falla
    fetchSectionsByCategory, // Función: Cargar secciones de una categoría
    createSection,      // Función: Crear nueva sección
    updateSection,      // Función: Actualizar sección existente
    deleteSection,      // Función: Eliminar sección
    toggleSectionVisibility, // Función: Cambiar visibilidad de sección
    reorderSections     // Función: Reordenar secciones
  };
} 