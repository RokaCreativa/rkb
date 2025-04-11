"use client";

/**
 * @fileoverview Componente de vista para la visualización y gestión de productos
 * @author RokaMenu Team
 * @version 1.0.0
 * @updated 2024-06-13
 */

import { ChevronLeftIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Product, Section } from "@/app/dashboard-v2/types";
import { ProductTable } from "@/app/dashboard-v2/components/domain/products/ProductTable";
import { useEffect, useState, useRef, useCallback } from "react";

/**
 * Props para el componente ProductView
 */
export interface ProductViewProps {
  products: Product[];
  sectionName: string;
  sectionId: number;
  isUpdatingVisibility: number | null;
  onAddProduct: () => void;
  onToggleProductVisibility: (productId: number, status: number, sectionId: number) => Promise<void> | void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => Promise<boolean> | void;
  isLoading?: boolean;
  onProductsReorder?: (sectionId: number, sourceIndex: number, destinationIndex: number) => void;
}

/**
 * COMPONENTE REFACTORIZADO - ProductView V2
 * 
 * Este componente muestra los productos de una sección con mejor manejo de estados
 * y un sistema más robusto para gestionar actualizaciones y renderizado.
 */
export default function ProductView({
  products,
  sectionName,
  sectionId,
  isUpdatingVisibility,
  onAddProduct,
  onToggleProductVisibility,
  onEditProduct,
  onDeleteProduct,
  isLoading = false,
  onProductsReorder
}: ProductViewProps) {
  // Usamos la inicialización directa para el estado local
  const [localProducts, setLocalProducts] = useState<Product[]>(products || []);
  
  // Ref para trackear si el componente está montado
  const isMounted = useRef(true);
  
  // Estado para indicar si estamos recargando manualmente
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // ID para identificar esta instancia específica
  const instanceId = useRef(`pv-${sectionId}-${Date.now()}`);
  
  // Mantener la sección anterior para detectar cambios
  const prevSectionIdRef = useRef<number>(sectionId);
  
  // Log de montaje
  useEffect(() => {
    console.log(`🔵 [ProductView ${instanceId.current}] MONTADO con sección ${sectionId}`);
    
    return () => {
      console.log(`🔴 [ProductView ${instanceId.current}] DESMONTADO`);
      isMounted.current = false;
    };
  }, [sectionId]);
  
  // Efecto principal para sincronizar productos
  useEffect(() => {
    // Detectar cambio de sección
    const isSectionChange = prevSectionIdRef.current !== sectionId;
    if (isSectionChange) {
      console.log(`🔄 [ProductView] Cambio de sección: ${prevSectionIdRef.current} → ${sectionId}`);
      prevSectionIdRef.current = sectionId;
    }
    
    console.log(`📥 [ProductView] Recibidos ${products?.length || 0} productos para sección ${sectionId}`, {
      cambio_seccion: isSectionChange,
      productos_ejemplo: products?.slice(0, 2).map(p => p.name) || [],
      total_productos: products?.length || 0
    });
    
    // Actualizar estado local solo cuando hay productos o cambio de sección
    if (products && Array.isArray(products)) {
      if (products.length > 0 || isSectionChange) {
        console.log(`✅ [ProductView] Actualizando estado local con ${products.length} productos`);
        setLocalProducts(products);
      }
    }
  }, [products, sectionId]);
  
  // Función para recargar productos manualmente
  const handleRefresh = useCallback(() => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    console.log(`🔄 [ProductView] Iniciando recarga manual para sección ${sectionId}`);
    
    // En una implementación real, aquí llamaríamos a la API o a una función de recarga
    // Para este ejemplo, simplemente simulamos un delay
    setTimeout(() => {
      if (isMounted.current) {
        setIsRefreshing(false);
        console.log(`✅ [ProductView] Recarga manual completada`);
      }
    }, 1500);
  }, [sectionId, isRefreshing]);
  
  // Procesamiento de productos para la tabla
  const adaptedProducts = localProducts.map(p => ({
    id: p.product_id,
    name: p.name,
    description: p.description,
    image: p.image || null,
    price: p.price,
    discount_price: p.discount_price,
    status: p.status,
  }));
  
  // Determinar estados de UI
  const hasProducts = adaptedProducts.length > 0;
  const showLoading = isLoading || isRefreshing;
  
  // Renderizado final
  return (
    <>
      {/* Cabecera con título y acciones */}
      <div className="mb-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {sectionName}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {hasProducts 
                ? `${adaptedProducts.length} productos` 
                : "Sin productos"}
            </p>
          </div>
          
          <div className="flex space-x-2">
            {/* Botón de recarga */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`inline-flex items-center px-3 py-2 rounded-md
                ${isRefreshing 
                  ? 'bg-blue-100 text-blue-400 cursor-not-allowed' 
                  : 'bg-blue-50 hover:bg-blue-100 text-blue-600'}`}
            >
              <svg 
                className={`h-5 w-5 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {isRefreshing ? 'Recargando...' : 'Recargar'}
            </button>
            
            {/* Botón de añadir */}
            <button
              onClick={onAddProduct}
              className="inline-flex items-center px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-md shadow-sm"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
              Añadir producto
            </button>
          </div>
        </div>
      </div>
      
      {/* Panel de debug (solo en desarrollo) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-xs">
          <div className="font-bold mb-1">Debug info:</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <div><span className="font-medium">ID:</span> {instanceId.current}</div>
            <div><span className="font-medium">Sección:</span> {sectionId}</div>
            <div><span className="font-medium">Props productos:</span> {products?.length || 0}</div>
            <div><span className="font-medium">Estado local:</span> {localProducts.length}</div>
            <div><span className="font-medium">Cargando:</span> {showLoading ? '✓' : '✗'}</div>
            <div><span className="font-medium">Tiene productos:</span> {hasProducts ? '✓' : '✗'}</div>
          </div>
          {localProducts.length > 0 && (
            <div className="mt-1">
              <span className="font-medium">Productos: </span>
              {localProducts.slice(0, 3).map(p => p.name).join(', ')}
              {localProducts.length > 3 ? ` y ${localProducts.length - 3} más` : ''}
            </div>
          )}
        </div>
      )}
      
      {/* Contenido principal */}
      {showLoading ? (
        <div className="flex flex-col justify-center items-center h-40 bg-white rounded-lg border border-gray-200">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600 mb-3"></div>
          <p className="text-sm text-gray-500">
            {isRefreshing ? 'Recargando productos...' : 'Cargando productos...'}
          </p>
        </div>
      ) : !hasProducts ? (
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="text-gray-500 font-medium mb-2">No hay productos disponibles</p>
          <p className="text-sm text-gray-400 mb-4">Esta sección aún no tiene productos añadidos</p>
          <div className="flex justify-center space-x-2">
            <button 
              onClick={handleRefresh}
              className="inline-flex items-center px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium rounded-md"
            >
              <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Recargar
            </button>
            <button 
              onClick={onAddProduct}
              className="inline-flex items-center px-3 py-2 bg-teal-100 hover:bg-teal-200 text-teal-700 text-sm font-medium rounded-md"
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              Añadir el primero
            </button>
          </div>
        </div>
      ) : (
        <ProductTable 
          products={localProducts.map(p => ({
            ...p,
            id: p.product_id,  // Añadir el campo id para compatibilidad
            product_id: p.product_id,
            section_id: sectionId,
            client_id: p.client_id || 0,
            display_order: p.display_order || 0
          } as any))}
          sectionId={sectionId}
          sectionName={sectionName}
          isUpdatingVisibility={isUpdatingVisibility}
          onToggleVisibility={(productId: number, status: number, sectionIdParam?: number) => 
            onToggleProductVisibility(productId, status, sectionIdParam || sectionId)
          }
          onEditProduct={(productFromTable: Product) => {
            // Buscar el producto original por product_id o id
            const productId = 'product_id' in productFromTable ? productFromTable.product_id : (productFromTable as any).id;
            const originalProduct = localProducts.find(p => p.product_id === productId);
            if (originalProduct) {
              onEditProduct(originalProduct);
            }
          }}
          onDeleteProduct={(productFromTable: Product) => {
            // Buscar el producto original por product_id o id
            const productId = 'product_id' in productFromTable ? productFromTable.product_id : (productFromTable as any).id;
            const originalProduct = localProducts.find(p => p.product_id === productId);
            if (originalProduct) {
              return onDeleteProduct(originalProduct);
            }
            return Promise.resolve(false);
          }}
          onReorderProduct={onProductsReorder}
          isReorderModeActive={!!onProductsReorder}
        />
      )}
    </>
  );
} 
