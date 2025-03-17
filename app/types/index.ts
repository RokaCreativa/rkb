// Tipo base que coincide con la tabla de Prisma
export interface CategoriaBase {
  id: number;
  nombre: string;
  foto: string | null;
  estatus: string;
  orden: number;
  cliente: number;
  registrado: Date;
  eliminado: string;
  fecha_eliminacion: string | null;
  usuario_eliminacion: string | null;
  ip_eliminacion: string | null;
}

// Tipo extendido que incluye relaciones
export interface CategoriaConSecciones extends CategoriaBase {
  secciones: Seccion[];
}

// Tipo para el listado simple
export type CategoriaListado = CategoriaBase;

export interface Producto {
  id: number;
  nombre: string;
  descripcion?: string | null;
  precio?: number | null;
  foto?: string | null;
  orden: number;
  estatus: string;
  sku?: string | null;
  eliminado: string;
  cliente: number;
  id_seccion?: number;
}

export interface Seccion {
  id: number;
  nombre: string;
  orden: number;
  estatus: string;
  foto?: string | null;
  cliente: number;
  categoria?: number;
  productos: Producto[];
}

export interface Cliente {
  cliente: number;
  nombre?: string | null;
  comp_logo?: string | null;
  usa_secciones?: boolean;
} 