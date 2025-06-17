import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * 🧭 MIGA DE PAN CONTEXTUAL: API de Carga Inicial del Dashboard
 *
 * 🎯 PORQUÉ EXISTE:
 * Este endpoint es el punto de partida para toda la aplicación. Su propósito es
 * cargar TODOS los datos iniciales necesarios para renderizar el dashboard con una
 * única llamada a la red, mejorando la performance y simplificando la lógica del cliente.
 *
 * 🔄 FLUJO DE DATOS:
 * 1. Recibe una petición GET con el ID del cliente.
 * 2. Valida la sesión para asegurar que el usuario solo pide sus propios datos.
 * 3. Realiza una única consulta a la base de datos usando Prisma.
 * 4. La consulta busca todas las categorías del cliente e inteligentemente INCLUYE
 *    los productos que están directamente asociados a cada categoría (productos
 *    globales y locales).
 * 5. Devuelve un objeto JSON con la información del cliente y la estructura de
 *    categorías y productos anidados.
 *
 * 📖 MANDAMIENTOS RELACIONADOS:
 * - #6 (Separación de Responsabilidades): La lógica de BBDD vive aquí, no en la UI.
 * - #9 (Rendimiento y Optimización): Una sola llamada a la red es más eficiente.
 */
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    console.log('✅ CONSOLE LOG: [API] Endpoint /api/clients/[id]/dashboard-data HIT');
    const clientId = parseInt(params.id, 10);
    console.log(`✅ CONSOLE LOG: [API] Received Client ID for processing: ${clientId}`);

    const session = await getServerSession(authOptions);

    if (!session || session.user.client_id !== clientId) {
        console.log('❌ CONSOLE LOG: [API] Unauthorized access attempt.');
        return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    if (isNaN(clientId)) {
        console.log(`❌ CONSOLE LOG: [API] Invalid Client ID provided: ${params.id}`);
        return new NextResponse(JSON.stringify({ error: 'Invalid client ID' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        console.log(`✅ CONSOLE LOG: [API] Fetching initial dashboard data for client ${clientId}...`);

        const client = await prisma.clients.findUnique({
            where: { client_id: clientId },
        });

        const categoriesFromDb = await prisma.categories.findMany({
            where: { client_id: clientId },
            include: {
                direct_products: {
                    where: {
                        section_id: null,
                    },
                    orderBy: {
                        display_order: 'asc',
                    },
                },
            },
            orderBy: {
                display_order: 'asc',
            },
        });

        // Transformamos los datos para que coincidan con el contrato del frontend (que espera 'products')
        const categoriesWithProducts = categoriesFromDb.map(cat => {
            const { direct_products, ...rest } = cat;
            return { ...rest, products: direct_products };
        });

        console.log(`✅ CONSOLE LOG: [API] Successfully fetched data for client ${clientId}.`);
        console.log(`✅ CONSOLE LOG: [API] Found ${categoriesWithProducts.length} total categories (real + virtual).`);

        return NextResponse.json({
            client,
            categories: categoriesWithProducts,
        });
    } catch (error) {
        console.error(`❌ CONSOLE LOG: [API] Error fetching dashboard data for client ${clientId}:`, error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return new NextResponse(JSON.stringify({ error: 'Failed to fetch dashboard data', details: errorMessage }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
} 