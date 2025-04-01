"use client";

import React from 'react';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';

interface BreadcrumbItem {
  id: string;
  name: string;
  current: boolean;
  onClick: () => void;
  key?: string; // Hacerlo opcional para mantener compatibilidad
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  // No renderizar nada si no hay items
  if (!items.length) return null;

  // Encontrar el índice del elemento actual
  const currentIndex = items.findIndex(item => item.current);
  
  // Para móviles: mostrar home, el elemento previo (si existe) y el actual
  const mobileItems = items.filter((item, index) => {
    return index === 0 || // Siempre mostrar home
           item.current || // Siempre mostrar el actual
           index === currentIndex - 1; // Mostrar el anterior al actual
  });

  return (
    <nav className="flex" aria-label="Breadcrumb">
      {/* Versión escritorio (todos los elementos) */}
      <ol className="hidden md:flex items-center space-x-2">
        <li>
          <button 
            onClick={() => items[0]?.onClick()} 
            className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-md p-1 transition-colors duration-200"
            aria-label="Ir a la página principal"
            title="Ir a la página principal"
          >
            <HomeIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </li>

        {items.map((item, index) => (
          <li key={item.id} className="flex items-center">
            <ChevronRightIcon
              className="flex-shrink-0 h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
            <button
              onClick={item.onClick}
              className={`ml-2 text-sm font-medium rounded-md px-2 py-1 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                item.current
                  ? 'text-indigo-700 bg-indigo-50 hover:bg-indigo-100'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
              aria-current={item.current ? 'page' : undefined}
              title={`Ir a ${item.name}`}
            >
              {item.name}
            </button>
          </li>
        ))}
      </ol>

      {/* Versión móvil (simplificada) */}
      <ol className="flex md:hidden items-center space-x-2">
        <li>
          <button 
            onClick={() => items[0]?.onClick()} 
            className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-md p-1 transition-colors duration-200"
            aria-label="Ir a la página principal"
            title="Ir a la página principal"
          >
            <HomeIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </li>

        {mobileItems.slice(1).map((item, index) => (
          <li key={item.id} className="flex items-center">
            <ChevronRightIcon
              className="flex-shrink-0 h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
            <button
              onClick={item.onClick}
              className={`ml-2 text-sm font-medium rounded-md px-2 py-1 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                item.current
                  ? 'text-indigo-700 bg-indigo-50 hover:bg-indigo-100'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
              aria-current={item.current ? 'page' : undefined}
              title={`Ir a ${item.name}`}
            >
              {item.name.length > 15 ? `${item.name.substring(0, 15)}...` : item.name}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
} 