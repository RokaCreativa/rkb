"use client";

import React from 'react';

interface TopNavbarProps {
  isReorderModeActive?: boolean;
  onToggleReorderMode?: () => void;
}

export function TopNavbar({ isReorderModeActive = false, onToggleReorderMode = () => {} }: TopNavbarProps) {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo y menú izquierdo */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <img className="h-8 w-auto" src="/images/logo.png" alt="RokaMenu" />
            </div>
          </div>
          
          {/* Menú derecho */}
          <div className="flex items-center">
            {/* Botón de modo reordenamiento - solo mostrar si se proporciona la función */}
            {onToggleReorderMode !== undefined && (
              <button
                type="button"
                onClick={onToggleReorderMode}
                className={`ml-3 inline-flex items-center px-4 py-2 border ${
                  isReorderModeActive 
                    ? 'bg-red-100 border-red-300 text-red-700' 
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                } text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
              >
                <svg 
                  className={`-ml-1 mr-2 h-5 w-5 ${isReorderModeActive ? 'text-red-500' : 'text-gray-500'}`} 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
                {isReorderModeActive ? 'Desactivar reordenamiento' : 'Modo reordenamiento'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 