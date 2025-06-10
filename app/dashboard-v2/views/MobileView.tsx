'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import useCategoryManagement from '../hooks/domain/category/useCategoryManagement';
import useSectionManagement from '../hooks/domain/section/useSectionManagement';
import useProductManagement from '../hooks/domain/product/useProductManagement';
import Loader from '../components/ui/Loader';
import { Category } from '../types/domain/category';
import { Section } from '../types/domain/section';
import { Product } from '../types/domain/product';
import { CategoryList } from '../components/domain/categories/CategoryList';
import Fab from '../components/ui/Fab';
import { PlusIcon } from '@heroicons/react/24/solid';
import ContextMenu from '../components/ui/ContextMenu';

// --- Sub-componente para la lista de Secciones ---
interface SectionListViewProps {
    categoryId: number;
    categoryName: string;
    onBack: () => void;
    onSectionClick: (section: Section) => void;
}

const SectionListView: React.FC<SectionListViewProps> = ({ categoryId, categoryName, onBack, onSectionClick }) => {
    const { sections, isLoading, error, fetchSectionsByCategory } = useSectionManagement();

    useEffect(() => {
        // Solo busca las secciones si no están ya cargadas para esta categoría
        if (!sections[categoryId]) {
            fetchSectionsByCategory(categoryId);
        }
    }, [categoryId, fetchSectionsByCategory, sections]);

    const categorySections = sections[categoryId] || [];

    const handleEdit = (section: Section) => {
        console.log("Editar sección:", section.name);
    };

    const handleDelete = (section: Section) => {
        console.log("Eliminar sección:", section.name);
    };

    return (
        <div className="p-4">
            <button onClick={onBack} className="mb-4 text-blue-500">
                &larr; Volver a Categorías
            </button>
            <h1 className="text-2xl font-bold mb-4">Secciones en {categoryName}</h1>

            {isLoading && categorySections.length === 0 && <Loader />}
            {error && <div className="text-red-500 text-center p-4">Error al cargar secciones: {error}</div>}

            {/* Aquí renderizaríamos la lista real de secciones */}
            <ul className="space-y-2">
                {categorySections.map(section => {
                    const actions = [
                        { label: 'Editar', onClick: () => handleEdit(section) },
                        { label: 'Eliminar', onClick: () => handleDelete(section), isDestructive: true }
                    ];
                    return (
                        <li
                            key={section.section_id}
                            className="p-4 border rounded-lg flex justify-between items-center cursor-pointer hover:bg-gray-100"
                            onClick={() => onSectionClick(section)}
                        >
                            <span>{section.name}</span>
                            <ContextMenu actions={actions} />
                        </li>
                    );
                })}
            </ul>
            {(!isLoading && categorySections.length === 0) && <p className="text-center text-gray-500 mt-8">No hay secciones en esta categoría.</p>}
        </div>
    );
};

// --- Sub-componente para la lista de Productos ---
interface ProductListViewProps {
    sectionId: number;
    sectionName: string;
    onBack: () => void;
}

const ProductListView: React.FC<ProductListViewProps> = ({ sectionId, sectionName, onBack }) => {
    const { products, isLoading, error, fetchProductsBySection } = useProductManagement();

    useEffect(() => {
        // Solo busca los productos si no están ya cargados para esta sección
        if (!products[sectionId]) {
            fetchProductsBySection(sectionId);
        }
    }, [sectionId, fetchProductsBySection, products]);

    const sectionProducts = products[sectionId] || [];

    const handleEdit = (product: Product) => {
        console.log("Editar producto:", product.name);
        // Lógica para el modal de edición
    };

    const handleDelete = (product: Product) => {
        console.log("Eliminar producto:", product.name);
        // Lógica para la confirmación de eliminación
    };

    return (
        <div className="p-4">
            <button onClick={onBack} className="mb-4 text-blue-500">
                &larr; Volver a Secciones
            </button>
            <h1 className="text-2xl font-bold mb-4">Productos en {sectionName}</h1>

            {isLoading && sectionProducts.length === 0 && <Loader />}
            {error && <div className="text-red-500 text-center p-4">Error al cargar productos: {error}</div>}

            <ul className="space-y-2">
                {sectionProducts.map(product => {
                    const actions = [
                        { label: 'Editar', onClick: () => handleEdit(product) },
                        { label: 'Eliminar', onClick: () => handleDelete(product), isDestructive: true }
                    ];

                    return (
                        <li
                            key={product.product_id}
                            className="p-4 border rounded-lg flex justify-between items-center"
                        >
                            <span>{product.name} - ${product.price}</span>
                            <ContextMenu actions={actions} />
                        </li>
                    );
                })}
            </ul>
            {(!isLoading && sectionProducts.length === 0) && <p className="text-center text-gray-500 mt-8">No hay productos en esta sección.</p>}
        </div>
    );
};

// --- Vista Móvil Principal ---
type MobileViewType =
    | { view: 'categories' }
    | { view: 'sections'; categoryId: number; categoryName: string }
    | { view: 'products'; sectionId: number; sectionName: string; categoryId: number; categoryName: string };

const MobileView = () => {
    const [currentView, setCurrentView] = useState<MobileViewType>({ view: 'categories' });
    const { categories, isLoading: isLoadingCategories, error: errorCategories, fetchCategories } = useCategoryManagement();

    useEffect(() => {
        if (categories.length === 0) {
            fetchCategories();
        }
    }, [fetchCategories, categories]);

    const handleFabClick = () => {
        switch (currentView.view) {
            case 'categories':
                console.log("Añadir nueva categoría");
                // Aquí iría la lógica para abrir el modal de nueva categoría
                break;
            case 'sections':
                console.log(`Añadir nueva sección a la categoría ${currentView.categoryName}`);
                // Aquí iría la lógica para abrir el modal de nueva sección
                break;
            case 'products':
                console.log(`Añadir nuevo producto a la sección ${currentView.sectionName}`);
                // Aquí iría la lógica para abrir el modal de nuevo producto
                break;
        }
    };

    const handleEditCategory = (category: Category) => {
        console.log("Editar categoría:", category.name);
    };

    const handleDeleteCategory = (category: Category) => {
        console.log("Eliminar categoría:", category.name);
    };

    const handleCategoryClick = (category: Category) => {
        setCurrentView({ view: 'sections', categoryId: category.category_id, categoryName: category.name });
    };

    const handleSectionClick = (section: Section) => {
        if (currentView.view === 'sections') {
            setCurrentView({
                view: 'products',
                sectionId: section.section_id,
                sectionName: section.name,
                categoryId: currentView.categoryId,
                categoryName: currentView.categoryName,
            });
        }
    };

    const handleBack = () => {
        if (currentView.view === 'sections') {
            setCurrentView({ view: 'categories' });
        } else if (currentView.view === 'products') {
            setCurrentView({
                view: 'sections',
                categoryId: currentView.categoryId,
                categoryName: currentView.categoryName,
            });
        }
    };

    if (isLoadingCategories && categories.length === 0) {
        return <Loader />;
    }

    if (errorCategories) {
        return <div className="text-red-500 text-center p-4">Error al cargar: {errorCategories}</div>;
    }

    const renderView = () => {
        switch (currentView.view) {
            case 'categories':
                const adaptedCategories = categories.map(cat => ({ ...cat, image: cat.image || null }));
                return (
                    <div className="p-4">
                        <h1 className="text-2xl font-bold mb-4">Gestiona tu menú</h1>
                        <CategoryList
                            categories={adaptedCategories}
                            onCategoryClick={handleCategoryClick}
                            expandedCategories={{}}
                            onEditCategory={handleEditCategory}
                            onDeleteCategory={handleDeleteCategory}
                        />
                    </div>
                );
            case 'sections':
                return (
                    <SectionListView
                        categoryId={currentView.categoryId}
                        categoryName={currentView.categoryName}
                        onBack={handleBack}
                        onSectionClick={handleSectionClick}
                    />
                );
            case 'products':
                return (
                    <ProductListView
                        sectionId={currentView.sectionId}
                        sectionName={currentView.sectionName}
                        onBack={handleBack}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <>
            {renderView()}
            <Fab
                onClick={handleFabClick}
                icon={<PlusIcon className="h-6 w-6" />}
                label="Añadir nuevo elemento"
            />
        </>
    );
};

export default MobileView;