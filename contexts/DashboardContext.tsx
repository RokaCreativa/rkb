/**
 * Contexto del Dashboard
 * 
 * Maneja el estado global para la pantalla del dashboard,
 * incluyendo las categorías, secciones y productos seleccionados.
 */

import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { Category, Section, Product, Client } from '@/lib/types/entities';

/**
 * Tipos de vistas disponibles en el dashboard
 */
type DashboardView = 'categories' | 'sections' | 'products';

/**
 * Estado del contexto del dashboard
 */
interface DashboardState {
  /** Vista actual */
  currentView: DashboardView;
  /** Categoría seleccionada */
  selectedCategory: Category | null;
  /** Sección seleccionada */
  selectedSection: Section | null;
  /** Información del cliente */
  client: Client | null;
  /** Modo de reordenamiento activo */
  isReorderModeActive: boolean;
  /** Lista de categorías */
  categories: Category[];
  /** Mapa de secciones por categoría */
  sections: Record<number, Section[]>;
  /** Mapa de productos por sección */
  products: Record<number, Product[]>;
  /** Estado de carga */
  isLoading: boolean;
  /** Mensaje de error */
  error: string | null;
}

/**
 * Acciones disponibles para el reducer
 */
type DashboardAction = 
  | { type: 'SET_VIEW', payload: DashboardView }
  | { type: 'SELECT_CATEGORY', payload: Category | null }
  | { type: 'SELECT_SECTION', payload: Section | null }
  | { type: 'SET_CLIENT', payload: Client }
  | { type: 'TOGGLE_REORDER_MODE' }
  | { type: 'SET_CATEGORIES', payload: Category[] }
  | { type: 'SET_SECTIONS', payload: { categoryId: number, sections: Section[] } }
  | { type: 'SET_PRODUCTS', payload: { sectionId: number, products: Product[] } }
  | { type: 'ADD_CATEGORY', payload: Category }
  | { type: 'UPDATE_CATEGORY', payload: Category }
  | { type: 'REMOVE_CATEGORY', payload: number }
  | { type: 'ADD_SECTION', payload: { categoryId: number, section: Section } }
  | { type: 'UPDATE_SECTION', payload: Section }
  | { type: 'REMOVE_SECTION', payload: number }
  | { type: 'ADD_PRODUCT', payload: { sectionId: number, product: Product } }
  | { type: 'UPDATE_PRODUCT', payload: Product }
  | { type: 'REMOVE_PRODUCT', payload: number }
  | { type: 'SET_LOADING', payload: boolean }
  | { type: 'SET_ERROR', payload: string | null };

/**
 * Estado inicial para el contexto
 */
const initialState: DashboardState = {
  currentView: 'categories',
  selectedCategory: null,
  selectedSection: null,
  client: null,
  isReorderModeActive: false,
  categories: [],
  sections: {},
  products: {},
  isLoading: false,
  error: null
};

/**
 * Reducer para gestionar el estado del dashboard
 */
function dashboardReducer(state: DashboardState, action: DashboardAction): DashboardState {
  switch (action.type) {
    case 'SET_VIEW':
      return { ...state, currentView: action.payload };
      
    case 'SELECT_CATEGORY':
      return { 
        ...state, 
        selectedCategory: action.payload,
        // Si cambiamos de categoría, reseteamos la sección seleccionada
        selectedSection: null,
        // Cambiamos la vista al seleccionar una categoría
        currentView: action.payload ? 'sections' : 'categories'
      };
      
    case 'SELECT_SECTION':
      return { 
        ...state, 
        selectedSection: action.payload,
        // Cambiamos la vista al seleccionar una sección
        currentView: action.payload ? 'products' : 'sections'
      };
      
    case 'SET_CLIENT':
      return { ...state, client: action.payload };
      
    case 'TOGGLE_REORDER_MODE':
      return { ...state, isReorderModeActive: !state.isReorderModeActive };
      
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload };
      
    case 'SET_SECTIONS':
      return { 
        ...state, 
        sections: { 
          ...state.sections, 
          [action.payload.categoryId]: action.payload.sections 
        } 
      };
      
    case 'SET_PRODUCTS':
      return { 
        ...state, 
        products: { 
          ...state.products, 
          [action.payload.sectionId]: action.payload.products 
        } 
      };
      
    case 'ADD_CATEGORY':
      return { 
        ...state, 
        categories: [...state.categories, action.payload] 
      };
      
    case 'UPDATE_CATEGORY':
      return { 
        ...state, 
        categories: state.categories.map(
          cat => cat.category_id === action.payload.category_id ? action.payload : cat
        ),
        selectedCategory: state.selectedCategory?.category_id === action.payload.category_id 
          ? action.payload 
          : state.selectedCategory
      };
      
    case 'REMOVE_CATEGORY':
      return { 
        ...state, 
        categories: state.categories.filter(cat => cat.category_id !== action.payload),
        selectedCategory: state.selectedCategory?.category_id === action.payload 
          ? null 
          : state.selectedCategory,
        currentView: state.selectedCategory?.category_id === action.payload 
          ? 'categories' 
          : state.currentView
      };
      
    case 'ADD_SECTION':
      return { 
        ...state, 
        sections: { 
          ...state.sections, 
          [action.payload.categoryId]: [
            ...(state.sections[action.payload.categoryId] || []), 
            action.payload.section
          ] 
        } 
      };
      
    case 'UPDATE_SECTION':
      return { 
        ...state, 
        sections: Object.entries(state.sections).reduce((acc, [catId, sections]) => {
          acc[Number(catId)] = sections.map(
            sec => sec.section_id === action.payload.section_id ? action.payload : sec
          );
          return acc;
        }, {} as Record<number, Section[]>),
        selectedSection: state.selectedSection?.section_id === action.payload.section_id 
          ? action.payload 
          : state.selectedSection
      };
      
    case 'REMOVE_SECTION':
      return { 
        ...state, 
        sections: Object.entries(state.sections).reduce((acc, [catId, sections]) => {
          acc[Number(catId)] = sections.filter(sec => sec.section_id !== action.payload);
          return acc;
        }, {} as Record<number, Section[]>),
        selectedSection: state.selectedSection?.section_id === action.payload 
          ? null 
          : state.selectedSection,
        currentView: state.selectedSection?.section_id === action.payload 
          ? 'sections' 
          : state.currentView
      };
      
    case 'ADD_PRODUCT':
      return { 
        ...state, 
        products: { 
          ...state.products, 
          [action.payload.sectionId]: [
            ...(state.products[action.payload.sectionId] || []), 
            action.payload.product
          ] 
        } 
      };
      
    case 'UPDATE_PRODUCT':
      return { 
        ...state, 
        products: Object.entries(state.products).reduce((acc, [secId, products]) => {
          acc[Number(secId)] = products.map(
            prod => prod.product_id === action.payload.product_id ? action.payload : prod
          );
          return acc;
        }, {} as Record<number, Product[]>)
      };
      
    case 'REMOVE_PRODUCT':
      return { 
        ...state, 
        products: Object.entries(state.products).reduce((acc, [secId, products]) => {
          acc[Number(secId)] = products.filter(prod => prod.product_id !== action.payload);
          return acc;
        }, {} as Record<number, Product[]>)
      };
      
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
      
    case 'SET_ERROR':
      return { ...state, error: action.payload };
      
    default:
      return state;
  }
}

/**
 * Tipo del contexto
 */
interface DashboardContextType {
  state: DashboardState;
  dispatch: React.Dispatch<DashboardAction>;
}

/**
 * Contexto del dashboard
 */
const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

/**
 * Props para el proveedor del contexto
 */
interface DashboardProviderProps {
  children: ReactNode;
}

/**
 * Proveedor del contexto del dashboard
 */
export function DashboardProvider({ children }: DashboardProviderProps) {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);
  
  return (
    <DashboardContext.Provider value={{ state, dispatch }}>
      {children}
    </DashboardContext.Provider>
  );
}

/**
 * Hook para usar el contexto del dashboard
 * 
 * @returns El estado y dispatch del dashboard
 * @throws Error si se usa fuera del proveedor
 */
export function useDashboard() {
  const context = useContext(DashboardContext);
  
  if (context === undefined) {
    throw new Error('useDashboard debe usarse dentro de un DashboardProvider');
  }
  
  return context;
} 