export interface Producto {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  visible: boolean;
  etiquetas?: string[];
  alergenos?: string[];
  foto?: string;
}

export interface Categoria {
  id: number;
  nombre: string;
  visible: boolean;
  productos: Producto[];
}

export interface Menu {
  id: number;
  nombre: string;
  tipo_negocio_id: number;
  categorias: Categoria[];
} 