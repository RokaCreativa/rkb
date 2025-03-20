import { NextResponse } from 'next/server';
import prisma from "@/prisma/prisma";
import { Menu, Product } from '../auth/models';

export async function GET() {
  try {
    // Try to get real menus (commented code until model implementation)
    /*
    // Get all menus with their related products
    const menus = await prisma.menus.findMany({
      include: {
        productos: true // Include relationship with products
      }
    });
    
    if (!menus || menus.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    // Transform data to the format expected by the frontend
    const formattedMenus = menus.map(menu => ({
      id: menu.id,
      name: menu.nombre,
      dishes: menu.productos?.length || 0,
      availability: menu.disponibilidad || 'All days',
      visible: menu.visible || true,
      products: menu.productos || []
    }));

    return NextResponse.json(formattedMenus);
    */

    // Meanwhile, return sample data
    const sampleMenus: Menu[] = [
      {
        id: 1,
        name: "Pasta and Plantain Menu",
        availability: "All days",
        visible: true,
        products: [
          { id: 1, name: "Caprese salad", description: "A simple Italian salad made with fresh tomatoes, mozzarella cheese...", price: 12.00, image: "/images/products/ensalada.jpg", visible: true },
          { id: 2, name: "Gazpacho", description: "Cold vegetable soup", price: 9.00, image: "/images/products/gazpacho.jpg", visible: true },
          { id: 3, name: "Onion rings", description: "Fried onion rings", price: 8.00, image: "/images/products/aros.jpg", visible: true },
          { id: 4, name: "Canary Plantain", description: "Plantain from the Canary Islands", price: 15.00, image: "/images/products/platano.jpg", visible: true }
        ]
      },
      {
        id: 2,
        name: "Desserts only menu",
        availability: "All days",
        visible: true,
        products: [
          { id: 5, name: "Homemade flan", description: "Delicious flan with caramel", price: 5.50, image: "/images/products/flan.jpg", visible: true }
        ]
      },
      {
        id: 3,
        name: "Our menu AAA",
        availability: "All days",
        visible: true,
        products: []
      },
      {
        id: 4,
        name: "Meats for you",
        availability: "All days",
        visible: true,
        products: [
          { id: 6, name: "Entrecote", description: "Galician beef entrecote", price: 22.50, image: "/images/products/entrecot.jpg", visible: true },
          { id: 7, name: "Sirloin", description: "Veal sirloin", price: 25.00, image: "/images/products/solomillo.jpg", visible: true }
        ]
      }
    ];

    // Transform to include the number of dishes
    const formattedMenus = sampleMenus.map(menu => ({
      ...menu,
      dishes: menu.products?.length || 0
    }));

    return NextResponse.json(formattedMenus);
  } catch (error) {
    console.error('Error getting menus:', error);
    return NextResponse.json(
      { error: 'Error getting menus' },
      { status: 500 }
    );
  }
} 