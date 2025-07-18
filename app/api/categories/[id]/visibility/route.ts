import { NextResponse } from 'next/server';
import prisma from '@/prisma/prisma';

/**
 * @swagger
 * /api/categories/{id}/visibility:
 *   put:
 *     summary: Actualiza la visibilidad de una categoría.
 *     description: Cambia el estado de visibilidad (status) de una categoría específica.
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: El ID de la categoría a actualizar.
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
 *         description: Categoría actualizada exitosamente.
 *       400:
 *         description: Error de validación (ID o estado inválido).
 *       500:
 *         description: Error interno del servidor.
 */
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { status } = await request.json();

        if (typeof status !== 'boolean' || !id) {
            return NextResponse.json({ message: 'Invalid status or ID provided. Expected a boolean for status.' }, { status: 400 });
        }

        const updatedCategory = await prisma.categories.update({
            where: {
                category_id: parseInt(id, 10),
            },
            data: {
                status: status,
            },
        });

        return NextResponse.json(updatedCategory);
    } catch (error) {
        console.error('Error updating category visibility:', error);
        return NextResponse.json({ message: 'Error updating category visibility.' }, { status: 500 });
    }
} 