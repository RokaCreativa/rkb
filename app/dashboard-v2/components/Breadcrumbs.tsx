"use client";

import React from 'react';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';
import { Category, Section } from '@/app/types/menu';

export interface BreadcrumbItem {
  id: string;
  name: string;
  onClick: () => void;
  current: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function getBreadcrumbItems(
  view: string,
  selectedCategory: Category | null,
  selectedSection: Section | null,
  handlers: {
    goToCategories: () => void;
    goToSections: (category: Category) => void;
    goToProducts: (section: Section) => void;
  }
): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [
    {
      id: 'categories',
      name: "Categorías",
      onClick: handlers.goToCategories,
      current: view === 'categories' || !view
    }
  ];

  if (selectedCategory) {
    items.push({
      id: `category-${selectedCategory.category_id}`,
      name: selectedCategory.name || "Categoría",
      onClick: () => handlers.goToSections(selectedCategory),
      current: view === 'sections' && !selectedSection
    });
  }

  if (selectedSection) {
    items.push({
      id: `section-${selectedSection.section_id}`,
      name: selectedSection.name || "Sección",
      onClick: () => handlers.goToProducts(selectedSection),
      // Siempre false porque ahora las secciones se expanden, no se cambia de vista
      current: false
    });
  }

  return items;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        <li>
          <div className="flex items-center">
            <span className="text-gray-400">
              <HomeIcon className="flex-shrink-0 h-5 w-5" aria-hidden="true" />
            </span>
          </div>
        </li>
        {items.map((item, index) => (
          <li key={item.id}>
            <div className="flex items-center">
              <ChevronRightIcon className="flex-shrink-0 h-5 w-5 text-gray-300" aria-hidden="true" />
              <button
                onClick={item.onClick}
                className={`ml-2 text-sm font-medium ${
                  item.current 
                    ? 'text-indigo-600 hover:text-indigo-700 font-semibold' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                aria-current={item.current ? 'page' : undefined}
              >
                {item.name}
              </button>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}; 