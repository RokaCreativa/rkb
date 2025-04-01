"use client";

import React from 'react';
import { ChevronRightIcon } from '@heroicons/react/24/solid';

interface BreadcrumbItem {
  id: string;
  name: string;
  current: boolean;
  onClick: () => void;
  key?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  if (!items || items.length === 0) return null;
  
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => (
          <li key={item.id || index} className="flex items-center">
            {index > 0 && (
              <ChevronRightIcon className="h-5 w-5 text-gray-500 mx-1" aria-hidden="true" />
            )}
            <button
              onClick={item.onClick}
              className={`text-sm font-medium ${
                item.current
                  ? 'text-indigo-600 font-semibold'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              aria-current={item.current ? 'page' : undefined}
            >
              {item.name}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
} 