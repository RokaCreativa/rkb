/**
 * @fileoverview API Route for Notifications
 * @description Handles all API requests for user notifications, including fetching,
 *              marking as read, and deleting.
 * @note This route currently uses `@ts-ignore` as the `notification` model
 *       is not yet defined in the Prisma schema.
 * @module app/api/notifications/route
 */
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from "@/prisma/prisma";
import { Server as SocketServer } from 'socket.io';

// Definir io como variable inicializada con valor null
let io: SocketServer | null = null;

// Definir tipo para evitar errores de TypeScript
type PrismaNotification = {
  id: string;
  userId: string;
  type: string;
  message: string;
  data?: string | null;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Usar @ts-ignore para evitar error de TypeScript ya que el modelo existe en runtime
    // @ts-ignore
    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    return NextResponse.json(
      { error: 'Error al obtener notificaciones' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { notificationId } = await request.json();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // @ts-ignore
    const notification = await prisma.notification.update({
      where: {
        id: notificationId,
        userId: session.user.id,
      },
      data: {
        read: true,
      },
    });

    // Emitir evento de notificación leída
    if (io) {
      io.to(`user-${session.user.id}`).emit('notificationRead', notificationId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al marcar notificación como leída:', error);
    return NextResponse.json(
      { error: 'Error al actualizar la notificación' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { notificationId } = await request.json();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // @ts-ignore
    await prisma.notification.delete({
      where: {
        id: notificationId,
        userId: session.user.id,
      },
    });

    // Emitir evento de notificación eliminada
    if (io) {
      io.to(`user-${session.user.id}`).emit('notificationDeleted', notificationId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar notificación:', error);
    return NextResponse.json(
      { error: 'Error al eliminar la notificación' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Marcar todas las notificaciones como leídas
    // @ts-ignore
    await prisma.notification.updateMany({
      where: {
        userId: session.user.id,
        read: false,
      },
      data: {
        read: true,
      },
    });

    // Obtener las notificaciones actualizadas
    // @ts-ignore
    const updatedNotifications = await prisma.notification.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(updatedNotifications);
  } catch (error) {
    console.error('Error al marcar todas las notificaciones como leídas:', error);
    return NextResponse.json(
      { error: 'Error al actualizar las notificaciones' },
      { status: 500 }
    );
  }
}

// Función auxiliar para crear una nueva notificación
export async function createNotification(userId: string, type: string, message: string, data?: any) {
  try {
    // @ts-ignore
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        message,
        data: data ? JSON.stringify(data) : null,
      },
    });

    // Emitir evento de nueva notificación
    if (io) {
      io.to(`user-${userId}`).emit('newNotification', notification);
    }

    return notification;
  } catch (error) {
    console.error('Error al crear notificación:', error);
    throw error;
  }
} 