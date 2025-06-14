/**
 * 🧭 MIGA DE PAN CONTEXTUAL: Componente MASTER en arquitectura Master-Detail para escritorio
 * 
 * PORQUÉ CRÍTICO: Es el punto de entrada principal para toda la navegación en vista escritorio
 * RESPONSABILIDAD ÚNICA: Renderizar tabla de categorías y manejar selección (Mandamiento #6)
 * 
 * CONEXIONES CRÍTICAS:
 * - DashboardView.tsx línea ~75: <CategoryGridView categories={store.categories} onCategorySelect={(cat) => store.setSelectedCategoryId(cat.category_id)} />
 * - dashboardStore.ts: setSelectedCategoryId → fetchSectionsByCategory → actualiza UI
 * - GenericTable.tsx: Componente reutilizable que maneja toda la lógica de tabla
 * - useModalState.tsx: onEdit/onDelete conectan con sistema de modales
 * 
 * ARQUITECTURA: Componente "tonto" que solo renderiza - NO maneja estado
 * FLUJO DE DATOS: store → DashboardView → CategoryGridView → GenericTable → UI
 * 
 * DECISIÓN UX: onRowClick selecciona categoría (navegación), botones específicos para acciones (editar/eliminar)
 * PATRÓN: Misma estructura que SectionGridView y ProductGridView para consistencia
 */
'use client';

import React from 'react';
import { Category } from '@/app/dashboard-v2/types';
import { GenericTable, Column } from '@/app/dashboard-v2/components/ui/Table/GenericTable';
import { Button } from '@/app/dashboard-v2/components/ui/Button/Button';
import { EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { useCategoryWithCounts } from '@/app/dashboard-v2/stores/dashboardStore';

// --- TIPOS DE PROPS ---
interface CategoryGridViewProps {
    categories: Category[];
    onCategorySelect: (category: Category) => void;
    onToggleVisibility: (category: Category) => void;
    onEdit: (category: Category) => void;
    onDelete: (category: Category) => void;
    onAddNew: () => void;
    // 🎯 SOLUCIÓN v0.dev: Nueva prop para crear productos directos en categorías
    // PORQUÉ: Simetría con MixedContentView que ya tiene esta funcionalidad
    // CONEXIÓN: DashboardViewWrapper pasará openModal('editProductDirect', null)
    onAddProductDirect?: () => void;
    // 🧭 MIGA DE PAN: Categoría seleccionada para habilitar/deshabilitar botón
    selectedCategoryId?: number | null;
}

/**
 * 🧭 MIGA DE PAN CONTEXTUAL: Componente para mostrar contadores híbridos inteligentes
 * 
 * PORQUÉ SEPARADO: Cada fila necesita sus propios contadores reactivos sin afectar otras filas
 * PROBLEMA RESUELTO: Antes mostraba solo "X/Y secciones", ahora muestra información completa
 * 
 * ARQUITECTURA REACTIVA: Usa useCategoryWithCounts que se actualiza automáticamente cuando:
 * - Se crean/eliminan secciones o productos directos
 * - Se cambia la visibilidad de elementos
 * - Se detecta cambio en el modo de la categoría
 * 
 * CONEXIONES CRÍTICAS:
 * - useCategoryWithCounts(): Hook que calcula contadores en tiempo real
 * - CategoryGridView columna 'content': Renderiza este componente por cada categoría
 * - dashboardStore: Fuente de datos reactiva que dispara actualizaciones
 * 
 * PATRÓN v0.dev: Componente pequeño y enfocado que maneja un aspecto específico de la UI
 * OPTIMIZACIÓN: Solo se re-renderiza cuando cambian los datos de SU categoría específica
 */
const CategoryContentDisplay = React.memo(({ categoryId }: { categoryId: number }) => {
    const categoryData = useCategoryWithCounts(categoryId);
    
    if (!categoryData) {
        return (
            <span className="text-sm text-gray-400">Cargando...</span>
        );
    }
    
    const displayText = categoryData.sectionsCount > 0 
        ? `${categoryData.sectionsCount} secciones` 
        : `${categoryData.productsCount} productos directos`;
    
    return (
        <div className="flex flex-col">
            <span className="text-sm text-gray-600 font-medium">
                {displayText}
            </span>
            {categoryData.productsCount > 0 && (
                <span className="text-xs text-gray-400">
                    {categoryData.visibleProductsCount} / {categoryData.productsCount} productos visibles
                </span>
            )}
        </div>
    );
});

CategoryContentDisplay.displayName = 'CategoryContentDisplay';

export const CategoryGridView: React.FC<CategoryGridViewProps> = ({
    categories,
    onCategorySelect,
    onToggleVisibility,
    onEdit,
    onDelete,
    onAddNew,
    onAddProductDirect,
    selectedCategoryId,
}) => {
    /**
     * 🧭 MIGA DE PAN CONTEXTUAL: Contador de visibilidad para feedback inmediato al usuario
     * PORQUÉ NECESARIO: Los usuarios necesitan saber cuántas categorías están activas en el menú
     * PATRÓN CONSISTENTE: Mismo cálculo que ProductGridView y SectionGridView
     * CONEXIÓN: Se actualiza automáticamente cuando store.toggleCategoryVisibility cambia el estado
     */
    const visibleCategories = categories.filter(category => category.status);
    const totalCategories = categories.length;

    /**
     * 🧭 MIGA DE PAN CONTEXTUAL: Configuración de columnas para GenericTable
     * DECISIONES DE DISEÑO:
     * - Columna 'name': Imagen + texto para identificación visual rápida
     * - Columna 'sections': Contador de secciones visibles (igual que en móvil)
     * - Columna 'display_order': Orden de aparición en el menú (importante para UX)
     * - Columna 'actions': Botones de acción con stopPropagation para evitar conflicto con onRowClick
     * 
     * PATRÓN DE ACCIONES:
     * - EyeIcon: Verde si visible, gris si oculto (feedback visual inmediato)
     * - PencilIcon: Editar categoría (abre EditCategoryModal)
     * - TrashIcon: Eliminar categoría (abre DeleteConfirmationModal)
     * 
     * CONEXIÓN: GenericTable.tsx renderiza estas columnas automáticamente
     */
    const columns: Column<Category>[] = [
        {
            key: 'name',
            header: 'Nombre',
            render: (category) => (
                <div className="flex items-center">
                    {/* DECISIÓN UX: Imagen 40x40 para identificación rápida sin ocupar mucho espacio */}
                    <Image
                        src={category.image || '/images/placeholder.png'}
                        alt={category.name || 'Categoría'}
                        width={40}
                        height={40}
                        className="rounded-md object-cover mr-4"
                    />
                    <div className="flex flex-col">
                        <div className="flex items-center space-x-2">
                            <span className="font-medium">{category.name}</span>
                            {/* 🎯 SOLUCIÓN v0.dev: Badge VIRTUAL para categorías virtuales */}
                            {/* PORQUÉ: Identificación visual inmediata para admin */}
                            {/* COMPORTAMIENTO: Solo visible para categorías con is_virtual_category = true */}
                            {/* CONEXIÓN: EditCategoryModal permitirá cambiar este estado */}
                            {category.is_virtual_category && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                    VIRTUAL
                                </span>
                            )}
                        </div>
                        {/* 🧭 MIGA DE PAN: Tooltip explicativo para categorías virtuales */}
                        {category.is_virtual_category && (
                            <span className="text-xs text-purple-600">
                                Productos aparecen en vista raíz del cliente
                            </span>
                        )}
                    </div>
                </div>
            ),
        },
        {
            key: 'content',
            header: 'Contenido',
            render: (category) => (
                <CategoryContentDisplay categoryId={category.category_id} />
            ),
        },
        {
            key: 'display_order',
            header: 'Orden',
        },
        {
            key: 'actions',
            header: 'Acciones',
            render: (category) => (
                <div className="flex justify-end items-center space-x-1">
                    {/* CRÍTICO: stopPropagation evita que se dispare onRowClick al hacer clic en botones */}
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onToggleVisibility(category); }}>
                        <EyeIcon className={`h-5 w-5 ${category.status ? 'text-green-500' : 'text-gray-400'}`} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onEdit(category); }}>
                        <PencilIcon className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onDelete(category); }}>
                        <TrashIcon className="h-5 w-5 text-red-500" />
                    </Button>
                </div>
            )
        }
    ];

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <div className="flex flex-col">
                    <h2 className="text-xl font-semibold">Gestionar Categorías</h2>
                    {/* 🧭 MIGA DE PAN: Contador siguiendo patrón consistente en todo el sistema */}
                    <p className="text-sm text-gray-500">
                        {visibleCategories.length} / {totalCategories} categorías visibles
                    </p>
                </div>
                {/* 🎯 SOLUCIÓN v0.dev: Botones de acción para categorías Y productos directos */}
                <div className="flex space-x-2">
                    {/* CONEXIÓN: onAddNew → useModalState.openModal('editCategory', null) */}
                    <Button onClick={onAddNew}>
                        Añadir Categoría
                    </Button>
                    {/* 🎯 NUEVO: Botón para productos directos en categorías */}
                    {/* PORQUÉ: Simetría con vista de secciones que tiene botón similar */}
                    {/* COMPORTAMIENTO: Deshabilitado si no hay categoría seleccionada */}
                    {/* CONEXIÓN: onAddProductDirect → openModal('editProductDirect', null) */}
                    {onAddProductDirect && (
                        <Button 
                            onClick={onAddProductDirect}
                            disabled={!selectedCategoryId}
                            variant="outline"
                            className="flex items-center space-x-2"
                        >
                            <span>📦</span>
                            <span>Producto Directo</span>
                        </Button>
                    )}
                </div>
            </div>
            {/* 
                🧭 MIGA DE PAN CONTEXTUAL: GenericTable maneja toda la lógica de renderizado
                PORQUÉ DELEGACIÓN: Reutilización de código y consistencia visual
                CONEXIÓN: onRowClick → onCategorySelect → store.setSelectedCategoryId → navegación
            */}
            <GenericTable
                data={categories}
                columns={columns}
                onRowClick={onCategorySelect}
                emptyMessage="No hay categorías para mostrar."
            />
        </div>
    );
}; 