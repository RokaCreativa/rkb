**Objetivo:** Modal que filtra destinos y maneja errores de permisos.

// MoveItemModal.tsx (conceptual)
import React, { useState, useEffect, useMemo } from 'react';
import { useDashboardStore, Category, Section, Product } from './store/dashboardStore'; // Asume tipos exportados
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // shadcn/ui
// Asume una función API para mover
// const apiMoveItem = async (itemId, targetParentId, targetParentType) => { /_ ... _/ };

interface MoveItemModalProps {
isOpen: boolean;
onClose: () => void;
itemToMove: Product | Section; // Solo productos o secciones se pueden mover (categorías no suelen moverse)
userPermissions: { canEdit: (itemId: string) => boolean }; // Simplificado
}

export function MoveItemModal({ isOpen, onClose, itemToMove, userPermissions }: MoveItemModalProps) {
const { categories, sections } = useDashboardStore(state => ({
categories: state.categories,
sections: state.sections.filter(s => s.id !== itemToMove.id), // No mover una sección a sí misma
}));

const [selectedTargetType, setSelectedTargetType] = useState<'category' | 'section' | null>(null);
const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
const [error, setError] = useState<string | null>(null);
const [isLoading, setIsLoading] = useState(false);

// Filtrar destinos válidos
const validDestinations = useMemo(() => {
const destinations: { id: string; name: string; type: 'category' | 'section'; disabled?: boolean; reason?: string }[] = [];

    if (itemToMove.type === 'product') {
      // Un producto puede moverse a una categoría (como directo) o a una sección
      categories.forEach(cat => {
        // Aquí podrías añadir lógica si una categoría NO permite productos directos
        destinations.push({
          id: cat.id,
          name: `${cat.name} (como producto directo)`,
          type: 'category',
          disabled: !userPermissions.canEdit(cat.id),
          reason: !userPermissions.canEdit(cat.id) ? "No tienes permiso para editar esta categoría" : undefined
        });
      });
      sections.forEach(sec => {
        destinations.push({
          id: sec.id,
          name: sec.name,
          type: 'section',
          disabled: !userPermissions.canEdit(sec.id),
          reason: !userPermissions.canEdit(sec.id) ? "No tienes permiso para editar esta sección" : undefined
        });
      });
    } else if (itemToMove.type === 'section') {
      // Una sección solo puede moverse a una categoría
      categories.forEach(cat => {
        if (cat.id === (itemToMove as Section).categoryId) return; // No mover a su misma categoría padre
        destinations.push({
          id: cat.id,
          name: cat.name,
          type: 'category',
          disabled: !userPermissions.canEdit(cat.id),
          reason: !userPermissions.canEdit(cat.id) ? "No tienes permiso para editar esta categoría" : undefined
        });
      });
    }
    return destinations;

}, [itemToMove, categories, sections, userPermissions]);

const handleMove = async () => {
if (!selectedTargetId || !selectedTargetType) {
setError("Por favor, selecciona un destino.");
return;
}
setError(null);
setIsLoading(true);

    // Optimistic update (más complejo, necesitaría acceso a acciones del store)
    // const previousItemParentId = itemToMove.parentId;
    // const previousItemParentType = itemToMove.parentType;
    // store.optimisticallyUpdateItemParent(itemToMove.id, selectedTargetId, selectedTargetType);

    try {
      // await apiMoveItem(itemToMove.id, selectedTargetId, selectedTargetType);
      // store.confirmItemMove(itemToMove.id); // Si la API es la fuente de verdad tras el movimiento
      alert(`Simulación: Mover ${itemToMove.name} a ${selectedTargetType} ${selectedTargetId}`);
      onClose();
    } catch (err: any) {
      // store.rollbackItemMove(itemToMove.id, previousItemParentId, previousItemParentType);
      if (err.response && err.response.status === 403) {
        setError("Error de permisos: No puedes mover este ítem al destino seleccionado.");
      } else {
        setError("Error al mover el ítem. Inténtalo de nuevo.");
      }
      console.error("Move error:", err);
    } finally {
      setIsLoading(false);
    }

};

useEffect(() => { // Resetear estado al cambiar el ítem o al abrir/cerrar
setSelectedTargetId(null);
setSelectedTargetType(null);
setError(null);
}, [isOpen, itemToMove]);

if (!itemToMove) return null;

return (

<Dialog open={isOpen} onOpenChange={onClose}>
<DialogContent>
<DialogHeader>
<DialogTitle>Mover "{itemToMove.name}"</DialogTitle>
</DialogHeader>
<div className="py-4 space-y-4">
<Select
onValueChange={(value) => {
const [type, id] = value.split(':');
setSelectedTargetType(type as 'category' | 'section');
setSelectedTargetId(id);
}}
value={selectedTargetType && selectedTargetId ? `${selectedTargetType}:${selectedTargetId}` : ""} >
<SelectTrigger>
<SelectValue placeholder="Selecciona un destino..." />
</SelectTrigger>
<SelectContent>
{validDestinations.map(dest => (
<SelectItem key={dest.id} value={`${dest.type}:${dest.id}`} disabled={dest.disabled}>
{dest.name} {dest.disabled ? `(${dest.reason})` : ''}
</SelectItem>
))}
</SelectContent>
</Select>
{error && <p className="text-sm text-red-600">{error}</p>}
</div>
<DialogFooter>
<Button variant="outline" onClick={onClose} disabled={isLoading}>Cancelar</Button>
<Button onClick={handleMove} disabled={isLoading || !selectedTargetId}>
{isLoading ? "Moviendo..." : "Mover"}
</Button>
</DialogFooter>
</DialogContent>
</Dialog>
);
}

**Notas:**

- La lógica de `userPermissions.canEdit()` es una simplificación. En una app real, esto podría venir del backend o de un store de permisos más complejo.
- El optimistic update para el movimiento es más complejo porque implica quitar de una lista y añadir a otra, y potencialmente actualizar `parentId` y `parentType`. Se ha omitido por brevedad pero seguiría el patrón de guardar estado previo y rollback.
