import React from 'react';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';

interface BreadcrumbItem {
  id: number | null | any;
  name: string;
  key?: string;
  onClick?: () => void;
  current: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  onItemClick?: (item: BreadcrumbItem) => void;
}

/**
 * Componente de migas de pan para navegación jerárquica
 * Creado: 26-03-2024 19:00 (GMT+0)
 */
const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, onItemClick }) => {
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1">
        <li>
          <div className="flex items-center">
            <HomeIcon 
              className="flex-shrink-0 h-4 w-4 text-gray-400" 
              aria-hidden="true"
            />
          </div>
        </li>
        
        {items.map((item, index) => (
          <li key={`${item.name}-${index}`}>
            <div className="flex items-center">
              <ChevronRightIcon
                className="flex-shrink-0 h-4 w-4 text-gray-400"
                aria-hidden="true"
              />
              
              {item.current ? (
                <span 
                  className="ml-1 text-sm font-medium text-indigo-600"
                  aria-current="page"
                >
                  {item.name}
                </span>
              ) : (
                <button
                  onClick={() => {
                    if (item.onClick) {
                      item.onClick();
                    } else if (onItemClick) {
                      onItemClick(item);
                    }
                  }}
                  className="ml-1 text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  {item.name}
                </button>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs; 