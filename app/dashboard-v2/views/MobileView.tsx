'use client';

import React, { useState, useEffect } from 'react';
import useCategoryManagement from '../hooks/domain/category/useCategoryManagement';
import useSectionManagement from '../hooks/domain/section/useSectionManagement';
import useProductManagement from '../hooks/domain/product/useProductManagement';
import Loader from '../components/ui/Loader';
import { Category } from '@/app/dashboard-v2/types/domain/category';
import { Section } from '@/app/dashboard-v2/types/domain/section';
import { Product } from '@/app/dashboard-v2/types/domain/product';
import { CategoryList } from '../components/domain/categories/CategoryList';
import Fab from '../components/ui/Fab';
import { PlusIcon } from '@heroicons/react/24/solid';
import ContextMenu from '../components/ui/ContextMenu';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { getImagePath, handleImageError } from '../utils/imageUtils';

// --- Tipos de Vista ---
type MobileViewType =
    | { view: 'categories' }
    | { view: 'sections'; categoryId: number; categoryName: string }
    | { view: 'products'; sectionId: number; sectionName: string; categoryId: number; categoryName: string };

// --- Sub-componente para la lista de Secciones ---
interface SectionListViewProps {
    categoryId: number;
    categoryName: string;
    sections: Section[];
    isLoading: boolean;
    error: string | null;
    onBack: () => void;
    onSectionClick: (section: Section) => void;
    onToggleVisibility: (section: Section) => void;
}

const SectionListView: React.FC<SectionListViewProps> = ({ categoryId, categoryName, sections, isLoading, error, onBack, onSectionClick, onToggleVisibility }) => {

    const handleEdit = (section: Section) => console.log("Editar sección:", section.name);
    const handleDelete = (section: Section) => console.log("Eliminar sección:", section.name);

    return (
        <div className="p-4">
            <button onClick={onBack} className="mb-4 text-blue-500">&larr; Volver a Categorías</button>
            <h1 className="text-2xl font-bold mb-4">Secciones en {categoryName}</h1>
            {isLoading && sections.length === 0 && <Loader />}
            {error && <div className="text-red-500 text-center p-4">Error al cargar secciones: {error}</div>}
            <ul className="space-y-2">
                {sections.map(section => {
                    const actions = [
                        { label: 'Editar', onClick: () => handleEdit(section) },
                        { label: 'Eliminar', onClick: () => handleDelete(section), isDestructive: true }
                    ];
                    return (
                        <li key={section.section_id} className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 ${section.status === 0 ? 'opacity-60' : ''}`}>
                            <div className="p-4 flex items-center gap-4">
                                <div className="flex-shrink-0 h-14 w-14 relative"><Image src={getImagePath(section.image || null, 'sections')} alt={section.name} fill className="object-cover rounded-md" onError={handleImageError} /></div>
                                <div className="flex-grow cursor-pointer" onClick={() => onSectionClick(section)}>
                                    <h3 className="font-bold text-lg text-gray-800">{section.name}</h3>
                                    <span className="text-sm text-gray-500">{section.visible_products_count} / {section.products_count} Productos Visibles</span>
                                </div>
                                <div className="flex-shrink-0 flex items-center gap-2">
                                    <button onClick={(e) => { e.stopPropagation(); onToggleVisibility(section); }} className="p-2 rounded-full hover:bg-gray-200">
                                        {section.status === 1 ? <EyeIcon className="h-6 w-6 text-gray-600" /> : <EyeSlashIcon className="h-6 w-6 text-gray-500" />}
                                    </button>
                                    <ContextMenu actions={actions} />
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ul>
            {(!isLoading && sections.length === 0) && <p className="text-center text-gray-500 mt-8">No hay secciones en esta categoría.</p>}
        </div>
    );
};

// --- Sub-componente para la lista de Productos ---
interface ProductListViewProps {
    sectionId: number;
    sectionName: string;
    products: Product[];
    isLoading: boolean;
    error: string | null;
    onBack: () => void;
    onToggleVisibility: (product: Product) => void;
}

const ProductListView: React.FC<ProductListViewProps> = ({ sectionId, sectionName, products, isLoading, error, onBack, onToggleVisibility }) => {

    const handleEdit = (product: Product) => console.log("Editar producto:", product.name);
    const handleDelete = (product: Product) => console.log("Eliminar producto:", product.name);

    return (
        <div className="p-4">
            <button onClick={onBack} className="mb-4 text-blue-500">&larr; Volver a Secciones</button>
            <h1 className="text-2xl font-bold mb-4">Productos en {sectionName}</h1>
            {isLoading && products.length === 0 && <Loader />}
            {error && <div className="text-red-500 text-center p-4">Error al cargar productos: {error}</div>}
            <ul className="space-y-2">
                {products.map(product => {
                    const actions = [
                        { label: 'Editar', onClick: () => handleEdit(product) },
                        { label: 'Eliminar', onClick: () => handleDelete(product), isDestructive: true }
                    ];
                    return (
                        <li key={product.product_id} className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 ${product.status === 0 ? 'opacity-60' : ''}`}>
                            <div className="p-4 flex items-center gap-4">
                                <div className="flex-shrink-0 h-14 w-14 relative"><Image src={getImagePath(product.image || null, 'products')} alt={product.name} fill className="object-cover rounded-md" onError={handleImageError} /></div>
                                <div className="flex-grow">
                                    <h3 className="font-bold text-lg text-gray-800">{product.name}</h3>
                                    <span className="text-sm text-gray-500">${product.price}</span>
                                </div>
                                <div className="flex-shrink-0 flex items-center gap-2">
                                    <button onClick={(e) => { e.stopPropagation(); onToggleVisibility(product); }} className="p-2 rounded-full hover:bg-gray-200">
                                        {product.status === 1 ? <EyeIcon className="h-6 w-6 text-gray-600" /> : <EyeSlashIcon className="h-6 w-6 text-gray-500" />}
                                    </button>
                                    <ContextMenu actions={actions} />
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ul>
            {(!isLoading && products.length === 0) && <p className="text-center text-gray-500 mt-8">No hay productos en esta sección.</p>}
        </div>
    );
};


// --- Vista Móvil Principal ---
const MobileView = () => {
    const [currentView, setCurrentView] = useState<MobileViewType>({ view: 'categories' });

    // Hooks de gestión de estado
    const categoryManager = useCategoryManagement();
    const sectionManager = useSectionManagement();
    const productManager = useProductManagement();

    // Efecto para cargar categorías iniciales
    useEffect(() => {
        if (categoryManager.categories.length === 0) {
            categoryManager.fetchCategories();
        }
    }, [categoryManager.fetchCategories, categoryManager.categories.length]);

    // Efecto para cargar secciones cuando se selecciona una categoría
    useEffect(() => {
        if (currentView.view === 'sections' && !sectionManager.sections[currentView.categoryId]) {
            sectionManager.fetchSectionsByCategory(currentView.categoryId);
        }
    }, [currentView, sectionManager.sections, sectionManager.fetchSectionsByCategory]);

    // Efecto para cargar productos cuando se selecciona una sección
    useEffect(() => {
        if (currentView.view === 'products' && !productManager.products[currentView.sectionId]) {
            productManager.fetchProductsBySection(currentView.sectionId);
        }
    }, [currentView, productManager.products, productManager.fetchProductsBySection]);


    // --- Handlers de Navegación y Acciones ---

    const handleToggleVisibility = async (item: Category | Section | Product) => {
        if ('sections_count' in item) { // Es Categoría
            await categoryManager.toggleCategoryVisibility(item.category_id, item.status);
        } else if ('products_count' in item) { // Es Sección
            if (currentView.view === 'sections' || currentView.view === 'products') {
                await sectionManager.toggleSectionVisibility(item.section_id, currentView.categoryId, item.status);
                categoryManager.fetchCategories();
            }
        } else if ('product_id' in item) { // Es Producto
            if (currentView.view === 'products') {
                await productManager.toggleProductVisibility(item.product_id, item.status);
                sectionManager.fetchSectionsByCategory(currentView.categoryId);
            }
        }
    };

    const handleCategoryClick = (category: Category) => setCurrentView({ view: 'sections', categoryId: category.category_id, categoryName: category.name });
    const handleSectionClick = (section: Section) => { if (currentView.view === 'sections') setCurrentView({ view: 'products', sectionId: section.section_id, sectionName: section.name, categoryId: currentView.categoryId, categoryName: currentView.categoryName }); };

    const handleBack = () => {
        if (currentView.view === 'sections') setCurrentView({ view: 'categories' });
        if (currentView.view === 'products') setCurrentView({ view: 'sections', categoryId: currentView.categoryId, categoryName: currentView.categoryName });
    };

    const handleFabClick = () => {
        switch (currentView.view) {
            case 'categories': console.log("Añadir nueva categoría"); break;
            case 'sections': console.log(`Añadir nueva sección a la categoría ${currentView.categoryName}`); break;
            case 'products': console.log(`Añadir nuevo producto a la sección ${currentView.sectionName}`); break;
        }
    };

    const handleEditCategory = (category: Category) => console.log("Editar categoría:", category.name);
    const handleDeleteCategory = (category: Category) => console.log("Eliminar categoría:", category.name);


    // --- Lógica de Renderizado ---

    if (categoryManager.isLoading && categoryManager.categories.length === 0) return <Loader />;
    if (categoryManager.error) return <div className="text-red-500 text-center p-4">Error al cargar: {categoryManager.error}</div>;

    const renderView = () => {
        switch (currentView.view) {
            case 'categories':
                return (
                    <div className="p-4">
                        <h1 className="text-2xl font-bold mb-4">Gestiona tu menú</h1>
                        <CategoryList
                            categories={categoryManager.categories}
                            onCategoryClick={handleCategoryClick}
                            expandedCategories={{}}
                            onEditCategory={handleEditCategory}
                            onDeleteCategory={handleDeleteCategory}
                            onToggleVisibility={handleToggleVisibility}
                        />
                    </div>
                );
            case 'sections':
                return (
                    <SectionListView
                        categoryId={currentView.categoryId}
                        categoryName={currentView.categoryName}
                        sections={sectionManager.sections[currentView.categoryId] || []}
                        isLoading={sectionManager.isLoading}
                        error={sectionManager.error}
                        onBack={handleBack}
                        onSectionClick={handleSectionClick}
                        onToggleVisibility={handleToggleVisibility}
                    />
                );
            case 'products':
                return (
                    <ProductListView
                        sectionId={currentView.sectionId}
                        sectionName={currentView.sectionName}
                        products={productManager.products[currentView.sectionId] || []}
                        isLoading={productManager.isLoading}
                        error={productManager.error}
                        onBack={handleBack}
                        onToggleVisibility={handleToggleVisibility}
                    />
                );
            default: return null;
        }
    };

    return (
        <>
            {renderView()}
            <Fab onClick={handleFabClick} icon={<PlusIcon className="h-6 w-6" />} label="Añadir nuevo elemento" />
        </>
    );
};

export default MobileView;