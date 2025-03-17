export interface BaseEntity {
  id: number
  createdAt?: Date
  updatedAt?: Date
}

export interface Producto extends BaseEntity {
  nombre: string
  descripcion?: string
  precio: number
  imagen?: string
  orden: number
  categoriaId: number
  activo: boolean
}

export interface Categoria extends BaseEntity {
  nombre: string
  descripcion?: string
  orden: number
  menuId: number
  productos: Producto[]
  activo: boolean
}

export interface Menu extends BaseEntity {
  nombre: string
  descripcion?: string
  usuarioId: string
  categorias: Categoria[]
  activo: boolean
} 