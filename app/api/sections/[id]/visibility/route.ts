/**
 * @fileoverview API Route for Section Visibility
 * @description Handles updating the visibility status of a specific section.
 * @module app/api/sections/[id]/visibility/route
 */
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
export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        const { status } = await request.json();

        if (typeof status !== 'boolean' || !id) {
            return NextResponse.json({ message: 'Invalid status or ID provided. Expected a boolean for status.' }, { status: 400 });
        }

        const updatedSection = await prisma.sections.update({
            where: {
                section_id: parseInt(id, 10),
            },
            data: {
                status: status,
            },
        });

        return NextResponse.json(updatedSection);
    } catch (error) {
        console.error('Error updating section visibility:', error);
        return NextResponse.json({ message: 'Error updating section visibility.' }, { status: 500 });
    }
} 