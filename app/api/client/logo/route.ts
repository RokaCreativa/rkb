import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('logo') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No se ha proporcionado ningún archivo' },
        { status: 400 }
      );
    }
    
    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'El archivo debe ser una imagen' },
        { status: 400 }
      );
    }
    
    // Validar tamaño (máx 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'El tamaño máximo permitido es 2MB' },
        { status: 400 }
      );
    }
    
    // Generar nombre único para el archivo
    const bytes = new Uint8Array(8);
    crypto.getRandomValues(bytes);
    const uniqueId = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Obtener extensión original
    const originalName = file.name;
    const extension = originalName.split('.').pop();
    
    // Crear nombre de archivo
    const fileName = `logo_${uniqueId}.${extension}`;
    
    // Ruta donde se guardará el archivo
    const imagePath = path.join(process.cwd(), 'public', 'images', 'imagenes_estructura_antigua', 'products', fileName);
    
    // Leer el contenido del archivo
    const buffer = await file.arrayBuffer();
    
    // Guardar el archivo en el sistema de archivos
    await writeFile(imagePath, Buffer.from(buffer));
    
    // Obtener cliente actual
    const cliente = await prisma.clientes.findFirst();
    
    if (!cliente) {
      return NextResponse.json(
        { error: 'No se encontró información del cliente' },
        { status: 404 }
      );
    }
    
    // Actualizar el logo del cliente en la base de datos
    const updatedCliente = await prisma.clientes.update({
      where: { cliente: cliente.cliente },
      data: { logo: fileName }
    });
    
    return NextResponse.json({
      message: 'Logo actualizado correctamente',
      logo: fileName
    });
  } catch (error) {
    console.error('Error al procesar la subida del logo:', error);
    return NextResponse.json(
      { error: 'Error al procesar la subida del logo' },
      { status: 500 }
    );
  }
} 