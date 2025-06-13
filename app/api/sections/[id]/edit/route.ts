import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth";
import prisma from '@/prisma/prisma';

/**
 * @route PUT /api/sections/[id]/edit
 * @description Actualiza completamente una sección (edición completa)
 * 🧭 MIGA DE PAN: Esta función corrige el error 405 reportado en móvil
 * Se conecta con updateSection() en dashboardStore.ts y SectionForm.tsx
 * 
 * 🎯 MANDAMIENTO #6: Separación clara entre lógica de API y presentación
 * 🎯 MANDAMIENTO #7: Comentarios contextuales para mantener el contexto
 */
export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        // 1. Verificación de autenticación
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        // 2. Obtener el usuario y verificar que tenga un cliente asociado
        const user = await prisma.users.findFirst({
            where: { email: session.user.email },
        });

        if (!user?.client_id) {
            return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
        }

        // 3. Obtener y validar el ID de la sección
        const id = params.id;
        const sectionId = parseInt(id);

        if (isNaN(sectionId)) {
            return NextResponse.json({ error: 'ID de sección inválido' }, { status: 400 });
        }

        // 4. Verificar que la sección exista y pertenezca al cliente
        const section = await prisma.sections.findFirst({
            where: {
                section_id: sectionId,
                OR: [
                    { deleted: 0 },
                    { deleted: null }
                ]
            },
            include: {
                categories: true,
            },
        });

        if (!section) {
            return NextResponse.json({ error: 'Sección no encontrada' }, { status: 404 });
        }

        // Verificar que la categoría de la sección pertenezca al cliente
        if (section.categories && section.categories.client_id !== user.client_id) {
            return NextResponse.json({ error: 'No tienes permiso para modificar esta sección' }, { status: 403 });
        }

        // 5. Obtener los datos del FormData
        const formData = await request.formData();
        const name = formData.get('name') as string;
        const status = formData.get('status') as string;

        // 6. Validar datos requeridos
        if (!name?.trim()) {
            return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 });
        }

        // 7. Preparar datos de actualización
        const updateData: any = {
            name: name.trim(),
            status: status === '1' ? 1 : 0,
        };

        // 8. Actualizar la sección
        const updatedSection = await prisma.sections.update({
            where: {
                section_id: sectionId,
            },
            data: updateData,
        });

        // 9. Devolver respuesta de éxito
        return NextResponse.json({
            success: true,
            message: 'Sección actualizada correctamente',
            section: {
                ...updatedSection,
                status: updatedSection.status ? 1 : 0, // Normalizar formato
            }
        });
    } catch (error) {
        console.error('Error al actualizar la sección:', error);
        return NextResponse.json({
            error: 'Error interno del servidor',
            message: error instanceof Error ? error.message : 'Error desconocido'
        }, { status: 500 });
    }
} 