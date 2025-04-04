import React, { useState, useEffect, useRef } from 'react';
import { XMarkIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { useClient } from '@/app/dashboard-v2/hooks/useClient';
import { useCustomizationStore, FavoriteTheme } from '@/app/dashboard-v2/stores/customizationStore';
import { HexColorPicker, HexColorInput } from 'react-colorful';
import { useTheme } from '@/app/dashboard-v2/hooks/useTheme';
import { default as DraggableComponent } from 'react-draggable';

interface CustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ColorSetting {
  id: string;
  label: string;
  value: string;
  cssVar: string;
  description: string;
}

// Paleta de colores de Tailwind
const tailwindColors = {
  slate: ['#f8fafc', '#f1f5f9', '#e2e8f0', '#cbd5e1', '#94a3b8', '#64748b', '#475569', '#334155', '#1e293b', '#0f172a'],
  gray: ['#f9fafb', '#f3f4f6', '#e5e7eb', '#d1d5db', '#9ca3af', '#6b7280', '#4b5563', '#374151', '#1f2937', '#111827'],
  red: ['#fef2f2', '#fee2e2', '#fecaca', '#fca5a5', '#f87171', '#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d'],
  orange: ['#fff7ed', '#ffedd5', '#fed7aa', '#fdba74', '#fb923c', '#f97316', '#ea580c', '#c2410c', '#9a3412', '#7c2d12'],
  amber: ['#fffbeb', '#fef3c7', '#fde68a', '#fcd34d', '#fbbf24', '#f59e0b', '#d97706', '#b45309', '#92400e', '#78350f'],
  yellow: ['#fefce8', '#fef9c3', '#fef08a', '#fde047', '#facc15', '#eab308', '#ca8a04', '#a16207', '#854d0e', '#713f12'],
  lime: ['#f7fee7', '#ecfccb', '#d9f99d', '#bef264', '#a3e635', '#84cc16', '#65a30d', '#4d7c0f', '#3f6212', '#365314'],
  green: ['#f0fdf4', '#dcfce7', '#bbf7d0', '#86efac', '#4ade80', '#22c55e', '#16a34a', '#15803d', '#166534', '#14532d'],
  emerald: ['#ecfdf5', '#d1fae5', '#a7f3d0', '#6ee7b7', '#34d399', '#10b981', '#059669', '#047857', '#065f46', '#064e3b'],
  teal: ['#f0fdfa', '#ccfbf1', '#99f6e4', '#5eead4', '#2dd4bf', '#14b8a6', '#0d9488', '#0f766e', '#115e59', '#134e4a'],
  cyan: ['#ecfeff', '#cffafe', '#a5f3fc', '#67e8f9', '#22d3ee', '#06b6d4', '#0891b2', '#0e7490', '#155e75', '#164e63'],
  sky: ['#f0f9ff', '#e0f2fe', '#bae6fd', '#7dd3fc', '#38bdf8', '#0ea5e9', '#0284c7', '#0369a1', '#075985', '#0c4a6e'],
  blue: ['#eff6ff', '#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a'],
  indigo: ['#eef2ff', '#e0e7ff', '#c7d2fe', '#a5b4fc', '#818cf8', '#6366f1', '#4f46e5', '#4338ca', '#3730a3', '#312e81'],
  violet: ['#f5f3ff', '#ede9fe', '#ddd6fe', '#c4b5fd', '#a78bfa', '#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95'],
  purple: ['#faf5ff', '#f3e8ff', '#e9d5ff', '#d8b4fe', '#c084fc', '#a855f7', '#9333ea', '#7e22ce', '#6b21a8', '#581c87'],
  fuchsia: ['#fdf4ff', '#fae8ff', '#f5d0fe', '#f0abfc', '#e879f9', '#d946ef', '#c026d3', '#a21caf', '#86198f', '#701a75'],
  pink: ['#fdf2f8', '#fce7f3', '#fbcfe8', '#f9a8d4', '#f472b6', '#ec4899', '#db2777', '#be185d', '#9d174d', '#831843'],
  rose: ['#fff1f2', '#ffe4e6', '#fecdd3', '#fda4af', '#fb7185', '#f43f5e', '#e11d48', '#be123c', '#9f1239', '#881337'],
};

// Mapeo de valores numéricos a nombres de colores de Tailwind
const tailwindShades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

const CustomizationModal: React.FC<CustomizationModalProps> = ({ isOpen, onClose }) => {
  const { client, updateClient } = useClient();
  const customization = useCustomizationStore(state => state);
  const { updateThemeVariable } = useTheme();
  
  const [activeTab, setActiveTab] = useState<'categories' | 'sections' | 'products' | 'icons' | 'themes'>('categories');
  const [activeColor, setActiveColor] = useState<string | null>(null);
  const [tempColor, setTempColor] = useState<string>('#ffffff');
  const [expanded, setExpanded] = useState<boolean>(false);
  const [showTailwindPalette, setShowTailwindPalette] = useState<boolean>(false);
  const [selectedColorFamily, setSelectedColorFamily] = useState<string>('indigo');
  
  // Estados para temas favoritos
  const [showSaveThemeForm, setShowSaveThemeForm] = useState<boolean>(false);
  const [newThemeName, setNewThemeName] = useState<string>('');
  const [editingThemeId, setEditingThemeId] = useState<string | null>(null);
  
  // Estado para la posición del modal
  const nodeRef = useRef<HTMLDivElement>(null);
  
  // Verificar que customization tenga valores
  const isCustomizationReady = customization && 
    customization.categoryBgColor !== undefined && 
    customization.sectionBgColor !== undefined && 
    customization.productBgColor !== undefined;
  
  // Solo creamos los grupos de colores si customization está listo
  const categoryColors: ColorSetting[] = isCustomizationReady ? [
    { id: 'categoryBgColor', label: 'Fondo', value: customization.categoryBgColor, cssVar: '--category-bg-color', description: 'Color de fondo para categorías' },
    { id: 'categoryBorderColor', label: 'Borde', value: customization.categoryBorderColor, cssVar: '--category-border-color', description: 'Color de borde para categorías' },
    { id: 'categoryTitleColor', label: 'Título', value: customization.categoryTitleColor, cssVar: '--category-title-color', description: 'Color del texto del título' },
    { id: 'categoryTextColor', label: 'Texto', value: customization.categoryTextColor, cssVar: '--category-text-color', description: 'Color del texto regular' },
    { id: 'categoryButtonBg', label: 'Botones', value: customization.categoryButtonBg, cssVar: '--category-button-bg', description: 'Color de fondo de botones' },
  ] : [];
  
  const sectionColors: ColorSetting[] = isCustomizationReady ? [
    { id: 'sectionBgColor', label: 'Fondo', value: customization.sectionBgColor, cssVar: '--section-bg-color', description: 'Color de fondo para secciones' },
    { id: 'sectionBorderColor', label: 'Borde', value: customization.sectionBorderColor, cssVar: '--section-border-color', description: 'Color de borde para secciones' },
    { id: 'sectionTitleColor', label: 'Título', value: customization.sectionTitleColor, cssVar: '--section-title-color', description: 'Color del texto del título' },
    { id: 'sectionTextColor', label: 'Texto', value: customization.sectionTextColor, cssVar: '--section-text-color', description: 'Color del texto regular' },
    { id: 'sectionAccentBorder', label: 'Acento', value: customization.sectionAccentBorder, cssVar: '--section-accent-border', description: 'Color del borde izquierdo' },
  ] : [];
  
  const productColors: ColorSetting[] = isCustomizationReady ? [
    { id: 'productBgColor', label: 'Fondo', value: customization.productBgColor, cssVar: '--product-bg-color', description: 'Color de fondo para productos' },
    { id: 'productBorderColor', label: 'Borde', value: customization.productBorderColor, cssVar: '--product-border-color', description: 'Color de borde para productos' },
    { id: 'productTitleColor', label: 'Título', value: customization.productTitleColor, cssVar: '--product-title-color', description: 'Color del texto del título' },
    { id: 'productTextColor', label: 'Texto', value: customization.productTextColor, cssVar: '--product-text-color', description: 'Color del texto regular' },
    { id: 'productButtonBg', label: 'Botones', value: customization.productButtonBg, cssVar: '--product-button-bg', description: 'Color de fondo de botones' },
  ] : [];
  
  const iconSettings: ColorSetting[] = isCustomizationReady ? [
    { id: 'iconAddColor', label: 'Icono Agregar', value: customization.iconAddColor, cssVar: '--icon-add-color', description: 'Color del icono de agregar' },
    { id: 'iconEditColor', label: 'Icono Editar', value: customization.iconEditColor, cssVar: '--icon-edit-color', description: 'Color del icono de editar' },
    { id: 'iconDeleteColor', label: 'Icono Eliminar', value: customization.iconDeleteColor, cssVar: '--icon-delete-color', description: 'Color del icono de eliminar' },
    { id: 'iconVisibilityColor', label: 'Icono Visibilidad', value: customization.iconVisibilityColor, cssVar: '--icon-visibility-color', description: 'Color del icono de visibilidad' },
  ] : [];
  
  // Efecto para actualizar colores en tiempo real
  useEffect(() => {
    if (!isOpen || !isCustomizationReady) return;
    
    try {
      // Aplicar colores actuales al DOM
      const allColorSettings = [...categoryColors, ...sectionColors, ...productColors, ...iconSettings];
      
      // Solo proceder si hay configuraciones de color válidas
      if (allColorSettings.length > 0) {
        // Iterar sobre todas las propiedades de customization que corresponden a colores
        Object.entries(customization).forEach(([key, value]) => {
          // Buscar si la clave corresponde a una configuración de color
          const setting = allColorSettings.find(s => s.id === key);
          if (setting && value) {
            updateThemeVariable(setting.cssVar, value);
          }
        });
      }
    } catch (error) {
      console.error('Error al aplicar colores:', error);
    }
  }, [isOpen, isCustomizationReady, customization, categoryColors, sectionColors, productColors, iconSettings, updateThemeVariable]);
  
  // Manejar cambio de color
  const handleColorChange = (color: string) => {
    if (!color) return;
    
    setTempColor(color);
    if (activeColor && isCustomizationReady) {
      try {
        // Actualizar el DOM en tiempo real
        const allColorSettings = [...categoryColors, ...sectionColors, ...productColors, ...iconSettings];
        const setting = allColorSettings.find(s => s.id === activeColor);
        if (setting) {
          updateThemeVariable(setting.cssVar, color);
        }
      } catch (error) {
        console.error('Error al cambiar color:', error);
      }
    }
  };
  
  // Aplicar color de Tailwind
  const applyTailwindColor = (colorFamily: string, index: number) => {
    const color = tailwindColors[colorFamily as keyof typeof tailwindColors][index];
    handleColorChange(color);
  };
  
  // Renderizar paleta de colores
  const renderColorPalette = (colors: ColorSetting[]) => {
    if (!colors.length) return <p className="text-gray-500">Cargando configuración de colores...</p>;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {colors.map((color) => (
          <div key={color.id} className="bg-white p-3 rounded-lg border shadow-sm">
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium text-sm">{color.label}</span>
              <div 
                className="h-5 w-5 rounded-full border cursor-pointer"
                style={{ backgroundColor: color.value }}
                onClick={() => {
                  setActiveColor(color.id);
                  setTempColor(color.value);
                }}
              />
            </div>
            <p className="text-xs text-gray-500 truncate">{color.description}</p>
          </div>
        ))}
      </div>
    );
  };
  
  // Renderizar paleta de Tailwind
  const renderTailwindPalette = () => {
    return (
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium">Paleta Tailwind</h3>
          <div className="flex overflow-x-auto pb-1 space-x-1">
            {Object.keys(tailwindColors).map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColorFamily(color)}
                className={`px-2 py-1 text-xs rounded ${selectedColorFamily === color ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
        <div className="flex overflow-x-auto space-x-1 py-1">
          {tailwindColors[selectedColorFamily as keyof typeof tailwindColors].map((color, index) => (
            <div 
              key={index}
              className="flex flex-col items-center"
            >
              <div 
                className="h-6 w-6 rounded border cursor-pointer hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
                title={`${selectedColorFamily}-${tailwindShades[index]}: ${color}`}
                onClick={() => applyTailwindColor(selectedColorFamily, index)}
              />
              <span className="text-xs mt-1">{tailwindShades[index]}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // Guardar cambio de color
  const saveColorChange = () => {
    if (activeColor && customization.setCustomization) {
      try {
        customization.setCustomization({ [activeColor]: tempColor });
        setActiveColor(null);
      } catch (error) {
        console.error('Error al guardar color:', error);
      }
    }
  };
  
  // Guardar todos los cambios
  const saveAllChanges = async () => {
    if (!client || !isCustomizationReady) return;
    
    try {
      // Excluir funciones y solo guardar valores de color
      const { setCustomization, resetToDefaults, initializeFromClient, ...colorValues } = customization;
      
      // Actualizar cliente con la configuración actual
      await updateClient({
        ...client,
        customization: JSON.stringify(colorValues)
      });
      
      onClose();
    } catch (error) {
      console.error('Error al guardar la personalización:', error);
    }
  };
  
  // Restaurar valores predeterminados
  const resetToDefaults = () => {
    if (customization.resetToDefaults) {
      customization.resetToDefaults();
    }
  };
  
  // Renderizar selector de color
  const renderColorPicker = () => {
    if (!activeColor || !isCustomizationReady) return null;
    
    const allColorSettings = [...categoryColors, ...sectionColors, ...productColors, ...iconSettings];
    const currentSetting = allColorSettings.find(s => s.id === activeColor);
    if (!currentSetting) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-5 max-w-xs w-full">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-base font-medium">{currentSetting.label}</h3>
            <button 
              onClick={() => setActiveColor(null)} 
              className="text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          
          <p className="text-sm text-gray-500 mb-3">{currentSetting.description}</p>
          
          <div className="mb-3">
            <HexColorPicker color={tempColor} onChange={handleColorChange} />
          </div>
          
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm text-gray-700">Código:</span>
            <HexColorInput
              color={tempColor}
              onChange={handleColorChange}
              className="px-2 py-1 border rounded text-sm w-24"
              prefixed
            />
            <div 
              className="h-6 w-6 rounded border"
              style={{ backgroundColor: tempColor }}
            />
          </div>
          
          {/* Paleta de colores Tailwind */}
          <div className="mb-3">
            <button 
              onClick={() => setShowTailwindPalette(!showTailwindPalette)}
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              {showTailwindPalette ? 'Ocultar paleta Tailwind' : 'Mostrar paleta Tailwind'}
            </button>
            
            {showTailwindPalette && (
              <div className="mt-2 border-t pt-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium">Familia de colores:</span>
                  <select 
                    className="text-xs border rounded p-1"
                    value={selectedColorFamily}
                    onChange={(e) => setSelectedColorFamily(e.target.value)}
                  >
                    {Object.keys(tailwindColors).map(color => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-wrap gap-1">
                  {tailwindColors[selectedColorFamily as keyof typeof tailwindColors].map((color, index) => (
                    <button
                      key={index}
                      className="h-5 w-5 rounded border hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      title={`${selectedColorFamily}-${tailwindShades[index]}: ${color}`}
                      onClick={() => handleColorChange(color)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-2">
            <button 
              onClick={() => setActiveColor(null)} 
              className="px-3 py-1 bg-gray-200 rounded text-sm"
            >
              Cancelar
            </button>
            <button 
              onClick={saveColorChange} 
              className="px-3 py-1 bg-indigo-600 text-white rounded text-sm"
            >
              Aplicar
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Si el componente no está abierto, no renderizar nada
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-40" onClick={(e) => {
      // Solo cerrar si se hizo clic directamente en el fondo
      if (e.target === e.currentTarget) {
        onClose();
      }
    }}>
      <DraggableComponent nodeRef={nodeRef} handle=".modal-handle" bounds="parent">
        <div 
          ref={nodeRef}
          className={`absolute bg-white rounded-lg shadow-xl ${expanded ? 'w-full max-w-4xl' : 'w-full max-w-md'} 
            overflow-hidden top-16 left-1/2 transform -translate-x-1/2`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center p-3 border-b modal-handle cursor-move">
            <h2 className="text-lg font-semibold">Personalización</h2>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setExpanded(!expanded)} 
                className="text-gray-500 hover:text-gray-700"
                title={expanded ? "Contraer" : "Expandir"}
              >
                {expanded ? (
                  <ArrowsPointingInIcon className="h-5 w-5" />
                ) : (
                  <ArrowsPointingOutIcon className="h-5 w-5" />
                )}
              </button>
              <button 
                onClick={onClose} 
                className="text-gray-500 hover:text-gray-700"
                title="Cerrar"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          {!isCustomizationReady ? (
            <div className="p-5 text-center">
              <p>Cargando configuración de personalización...</p>
            </div>
          ) : (
            <>
              <div className={`flex ${expanded ? 'h-[70vh]' : 'h-[50vh]'}`}>
                {/* Barra lateral de navegación */}
                <div className="w-32 border-r bg-gray-50 overflow-y-auto">
                  <nav className="p-2">
                    <button 
                      onClick={() => setActiveTab('themes')}
                      className={`w-full text-left p-2 rounded mb-1 ${activeTab === 'themes' ? 'bg-indigo-100 text-indigo-800' : 'hover:bg-gray-200'}`}
                    >
                      Temas
                    </button>
                    <button 
                      onClick={() => setActiveTab('categories')}
                      className={`w-full text-left p-2 rounded mb-1 ${activeTab === 'categories' ? 'bg-indigo-100 text-indigo-800' : 'hover:bg-gray-200'}`}
                    >
                      Categorías
                    </button>
                    <button 
                      onClick={() => setActiveTab('sections')}
                      className={`w-full text-left p-2 rounded mb-1 ${activeTab === 'sections' ? 'bg-indigo-100 text-indigo-800' : 'hover:bg-gray-200'}`}
                    >
                      Secciones
                    </button>
                    <button 
                      onClick={() => setActiveTab('products')}
                      className={`w-full text-left p-2 rounded mb-1 ${activeTab === 'products' ? 'bg-indigo-100 text-indigo-800' : 'hover:bg-gray-200'}`}
                    >
                      Productos
                    </button>
                    <button 
                      onClick={() => setActiveTab('icons')}
                      className={`w-full text-left p-2 rounded mb-1 ${activeTab === 'icons' ? 'bg-indigo-100 text-indigo-800' : 'hover:bg-gray-200'}`}
                    >
                      Iconos
                    </button>
                  </nav>
                </div>
                
                {/* Área de contenido */}
                <div className="flex-1 p-4 overflow-y-auto">
                  {activeTab === 'categories' && (
                    <div>
                      <h3 className="text-base font-medium mb-3">Personalización de Categorías</h3>
                      {renderColorPalette(categoryColors)}
                      {renderTailwindPalette()}
                    </div>
                  )}
                  
                  {activeTab === 'sections' && (
                    <div>
                      <h3 className="text-base font-medium mb-3">Personalización de Secciones</h3>
                      {renderColorPalette(sectionColors)}
                      {renderTailwindPalette()}
                    </div>
                  )}
                  
                  {activeTab === 'products' && (
                    <div>
                      <h3 className="text-base font-medium mb-3">Personalización de Productos</h3>
                      {renderColorPalette(productColors)}
                      {renderTailwindPalette()}
                    </div>
                  )}
                  
                  {activeTab === 'icons' && (
                    <div>
                      <h3 className="text-base font-medium mb-3">Personalización de Iconos</h3>
                      {renderColorPalette(iconSettings)}
                      {renderTailwindPalette()}
                    </div>
                  )}
                  
                  {activeTab === 'themes' && (
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-base font-medium">Temas Guardados</h3>
                        <button
                          onClick={() => setShowSaveThemeForm(true)}
                          className="px-2 py-1 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700"
                        >
                          Guardar tema actual
                        </button>
                      </div>

                      {/* Formulario para guardar un nuevo tema */}
                      {showSaveThemeForm && (
                        <div className="mb-4 p-3 border rounded-lg bg-gray-50">
                          <h4 className="text-sm font-medium mb-2">Guardar configuración actual como tema</h4>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={newThemeName}
                              onChange={(e) => setNewThemeName(e.target.value)}
                              placeholder="Nombre del tema"
                              className="flex-1 px-2 py-1 text-sm border rounded"
                            />
                            <button
                              onClick={() => {
                                if (newThemeName.trim()) {
                                  customization.saveCurrentAsTheme(newThemeName);
                                  setNewThemeName('');
                                  setShowSaveThemeForm(false);
                                }
                              }}
                              className="px-2 py-1 bg-green-600 text-white rounded text-xs"
                              disabled={!newThemeName.trim()}
                            >
                              Guardar
                            </button>
                            <button
                              onClick={() => {
                                setNewThemeName('');
                                setShowSaveThemeForm(false);
                              }}
                              className="px-2 py-1 bg-gray-300 rounded text-xs"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Lista de temas guardados */}
                      <div className="space-y-2 overflow-y-auto max-h-[60vh]">
                        {customization.favoriteThemes.map((theme) => (
                          <div
                            key={theme.id}
                            className={`p-3 rounded-lg border ${
                              editingThemeId === theme.id ? 'border-indigo-400 bg-indigo-50' : 'hover:border-gray-300'
                            }`}
                          >
                            <div className="flex justify-between items-center mb-2">
                              {editingThemeId === theme.id ? (
                                <input
                                  type="text"
                                  value={newThemeName}
                                  onChange={(e) => setNewThemeName(e.target.value)}
                                  className="flex-1 px-2 py-1 text-sm border rounded"
                                  autoFocus
                                />
                              ) : (
                                <h4 className="font-medium">{theme.name}</h4>
                              )}
                              
                              <div className="flex items-center space-x-1">
                                {editingThemeId === theme.id ? (
                                  <>
                                    <button
                                      onClick={() => {
                                        if (newThemeName.trim()) {
                                          customization.renameTheme(theme.id, newThemeName);
                                          setEditingThemeId(null);
                                          setNewThemeName('');
                                        }
                                      }}
                                      className="p-1 rounded hover:bg-green-100 text-green-600"
                                      title="Guardar"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                    </button>
                                    <button
                                      onClick={() => {
                                        setEditingThemeId(null);
                                        setNewThemeName('');
                                      }}
                                      className="p-1 rounded hover:bg-red-100 text-red-600"
                                      title="Cancelar"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                      </svg>
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => customization.applyTheme(theme.id)}
                                      className="p-1 rounded hover:bg-blue-100 text-blue-600"
                                      title="Aplicar tema"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                      </svg>
                                    </button>
                                    {!['default', 'dark-mode', 'purple-dream'].includes(theme.id) && (
                                      <>
                                        <button
                                          onClick={() => {
                                            setEditingThemeId(theme.id);
                                            setNewThemeName(theme.name);
                                          }}
                                          className="p-1 rounded hover:bg-yellow-100 text-yellow-600"
                                          title="Renombrar"
                                        >
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                                            <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                                          </svg>
                                        </button>
                                        <button
                                          onClick={() => customization.deleteTheme(theme.id)}
                                          className="p-1 rounded hover:bg-red-100 text-red-600"
                                          title="Eliminar"
                                        >
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                          </svg>
                                        </button>
                                      </>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                            
                            {/* Previsualización del tema */}
                            <div className="flex space-x-1 mt-2">
                              <div className="h-4 w-4 rounded-sm" style={{ backgroundColor: theme.colors.categoryBgColor }} title="Categoría"></div>
                              <div className="h-4 w-4 rounded-sm" style={{ backgroundColor: theme.colors.sectionBgColor }} title="Sección"></div>
                              <div className="h-4 w-4 rounded-sm" style={{ backgroundColor: theme.colors.productBgColor }} title="Producto"></div>
                              <div className="h-4 w-4 rounded-sm" style={{ backgroundColor: theme.colors.categoryTitleColor }} title="Título categoría"></div>
                              <div className="h-4 w-4 rounded-sm" style={{ backgroundColor: theme.colors.sectionTitleColor }} title="Título sección"></div>
                              <div className="h-4 w-4 rounded-sm" style={{ backgroundColor: theme.colors.productTitleColor }} title="Título producto"></div>
                            </div>
                            
                            {/* Fecha de creación */}
                            <div className="text-xs text-gray-500 mt-1">
                              Creado: {new Date(theme.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-3 border-t bg-gray-50 flex justify-end gap-2">
                <button 
                  onClick={resetToDefaults} 
                  className="px-3 py-1.5 bg-white border rounded text-sm hover:bg-gray-50"
                >
                  Restaurar valores
                </button>
                <button 
                  onClick={saveAllChanges} 
                  className="px-3 py-1.5 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
                >
                  Guardar cambios
                </button>
              </div>
            </>
          )}
          
          {renderColorPicker()}
        </div>
      </DraggableComponent>
    </div>
  );
};

export default CustomizationModal; 