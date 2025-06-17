import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Product } from '@/app/dashboard-v2/types';

// =================================================================
// 🧭 MIGA DE PAN CONTEXTUAL: HOOK DE API PARA PRODUCTOS
// -----------------------------------------------------------------
// 📍 UBICACIÓN: app/dashboard-v2/hooks/api/useProductApi.ts
//
// 🎯 PROPÓSITO:
//    Este hook encapsula TODA la lógica de comunicación con el
//    backend para la entidad "Producto". Centraliza las operaciones
//    CRUD (Crear, Actualizar, Eliminar) usando React Query.
//
// 🔄 FLUJO TÍPICO (EJ: CREAR PRODUCTO):
//    1. Componente (ej: EditModal) llama a `createProduct.mutate()`.
//    2. Este hook ejecuta la llamada fetch a `POST /api/products`.
//    3. Gestiona los estados (isLoading, isError) automáticamente.
//    4. Al tener éxito (`onSuccess`), invalida las queries relevantes
//       (ej: ['products', sectionId]), forzando a React Query a
//       refrescar los datos y manteniendo la UI sincronizada.
//
// 🔗 CONEXIONES:
//    - LLAMADO DESDE: EditModal.tsx, DeleteConfirmationModal.tsx.
//    - USA: @tanstack/react-query para la gestión de estado del servidor.
//    - API: Se comunica con los endpoints en `app/api/products`.
//
// ⚠️ REGLAS DE NEGOCIO:
//    - La subida de imágenes se maneja con `FormData`.
//    - La invalidación de queries es crucial para la consistencia de la UI.
// =================================================================


// --- LÓGICA DE MUTACIÓN PARA CREAR PRODUCTO ---
const createProductFn = async ({ productData, imageFile }: { productData: Partial<Product>; imageFile?: File | null; }) => {
    const formData = new FormData();
    formData.append('productData', JSON.stringify(productData));
    if (imageFile) {
        formData.append('image', imageFile);
    }

    const response = await fetch('/api/products', {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear el producto');
    }

    return response.json();
};

// --- LÓGICA DE MUTACIÓN PARA ACTUALIZAR PRODUCTO ---
const updateProductFn = async ({ productId, productData, imageFile }: { productId: number; productData: Partial<Product>; imageFile?: File | null; }) => {
    const formData = new FormData();
    formData.append('productData', JSON.stringify(productData));
    if (imageFile) {
        formData.append('image', imageFile);
    }

    const response = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar el producto');
    }

    return response.json();
};

// --- LÓGICA DE MUTACIÓN PARA ELIMINAR PRODUCTO ---
const deleteProductFn = async (productId: number) => {
    const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al eliminar el producto');
    }

    return response.json();
};


// --- HOOK PRINCIPAL ---
export const useProductApi = () => {
    const queryClient = useQueryClient();

    // === MUTACIÓN PARA CREAR ===
    const createProduct = useMutation({
        mutationFn: createProductFn,
        onSuccess: (newProduct) => {
            toast.success('Producto creado con éxito');
            // Invalida las queries relevantes para forzar un refresco
            if (newProduct.section_id) {
                queryClient.invalidateQueries({ queryKey: ['products', newProduct.section_id] });
            }
            if (newProduct.category_id) {
                queryClient.invalidateQueries({ queryKey: ['directProducts', newProduct.category_id] });
            }
            // También invalida la lista de categorías por si hay contadores
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    // === MUTACIÓN PARA ACTUALIZAR ===
    const updateProduct = useMutation({
        mutationFn: updateProductFn,
        onSuccess: (updatedProduct) => {
            toast.success('Producto actualizado con éxito');
            // Invalida todas las queries que puedan contener este producto
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['directProducts'] });
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    // === MUTACIÓN PARA ELIMINAR ===
    const deleteProduct = useMutation({
        mutationFn: deleteProductFn,
        onSuccess: (_, deletedProductId) => {
            toast.success('Producto eliminado con éxito');
            // Invalida todo para asegurar la consistencia.
            // Una estrategia más fina sería recibir el category/section id.
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['directProducts'] });
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    return {
        createProduct,
        updateProduct,
        deleteProduct,
    };
}; 