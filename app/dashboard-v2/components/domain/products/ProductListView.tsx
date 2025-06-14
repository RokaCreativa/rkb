'use client';

import React from 'react';
import { Product } from '@/app/dashboard-v2/types';
import Image from 'next/image';
import { getImagePath, handleImageError } from '@/app/dashboard-v2/utils/imageUtils';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import ContextMenu from '@/app/dashboard-v2/components/ui/ContextMenu';

interface ProductListViewProps {
    products: Product[];
    onToggleVisibility: (product: Product) => void;
    onEdit: (product: Product) => void;
    onDelete: (product: Product) => void;
}

export const ProductListView: React.FC<ProductListViewProps> = ({ products, onToggleVisibility, onEdit, onDelete }) => {
    if (products.length === 0) {
        return <p className="text-center text-gray-500 mt-8">No hay productos en esta sección.</p>;
    }

    return (
        <ul className="space-y-2">
            {products.map(product => {
                const actions = [
                    { label: 'Editar', onClick: () => onEdit(product) },
                    { label: 'Eliminar', onClick: () => onDelete(product), isDestructive: true }
                ];
                return (
                    <li key={product.product_id} className={`bg-white rounded-lg shadow-md transition-all duration-300 ${!product.status ? 'opacity-60' : ''}`}>
                        <div className="p-4 flex items-center gap-4">
                            <div className="shrink-0 h-14 w-14 relative">
                                <Image
                                    src={getImagePath(product.image || null, 'products')}
                                    alt={product.name}
                                    fill
                                    className="object-cover rounded-md"
                                    onError={handleImageError}
                                />
                            </div>
                            <div className="grow">
                                <h3 className="font-bold text-lg text-gray-800">{product.name}</h3>
                                <span className="text-sm text-gray-500">${product.price}</span>
                                {product.description && (
                                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                        {product.description}
                                    </p>
                                )}
                            </div>
                            <div className="shrink-0 flex items-center gap-2">
                                <button onClick={(e) => { e.stopPropagation(); onToggleVisibility(product); }} className="p-2 rounded-full hover:bg-gray-200">
                                    {product.status ? <EyeIcon className="h-6 w-6 text-gray-600" /> : <EyeSlashIcon className="h-6 w-6 text-gray-500" />}
                                </button>
                                <ContextMenu actions={actions} />
                            </div>
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}; 