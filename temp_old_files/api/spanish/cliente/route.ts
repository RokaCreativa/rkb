import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    // Obtener la sesión del usuario
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    
    console.log("Sesión de usuario:", session.user);
    
    // Buscar el usuario por email
    const user = await prisma.users.findFirst({
      where: {
        email: session.user.email
      }
    });
    
    if (!user) {
      console.error("Usuario no encontrado:", session.user.email);
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }
    
    console.log("Usuario recuperado:", user);
    
    // Obtener client_id del usuario
    const client_id = user.client_id;
    
    if (!client_id) {
      console.error("Usuario sin cliente asociado");
      return NextResponse.json({ error: 'Usuario sin cliente asociado' }, { status: 404 });
    }
    
    console.log("Buscando cliente ID:", client_id);
    
    // Obtener datos del cliente
    const client = await prisma.clients.findUnique({
      where: {
        cliente: client_id // ID del cliente según el usuario
      }
    });

    if (!client) {
      console.error("Cliente no encontrado");
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
    }

    // Procesar los datos del cliente
    const processedClient = {
      id: client.cliente,
      name: client.name || '',
      address: client.address || '',
      email: client.email || '',
      phone: client.phone || '',
      logoCompany: client.company_logo ? `/logos/${client.company_logo}` : null,
      logoMain: client.main_logo ? `/logos/${client.main_logo}` : null,
      country_id: client.country_id || 0,
      backgroundColor: client.background_color || '#ffffff',
      whatsapp: client.whatsapp_number || '',
      whatsappMessage: client.whatsapp_message || '',
      enableWhatsapp: client.enable_whatsapp === 'S',
      menuBackground: client.menu_background ? `/bg/${client.menu_background}` : null,
      allergens: client.allergens === 'S',
      footerText: client.footer_text || '',
      footerTextColor: client.footer_text_color || '#000000',
      expirationDate: client.expiration_date,
      primaryButtonBgColor: client.primary_button_bg_color || '#000000',
      primaryButtonTextColor: client.primary_button_text_color || '#ffffff'
    };

    console.log("Cliente procesado:", JSON.stringify(processedClient, null, 2));
    
    return NextResponse.json(processedClient);
  } catch (error) {
    console.error('Error al obtener datos del cliente:', error);
    console.error('Detalles del error:', error instanceof Error ? error.message : String(error));
    return NextResponse.json({ 
      error: 'Error interno del servidor', 
      message: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Obtener la sesión del usuario
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    
    // Buscar el usuario por email
    const user = await prisma.users.findFirst({
      where: {
        email: session.user.email
      }
    });
    
    if (!user || !user.client_id) {
      return NextResponse.json({ error: 'Usuario sin cliente asociado' }, { status: 404 });
    }
    
    const client_id = user.client_id;
    
    // Obtener cliente actual
    const cliente = await prisma.clients.findUnique({
      where: {
        cliente: client_id
      }
    });
    
    if (!cliente) {
      return NextResponse.json(
        { error: 'No se encontró información del cliente' },
        { status: 404 }
      );
    }
    
    const data = await request.json();
    
    // Campos permitidos para actualizar
    const allowedFields = [
      'name',
      'email',
      'phone',
      'address',
      'instagram_account',
      'whatsapp_number',
      'currency_id',
      'type_id'
    ];
    
    // Filtrar solo los campos permitidos
    const updateData: any = {};
    for (const field of allowedFields) {
      if (field in data) {
        updateData[field] = data[field];
      }
    }
    
    // Actualizar cliente
    const updatedClient = await prisma.clients.update({
      where: { cliente: cliente.cliente },
      data: updateData
    });
    
    // Procesar datos del cliente actualizado
    const processedClient = {
      id: updatedClient.cliente,
      name: updatedClient.name || '',
      address: updatedClient.address || '',
      email: updatedClient.email || '',
      phone: updatedClient.phone || '',
      logoCompany: updatedClient.company_logo ? `/logos/${updatedClient.company_logo}` : null,
      logoMain: updatedClient.main_logo ? `/logos/${updatedClient.main_logo}` : null
    };
    
    return NextResponse.json(processedClient);
  } catch (error) {
    console.error('Error al actualizar datos del cliente:', error);
    return NextResponse.json(
      { error: 'Error al actualizar datos del cliente', details: error },
      { status: 500 }
    );
  }
} 