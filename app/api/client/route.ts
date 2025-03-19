import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log("User session:", session.user);
    
    // Find user by email
    const user = await prisma.users.findFirst({
      where: {
        email: session.user.email
      }
    });
    
    if (!user) {
      console.error("User not found:", session.user.email);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    console.log("User retrieved:", user);
    
    // Get client_id from user
    const client_id = user.client_id;
    
    if (!client_id) {
      console.error("User without associated client");
      return NextResponse.json({ error: 'User without associated client' }, { status: 404 });
    }
    
    console.log("Looking for client ID:", client_id);
    
    // Get client data
    const client = await prisma.clients.findUnique({
      where: {
        cliente: client_id // Client ID according to user
      }
    });

    if (!client) {
      console.error("Client not found");
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Process client data
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

    console.log("Processed client:", JSON.stringify(processedClient, null, 2));
    
    return NextResponse.json(processedClient);
  } catch (error) {
    console.error('Error getting client data:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    return NextResponse.json({ 
      error: 'Internal server error', 
      message: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Find user by email
    const user = await prisma.users.findFirst({
      where: {
        email: session.user.email
      }
    });
    
    if (!user || !user.client_id) {
      return NextResponse.json({ error: 'User without associated client' }, { status: 404 });
    }
    
    const client_id = user.client_id;
    
    // Get current client
    const client = await prisma.clients.findUnique({
      where: {
        cliente: client_id
      }
    });
    
    if (!client) {
      return NextResponse.json(
        { error: 'Client information not found' },
        { status: 404 }
      );
    }
    
    const data = await request.json();
    
    // Fields allowed to update
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
    
    // Filter only allowed fields
    const updateData: any = {};
    for (const field of allowedFields) {
      if (field in data) {
        updateData[field] = data[field];
      }
    }
    
    // Update client
    const updatedClient = await prisma.clients.update({
      where: { cliente: client.cliente },
      data: updateData
    });
    
    // Process updated client data
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
    console.error('Error updating client data:', error);
    return NextResponse.json(
      { error: 'Error updating client data', details: error },
      { status: 500 }
    );
  }
} 