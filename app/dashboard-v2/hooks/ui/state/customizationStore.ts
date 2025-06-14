import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Tipo para representar un tema completo (conjunto de colores)
export interface ThemeColors {
  // Colores de categorías
  categoryBgColor: string;
  categoryBorderColor: string;
  categoryTitleColor: string;
  categoryTextColor: string;
  categoryButtonBg: string;
  categoryButtonHover: string;
  
  // Colores de secciones
  sectionBgColor: string;
  sectionBorderColor: string;
  sectionTitleColor: string;
  sectionTextColor: string;
  sectionButtonBg: string;
  sectionButtonHover: string;
  sectionAccentBorder: string;
  
  // Colores de productos
  productBgColor: string;
  productBorderColor: string;
  productTitleColor: string;
  productTextColor: string;
  productButtonBg: string;
  productButtonHover: string;
  
  // Colores de iconos
  iconAddColor: string;
  iconEditColor: string;
  iconDeleteColor: string;
  iconVisibilityColor: string;
  
  // Tamaños
  iconSize: string;
}

// Tema favorito con nombre y colores
export interface FavoriteTheme {
  id: string;
  name: string;
  colors: ThemeColors;
  createdAt: number;
}

interface CustomizationState extends ThemeColors {
  // Temas favoritos guardados
  favoriteThemes: FavoriteTheme[];
  
  // Acciones
  setCustomization: (updates: Partial<CustomizationState>) => void;
  resetToDefaults: () => void;
  initializeFromClient: (customizationJson: string | null) => void;
  
  // Acciones para temas favoritos
  saveCurrentAsTheme: (name: string) => void;
  applyTheme: (themeId: string) => void;
  deleteTheme: (themeId: string) => void;
  renameTheme: (themeId: string, newName: string) => void;
}

// Valores predeterminados basados en theme.css
const DEFAULT_VALUES: Omit<ThemeColors, 'setCustomization' | 'resetToDefaults' | 'initializeFromClient' | 'favoriteThemes' | 'saveCurrentAsTheme' | 'applyTheme' | 'deleteTheme' | 'renameTheme'> = {
  // Categorías (Indigo)
  categoryBgColor: '#EEF2FF',      // Indigo-50
  categoryBorderColor: '#E0E7FF',  // Indigo-100
  categoryTitleColor: '#4F46E5',   // Indigo-600
  categoryTextColor: '#4338CA',    // Indigo-700
  categoryButtonBg: '#4F46E5',     // Indigo-600
  categoryButtonHover: '#4338CA',  // Indigo-700
  
  // Secciones (Verde)
  sectionBgColor: '#ECFDF5',       // Green-50
  sectionBorderColor: '#D1FAE5',   // Green-100
  sectionTitleColor: '#059669',    // Green-600
  sectionTextColor: '#047857',     // Green-700
  sectionButtonBg: '#059669',      // Green-600
  sectionButtonHover: '#047857',   // Green-700
  sectionAccentBorder: '#10B981',  // Green-500
  
  // Productos (Amarillo)
  productBgColor: '#FFFBEB',       // Yellow-50
  productBorderColor: '#FEF3C7',   // Yellow-100
  productTitleColor: '#D97706',    // Yellow-600
  productTextColor: '#B45309',     // Yellow-700
  productButtonBg: '#D97706',      // Yellow-600
  productButtonHover: '#B45309',   // Yellow-700
  
  // Iconos
  iconAddColor: 'currentColor',
  iconEditColor: 'currentColor',
  iconDeleteColor: 'currentColor',
  iconVisibilityColor: 'currentColor',
  iconSize: '1rem',
};

// Temas predefinidos
const PREDEFINED_THEMES: FavoriteTheme[] = [
  {
    id: 'default',
    name: 'Tema Predeterminado',
    colors: { ...DEFAULT_VALUES },
    createdAt: Date.now()
  },
  {
    id: 'dark-mode',
    name: 'Modo Oscuro',
    colors: {
      // Categorías (Azul oscuro)
      categoryBgColor: '#1E293B',      // Slate-800
      categoryBorderColor: '#334155',  // Slate-700
      categoryTitleColor: '#60A5FA',   // Blue-400
      categoryTextColor: '#93C5FD',    // Blue-300
      categoryButtonBg: '#2563EB',     // Blue-600
      categoryButtonHover: '#1D4ED8',  // Blue-700
      
      // Secciones (Verde oscuro)
      sectionBgColor: '#064E3B',       // Emerald-900
      sectionBorderColor: '#065F46',   // Emerald-800
      sectionTitleColor: '#6EE7B7',    // Emerald-300
      sectionTextColor: '#A7F3D0',     // Emerald-200
      sectionButtonBg: '#059669',      // Emerald-600
      sectionButtonHover: '#047857',   // Emerald-700
      sectionAccentBorder: '#10B981',  // Emerald-500
      
      // Productos (Amarillo oscuro)
      productBgColor: '#78350F',       // Amber-900
      productBorderColor: '#92400E',   // Amber-800
      productTitleColor: '#FCD34D',    // Amber-300
      productTextColor: '#FDE68A',     // Amber-200
      productButtonBg: '#D97706',      // Amber-600
      productButtonHover: '#B45309',   // Amber-700
      
      // Iconos
      iconAddColor: '#A7F3D0',         // Emerald-200
      iconEditColor: '#93C5FD',        // Blue-300
      iconDeleteColor: '#FCA5A5',      // Red-300
      iconVisibilityColor: '#D8B4FE',  // Purple-300
      iconSize: '1rem',
    },
    createdAt: Date.now()
  },
  {
    id: 'purple-dream',
    name: 'Sueño Púrpura',
    colors: {
      // Categorías (Púrpura)
      categoryBgColor: '#F5F3FF',      // Violet-50
      categoryBorderColor: '#EDE9FE',  // Violet-100
      categoryTitleColor: '#8B5CF6',   // Violet-500
      categoryTextColor: '#7C3AED',    // Violet-600
      categoryButtonBg: '#8B5CF6',     // Violet-500
      categoryButtonHover: '#7C3AED',  // Violet-600
      
      // Secciones (Rosa)
      sectionBgColor: '#FDF2F8',       // Pink-50
      sectionBorderColor: '#FCE7F3',   // Pink-100
      sectionTitleColor: '#EC4899',    // Pink-500
      sectionTextColor: '#DB2777',     // Pink-600
      sectionButtonBg: '#EC4899',      // Pink-500
      sectionButtonHover: '#DB2777',   // Pink-600
      sectionAccentBorder: '#F472B6',  // Pink-400
      
      // Productos (Indigo)
      productBgColor: '#EEF2FF',       // Indigo-50
      productBorderColor: '#E0E7FF',   // Indigo-100
      productTitleColor: '#6366F1',    // Indigo-500
      productTextColor: '#4F46E5',     // Indigo-600
      productButtonBg: '#6366F1',      // Indigo-500
      productButtonHover: '#4F46E5',   // Indigo-600
      
      // Iconos
      iconAddColor: '#C084FC',         // Purple-400
      iconEditColor: '#F472B6',        // Pink-400
      iconDeleteColor: '#FB7185',      // Rose-400
      iconVisibilityColor: '#818CF8',  // Indigo-400
      iconSize: '1rem',
    },
    createdAt: Date.now()
  }
];

export const useCustomizationStore = create<CustomizationState>()(
  persist(
    (set, get) => ({
      // Aseguramos que todos los valores por defecto estén presentes
      ...DEFAULT_VALUES,
      
      // Temas favoritos
      favoriteThemes: PREDEFINED_THEMES,
      
      setCustomization: (updates) => set((state) => ({
        ...state,
        ...updates,
      })),
      
      resetToDefaults: () => set((state) => ({
        ...state,
        ...DEFAULT_VALUES,
      })),
      
      initializeFromClient: (customizationJson) => {
        if (!customizationJson) return;
        
        try {
          const clientCustomization = JSON.parse(customizationJson);
          set((state) => ({
            // Mantenemos el estado actual y los valores por defecto como fallback
            ...DEFAULT_VALUES,
            ...state,
            // Aplicamos la personalización del cliente
            ...clientCustomization,
          }));
        } catch (error) {
          console.error('Error parsing client customization:', error);
          // En caso de error, aseguramos que se mantengan los valores por defecto
          set((state) => ({
            ...DEFAULT_VALUES,
            ...state,
          }));
        }
      },
      
      // Guardar el tema actual como un tema favorito
      saveCurrentAsTheme: (name) => {
        const state = get();
        
        // Extraer solo los colores del estado actual
        const {
          favoriteThemes, setCustomization, resetToDefaults, 
          initializeFromClient, saveCurrentAsTheme, applyTheme, 
          deleteTheme, renameTheme, ...colors
        } = state;
        
        const newTheme: FavoriteTheme = {
          id: `theme-${Date.now()}`,
          name,
          colors: colors as ThemeColors,
          createdAt: Date.now()
        };
        
        set((state) => ({
          ...state,
          favoriteThemes: [...state.favoriteThemes, newTheme]
        }));
        
        return newTheme.id;
      },
      
      // Aplicar un tema guardado
      applyTheme: (themeId) => {
        const state = get();
        const theme = state.favoriteThemes.find(t => t.id === themeId);
        
        if (theme) {
          set((state) => ({
            ...state,
            ...theme.colors
          }));
        }
      },
      
      // Eliminar un tema guardado
      deleteTheme: (themeId) => {
        // No permitir eliminar los temas predefinidos
        if (['default', 'dark-mode', 'purple-dream'].includes(themeId)) {
          console.warn('No se pueden eliminar los temas predefinidos');
          return;
        }
        
        set((state) => ({
          ...state,
          favoriteThemes: state.favoriteThemes.(t => t.id !== themeId)
        }));
      },
      
      // Renombrar un tema guardado
      renameTheme: (themeId, newName) => {
        set((state) => ({
          ...state,
          favoriteThemes: state.favoriteThemes.map(theme => 
            theme.id === themeId 
              ? { ...theme, name: newName } 
              : theme
          )
        }));
      }
    }),
    {
      name: 'dashboard-customization',
      storage: createJSONStorage(() => localStorage),
      // Incluimos una función de migración para asegurar compatibilidad con estados guardados anteriormente
      partialize: (state) => {
        // Excluimos las funciones, solo guardamos los valores
        const { 
          setCustomization, resetToDefaults, initializeFromClient,
          saveCurrentAsTheme, applyTheme, deleteTheme, renameTheme,
          ...rest 
        } = state;
        return rest;
      },
    }
  )
);

export default useCustomizationStore; 