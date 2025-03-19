import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Menu, Producto } from '../auth/models';

export async function GET() {
  try {
    // Intentar obtener los menús reales (código comentado hasta implementar el modelo)
    /*
    // Obtener todos los menús con sus productos relacionados
    const menus = await prisma.menus.findMany({
      include: {
        productos: true // Incluir relación con productos
      }
    });
    
    if (!menus || menus.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    // Transformar los datos para el formato esperado por el frontend
    const formattedMenus = menus.map(menu => ({
      id: menu.id,
      nombre: menu.nombre,
      platos: menu.productos?.length || 0,
      disponibilidad: menu.disponibilidad || 'Todos los días',
      visible: menu.visible || true,
      productos: menu.productos || []
    }));

    return NextResponse.json(formattedMenus);
    */

    // Mientras tanto, devolver datos de ejemplo
    const menusEjemplo: Menu[] = [
      {
        id: 1,
        nombre: "Menu Pasta y Platanos",
        disponibilidad: "Todos los días",
        visible: true,
        productos: [
          { id: 1, nombre: "Ensalada caprese", descripcion: "Una sencilla ensalada italiana hecha con tomates frescos, queso mozzarella...", precio: 12.00, imagen: "/images/products/ensalada.jpg", visible: true },
          { id: 2, nombre: "Gazpacho", descripcion: "Sopa fría de vegetales", precio: 9.00, imagen: "/images/products/gazpacho.jpg", visible: true },
          { id: 3, nombre: "Aros de cebolla", descripcion: "Aros de cebolla fritos", precio: 8.00, imagen: "/images/products/aros.jpg", visible: true },
          { id: 4, nombre: "Platano Canario", descripcion: "Platano de las islas canarias", precio: 15.00, imagen: "/images/products/platano.jpg", visible: true }
        ]
      },
      {
        id: 2,
        nombre: "Menu solo postres",
        disponibilidad: "Todos los días",
        visible: true,
        productos: [
          { id: 5, nombre: "Flan casero", descripcion: "Delicioso flan con caramelo", precio: 5.50, imagen: "/images/products/flan.jpg", visible: true }
        ]
      },
      {
        id: 3,
        nombre: "Nuestro menúAAA",
        disponibilidad: "Todos los días",
        visible: true,
        productos: []
      },
      {
        id: 4,
        nombre: "Carnes foryou",
        disponibilidad: "Todos los días",
        visible: true,
        productos: [
          { id: 6, nombre: "Entrecot", descripcion: "Entrecot de vaca gallega", precio: 22.50, imagen: "/images/products/entrecot.jpg", visible: true },
          { id: 7, nombre: "Solomillo", descripcion: "Solomillo de ternera", precio: 25.00, imagen: "/images/products/solomillo.jpg", visible: true }
        ]
      }
    ];

    // Transformar para incluir el número de platos
    const formattedMenus = menusEjemplo.map(menu => ({
      ...menu,
      platos: menu.productos?.length || 0
    }));

    return NextResponse.json(formattedMenus);
  } catch (error) {
    console.error('Error al obtener menús:', error);
    return NextResponse.json(
      { error: 'Error al obtener menús' },
      { status: 500 }
    );
  }
} 