'use client';

import React, { useState, useEffect } from 'react'; // Importar useEffect
import { useSession } from 'next-auth/react';
import useCategoryManagement from '../hooks/domain/category/useCategoryManagement';
import Loader from '../components/ui/Loader';
import { Category } from '../types/domain/category';
import { CategoryList } from '../components/domain/categories/CategoryList';

type MobileViewType =
    | { view: 'categories' }
    | { view: 'sections'; categoryId: number; categoryName: string };

const MobileView = () => {
    const [currentView, setCurrentView] = useState<MobileViewType>({ view: 'categories' });

    const {
        categories,
        isLoading,
        error,
        fetchCategories, // Obtenemos la función para buscar categorías
    } = useCategoryManagement();

    // SOLUCIÓN: Usamos useEffect para llamar a fetchCategories cuando el componente se monta
    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]); // El array de dependencias asegura que solo se llame una vez

    const handleCategoryClick = (category: Category) => {
        setCurrentView({ view: 'sections', categoryId: category.category_id, categoryName: category.name });
    };

    const handleBackToCategories = () => {
        setCurrentView({ view: 'categories' });
    };

    if (isLoading && categories.length === 0) { // Mostrar loader solo en la carga inicial
        return <Loader />;
    }

    if (error) {
        return <div className="text-red-500 text-center p-4">Error al cargar: {error}</div>;
    }

    const adaptedCategories = categories.map(cat => ({
        ...cat,
        image: cat.image || null,
    }));

    if (currentView.view === 'categories') {
        // Añadimos un mensaje explícito si el array de categorías está vacío después de cargar
        if (adaptedCategories.length === 0) {
            return (
                <div className="p-4">
                    <h1 className="text-2xl font-bold mb-4">Gestiona tu menú</h1>
                    <p className="text-center text-gray-500 mt-8">No hay categorías disponibles.</p>
                </div>
            );
        }

        return (
            <div className="p-4">
                <h1 className="text-2xl font-bold mb-4">Gestiona tu menú</h1>
                <CategoryList
                    categories={adaptedCategories}
                    onCategoryClick={handleCategoryClick}
                    expandedCategories={{}}
                />
            </div>
        );
    }

    if (currentView.view === 'sections') {
        return (
            <div className="p-4">
                <button onClick={handleBackToCategories} className="mb-4 text-blue-500">
                    &larr; Volver a Categorías
                </button>
                <h1 className="text-2xl font-bold mb-4">Secciones en {currentView.categoryName}</h1>
                <p>Mostrando secciones para la categoría ID: {currentView.categoryId}</p>
                {/* Aquí iría el componente SectionList */}
            </div>
        );
    }

    return null;
};

export default MobileView;