import React from 'react';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

interface Breadcrumb {
  id: number;
  name: string;
  onClick: () => void;
}

interface ContentPanelProps {
  title: string;
  children: React.ReactNode;
  breadcrumbs?: Breadcrumb[];
}

/**
 * Panel de contenido con título y sistema de migas de pan para navegación jerárquica.
 */
export default function ContentPanel({ title, children, breadcrumbs = [] }: ContentPanelProps) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex flex-col space-y-1">
          {breadcrumbs.length > 0 && (
            <div className="flex items-center text-xs text-gray-500">
              <button 
                onClick={() => {}} 
                className="hover:text-indigo-600 transition-colors"
              >
                Inicio
              </button>
              
              {breadcrumbs.map((crumb, index) => (
                <div key={crumb.id} className="flex items-center">
                  <ChevronRightIcon className="h-3 w-3 mx-1" />
                  <button
                    onClick={crumb.onClick}
                    className={`${
                      index === breadcrumbs.length - 1 
                        ? 'font-medium text-gray-700' 
                        : 'hover:text-indigo-600 transition-colors'
                    }`}
                  >
                    {crumb.name}
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        </div>
      </div>
      
      <div className="p-4">
        {children}
      </div>
    </div>
  );
} 