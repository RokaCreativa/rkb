// Correcciones para dashboardStore.ts

// toggleSectionVisibility debe usar PATCH y boolean:
toggleSectionVisibility: async (id, status) => {
    const toastId = 'toggle-section-visibility';
    set({ isUpdating: true });
    toast.loading('Actualizando visibilidad...', { id: toastId });
    try {
        const newStatus = status === 1 ? false : true;
        const res = await fetch(`/api/sections/${id}/visibility`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        if (!res.ok) throw new Error('Error al actualizar visibilidad');
        toast.success('Visibilidad actualizada', { id: toastId });

        // Recargar las secciones de la categoría activa
        const { activeCategoryId } = get();
        if (activeCategoryId) await get().fetchSectionsByCategory(activeCategoryId);
    } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Error', { id: toastId });
    } finally {
        set({ isUpdating: false });
    }
}, 