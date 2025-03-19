import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Crear una notificación de prueba
    const notification = await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: 'SISTEMA',
        message: `Notificación de prueba - ${new Date().toLocaleTimeString()}`,
        read: false,
      },
    });

    return NextResponse.json(notification);
  } catch (error) {
    console.error('Error al crear notificación de prueba:', error);
    return NextResponse.json(
      { error: 'Error al crear notificación' },
      { status: 500 }
    );
  }
} 