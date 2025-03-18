import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Cliente } from '../auth/models';

export async function GET() {
  try {
    // Intentar obtener datos reales del cliente
    try {
      const cliente = await prisma.clientes.findFirst({
        where: {
          cliente: 3 // BAKERY
        }
      });

      if (cliente) {
        return NextResponse.json(cliente);
      }
    } catch (error) {
      console.error("Error al obtener datos reales del cliente:", error);
      // Continuar con datos de ejemplo si hay error
    }

    // Datos de ejemplo para el cliente
    const clienteEjemplo: Cliente = {
      cliente: 3,
      nombre: "BAKERY",
      email: "info@mybakery.com",
      telefono: "+34 654 123 987",
      comp_direccion: "Calle Panadería 123, Madrid",
      instagram: "mybakery",
      numero_ws: "+34654123987",
      moneda: 1, // Euro
      tipo: 2, // Tipo Panadería
      logo: "bakery-logo.png"
    };

    return NextResponse.json(clienteEjemplo);
  } catch (error) {
    console.error('Error al obtener información del cliente:', error);
    return NextResponse.json(
      { error: 'Error al obtener información del cliente' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Obtener cliente actual
    const cliente = await prisma.clientes.findFirst();
    
    if (!cliente) {
      return NextResponse.json(
        { error: 'No se encontró información del cliente' },
        { status: 404 }
      );
    }
    
    // Campos permitidos para actualizar
    const allowedFields = [
      'nombre',
      'email',
      'telefono',
      'comp_direccion',
      'instagram',
      'numero_ws',
      'moneda',
      'tipo'
    ];
    
    // Filtrar solo los campos permitidos
    const updateData: any = {};
    for (const field of allowedFields) {
      if (field in data) {
        updateData[field] = data[field];
      }
    }
    
    // Actualizar cliente
    const updatedCliente = await prisma.clientes.update({
      where: { cliente: cliente.cliente },
      data: updateData
    });
    
    return NextResponse.json(updatedCliente);
  } catch (error) {
    console.error('Error al actualizar datos del cliente:', error);
    return NextResponse.json(
      { error: 'Error al actualizar datos del cliente' },
      { status: 500 }
    );
  }
} 