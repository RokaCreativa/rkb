import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Categoria, Seccion, Producto } from '../auth/models';

export async function GET() {
  try {
    // Intentar obtener las categorías reales
    try {
      const categorias = await prisma.categorias.findMany({
        where: {
          cliente: 3, // BAKERY
          eliminado: 'N',
          estatus: 'A'
        },
        orderBy: {
          orden: 'asc'
        },
        select: {
          id: true,
          nombre: true,
          foto: true,
          estatus: true,
          orden: true,
          cliente: true
        }
      });

      if (categorias && categorias.length > 0) {
        // Procesar cada categoría para obtener productos
        const categoriasConProductos = await Promise.all(
          categorias.map(async (categoria) => {
            // Buscar secciones de esta categoría
            const secciones = await prisma.secciones.findMany({
              where: {
                cliente: 3,
                categoria: categoria.id,
                estatus: 'A'
              },
              select: {
                id: true,
                nombre: true,
                foto: true,
                estatus: true,
                orden: true
              },
              orderBy: {
                orden: 'asc'
              }
            });

            // Obtener productos de cada sección
            const seccionesConProductos = await Promise.all(
              secciones.map(async (seccion) => {
                const productosSeccion = await prisma.productos_secciones.findMany({
                  where: {
                    id_seccion: seccion.id
                  }
                });

                const productosIds = productosSeccion.map(ps => ps.id_producto);
                
                let productos: Producto[] = [];
                if (productosIds.length > 0) {
                  const productosDb = await prisma.productos.findMany({
                    where: {
                      id: {
                        in: productosIds
                      },
                      cliente: 3,
                      eliminado: "N",
                      estatus: "A"
                    },
                    orderBy: {
                      orden: 'asc'
                    }
                  });
                  
                  productos = productosDb.map(p => ({
                    id: p.id,
                    nombre: p.nombre,
                    descripcion: p.descripcion || undefined,
                    precio: p.precio ? parseFloat(p.precio.toString()) : 0,
                    orden: p.orden,
                    estatus: p.estatus,
                    foto: p.foto || undefined
                  }));
                }

                return {
                  ...seccion,
                  productos: productos
                } as Seccion;
              })
            );

            // Contar productos totales
            const totalProductos = seccionesConProductos.reduce(
              (total, seccion) => total + seccion.productos.length, 0
            );

            return {
              ...categoria,
              secciones: seccionesConProductos,
              totalProductos
            } as Categoria;
          })
        );

        return NextResponse.json(categoriasConProductos);
      }
    } catch (error) {
      console.error("Error al obtener datos reales:", error);
      // Si falla, continuar con los datos de ejemplo
    }

    // Datos de ejemplo
    const categoriasEjemplo: Categoria[] = [
      {
        id: 1,
        nombre: "Comidas",
        foto: "categories/comidas.jpg",
        estatus: "A",
        orden: 1,
        cliente: 3,
        totalProductos: 71,
        secciones: []
      },
      {
        id: 2,
        nombre: "BOCADILLOS, SANWICHES, CROISSANTS Y PULGUITAS",
        foto: "categories/bocadillos.jpg",
        estatus: "A",
        orden: 2,
        cliente: 3,
        totalProductos: 10,
        secciones: [
          {
            id: 201,
            nombre: "Bocadillos Fríos",
            foto: undefined,
            estatus: "A",
            orden: 1,
            productos: [
              {
                id: 1001,
                nombre: "VEGETAL",
                orden: 1,
                precio: 4.00,
                estatus: "A",
                descripcion: "CALABACIN, AGUACATE, TOMATE Y CEBOLLA",
                foto: "products/vegetal.jpg"
              },
              {
                id: 1002,
                nombre: "AMERICANO",
                orden: 2,
                precio: 4.50,
                estatus: "A",
                descripcion: "JAMON, QUESO AMARILLO, TOMATE, LECHUGA, CEBOLLA, BACON Y HUEVO",
                foto: "products/americano.jpg"
              },
              {
                id: 1003,
                nombre: "ATÚN",
                orden: 3,
                precio: 4.10,
                estatus: "A",
                descripcion: "ATUN, CEBOLLA ROJA Y PIMIENTO ASADO",
                foto: "products/atun.jpg"
              }
            ]
          }
        ]
      },
      {
        id: 3,
        nombre: "DESAYUNOS",
        foto: "categories/desayunos.jpg",
        estatus: "A",
        orden: 3,
        cliente: 3,
        totalProductos: 8,
        secciones: [
          {
            id: 301,
            nombre: "Tostadas",
            foto: undefined,
            estatus: "A",
            orden: 1,
            productos: [
              {
                id: 2001,
                nombre: "TOSTADA CON TOMATE",
                orden: 1,
                precio: 2.00,
                estatus: "A",
                descripcion: "Pan tostado con tomate rallado y aceite de oliva",
                foto: "products/tostada_tomate.jpg"
              },
              {
                id: 2002,
                nombre: "TOSTADA CON MANTEQUILLA Y MERMELADA",
                orden: 2,
                precio: 2.20,
                estatus: "A",
                descripcion: "Pan tostado con mantequilla y mermelada a elegir",
                foto: "products/tostada_mermelada.jpg"
              }
            ]
          },
          {
            id: 302,
            nombre: "Bollería",
            foto: undefined,
            estatus: "A",
            orden: 2,
            productos: [
              {
                id: 2003,
                nombre: "CROISSANT",
                orden: 1,
                precio: 1.50,
                estatus: "A",
                descripcion: "Croissant recién horneado",
                foto: "products/croissant.jpg"
              },
              {
                id: 2004,
                nombre: "NAPOLITANA DE CHOCOLATE",
                orden: 2,
                precio: 1.80,
                estatus: "A",
                descripcion: "Napolitana con relleno de chocolate",
                foto: "products/napolitana.jpg"
              }
            ]
          }
        ]
      }
    ];

    return NextResponse.json(categoriasEjemplo);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    return NextResponse.json(
      { error: 'Error al obtener categorías' },
      { status: 500 }
    );
  }
} 