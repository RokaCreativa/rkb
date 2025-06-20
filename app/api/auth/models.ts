// Shared interfaces for the application

export interface Menu {
  id: number;
  name: string;
  availability?: string;
  visible?: boolean;
  products?: Product[];
  dishes?: number;
  expanded?: boolean;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  image?: string;
  visible?: boolean;
  products_display_order?: number; // 🧹 CORREGIDO: Campo contextual
  status?: string;
  photo?: string;
}

export interface Client {
  id?: number;
  client?: number;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  instagram?: string;
  whatsapp_number?: string;
  currency?: number;
  type?: number;
  logo?: string;
}

export interface Currency {
  id: number;
  description: string;
  symbol: string;
  stripe_code: string;
}

export interface BusinessType {
  id: number;
  description: string;
}

export interface Category {
  id: number;
  name: string;
  image?: string;
  status: string;
  categories_display_order: number; // 🧹 CORREGIDO: Campo contextual
  client_id: number;
  totalProducts?: number;
  sections?: Section[];
}

export interface Section {
  id: number;
  name: string;
  image?: string;
  status: string;
  sections_display_order: number; // 🧹 CORREGIDO: Campo contextual
  products: Product[];
}

// For backward compatibility
export interface Producto extends Product { }
export interface Cliente extends Client { }
export interface Moneda extends Currency { }
export interface TipoNegocio extends BusinessType { }
export interface Categoria extends Category { }
export interface Seccion extends Section { } 