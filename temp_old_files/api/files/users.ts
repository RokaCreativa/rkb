import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * Obtiene todos los usuarios de la base de datos.
 */
async function getUsers(req: NextApiRequest, res: NextApiResponse) {
    try {
        const users = await prisma.usuarios.findMany({
            select: {
                us_cd_usuario: true,  // ID del usuario
                us_email: true,       // Email
                us_nombreusuario: true, // Nombre de usuario
                us_estatus: true      // Estado del usuario
            }
        });

        return res.status(200).json(users);
    } catch (error) {
        console.error("Error obteniendo usuarios:", error);
        return res.status(500).json({ error: "Error obteniendo usuarios" });
    }
}

/**
 * Crea un nuevo usuario en la base de datos.
 */
async function createUser(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { us_cd_usuario, us_nombreusuario, us_email, us_contrasena, us_perfil, us_cd_compania, us_estatus } = req.body;

        // Validación de campos obligatorios
        if (!us_cd_usuario || !us_nombreusuario || !us_email || !us_contrasena || !us_perfil || !us_cd_compania) {
            return res.status(400).json({ error: "Todos los campos son obligatorios." });
        }

        // Encriptar la contraseña antes de guardarla
        const hashedPassword = await bcrypt.hash(us_contrasena, 10);

        const newUser = await prisma.usuarios.create({
            data: {
                us_cd_usuario,
                us_nombreusuario,
                us_email,
                us_contrasena: hashedPassword,
                us_perfil,
                us_cd_compania,
                us_estatus: us_estatus || "A" // Si no se envía, se establece como "A"
            }
        });

        return res.status(201).json(newUser);
    } catch (error) {
        console.error("Error creando usuario:", error);
        return res.status(500).json({ error: "Error creando usuario" });
    }
}

/**
 * Actualiza los datos de un usuario existente.
 */
async function updateUser(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { us_cd_usuario, us_nombreusuario, us_email, us_contrasena, us_perfil, us_cd_compania, us_estatus } = req.body;

        // Validación de usuario obligatorio
        if (!us_cd_usuario) {
            return res.status(400).json({ error: "El ID del usuario es obligatorio." });
        }

        // Verificar si el usuario existe
        const existingUser = await prisma.usuarios.findUnique({
            where: { us_cd_usuario }
        });

        if (!existingUser) {
            return res.status(404).json({ error: "Usuario no encontrado." });
        }

        // Si hay una nueva contraseña, encriptarla
        let hashedPassword = existingUser.us_contrasena;
        if (us_contrasena) {
            hashedPassword = await bcrypt.hash(us_contrasena, 10);
        }

        const updatedUser = await prisma.usuarios.update({
            where: { us_cd_usuario },
            data: {
                us_nombreusuario,
                us_email,
                us_contrasena: hashedPassword,
                us_perfil,
                us_cd_compania,
                us_estatus
            }
        });

        return res.status(200).json(updatedUser);
    } catch (error) {
        console.error("Error actualizando usuario:", error);
        return res.status(500).json({ error: "Error actualizando usuario" });
    }
}

/**
 * Elimina un usuario de la base de datos.
 */
async function deleteUser(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { us_cd_usuario } = req.body;

        if (!us_cd_usuario) {
            return res.status(400).json({ error: "El ID del usuario es obligatorio." });
        }

        // Verificar si el usuario existe
        const existingUser = await prisma.usuarios.findUnique({
            where: { us_cd_usuario }
        });

        if (!existingUser) {
            return res.status(404).json({ error: "Usuario no encontrado." });
        }

        await prisma.usuarios.delete({
            where: { us_cd_usuario }
        });

        return res.status(200).json({ message: "Usuario eliminado correctamente." });
    } catch (error) {
        console.error("Error eliminando usuario:", error);
        return res.status(500).json({ error: "Error eliminando usuario" });
    }
}

/**
 * Manejo de los métodos HTTP en la API.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "GET") {
        return getUsers(req, res);
    } else if (req.method === "POST") {
        return createUser(req, res);
    } else if (req.method === "PUT") {
        return updateUser(req, res);
    } else if (req.method === "DELETE") {
        return deleteUser(req, res);
    } else {
        return res.status(405).json({ error: "Método no permitido" });
    }
}
