/**
 * 🧭 HOOK DE REORDENAMIENTO CONTEXTUAL
 * 
 * 📍 UBICACIÓN: app/dashboard-v2/hooks/domain/reordering/useReorderLogic.ts
 * 
 * 🎯 PORQUÉ EXISTE:
 * Implementa la lógica completa de reordenamiento para listas híbridas (categorías + productos).
 * Maneja la sincronización entre frontend y backend usando los nuevos campos contextuales.
 * Separa completamente la lógica de negocio de los componentes UI (Mandamiento #7).
 * 
 * 🔄 FLUJO DE DATOS:
 * 1. Recibe una acción de reordenamiento (itemId, direction, itemType, contextId)
 * 2. Calcula el nuevo orden basándose en el estado actual
 * 3. Actualiza optimísticamente el estado local
 * 4. Envía la petición al backend con el contexto correcto
 * 5. Si falla, revierte el estado; si funciona, recarga los datos desde la BD
 * 
 * 🔗 CONEXIONES:
 * - CONSUME: dashboardStore (estado y acciones)
 * - LLAMA: APIs de reordenamiento (/api/.../reorder)
 * - ACTUALIZA: Estado local del store
 * 
 * ⚠️ REGLAS DE NEGOCIO:
 * - Para productos globales: context = 'category', actualiza categories_display_order
 * - Para productos locales: context = 'section', actualiza sections_display_order  
 * - Para productos normales: sin context, actualiza products_display_order
 * - Siempre recarga datos post-actualización para mantener sincronización
 */

import { useState } from 'react';
// import { toast } from 'sonner';
import { useDashboardStore } from '@/app/dashboard-v2/stores/dashboardStore';
import { apiClient } from '@/app/dashboard-v2/services/apiClient';

interface ReorderParams {
    itemId: number;
    direction: 'up' | 'down';
    itemType: 'category' | 'section' | 'product';
    contextId?: number | null;
}

export const useReorderLogic = () => {
    const [isReordering, setIsReordering] = useState(false);
    const store = useDashboardStore();

    const executeReorder = async ({ itemId, direction, itemType, contextId }: ReorderParams) => {
        if (isReordering) {
            console.log('🔥 REORDER: Already reordering, skipping');
            return;
        }

        setIsReordering(true);
        console.log('🔥 REORDER: Starting', { itemId, direction, itemType, contextId });

        // Backup del estado original ANTES de cualquier cambio
        const originalState = {
            categories: [...store.categories],
            sections: { ...store.sections },
            products: { ...store.products }
        };

        try {
            // 1. Obtener la lista actual según el tipo
            const getListAndIdKey = (): [any[], 'category_id' | 'section_id' | 'product_id' | null] => {
                if (itemType === 'category') return [store.categories, 'category_id'];
                if (itemType === 'section' && contextId) return [store.sections[contextId] || [], 'section_id'];
                if (itemType === 'product') {
                    if (!contextId) {
                        // Productos globales - buscar en sección virtual
                        const virtualCategory = store.categories.find(c => c.is_virtual_category);
                        if (virtualCategory) {
                            const virtualSections = store.sections[virtualCategory.category_id] || [];
                            const virtualSection = virtualSections.find(s => s.is_virtual);
                            if (virtualSection) {
                                return [store.products[virtualSection.section_id] || [], 'product_id'];
                            }
                        }
                        return [[], null];
                    }
                    return [store.products[contextId] || [], 'product_id'];
                }
                return [[], null];
            };

            const [list, idKey] = getListAndIdKey();
            console.log('🔥 REORDER: Current list', { length: list.length, idKey });

            if (!idKey || list.length === 0) {
                console.log('🔥 REORDER: No items to reorder');
                return;
            }

            // 2. Encontrar el índice actual del item
            const currentIndex = list.findIndex(item => item[idKey] === itemId);
            if (currentIndex === -1) {
                console.log('🔥 REORDER: Item not found');
                return;
            }

            // 3. Calcular el nuevo índice
            const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
            if (targetIndex < 0 || targetIndex >= list.length) {
                console.log('🔥 REORDER: Target index out of bounds');
                return;
            }

            console.log('🔥 REORDER: Moving from', currentIndex, 'to', targetIndex);

            // 4. Crear la nueva lista reordenada
            const reorderedList = [...list];
            [reorderedList[currentIndex], reorderedList[targetIndex]] =
                [reorderedList[targetIndex], reorderedList[currentIndex]];

            // 5. Asignar nuevos display_order
            const updatedItems = reorderedList.map((item, index) => ({
                ...item,
                display_order: index
            }));

            console.log('🔥 REORDER: New order', updatedItems.map(item => ({
                id: item[idKey],
                display_order: item.display_order
            })));

            // 6. Preparar petición API
            const endpointMap = {
                'category': 'categories',
                'section': 'sections',
                'product': 'products'
            };

            const payloadKeyMap = {
                'category': 'categories',
                'section': 'sections',
                'product': 'products'
            };

            const endpoint = `/api/${endpointMap[itemType]}/reorder`;
            const payload = updatedItems.map(item => ({
                [idKey]: item[idKey],
                display_order: item.display_order
            }));

            // Para productos, agregar información de contexto
            const requestBody = itemType === 'product'
                ? {
                    [payloadKeyMap[itemType]]: payload,
                    context: contextId ? 'section' : 'category'
                }
                : { [payloadKeyMap[itemType]]: payload };

            console.log('🔥 REORDER: Calling API', endpoint);
            console.log('🔥 REORDER: Payload', JSON.stringify(requestBody, null, 2));

            // 7. Enviar petición ANTES de actualizar estado local
            await apiClient(endpoint, {
                method: 'PUT',
                data: requestBody,
            });

            console.log('🔥 REORDER: API call successful');

            // 8. CRÍTICO: Recargar datos desde la BD para sincronizar
            if (itemType === 'category') {
                await store.fetchCategories(store.selectedClientId!);
            } else if (itemType === 'section' && contextId) {
                await store.fetchSectionsByCategory(contextId);
            } else if (itemType === 'product' && contextId) {
                await store.fetchProductsBySection(contextId);
            } else if (itemType === 'product' && !contextId) {
                // Recargar productos globales
                await store.fetchCategories(store.selectedClientId!);
            }

            console.log('🔥 REORDER: Data reloaded successfully');
            // toast.success('Orden actualizado');

        } catch (error) {
            console.error('🔥 REORDER: Failed', error);

            // Revertir estado en caso de error
            // store.setState(state => {
            //   state.categories = originalState.categories;
            //   state.sections = originalState.sections;
            //   state.products = originalState.products;
            // });

            // toast.error('Error al reordenar');
        } finally {
            setIsReordering(false);
        }
    };

    return {
        executeReorder,
        isReordering
    };
};
