import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { company: true }
    });

    if (!user?.company) {
      return NextResponse.json(
        { error: 'Usuario no asociado a una compañía' },
        { status: 400 }
      );
    }

    const categories = await prisma.category.findMany({
      where: {
        companyId: user.company.id,
        deleted: "N",
        status: "A"
      },
      orderBy: {
        order: 'asc'
      },
      include: {
        _count: {
          select: {
            products: {
              where: {
                deleted: "N",
                status: "A"
              }
            }
          }
        }
      }
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    return NextResponse.json(
      { error: 'Error al obtener categorías' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { company: true }
    });

    if (!user?.company) {
      return NextResponse.json(
        { error: 'Usuario no asociado a una compañía' },
        { status: 400 }
      );
    }

    const data = await request.json();
    const category = await prisma.category.create({
      data: {
        ...data,
        companyId: user.company.id,
        status: "A",
        deleted: "N"
      }
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error al crear categoría:', error);
    return NextResponse.json(
      { error: 'Error al crear categoría' },
      { status: 500 }
    );
  }
} 