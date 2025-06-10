import { NextResponse } from 'next/server';
import prisma from '@/prisma/prisma';

/**
 * @swagger
 * /api/sections/{id}/visibility:
 *   put:
 *     summary: Actualiza la visibilidad de una sección.
 *     description: Cambia el estado de visibilidad (status) de una sección específica.
 *     tags: [Sections]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: El ID de la sección a actualizar.
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
 *         description: Sección actualizada exitosamente.
 *       400:
 *         description: Error de validación (ID o estado inválido).
 *       500:
 *         description: Error interno del servidor.
 */
export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const { status } = await request.json();

        if (typeof status !== 'number' || (status !== 0 && status !== 1) || !id) {
            return NextResponse.json({ message: 'Invalid status or ID provided.' }, { status: 400 });
        }

        const updatedSection = await prisma.sections.update({
            where: {
                section_id: parseInt(id, 10),
            },
            data: {
                status: status === 1,
            },
        });

        return NextResponse.json(updatedSection);
    } catch (error) {
        console.error('Error updating section visibility:', error);
        return NextResponse.json({ message: 'Error updating section visibility.' }, { status: 500 });
    }
} 