import type { Prisma } from '@prisma/client';

// Tipo base que coincide con la tabla de Prisma
export interface CategoriaBase {
  id: number;
  nombre: string;
  foto: string | null;
  estatus: string;
  orden: number;
  cliente: number;
}

// Tipo extendido que incluye relaciones
export interface CategoriaConSecciones extends CategoriaBase {
  secciones: Seccion[];
}

// Tipo para el listado simple
export interface CategoriaListado extends CategoriaBase {}

export interface Producto {
  id: number;
  nombre: string;
  orden: number;
  precio: Prisma.Decimal | null;
  estatus: string;
  descripcion: string | null;
  foto: string | null;
  sku: string | null;
}

export interface Seccion {
  id: number;
  nombre: string;
  foto: string | null;
  estatus: string;
  orden: number;
  productos: ProductoConAlergenos[];
}

export interface Cliente {
  cliente: number;
  nombre: string;
  logo?: string | null;
  qr?: string | null;
  fondo_menu?: string | null;
}

export interface Alergeno {
  id: number;
  nombre: string;
  icono: string;
  orden: number | null;
}

export type ProductoConAlergenos = {
  id: number;
  nombre: string;
  orden: number;
  cliente: number;
  foto: string | null;
  estatus: string;
  descripcion: string | null;
  registrado: Date;
  eliminado: string;
  alergenos_producto: Array<{
    alergenos: {
      id: number;
      nombre: string;
      icono: string;
      orden: number | null;
    }
  }>;
  alergenos: Array<{
    id: number;
    nombre: string;
    icono: string;
    orden: number | null;
  }>;
}; 