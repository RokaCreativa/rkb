import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const monedas = await prisma.monedas.findMany({
      orderBy: {
        descripcion: 'asc'
      }
    });
    
    return NextResponse.json(monedas);
  } catch (error) {
    console.error('Error al obtener monedas:', error);
    return NextResponse.json(
      { error: 'Error al obtener monedas' },
      { status: 500 }
    );
  }
} 