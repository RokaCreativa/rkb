import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Obtiene todos los roles disponibles en la base de datos.
 */
async function getRoles(req: NextApiRequest, res: NextApiResponse) {
    try {
        const roles = await prisma.roles.findMany({  // Asegúrate que sea `role` o `roles`
            select: {
                id: true,  // ID del rol
                nombre: true  // Nombre del rol
            }
        });

        return res.status(200).json(roles);
    } catch (error) {
        console.error("Error obteniendo roles:", error);
        return res.status(500).json({ error: "Error obteniendo roles" });
    }
}

/**
 * Asigna un rol a un usuario específico.
 */
async function assignRoleToUser(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { us_cd_usuario, role_id } = req.body;

        if (!us_cd_usuario || !role_id) {
            return res.status(400).json({ error: "Usuario y rol son obligatorios." });
        }

        // Verificar si el usuario existe
        const existingUser = await prisma.usuarios.findUnique({
            where: { us_cd_usuario }
        });

        if (!existingUser) {
            return res.status(404).json({ error: "Usuario no encontrado." });
        }

        // Verificar si el rol existe
        const existingRole = await prisma.roles.findUnique({ // Asegúrate que sea `role` o `roles`
            where: { id: role_id }
        });

        if (!existingRole) {
            return res.status(404).json({ error: "Rol no encontrado." });
        }

        // Actualizar el rol del usuario
        const updatedUser = await prisma.usuarios.update({
            where: { us_cd_usuario },
            data: { us_perfil: role_id }
        });

        return res.status(200).json({ message: "Rol asignado correctamente.", user: updatedUser });
    } catch (error) {
        console.error("Error asignando rol:", error);
        return res.status(500).json({ error: "Error asignando rol" });
    }
}

/**
 * Manejo de los métodos HTTP en la API.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "GET") {
        return getRoles(req, res);
    } else if (req.method === "POST") {
        return assignRoleToUser(req, res);
    } else {
        return res.status(405).json({ error: "Método no permitido" });
    }
}
