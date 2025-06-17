/**
 * 🧭 MIGA DE PAN CONTEXTUAL (API PATCH): Marcar Producto como Destacado
 *
 * 📍 UBICACIÓN: /app/api/products/[id]/toggle-showcase/route.ts -> PATCH
 *
 * 🎯 PORQUÉ EXISTE:
 * Este endpoint es el responsable de la funcionalidad de "Producto Destacado". Su única
 * misión es cambiar el estado del flag `is_showcased` de un producto específico.
 *
 * 🔄 FLUJO DE DATOS:
 * 1. El usuario hace clic en el icono de estrella (★) de un producto en la Columna 3 del dashboard.
 * 2. El frontend (`dashboardStore`) llama a este endpoint con el ID del producto.
 * 3. El handler busca el producto por su ID.
 * 4. Invierte el valor actual de `is_showcased` (si es `true` lo pone `false` y viceversa).
 * 5. Actualiza el producto en la base de datos.
 * 6. Devuelve el producto actualizado para que la UI se refresque y muestre el nuevo estado.
 */
import { NextResponse } from 'next/server';
import prisma from "@/prisma/prisma";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface PatchParams {
    params: {
        id: string;
    };
}

export async function PATCH(request: Request, { params }: PatchParams) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
        }

        const user = await prisma.users.findFirst({ where: { email: session.user.email } });
        if (!user?.client_id) {
            return NextResponse.json({ error: 'Usuario no asociado a un cliente' }, { status: 403 });
        }

        const productId = parseInt(params.id, 10);

        if (isNaN(productId)) {
            return NextResponse.json({ error: 'ID de producto inválido' }, { status: 400 });
        }

        const product = await prisma.products.findUnique({
            where: { product_id: productId },
        });

        if (!product) {
            return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
        }

        // Asegurarse de que el producto pertenece al cliente del usuario
        if (product.client_id !== user.client_id) {
            return NextResponse.json({ error: 'Acceso no autorizado al producto' }, { status: 403 });
        }

        const updatedProduct = await prisma.products.update({
            where: { product_id: productId },
            data: {
                is_showcased: !product.is_showcased,
            },
        });

        const responseProduct = {
            ...updatedProduct,
            price: updatedProduct.price.toNumber(),
        };

        return NextResponse.json(responseProduct);

    } catch (error) {
        console.error(`Error al actualizar producto [${params.id}]:`, error);
        const errorMessage = error instanceof Error ? error.message : 'Un error desconocido ocurrió';
        return NextResponse.json({ error: 'Error interno del servidor', details: errorMessage }, { status: 500 });
    }
} 