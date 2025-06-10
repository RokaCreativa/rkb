import { NextResponse } from 'next/server';
import prisma from '@/prisma/prisma';

/**
 * @swagger
 * /api/products/{id}/visibility:
 *   put:
 *     summary: Actualiza la visibilidad de un producto.
 *     description: Cambia el estado de visibilidad (status) de un producto específico, marcándolo como visible u oculto en el menú.
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: El ID del producto a actualizar.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: integer
 *                 description: El nuevo estado de visibilidad (1 para visible, 0 para oculto).
 *                 example: 1
 *     responses:
 *       200:
 *         description: Producto actualizado exitosamente. Devuelve el objeto del producto modificado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Error de validación (ej. ID de producto o estado inválido).
 *       401:
 *         description: No autorizado (el usuario no está autenticado).
 *       500:
 *         description: Error interno del servidor.
 */
export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        const { status } = await request.json();

        if (typeof status !== 'number' || status < 0 || status > 1) {
            return NextResponse.json({ message: 'Invalid status provided.' }, { status: 400 });
        }

        const updatedProduct = await prisma.products.update({
            where: {
                product_id: parseInt(id, 10),
            },
            data: {
                status: status === 1,
            },
        });

        return NextResponse.json(updatedProduct);
    } catch (error) {
        console.error('Error updating product visibility:', error);
        return NextResponse.json({ message: 'Error updating product visibility.' }, { status: 500 });
    }
} 