import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const tiposNegocio = await prisma.tipo_negocio.findMany({
      orderBy: {
        descripcion: 'asc'
      }
    });
    
    return NextResponse.json(tiposNegocio);
  } catch (error) {
    console.error('Error al obtener tipos de negocio:', error);
    return NextResponse.json(
      { error: 'Error al obtener tipos de negocio' },
      { status: 500 }
    );
  }
} 