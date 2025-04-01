import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    // Intentar obtener la sesión
    const session = await getServerSession(authOptions);
    
    // Si no hay sesión, devolver un error
    if (!session) {
      return NextResponse.json(
        { 
          status: 'error', 
          message: 'No hay sesión activa',
          authenticated: false 
        }, 
        { status: 401 }
      );
    }
    
    // Si hay sesión, devolver información de la sesión
    return NextResponse.json({
      status: 'success',
      message: 'Sesión activa',
      authenticated: true,
      session: {
        user: {
          name: session.user.name,
          email: session.user.email,
          role: session.user.role,
          client_id: session.user.client_id,
        },
        expires: session.expires
      }
    });
  } catch (error) {
    console.error('Error al verificar autenticación:', error);
    
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Error al verificar autenticación',
        error: String(error),
        authenticated: false 
      }, 
      { status: 500 }
    );
  }
} 