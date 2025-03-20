import { PrismaClient } from '@prisma/client'
import type { Menu, Categoria, Producto } from '../types/menu'

const prisma = new PrismaClient()

export async function getMenusByUserId(userId: string): Promise<Menu[]> {
  return prisma.menu.findMany({
    where: { usuarioId: userId },
    include: {
      categorias: {
        include: {
          productos: true
        }
      }
    }
  }) as Promise<Menu[]>
}

export async function getMenuById(menuId: number): Promise<Menu | null> {
  return prisma.menu.findUnique({
    where: { id: menuId },
    include: {
      categorias: {
        include: {
          productos: true
        }
      }
    }
  }) as Promise<Menu | null>
}

export async function createCategoria(data: Omit<Categoria, 'id' | 'productos'>): Promise<Categoria> {
  return prisma.categorias.create({
    data,
    include: {
      productos: true
    }
  }) as Promise<Categoria>
}

export async function updateCategoria(id: number, data: Partial<Categoria>): Promise<Categoria> {
  return prisma.categorias.update({
    where: { id },
    data,
    include: {
      productos: true
    }
  }) as Promise<Categoria>
}

export async function deleteCategoria(id: number): Promise<void> {
  await prisma.categorias.delete({
    where: { id }
  })
}

export async function createProducto(data: Omit<Producto, 'id'>): Promise<Producto> {
  return prisma.productos.create({
    data
  }) as Promise<Producto>
}

export async function updateProducto(id: number, data: Partial<Producto>): Promise<Producto> {
  return prisma.productos.update({
    where: { id },
    data
  }) as Promise<Producto>
}

export async function deleteProducto(id: number): Promise<void> {
  await prisma.productos.delete({
    where: { id }
  })
}

export async function reorderCategorias(categoriaIds: number[]): Promise<void> {
  await prisma.$transaction(
    categoriaIds.map((id, index) =>
      prisma.categorias.update({
        where: { id },
        data: { orden: index }
      })
    )
  )
}

export async function reorderProductos(productoIds: number[]): Promise<void> {
  await prisma.$transaction(
    productoIds.map((id, index) =>
      prisma.productos.update({
        where: { id },
        data: { orden: index }
      })
    )
  )
} 