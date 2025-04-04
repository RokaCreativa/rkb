import React, { useState } from 'react';
import { PaintBrushIcon } from '@heroicons/react/24/outline';
import CustomizationModal from '../modals/CustomizationModal';

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ title, subtitle }) => {
  const [isCustomizationModalOpen, setIsCustomizationModalOpen] = useState(false);
  
  return (
    <header className="py-6 px-4 sm:px-6 lg:px-8 bg-white shadow-sm border-b border-gray-200">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
        </div>
        
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={() => setIsCustomizationModalOpen(true)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PaintBrushIcon className="h-5 w-5 mr-2 text-gray-500" />
            Personalizar Dashboard
          </button>
        </div>
      </div>
      
      {/* Modal de personalización */}
      <CustomizationModal 
        isOpen={isCustomizationModalOpen} 
        onClose={() => setIsCustomizationModalOpen(false)} 
      />
    </header>
  );
};

export default DashboardHeader; 