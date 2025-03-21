import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from '@/prisma/prisma';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const categoryId = parseInt(params.id);
    
    // Verificar que la categoría exista y pertenezca al cliente
    const existingCategory = await prisma.categories.findFirst({
      where: {
        id: categoryId,
        client_id: user.client_id,
      },
    });

    if (!existingCategory) {
      return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 });
    }

    let imageFileName = null;
    let updatedData: any = {};
    
    // Verificar si la solicitud es multipart/form-data o JSON
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      // Procesar FormData para imagen
      const formData = await request.formData();
      const name = formData.get('name');
      const image = formData.get('image') as File | null;
      
      if (name) {
        updatedData.name = name.toString();
      }
      
      if (image) {
        // Crear nombre de archivo único (timestamp + nombre original)
        const timestamp = Date.now();
        const fileName = image.name.toLowerCase().replace(/\s+/g, '-');
        imageFileName = `${timestamp}-${fileName}`;
        
        // Guardar la imagen en el directorio público
        const publicDir = join(process.cwd(), 'public');
        const categoriesDir = join(publicDir, 'images', 'categories');
        
        try {
          const bytes = await image.arrayBuffer();
          const buffer = Buffer.from(bytes);
          const imagePath = join(categoriesDir, imageFileName);
          
          await writeFile(imagePath, buffer);
          updatedData.image = imageFileName;
        } catch (error) {
          console.error('Error al guardar la imagen:', error);
          return NextResponse.json({ error: 'Error al procesar la imagen' }, { status: 500 });
        }
      }
    } else {
      // Procesar JSON para actualizaciones sin imagen
      const data = await request.json();
      
      // Actualizar nombre si está definido
      if (data.name !== undefined) {
        updatedData.name = data.name;
      }
      
      // Actualizar display_order si está definido
      if (data.display_order !== undefined) {
        updatedData.display_order = data.display_order;
      }
      
      // Actualizar status si está definido
      if (data.status !== undefined) {
        updatedData.status = data.status === 1;
      }
      
      // Permitir eliminar la imagen estableciéndola a null
      if (data.image !== undefined) {
        updatedData.image = data.image;
      }
    }
    
    // Actualizar la categoría con los datos proporcionados
    const updatedCategory = await prisma.categories.update({
      where: {
        id: categoryId,
      },
      data: updatedData,
    });

    // Convertir el status a formato numérico para la respuesta
    return NextResponse.json({
      ...updatedCategory,
      status: updatedCategory.status ? 1 : 0,
    });
  } catch (error) {
    console.error('Error al actualizar la categoría:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const categoryId = parseInt(params.id);
    
    // Verificar que la categoría exista y pertenezca al cliente
    const existingCategory = await prisma.categories.findFirst({
      where: {
        id: categoryId,
        client_id: user.client_id,
      },
    });

    if (!existingCategory) {
      return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 });
    }

    // Eliminar la categoría
    await prisma.categories.delete({
      where: {
        id: categoryId,
      },
    });

    return NextResponse.json({ success: true, message: 'Categoría eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar la categoría:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
} 