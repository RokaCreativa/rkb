import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from "@/prisma/prisma";
// O la ruta relativa que corresponda


// Interfaz para categorías procesadas en la respuesta del API
interface ProcessedCategory {
  id: number;
  name: string;
  image: string | null;
  status: number; // Ahora solo 1 o 0
  display_order: number;
  client_id: number; // Ahora siempre es un número
  products: number;
}

// Método GET para obtener las categorías del cliente autenticado
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = await prisma.users.findFirst({
      where: { email: session.user.email },
    });

    if (!user?.client_id) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
    }

    const categories = await prisma.categories.findMany({
      where: { client_id: user.client_id },
      orderBy: { display_order: 'asc' },
    });

    const processedCategories: ProcessedCategory[] = categories.map((cat) => ({
      id: cat.id,
      name: cat.name || '',
      image: cat.image,
      status: cat.status ? 1 : 0, // Ahora status solo 1 o 0
      display_order: cat.display_order || 0,
      client_id: cat.client_id ?? 0, // Aquí corriges el error asignando 0 si es null
      products: 0,
    }));

    return NextResponse.json(processedCategories);
  } catch (error) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// Método PUT para cambiar la visibilidad de una categoría
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = await prisma.users.findFirst({
      where: { email: session.user.email },
    });

    if (!user?.client_id) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
    }

    const data = await request.json();

    if (!data.id || typeof data.status !== 'number') {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }

    const category = await prisma.categories.update({
      where: {
        id: data.id,
        client_id: user.client_id,
      },
      data: {
        status: data.status === 1,
      },
    });

    const processedCategory: ProcessedCategory = {
      id: category.id,
      name: category.name || '',
      image: category.image,
      status: category.status ? 1 : 0,
      display_order: category.display_order || 0,
      client_id: category.client_id ?? 0,
      products: 0,
    };

    return NextResponse.json(processedCategory);
  } catch (error) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
