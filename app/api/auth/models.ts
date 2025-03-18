// Interfaces compartidas para la aplicación

export interface Menu {
  id: number;
  nombre: string;
  disponibilidad?: string;
  visible?: boolean;
  productos?: Producto[];
  platos?: number;
  expanded?: boolean;
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  imagen?: string;
  visible?: boolean;
  orden?: number;
  estatus?: string;
  foto?: string;
}

export interface Cliente {
  id?: number;
  cliente?: number;
  nombre?: string;
  email?: string;
  telefono?: string;
  comp_direccion?: string;
  instagram?: string;
  numero_ws?: string;
  moneda?: number;
  tipo?: number;
  logo?: string;
}

export interface Moneda {
  id: number;
  descripcion: string;
  simbolo: string;
  codigo_stripe: string;
}

export interface TipoNegocio {
  id: number;
  descripcion: string;
}

export interface Categoria {
  id: number;
  nombre: string;
  foto?: string;
  estatus: string;
  orden: number;
  cliente: number;
  totalProductos?: number;
  secciones?: Seccion[];
}

export interface Seccion {
  id: number;
  nombre: string;
  foto?: string;
  estatus: string;
  orden: number;
  productos: Producto[];
} 