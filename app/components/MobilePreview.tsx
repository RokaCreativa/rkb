import React from 'react';
import Image from 'next/image';
import { QrCodeIcon } from '@heroicons/react/24/outline';
import { Menu, Producto } from '../api/auth/models';

// Definir solo la interfaz de propiedades del componente
interface MobilePreviewProps {
  selectedMenu: Menu | null;
}

const MobilePreview: React.FC<MobilePreviewProps> = ({ selectedMenu }) => {
  // Función para generar la hora actual
  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Previsualización Móvil</h3>
      
      <div className="flex-1 flex items-center justify-center">
        <div className="w-[280px] h-[560px] bg-black rounded-[36px] overflow-hidden shadow-xl border-[10px] border-gray-800 relative">
          {/* Notch del teléfono */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[120px] h-7 bg-black rounded-b-xl z-10"></div>
          
          {/* Barra de estado */}
          <div className="h-7 bg-gray-800 w-full flex items-center justify-between px-6 z-5">
            <div className="text-white text-xs font-medium">{getCurrentTime()}</div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
          
          {/* Contenido */}
          {selectedMenu ? (
            <div className="bg-gray-900 text-white h-[calc(100%-8rem)] overflow-y-auto custom-scrollbar">
              {/* Header */}
              <div className="p-4 flex items-center justify-between sticky top-0 bg-gray-900 z-10 border-b border-gray-800">
                <div className="flex items-center space-x-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                  <span className="text-sm font-medium">{selectedMenu.nombre}</span>
                </div>
                <div className="flex items-center">
                  <QrCodeIcon className="h-5 w-5 text-white" />
                </div>
              </div>
              
              {/* Filtros */}
              <div className="flex px-3 py-3 space-x-2 overflow-x-auto hide-scrollbar">
                <div className="bg-white text-black rounded-full px-3 py-1 text-xs whitespace-nowrap">Entrantes</div>
                <div className="bg-gray-700 text-white rounded-full px-3 py-1 text-xs whitespace-nowrap">Principales</div>
                <div className="bg-gray-700 text-white rounded-full px-3 py-1 text-xs whitespace-nowrap">Postres</div>
                <div className="bg-gray-700 text-white rounded-full px-3 py-1 text-xs whitespace-nowrap">Bebidas</div>
              </div>
              
              {/* Sección */}
              <div className="pt-3 pb-2 px-4 bg-black sticky top-14 z-10">
                <h3 className="text-lg font-bold">Entrantes</h3>
              </div>
              
              {/* Productos */}
              <div className="divide-y divide-gray-800">
                {selectedMenu?.productos && selectedMenu.productos.length > 0 ? (
                  selectedMenu.productos.map((producto: Producto) => (
                    <div key={producto.id} className="p-4 flex justify-between">
                      <div className="flex-1 pr-3">
                        <h4 className="font-medium flex items-center space-x-1">
                          <span>{producto.nombre}</span>
                          {producto.visible && (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 text-gray-400">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                            </svg>
                          )}
                        </h4>
                        {producto.descripcion && (
                          <p className="text-xs text-gray-400 mt-1 line-clamp-2">{producto.descripcion}</p>
                        )}
                        <p className="text-sm mt-1 font-semibold">{producto.precio.toFixed(2)} €</p>
                      </div>
                      <div className="w-20 h-20 bg-gray-700 rounded-md overflow-hidden flex-shrink-0">
                        {producto.imagen && (
                          <div className="relative w-full h-full">
                            <img 
                              src={producto.imagen} 
                              alt={producto.nombre}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-sm text-gray-400">
                    <p>No hay platos en este menú</p>
                    <p className="mt-2 text-xs">Añade platos para visualizarlos aquí</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gray-900 text-white h-[calc(100%-8rem)] flex flex-col items-center justify-center p-6 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-600 mb-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
              <p className="text-sm text-gray-400 mb-2">Selecciona un menú para previsualizar</p>
              <p className="text-xs text-gray-500">Los cambios se mostrarán aquí en tiempo real</p>
            </div>
          )}
          
          {/* Barra inferior */}
          <div className="h-[5rem] bg-gray-800 absolute bottom-0 w-full px-4 py-3 flex flex-col justify-center">
            <div className="bg-white text-black rounded-full text-center py-2 text-sm mb-2 flex items-center justify-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
              <span>Valora tu experiencia</span>
            </div>
            
            <div className="flex justify-between items-center px-2">
              <div className="w-8 h-1 bg-gray-600 rounded-full"></div>
              <div className="w-8 h-1 bg-white rounded-full"></div>
              <div className="w-8 h-1 bg-gray-600 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code */}
      <div className="mt-4 flex justify-center">
        <div className="bg-white rounded-lg p-3 shadow">
          <QrCodeIcon className="h-8 w-8 text-gray-800" />
        </div>
      </div>
    </div>
  );
};

export default MobilePreview; 