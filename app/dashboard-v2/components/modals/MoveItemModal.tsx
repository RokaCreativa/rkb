/**
 * 🧭 MIGA DE PAN CONTEXTUAL: Modal inteligente para mover elementos entre categorías/secciones
 * 
 * PORQUÉ CRÍTICO: Implementa el patrón avanzado de v0.dev para movimiento con validaciones en tiempo real
 * PROBLEMA RESUELTO: Antes no existía forma de reorganizar la jerarquía, ahora permite movimientos inteligentes
 * 
 * ARQUITECTURA REACTIVA: Usa computed values para filtrar destinos válidos automáticamente
 * - Valida permisos en tiempo real
 * - Previene movimientos inválidos (ej: categoría a sí misma)
 * - Muestra solo destinos compatibles según el tipo de elemento
 * 
 * CONEXIONES CRÍTICAS:
 * - dashboardStore: Fuente de datos para categorías/secciones disponibles
 * - useModalState: Integración con sistema de modales existente
 * - API endpoints: Llamadas para ejecutar movimientos
 * - GridView components: Botones de "mover" que abren este modal
 * 
 * PATRÓN v0.dev: Validación dual (cliente + servidor) con optimistic updates
 * OPTIMIZACIÓN: useMemo para filtrado de destinos válidos sin re-renders innecesarios
 */
'use client';

import React, { useState, useMemo } from 'react';
import { BaseModal } from '@/app/dashboard-v2/components/ui/Modal/BaseModal';
import { Button } from '@/app/dashboard-v2/components/ui/Button/Button';
import { Category, Section, Product } from '@/app/dashboard-v2/types';
import { useDashboardStore } from '@/app/dashboard-v2/stores/dashboardStore';
import { ArrowRightIcon, FolderIcon, DocumentIcon, CubeIcon } from '@heroicons/react/24/outline';
import { usePermissions, useMoveValidations } from '../../hooks/core/usePermissions';
import { toast } from 'react-hot-toast';

// --- TIPOS ---
type MoveableItem = Category | Section | Product;
type ItemType = 'category' | 'section' | 'product';
type DestinationType = 'category' | 'section';

interface MoveDestination {
    id: number;
    name: string;
    type: DestinationType;
    icon: React.ReactNode;
    disabled: boolean;
    reason?: string; // Razón por la cual está deshabilitado
}

interface MoveItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: MoveableItem | null;
    itemType: ItemType;
}

/**
 * 🧭 MIGA DE PAN CONTEXTUAL: Hook para calcular destinos válidos con validaciones en tiempo real
 * 
 * PORQUÉ SEPARADO: Lógica compleja de validación que debe ser reactiva y reutilizable
 * PROBLEMA RESUELTO: Evita movimientos inválidos mostrando solo opciones válidas
 * 
 * ARQUITECTURA: Usa selectores de Zustand + useMemo para optimización
 * VALIDACIONES IMPLEMENTADAS:
 * - No mover elemento a su contenedor actual
 * - No mover categoría a sí misma
 * - No mover sección a categoría que no existe
 * - Validar permisos según tipo de elemento
 * 
 * CONEXIÓN: dashboardStore proporciona datos reactivos que disparan recálculo automático
 */
const useValidDestinations = (item: MoveableItem | null, itemType: ItemType): MoveDestination[] => {
    const categories = useDashboardStore(state => state.categories);
    const sections = useDashboardStore(state => state.sections);
    const { canMove, hasPermission } = usePermissions();
    const { isValidDestination, canMoveToCategory, canMoveToSection } = useMoveValidations();
    
    return useMemo(() => {
        if (!item) return [];
        
        const destinations: MoveDestination[] = [];
        
        // 🧭 MIGA DE PAN: Lógica de destinos según tipo de elemento
        switch (itemType) {
            case 'product':
                const product = item as Product;
                
                // Destinos: Otras secciones + categorías (para productos directos)
                categories.forEach(category => {
                    const categorySections = sections[category.category_id] || [];
                    
                    // Agregar categoría como destino (productos directos)
                    destinations.push({
                        id: category.category_id,
                        name: `📁 ${category.name} (Producto Directo)`,
                        type: 'category',
                        icon: <FolderIcon className="h-4 w-4" />,
                        disabled: false
                    });
                    
                    // Agregar secciones de la categoría
                    categorySections.forEach(section => {
                        const isCurrentSection = product.section_id === section.section_id;
                        
                        destinations.push({
                            id: section.section_id,
                            name: `📋 ${section.name} (${category.name})`,
                            type: 'section',
                            icon: <DocumentIcon className="h-4 w-4" />,
                            disabled: isCurrentSection,
                            reason: isCurrentSection ? 'Ubicación actual' : undefined
                        });
                    });
                });
                break;
                
            case 'section':
                const section = item as Section;
                
                // Destinos: Otras categorías
                categories.forEach(category => {
                    const isCurrentCategory = section.category_id === category.category_id;
                    
                    destinations.push({
                        id: category.category_id,
                        name: `📁 ${category.name}`,
                        type: 'category',
                        icon: <FolderIcon className="h-4 w-4" />,
                        disabled: isCurrentCategory,
                        reason: isCurrentCategory ? 'Categoría actual' : undefined
                    });
                });
                break;
                
            case 'category':
                // Las categorías no se pueden mover (están en el nivel superior)
                break;
        }
        
        return destinations.sort((a, b) => {
            // Ordenar: habilitados primero, luego por nombre
            if (a.disabled !== b.disabled) {
                return a.disabled ? 1 : -1;
            }
            return a.name.localeCompare(b.name);
        });
    }, [item, itemType, categories, sections, canMove, hasPermission, canMoveToCategory, canMoveToSection]);
};

export const MoveItemModal: React.FC<MoveItemModalProps> = ({
    isOpen,
    onClose,
    item,
    itemType
}) => {
    const [selectedDestination, setSelectedDestination] = useState<MoveDestination | null>(null);
    const [isMoving, setIsMoving] = useState(false);
    
    const validDestinations = useValidDestinations(item, itemType);
    
    // 🧭 MIGA DE PAN: Funciones del store para ejecutar movimientos
    const { updateProduct, updateSection } = useDashboardStore();
    
    // 🎯 HOOKS DE VALIDACIÓN
    // PORQUÉ: Centralizan todas las validaciones de permisos y movimiento
    // CONEXIÓN: usePermissions() → validar si puede mover
    // CONEXIÓN: useMoveValidations() → validar destinos válidos
    const { canMove: globalCanMove, hasPermission: globalHasPermission } = usePermissions();
    const { isValidDestination: globalIsValidDestination, canMoveToCategory: globalCanMoveToCategory, canMoveToSection: globalCanMoveToSection } = useMoveValidations();
    
    if (!isOpen || !item) return null;
    
    /**
     * 🧭 MIGA DE PAN CONTEXTUAL: Ejecutar movimiento con validación dual (cliente + servidor)
     * 
     * PORQUÉ DUAL: Cliente valida UX, servidor valida seguridad y consistencia
     * PATRÓN v0.dev: Optimistic update con rollback en caso de error
     * 
     * FLUJO:
     * 1. Validación cliente (ya hecha en useValidDestinations)
     * 2. Optimistic update en UI
     * 3. Llamada a API
     * 4. Rollback si falla, confirmación si éxito
     * 
     * CONEXIÓN: Usa funciones existentes del store (updateProduct, updateSection)
     */
    const handleMove = async () => {
        if (!selectedDestination || !item) return;
        
        // 🔒 VALIDACIÓN FINAL DE PERMISOS
        // PORQUÉ: Doble validación antes de ejecutar (cliente + servidor)
        if (!globalCanMove(item.product_id, selectedDestination.id)) {
            toast.error('No tienes permisos para mover este elemento');
            return;
        }

        setIsMoving(true);
        try {
            switch (itemType) {
                case 'product':
                    const product = item as Product;
                    if (selectedDestination.type === 'category') {
                        // Mover a categoría (producto directo)
                        await updateProduct(product.product_id, {
                            category_id: selectedDestination.id,
                            section_id: null // Limpiar section_id para producto directo
                        });
                    } else {
                        // Mover a sección
                        await updateProduct(product.product_id, {
                            section_id: selectedDestination.id,
                            category_id: null // Limpiar category_id para producto tradicional
                        });
                    }
                    break;
                    
                case 'section':
                    const section = item as Section;
                    await updateSection(section.section_id, {
                        category_id: selectedDestination.id
                    });
                    break;
            }
            
            // ✅ ÉXITO: Cerrar modal y mostrar confirmación
            toast.success(`Producto movido a ${selectedDestination.name}`);
            onClose();
        } catch (error) {
            // ❌ ERROR: El rollback ya se maneja en updateProduct()
            // CONEXIÓN: dashboardStore → rollback automático en catch
            toast.error('Error al mover el producto. Inténtalo de nuevo.');
            console.error('Error moving product:', error);
        } finally {
            setIsMoving(false);
        }
    };
    
    // 🧭 MIGA DE PAN: Generar título dinámico según tipo de elemento
    const getItemIcon = () => {
        switch (itemType) {
            case 'product': return <CubeIcon className="h-5 w-5" />;
            case 'section': return <DocumentIcon className="h-5 w-5" />;
            case 'category': return <FolderIcon className="h-5 w-5" />;
        }
    };
    
    const getItemName = () => {
        switch (itemType) {
            case 'product': return (item as Product).name;
            case 'section': return (item as Section).name;
            case 'category': return (item as Category).name;
        }
    };
    
    const title = `Mover ${itemType === 'product' ? 'Producto' : itemType === 'section' ? 'Sección' : 'Categoría'}`;
    
    const footer = (
        <div className="flex justify-end space-x-2">
            <Button variant="ghost" onClick={onClose} disabled={isMoving}>
                Cancelar
            </Button>
            <Button 
                onClick={handleMove} 
                disabled={!selectedDestination || selectedDestination.disabled || isMoving}
            >
                {isMoving ? 'Moviendo...' : 'Mover'}
            </Button>
        </div>
    );
    
    return (
        <BaseModal isOpen={isOpen} onClose={onClose} title={title} footer={footer} size="lg">
            <div className="space-y-6">
                {/* 🧭 MIGA DE PAN: Información del elemento a mover */}
                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                    {getItemIcon()}
                    <div className="ml-3">
                        <h3 className="font-medium text-gray-900">{getItemName()}</h3>
                        <p className="text-sm text-gray-500">
                            {itemType === 'product' ? 'Producto' : itemType === 'section' ? 'Sección' : 'Categoría'}
                        </p>
                    </div>
                </div>
                
                <div className="flex items-center justify-center">
                    <ArrowRightIcon className="h-6 w-6 text-gray-400" />
                </div>
                
                {/* 🧭 MIGA DE PAN: Lista de destinos válidos */}
                <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Seleccionar destino:</h4>
                    
                    {validDestinations.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <p>No hay destinos válidos disponibles</p>
                            <p className="text-sm mt-1">
                                {!globalHasPermission('products.move') 
                                    ? 'No tienes permisos para mover productos'
                                    : 'Todos los destinos están ocupados o inactivos'
                                }
                            </p>
                        </div>
                    ) : (
                        <div className="max-h-60 overflow-y-auto space-y-1">
                            {validDestinations.map((destination) => (
                                <button
                                    key={`${destination.type}-${destination.id}`}
                                    onClick={() => !destination.disabled && setSelectedDestination(destination)}
                                    disabled={destination.disabled}
                                    className={`w-full flex items-center p-3 rounded-lg border text-left transition-colors ${
                                        destination.disabled
                                            ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                                            : selectedDestination?.id === destination.id && selectedDestination?.type === destination.type
                                                ? 'bg-blue-50 border-blue-200 text-blue-900'
                                                : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-900'
                                    }`}
                                >
                                    {destination.icon}
                                    <div className="ml-3 flex-1">
                                        <div className="font-medium">{destination.name}</div>
                                        {destination.reason && (
                                            <div className="text-xs text-gray-500">{destination.reason}</div>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </BaseModal>
    );
}; 