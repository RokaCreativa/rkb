/**
 * Constantes de colores para las entidades del sistema
 * 
 * Define esquemas de colores consistentes para cada tipo
 * de entidad en el sistema (categorías, secciones y productos).
 */

/**
 * Esquema de colores para categorías
 */
const CATEGORY_COLORS = {
  // Para los contenedores principales
  border: 'border-indigo-200',
  light: 'bg-indigo-50',
  text: 'text-indigo-700',
  accent: 'text-indigo-600',
  active: 'bg-indigo-100',
  hover: 'hover:bg-indigo-100',
  focus: 'focus:ring-indigo-500 focus:border-indigo-500',
  
  // Para botones y acciones
  button: {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    secondary: 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-300',
    outline: 'border border-indigo-300 text-indigo-700 hover:bg-indigo-50',
  },
  
  // Para tablas
  table: 'border-indigo-200',
  tableHeader: 'bg-indigo-50 text-indigo-700',
  tableRow: 'hover:bg-indigo-50',
  tableCell: 'text-indigo-900',
  
  // Para iconos
  icon: {
    primary: 'text-indigo-600',
    secondary: 'text-indigo-400',
    hover: 'group-hover:text-indigo-700',
  },
};

/**
 * Esquema de colores para secciones
 */
const SECTION_COLORS = {
  // Para los contenedores principales
  border: 'border-teal-200',
  light: 'bg-teal-50',
  text: 'text-teal-700',
  accent: 'text-teal-600',
  active: 'bg-teal-100',
  hover: 'hover:bg-teal-100',
  focus: 'focus:ring-teal-500 focus:border-teal-500',
  
  // Para botones y acciones
  button: {
    primary: 'bg-teal-600 hover:bg-teal-700 text-white',
    secondary: 'bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-300',
    outline: 'border border-teal-300 text-teal-700 hover:bg-teal-50',
  },
  
  // Para tablas
  table: 'border-teal-200',
  tableHeader: 'bg-teal-50 text-teal-700',
  tableRow: 'hover:bg-teal-50',
  tableCell: 'text-teal-900',
  
  // Para iconos
  icon: {
    primary: 'text-teal-600',
    secondary: 'text-teal-400',
    hover: 'group-hover:text-teal-700',
  },
};

/**
 * Esquema de colores para productos
 */
const PRODUCT_COLORS = {
  // Para los contenedores principales
  border: 'border-amber-200',
  light: 'bg-amber-50',
  text: 'text-amber-700',
  accent: 'text-amber-600',
  active: 'bg-amber-100',
  hover: 'hover:bg-amber-100',
  focus: 'focus:ring-amber-500 focus:border-amber-500',
  
  // Para botones y acciones
  button: {
    primary: 'bg-amber-600 hover:bg-amber-700 text-white',
    secondary: 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-300',
    outline: 'border border-amber-300 text-amber-700 hover:bg-amber-50',
  },
  
  // Para tablas
  table: 'border-amber-200',
  tableHeader: 'bg-amber-50 text-amber-700',
  tableRow: 'hover:bg-amber-50',
  tableCell: 'text-amber-900',
  
  // Para iconos
  icon: {
    primary: 'text-amber-600',
    secondary: 'text-amber-400',
    hover: 'group-hover:text-amber-700',
  },
};

/**
 * Exportación del mapa de colores por entidad
 */
export const ENTITY_COLORS = {
  CATEGORY: CATEGORY_COLORS,
  SECTION: SECTION_COLORS,
  PRODUCT: PRODUCT_COLORS,
  // Acceso por tipo de entidad
  'category': CATEGORY_COLORS,
  'section': SECTION_COLORS,
  'product': PRODUCT_COLORS,
}; 