// Archivo para el componente de contenido de categoría.
// El contenido se añadirá en el siguiente paso. 

import React from 'react';
import { useDashboardStore } from '@/app/dashboard-v2/stores/dashboardStore';

export const CategoryContentDisplay = React.memo(({ categoryId }: { categoryId: number }) => {
    const categories = useDashboardStore(state => state.categories);
    const sections = useDashboardStore(state => state.sections);
    const products = useDashboardStore(state => state.products);

    const displayData = React.useMemo(() => {
        const category = categories.find(c => c.category_id === categoryId);
        if (!category) return null;

        const categorySections = sections[categoryId] || [];
        const allCategoryProducts = products[`cat-${categoryId}`] || [];
        const directProducts = allCategoryProducts.filter(p => !p.section_id);

        const sectionsCount = categorySections.length;
        const directProductsCount = directProducts.length;
        const visibleDirectProductsCount = directProducts.filter(p => p.status).length;
        const visibleSectionsCount = categorySections.filter(s => s.status).length;

        const displayText = sectionsCount > 0
            ? `${sectionsCount} secciones`
            : `${directProductsCount} productos directos`;

        const subDisplayText = sectionsCount > 0
            ? `${visibleSectionsCount} / ${sectionsCount} visibles`
            : `${visibleDirectProductsCount} / ${directProductsCount} visibles`;

        return { displayText, subDisplayText };
    }, [categoryId, categories, sections, products]);

    if (!displayData) {
        return <span className="text-sm text-gray-400">Cargando...</span>;
    }

    return (
        <div className="flex flex-col">
            <span className="text-sm text-gray-600 font-medium">{displayData.displayText}</span>
            <span className="text-xs text-gray-400">{displayData.subDisplayText}</span>
        </div>
    );
});

CategoryContentDisplay.displayName = 'CategoryContentDisplay'; 