import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/prisma/prisma";
// O la ruta relativa que corresponda

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.name) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.users.findFirst({
      where: { username: session.user.name }  // Ahora usa username ✅
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const client_id = user.client_id;

    if (!client_id) {
      return NextResponse.json({ error: 'User without associated client' }, { status: 404 });
    }

    const client = await prisma.clients.findUnique({
      where: { client_id: client_id }
    });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const processedClient = {
      id: client.client_id,
      name: client.name || '',
      address: client.address || '',
      email: client.email || '',
      phone: client.phone || '',
      logoCompany: client.company_logo ? `/images/company_logo/${client.company_logo}` : null,
      logoMain: client.main_logo ? `/images/main_logo/${client.main_logo}` : null,
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

    return NextResponse.json(processedClient);
  } catch (error) {
    console.error('Error getting client data:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      message: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.name) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.users.findFirst({
      where: { username: session.user.name }  // Ahora usa username ✅
    });

    if (!user || !user.client_id) {
      return NextResponse.json({ error: 'User without associated client' }, { status: 404 });
    }

    const client_id = user.client_id;

    const data = await request.json();

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

    const updateData: any = {};
    for (const field of allowedFields) {
      if (field in data) {
        updateData[field] = data[field];
      }
    }

    const updatedClient = await prisma.clients.update({
      where: { client_id: client_id },
      data: updateData
    });

    const processedClient = {
      id: updatedClient.client_id,
      name: updatedClient.name || '',
      address: updatedClient.address || '',
      email: updatedClient.email || '',
      phone: updatedClient.phone || '',
      logoCompany: updatedClient.company_logo ? `/images/company_logo/${updatedClient.company_logo}` : null,
      logoMain: updatedClient.main_logo ? `/images/main_logo/${updatedClient.main_logo}` : null
    };

    return NextResponse.json(processedClient);
  } catch (error) {
    console.error('Error updating client data:', error);
    return NextResponse.json(
      { error: 'Error updating client data', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
